const express = require('express');
const User = require('../models/User');
const Pin = require('../models/Pin');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route GET /api/users/:username - Get user profile
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username displayName avatar')
      .populate('following', 'username displayName avatar')
      .select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const pins = await Pin.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate('author', 'username displayName avatar')
      .lean();

    const savedPins = await Pin.find({ _id: { $in: user.savedPins } })
      .sort({ createdAt: -1 })
      .populate('author', 'username displayName avatar')
      .lean();

    const isFollowing = req.user 
      ? user.followers.some(f => f._id.toString() === req.user._id.toString()) 
      : false;

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        followersCount: user.followers.length,
        followingCount: user.following.length,
        pinsCount: pins.length,
        isFollowing,
        isOwnProfile: req.user ? req.user._id.toString() === user._id.toString() : false
      },
      pins,
      savedPins
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route PUT /api/users/profile/update
router.put('/profile/update', protect, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { displayName, bio, website, location } = req.body;

    if (displayName !== undefined) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    if (location !== undefined) user.location = location;
    
    if (req.file) {
      user.avatar = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    await user.save();
    res.json({ success: true, message: 'Profile updated successfully', user: user.getPublicProfile() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route POST /api/users/:id/follow
router.post('/:id/follow', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      currentUser.following.pull(req.params.id);
      userToFollow.followers.pull(req.user._id);
    } else {
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user._id);
    }

    await Promise.all([currentUser.save(), userToFollow.save()]);

    res.json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: userToFollow.followers.length,
      message: isFollowing ? 'Unfollowed successfully' : 'Following successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route GET /api/users/:id/saved-pins
router.get('/:id/saved-pins', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: 'savedPins',
      populate: { path: 'author', select: 'username displayName avatar' }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, savedPins: user.savedPins });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route GET /api/users/search/query
router.get('/search/query', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } }
      ]
    }).select('username displayName avatar bio').limit(10);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
