import mongoose from 'mongoose';

const preferencesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  style: [{
    type: String,
    enum: ['Casual', 'Formal', 'Sporty', 'Vintage', 'Minimalist', 'Bohemian', 'Streetwear', 'Classic']
  }],
  sustainability: {
    preferOrganic: {
      type: Boolean,
      default: true
    },
    preferRecycled: {
      type: Boolean,
      default: true
    },
    maxPriceRange: {
      type: Number,
      default: 200,
      min: 50,
      max: 500
    }
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

preferencesSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Preferences', preferencesSchema); 