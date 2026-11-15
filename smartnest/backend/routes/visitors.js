const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const VisitorRequest = require('../models/VisitorRequest');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/visitors — visitor only
router.post(
  '/',
  authenticate,
  authorize('visitor'),
  [
    body('residentApartment').trim().notEmpty().withMessage('Resident apartment number is required'),
    body('purpose')
      .trim()
      .notEmpty()
      .withMessage('Purpose is required')
      .isLength({ max: 500 })
      .withMessage('Purpose cannot exceed 500 characters'),
    body('visitDate').isISO8601().withMessage('Valid visit date is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { residentApartment, purpose, visitDate } = req.body;

    try {
      // Look up resident by apartment number
      const resident = await User.findOne({ role: 'resident', apartmentNumber: residentApartment });
      if (!resident) {
        return res.status(404).json({ message: `No resident found at apartment ${residentApartment}.` });
      }

      const request = await VisitorRequest.create({
        visitorId: req.user._id,
        visitorName: req.user.name,
        residentId: resident._id,
        residentApartment,
        purpose,
        visitDate,
      });

      res.status(201).json({ request });
    } catch (error) {
      console.error('Create visitor request error:', error);
      res.status(500).json({ message: 'Server error creating visitor request.' });
    }
  }
);

// GET /api/visitors — visitor: own; resident: for their apartment
router.get('/', authenticate, authorize('visitor', 'resident'), async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'visitor') {
      query.visitorId = req.user._id;
    } else if (req.user.role === 'resident') {
      query.residentId = req.user._id;
    }

    const requests = await VisitorRequest.find(query).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    console.error('Get visitor requests error:', error);
    res.status(500).json({ message: 'Server error fetching visitor requests.' });
  }
});

// PATCH /api/visitors/:id/status — resident only
router.patch(
  '/:id/status',
  authenticate,
  authorize('resident'),
  [
    body('status').isIn(['Approved', 'Rejected']).withMessage('Status must be Approved or Rejected'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    try {
      const request = await VisitorRequest.findById(req.params.id);
      if (!request) {
        return res.status(404).json({ message: 'Visitor request not found.' });
      }

      // Ensure this resident owns this request
      if (request.residentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only manage requests for your own apartment.' });
      }

      request.status = req.body.status;
      await request.save();

      res.json({ request });
    } catch (error) {
      console.error('Update visitor request status error:', error);
      res.status(500).json({ message: 'Server error updating visitor request.' });
    }
  }
);

module.exports = router;
