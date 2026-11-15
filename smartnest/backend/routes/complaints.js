const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const { authenticate, authorize } = require('../middleware/auth');
const { categorize } = require('../utils/categorize');

// POST /api/complaints — resident only
router.post(
  '/',
  authenticate,
  authorize('resident'),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { title, description } = req.body;
    const category = categorize(title, description);

    try {
      const complaint = await Complaint.create({
        residentId: req.user._id,
        residentName: req.user.name,
        title,
        description,
        category,
      });
      res.status(201).json({ complaint });
    } catch (error) {
      console.error('Create complaint error:', error);
      res.status(500).json({ message: 'Server error creating complaint.' });
    }
  }
);

// GET /api/complaints — resident: own; maintenance: all
router.get('/', authenticate, authorize('resident', 'maintenance'), async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'resident') {
      query.residentId = req.user._id;
    } else if (req.user.role === 'maintenance') {
      if (req.query.status) query.status = req.query.status;
      if (req.query.category) query.category = req.query.category;
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error fetching complaints.' });
  }
});

// PATCH /api/complaints/:id/status — maintenance only
router.patch(
  '/:id/status',
  authenticate,
  authorize('maintenance'),
  [
    body('status')
      .isIn(['Pending', 'In Progress', 'Resolved'])
      .withMessage('Invalid status value'),
    body('resolutionNote').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    try {
      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found.' });
      }

      complaint.status = req.body.status;
      if (req.body.resolutionNote !== undefined) {
        complaint.resolutionNote = req.body.resolutionNote;
      }
      await complaint.save();

      res.json({ complaint });
    } catch (error) {
      console.error('Update complaint status error:', error);
      res.status(500).json({ message: 'Server error updating complaint.' });
    }
  }
);

module.exports = router;
