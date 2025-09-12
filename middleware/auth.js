const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
const generateToken = (userId, tenantId) => {
  return jwt.sign(
    { userId, tenantId },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);
    
    // Get user with tenant information
    const user = await User.findById(decoded.userId)
      .populate('tenantId', 'name slug subscription noteLimit')
      .select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token or user not found.' });
    }

    // Verify tenant matches
    if (user.tenantId._id.toString() !== decoded.tenantId) {
      return res.status(401).json({ error: 'Invalid tenant access.' });
    }

    req.user = user;
    req.tenant = user.tenantId;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    next();
  };
};

// Check if user can create notes (subscription limit)
const checkNoteLimit = async (req, res, next) => {
  try {
    const Note = require('../models/Note');
    const currentNoteCount = await Note.countDocuments({ 
      tenantId: req.tenant._id,
      isArchived: false 
    });

    if (!req.tenant.canCreateNote(currentNoteCount)) {
      return res.status(403).json({ 
        error: 'Note limit reached. Please upgrade to Pro plan.',
        currentCount: currentNoteCount,
        limit: req.tenant.noteLimit,
        subscription: req.tenant.subscription
      });
    }

    req.currentNoteCount = currentNoteCount;
    next();
  } catch (error) {
    console.error('Note limit check error:', error);
    res.status(500).json({ error: 'Error checking note limit.' });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  authorize,
  checkNoteLimit
};
