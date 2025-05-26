const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getBooking,
  createOrUpdateBooking,
  updatePaymentStatus,
  updateBookingDetails
} = require('../controllers/bookingController');

// Validation middleware
const bookingValidation = [
  body('email').isEmail().normalizeEmail(),
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().trim().notEmpty(),
  body('adults').optional().isInt({ min: 0 }),
  body('childrenUnder18').optional().isInt({ min: 0 }),
  body('childrenOver18').optional().isInt({ min: 0 }),
  body('tripDate').optional().isISO8601(),
  body('price').optional().isString(),
  body('paymentStatus').optional().isIn(['Pending', 'Paid', 'Failed'])
];

// Routes
router.get('/contact/:email', getBooking);
router.post('/contact', bookingValidation, createOrUpdateBooking);
router.patch('/contact/:email/payment', updatePaymentStatus);
router.patch('/contact/:email/booking', bookingValidation, updateBookingDetails);

module.exports = router;