const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subscription: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  noteLimit: {
    type: Number,
    default: 3 // Free plan limit
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
tenantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if tenant can create more notes
tenantSchema.methods.canCreateNote = function(currentNoteCount) {
  if (this.subscription === 'pro') {
    return true; // Pro plan has unlimited notes
  }
  return currentNoteCount < this.noteLimit;
};

module.exports = mongoose.model('Tenant', tenantSchema);
