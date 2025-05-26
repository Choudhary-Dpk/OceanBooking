const fs = require('fs');
const path = require('path');
const { sendToHubSpot } = require('../services/hubspotService');
const dataPath = path.join(__dirname, '../data/bookings.json');
const { validationResult } = require('express-validator');
const hubspotService = require('../services/hubspotService');

const loadBookings = () => fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath)) : {};
const saveBookings = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

exports.saveDraft = (req, res) => {
  const { email, stepData } = req.body;
  const data = loadBookings();
  data[email] = { ...data[email], ...stepData, isComplete: false };
  saveBookings(data);
  res.json({ message: 'Draft saved' });
};

exports.completeBooking = async (req, res) => {
  const { email, fullData } = req.body;
  const data = loadBookings();
  data[email] = { ...data[email], ...fullData, isComplete: true };
  saveBookings(data);
  await sendToHubSpot(fullData);
  res.json({ message: 'Booking completed' });
};

exports.getBooking = async (req, res) => {
  try {
    const { email } = req.params;
    const contact = await hubspotService.getContactByEmail(email);
    
    if (!contact) {
      return res.status(404).json({ message: 'No booking found for this email' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Failed to fetch booking details' });
  }
};

exports.updateBooking = (req, res) => {
  const { email } = req.params;
  const data = loadBookings();
  data[email] = { ...data[email], ...req.body };
  saveBookings(data);
  res.json({ message: 'Booking updated' });
};

exports.createOrUpdateBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bookingData = req.body;
    const contact = await hubspotService.createOrUpdateContact(bookingData);
    res.json(contact);
  } catch (error) {
    console.error('Error creating/updating booking:', error);
    res.status(500).json({ message: 'Failed to create/update booking' });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Paid', 'Failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const updatedContact = await hubspotService.updatePaymentStatus(email, status);
    res.json(updatedContact);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Failed to update payment status' });
  }
};

exports.updateBookingDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.params;
    const updateData = req.body;

    const updatedContact = await hubspotService.updateBookingDetails(email, updateData);
    res.json(updatedContact);
  } catch (error) {
    console.error('Error updating booking details:', error);
    res.status(500).json({ message: 'Failed to update booking details' });
  }
};