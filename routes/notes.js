const express = require('express');
const Note = require('../models/Note');
const { authenticate, checkNoteLimit } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Create a new note
router.post('/', checkNoteLimit, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const note = new Note({
      title,
      content,
      tags: tags || [],
      tenantId: req.tenant._id,
      createdBy: req.user._id
    });

    await note.save();
    await note.populate('createdBy', 'email role');

    res.status(201).json({
      message: 'Note created successfully',
      note: {
        id: note._id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        createdBy: note.createdBy,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note.' });
  }
});

// Get all notes for the current tenant
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, archived = false } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      tenantId: req.tenant._id,
      isArchived: archived === 'true'
    };

    const notes = await Note.find(query)
      .populate('createdBy', 'email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    res.json({
      notes: notes.map(note => ({
        id: note._id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        createdBy: note.createdBy,
        isArchived: note.isArchived,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalNotes: total,
        hasNext: skip + notes.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes.' });
  }
});

// Get a specific note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      tenantId: req.tenant._id
    }).populate('createdBy', 'email role');

    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    res.json({
      note: {
        id: note._id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        createdBy: note.createdBy,
        isArchived: note.isArchived,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to fetch note.' });
  }
});

// Update a note
router.put('/:id', async (req, res) => {
  try {
    const { title, content, tags, isArchived } = req.body;

    const note = await Note.findOne({
      _id: req.params.id,
      tenantId: req.tenant._id
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (isArchived !== undefined) note.isArchived = isArchived;

    await note.save();
    await note.populate('createdBy', 'email role');

    res.json({
      message: 'Note updated successfully',
      note: {
        id: note._id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        createdBy: note.createdBy,
        isArchived: note.isArchived,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note.' });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenant._id
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note.' });
  }
});

// Archive/Unarchive a note
router.patch('/:id/archive', async (req, res) => {
  try {
    const { isArchived } = req.body;

    const note = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.tenant._id
      },
      { isArchived: isArchived === true },
      { new: true }
    ).populate('createdBy', 'email role');

    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    res.json({
      message: `Note ${isArchived ? 'archived' : 'unarchived'} successfully`,
      note: {
        id: note._id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        createdBy: note.createdBy,
        isArchived: note.isArchived,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });
  } catch (error) {
    console.error('Archive note error:', error);
    res.status(500).json({ error: 'Failed to archive note.' });
  }
});

module.exports = router;
