const express = require('express');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const { generateToken, authenticate } = require('../middleware/auth');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user with tenant information
    const user = await User.findOne({ email })
      .populate('tenantId', 'name slug subscription noteLimit')
      .select('+password');

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate token
    const token = generateToken(user._id, user.tenantId._id);

    // Return user data without password
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      tenant: {
        id: user.tenantId._id,
        name: user.tenantId.name,
        slug: user.tenantId.slug,
        subscription: user.tenantId.subscription,
        noteLimit: user.tenantId.noteLimit
      }
    };

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get current user info
router.get('/me', authenticate, (req, res) => {
  const userData = {
    id: req.user._id,
    email: req.user.email,
    role: req.user.role,
    tenant: {
      id: req.tenant._id,
      name: req.tenant.name,
      slug: req.tenant.slug,
      subscription: req.tenant.subscription,
      noteLimit: req.tenant.noteLimit
    }
  };

  res.json({ user: userData });
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
