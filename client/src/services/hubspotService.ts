import axiosInstance from './axiosConfig';

interface BookingData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  adults?: number;
  childrenUnder18?: number;
  childrenOver18?: number;
  tripDate?: string;
  price?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
}

export const hubspotService = {
  // Get contact by email
  async getContactByEmail(email: string) {
    try {
      const response = await axiosInstance.get(`/api/hubspot/contact/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  },

  // Create or update contact
  async createOrUpdateContact(data: BookingData) {
    try {
      const response = await axiosInstance.post(`/api/hubspot/contact`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating/updating contact:', error);
      throw error;
    }
  },

  // Update payment status
  async updatePaymentStatus(email: string, status: string) {
    try {
      const response = await axiosInstance.patch(`/api/hubspot/contact/${email}/payment`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  // Update booking details
  async updateBookingDetails(email: string, data: Partial<BookingData>) {
    try {
      const response = await axiosInstance.patch(`/api/hubspot/contact/${email}/booking`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating booking details:', error);
      throw error;
    }
  }
}; 