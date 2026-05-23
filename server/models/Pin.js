const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    trim: true
  }
}, { timestamps: true });

const pinSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  imagePublicId: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: [
      'Art', 'Photography', 'Architecture', 'Travel', 'Food', 
      'Fashion', 'Nature', 'Technology', 'Design', 'DIY',
      'Home Decor', 'Fitness', 'Music', 'Quotes', 'Animals', 'Other'
    ],
    default: 'Other'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  saves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  views: {
    type: Number,
    default: 0
  },
  aspectRatio: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

// Indexes for performance
pinSchema.index({ author: 1, createdAt: -1 });
pinSchema.index({ category: 1, createdAt: -1 });
pinSchema.index({ tags: 1 });
pinSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Pin', pinSchema);
