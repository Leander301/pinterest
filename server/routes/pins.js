const express = require('express');
const { body, validationResult } = require('express-validator');
const Pin = require('../models/Pin');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');

const router = express.Router();

// @route GET /api/pins - Get all pins (with pagination, filtering)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { category, search, sort = 'newest' } = req.query;

    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$text = { $search: search };
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'popular') sortObj = { 'likes': -1, createdAt: -1 };
    if (sort === 'trending') sortObj = { views: -1, createdAt: -1 };

    const pins = await Pin.find(query)
      .populate('author', 'username displayName avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Pin.countDocuments(query);
    const pinsWithMeta = pins.map(pin => ({
      ...pin,
      likesCount: pin.likes?.length || 0,
      savesCount: pin.saves?.length || 0,
      commentsCount: pin.comments?.length || 0,
      isLiked: req.user ? pin.likes?.some(id => id.toString() === req.user._id.toString()) : false,
      isSaved: req.user ? pin.saves?.some(id => id.toString() === req.user._id.toString()) : false,
    }));

    res.json({
      success: true,
      pins: pinsWithMeta,
      pagination: {
        page, limit, total,
        pages: Math.ceil(total / limit),
        hasMore: skip + pins.length < total
      }
    });
  } catch (error) {
    console.error('Get pins error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching pins' });
  }
});

// @route GET /api/pins/:id - Get single pin
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const pin = await Pin.findByIdAndUpdate(
      req.params.id, 
      { $inc: { views: 1 } },
      { new: true }
    )
    .populate('author', 'username displayName avatar bio followers')
    .populate('comments.user', 'username displayName avatar');

    if (!pin) {
      return res.status(404).json({ success: false, message: 'Pin not found' });
    }

    const pinObj = pin.toObject();
    pinObj.likesCount = pin.likes.length;
    pinObj.savesCount = pin.saves.length;
    pinObj.isLiked = req.user ? pin.likes.some(id => id.toString() === req.user._id.toString()) : false;
    pinObj.isSaved = req.user ? pin.saves.some(id => id.toString() === req.user._id.toString()) : false;

    res.json({ success: true, pin: pinObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route POST /api/pins - Create a pin
router.post('/', protect, upload.single('image'), [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('category').optional().isIn([
    'Art', 'Photography', 'Architecture', 'Travel', 'Food', 
    'Fashion', 'Nature', 'Technology', 'Design', 'DIY',
    'Home Decor', 'Fitness', 'Music', 'Quotes', 'Animals', 'Other'
  ])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    let imageUrl = req.body.imageUrl; // Allow URL-based images
    
    if (req.file) {
      // Build URL for locally stored file using tunnel URL if available
      const baseUrl = process.env.SERVER_TUNNEL_URL || `${req.protocol}://${req.get('host')}`;
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image is required (upload file or provide URL)' });
    }

    const { title, description, category, link, tags, aspectRatio } = req.body;
    const parsedTags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim().toLowerCase())) : [];

    const pin = await Pin.create({
      title,
      description,
      imageUrl,
      link,
      author: req.user._id,
      category: category || 'Other',
      tags: parsedTags.slice(0, 10),
      aspectRatio: aspectRatio ? parseFloat(aspectRatio) : 1
    });

    await pin.populate('author', 'username displayName avatar');
    res.status(201).json({ success: true, message: 'Pin created successfully', pin });
  } catch (error) {
    console.error('Create pin error:', error);
    res.status(500).json({ success: false, message: 'Server error creating pin' });
  }
});

// @route PUT /api/pins/:id - Update pin
router.put('/:id', protect, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ success: false, message: 'Pin not found' });
    if (pin.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this pin' });
    }

    const { title, description, category, link, tags } = req.body;
    if (title) pin.title = title;
    if (description !== undefined) pin.description = description;
    if (category) pin.category = category;
    if (link !== undefined) pin.link = link;
    if (tags) pin.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());

    await pin.save();
    await pin.populate('author', 'username displayName avatar');
    res.json({ success: true, message: 'Pin updated successfully', pin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route DELETE /api/pins/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ success: false, message: 'Pin not found' });
    if (pin.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this pin' });
    }
    await pin.deleteOne();
    // Remove from users' savedPins
    await User.updateMany({ savedPins: req.params.id }, { $pull: { savedPins: req.params.id } });
    res.json({ success: true, message: 'Pin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route POST /api/pins/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ success: false, message: 'Pin not found' });

    const userId = req.user._id;
    const isLiked = pin.likes.includes(userId);

    if (isLiked) {
      pin.likes.pull(userId);
    } else {
      pin.likes.push(userId);
    }
    await pin.save();

    res.json({ 
      success: true, 
      isLiked: !isLiked,
      likesCount: pin.likes.length,
      message: isLiked ? 'Pin unliked' : 'Pin liked'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route POST /api/pins/:id/save
router.post('/:id/save', protect, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ success: false, message: 'Pin not found' });

    const userId = req.user._id;
    const user = await User.findById(userId);
    const isSaved = pin.saves.includes(userId);

    if (isSaved) {
      pin.saves.pull(userId);
      user.savedPins.pull(req.params.id);
    } else {
      pin.saves.push(userId);
      if (!user.savedPins.includes(req.params.id)) {
        user.savedPins.push(req.params.id);
      }
    }
    await Promise.all([pin.save(), user.save()]);

    res.json({ 
      success: true, 
      isSaved: !isSaved,
      savesCount: pin.saves.length,
      message: isSaved ? 'Pin unsaved' : 'Pin saved'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route POST /api/pins/:id/comments
router.post('/:id/comments', protect, [
  body('text').trim().notEmpty().withMessage('Comment text is required').isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ success: false, message: 'Pin not found' });

    pin.comments.push({ user: req.user._id, text: req.body.text });
    await pin.save();
    await pin.populate('comments.user', 'username displayName avatar');

    const newComment = pin.comments[pin.comments.length - 1];
    res.status(201).json({ success: true, comment: newComment, commentsCount: pin.comments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route DELETE /api/pins/:id/comments/:commentId
router.delete('/:id/comments/:commentId', protect, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ success: false, message: 'Pin not found' });

    const comment = pin.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.user.toString() !== req.user._id.toString() && 
        pin.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    comment.deleteOne();
    await pin.save();
    res.json({ success: true, message: 'Comment deleted', commentsCount: pin.comments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
