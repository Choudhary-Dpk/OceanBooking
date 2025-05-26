const { Client } = require('@hubspot/api-client');

const hubspot = new Client({ accessToken: process.env.HUBSPOT_API_KEY });

const BOOKING_STATUS_PROPERTY = 'booking_status';
const TRIP_DATE_PROPERTY = 'booking_date';
const ADULTS_PROPERTY = 'number_of_adult';
const CHILDREN_UNDER_18_PROPERTY = 'number_of_children_under_18';
const CHILDREN_OVER_18_PROPERTY = 'number_of_children';
const PRICE_PROPERTY = 'booking_price';
const PAYMENT_STATUS_PROPERTY = 'payment_status';

const hubspotService = {
  async getContactByEmail(email) {
    try {
      const apiResponse = await hubspot.crm.contacts.searchApi.doSearch({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email
          }]
        }],
        properties: [
          'email',
          'firstname',
          'lastname',
          'mobilephone',
          BOOKING_STATUS_PROPERTY,
          TRIP_DATE_PROPERTY,
          ADULTS_PROPERTY,
          CHILDREN_UNDER_18_PROPERTY,
          CHILDREN_OVER_18_PROPERTY,
          PRICE_PROPERTY,
          PAYMENT_STATUS_PROPERTY
        ],
        limit: 1
      });

      if (apiResponse.results.length === 0) {
        return null;
      }

      const contact = apiResponse.results[0];
      return {
        id: contact.id,
        email: contact.properties.email,
        firstName: contact.properties.firstname,
        lastName: contact.properties.lastname,
        phone: contact.properties.mobilephone,
        bookingStatus: contact.properties[BOOKING_STATUS_PROPERTY] || 'active',
        adults: parseInt(contact.properties[ADULTS_PROPERTY] || '0'),
        childrenUnder18: parseInt(contact.properties[CHILDREN_UNDER_18_PROPERTY] || '0'),
        childrenOver18: parseInt(contact.properties[CHILDREN_OVER_18_PROPERTY] || '0'),
        tripDate: contact.properties[TRIP_DATE_PROPERTY],
        price: contact.properties[PRICE_PROPERTY],
        paymentStatus: contact.properties[PAYMENT_STATUS_PROPERTY] || 'Pending'
      };
    } catch (error) {
      console.error('HubSpot Error:', error);
      throw new Error('Failed to fetch contact from HubSpot');
    }
  },

  async createOrUpdateContact(contactData) {
    try {
      const properties = {
        email: contactData.email,
        firstname: contactData.firstName,
        lastname: contactData.lastName,
        mobilephone: contactData.phone,
        [ADULTS_PROPERTY]: contactData.adults?.toString(),
        [CHILDREN_UNDER_18_PROPERTY]: contactData.childrenUnder18?.toString(),
        [CHILDREN_OVER_18_PROPERTY]: contactData.childrenOver18?.toString(),
        [TRIP_DATE_PROPERTY]: contactData.tripDate,
        [PRICE_PROPERTY]: contactData.price,
        [PAYMENT_STATUS_PROPERTY]: contactData.paymentStatus || 'Pending',
        [BOOKING_STATUS_PROPERTY]: 'active'
      };

      // Check if contact exists
      const existingContact = await this.getContactByEmail(contactData.email);

      if (existingContact) {
        // Update existing contact
        await hubspot.crm.contacts.basicApi.update(existingContact.id, { properties });
        return await this.getContactByEmail(contactData.email);
      } else {
        // Create new contact
        await hubspot.crm.contacts.basicApi.create({ properties });
        return await this.getContactByEmail(contactData.email);
      }
    } catch (error) {
      console.error('HubSpot Error:', error);
      throw new Error('Failed to create/update contact in HubSpot');
    }
  },

  async updatePaymentStatus(email, status) {
    try {
      const contact = await this.getContactByEmail(email);
      if (!contact) {
        throw new Error('Contact not found');
      }

      await hubspot.crm.contacts.basicApi.update(contact.id, {
        properties: {
          [PAYMENT_STATUS_PROPERTY]: status
        }
      });

      return await this.getContactByEmail(email);
    } catch (error) {
      console.error('HubSpot Error:', error);
      throw new Error('Failed to update payment status in HubSpot');
    }
  },

  async updateBookingDetails(email, data) {
    try {
      const contact = await this.getContactByEmail(email);
      if (!contact) {
        throw new Error('Contact not found');
      }

      const properties = {
        ...(data.firstName && { firstname: data.firstName }),
        ...(data.lastName && { lastname: data.lastName }),
        ...(data.phone && { mobilephone: data.phone }),
        ...(data.adults && { [ADULTS_PROPERTY]: data.adults.toString() }),
        ...(data.childrenUnder18 && { [CHILDREN_UNDER_18_PROPERTY]: data.childrenUnder18.toString() }),
        ...(data.childrenOver18 && { [CHILDREN_OVER_18_PROPERTY]: data.childrenOver18.toString() }),
        ...(data.tripDate && { [TRIP_DATE_PROPERTY]: data.tripDate }),
        ...(data.price && { [PRICE_PROPERTY]: data.price })
      };

      await hubspot.crm.contacts.basicApi.update(contact.id, { properties });
      return await this.getContactByEmail(email);
    } catch (error) {
      console.error('HubSpot Error:', error);
      throw new Error('Failed to update booking details in HubSpot');
    }
  }
};

module.exports = hubspotService;