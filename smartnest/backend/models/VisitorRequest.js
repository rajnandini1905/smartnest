const mongoose = require('mongoose');

const visitorRequestSchema = new mongoose.Schema({
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  visitorName: {
    type: String,
    required: true,
  },
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  residentApartment: {
    type: String,
    required: [true, 'Resident apartment number is required'],
    trim: true,
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    maxlength: [500, 'Purpose cannot exceed 500 characters'],
    trim: true,
  },
  visitDate: {
    type: Date,
    required: [true, 'Visit date is required'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('VisitorRequest', visitorRequestSchema);
