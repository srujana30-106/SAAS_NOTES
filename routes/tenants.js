const express = require('express');
const Tenant = require('../models/Tenant');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get tenant information
router.get('/info', (req, res) => {
  res.json({
    tenant: {
      id: req.tenant._id,
      name: req.tenant.name,
      slug: req.tenant.slug,
      subscription: req.tenant.subscription,
      noteLimit: req.tenant.noteLimit,
      createdAt: req.tenant.createdAt
    }
  });
});

// Upgrade tenant subscription (Admin only)
router.post('/:slug/upgrade', authorize(['admin']), async (req, res) => {
  try {
    const { slug } = req.params;

    // Verify the slug matches the current tenant
    if (req.tenant.slug !== slug) {
      return res.status(403).json({ error: 'Access denied. Invalid tenant.' });
    }

    // Check if already on Pro plan
    if (req.tenant.subscription === 'pro') {
      return res.status(400).json({ error: 'Tenant is already on Pro plan.' });
    }

    // Upgrade to Pro plan
    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.tenant._id,
      { 
        subscription: 'pro',
        noteLimit: -1 // -1 indicates unlimited
      },
      { new: true }
    );

    res.json({
      message: 'Tenant upgraded to Pro plan successfully',
      tenant: {
        id: updatedTenant._id,
        name: updatedTenant.name,
        slug: updatedTenant.slug,
        subscription: updatedTenant.subscription,
        noteLimit: updatedTenant.noteLimit,
        updatedAt: updatedTenant.updatedAt
      }
    });
  } catch (error) {
    console.error('Upgrade tenant error:', error);
    res.status(500).json({ error: 'Failed to upgrade tenant.' });
  }
});

// Get tenant statistics (Admin only)
router.get('/stats', authorize(['admin']), async (req, res) => {
  try {
    const Note = require('../models/Note');
    const User = require('../models/User');

    const [noteCount, userCount] = await Promise.all([
      Note.countDocuments({ 
        tenantId: req.tenant._id,
        isArchived: false 
      }),
      User.countDocuments({ 
        tenantId: req.tenant._id,
        isActive: true 
      })
    ]);

    res.json({
      stats: {
        totalNotes: noteCount,
        totalUsers: userCount,
        subscription: req.tenant.subscription,
        noteLimit: req.tenant.noteLimit,
        canCreateMoreNotes: req.tenant.canCreateNote(noteCount)
      }
    });
  } catch (error) {
    console.error('Get tenant stats error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant statistics.' });
  }
});

module.exports = router;
