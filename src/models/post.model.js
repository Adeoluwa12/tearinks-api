const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

// Initialize the plugin
mongoose.plugin(slug);

const postSchema = new mongoose.Schema(
  {
    author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:      { type: String, enum: ['WRITTEN', 'VIDEO', 'AUDIO'], default: 'WRITTEN' },
    title:     { type: String, required: true, trim: true, maxlength: 120 },
    
    // Updated slug field configuration
    slug: { 
      type: String, 
      slug: "title",    // Point this to the field you want to slugify
      unique: true, 
      slugPaddingSize: 1 
    },

    content:   { type: String },
    videoUrl:  { type: String },
    audioUrl:  { type: String },
    tags:      [{ type: String, lowercase: true, trim: true }],
    coAuthors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPublished: { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
    viewCount:   { type: Number, default: 0 },
    likeCount:   { type: Number, default: 0 },
    repostCount: { type: Number, default: 0 },
    score:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes
postSchema.index({ tags: 1 });
postSchema.index({ score: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);