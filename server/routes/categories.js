const express = require('express');
const Pin = require('../models/Pin');
const router = express.Router();

const CATEGORIES = [
  'Art', 'Photography', 'Architecture', 'Travel', 'Food', 
  'Fashion', 'Nature', 'Technology', 'Design', 'DIY',
  'Home Decor', 'Fitness', 'Music', 'Quotes', 'Animals', 'Other'
];

// @route GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categoryCounts = await Pin.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const categories = CATEGORIES.map(name => ({
      name,
      count: categoryCounts.find(c => c._id === name)?.count || 0
    }));

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
