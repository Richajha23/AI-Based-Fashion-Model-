const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    amazonId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    price: Number,
    imageUrl: String,
    category: String,
    brand: String,
    sustainability: {
        materials: String,
        labor: String,
        carbonFootprint: String,
        verified: {
            type: Boolean,
            default: false
        },
        verificationDate: Date,
        blockchainHash: String
    },
    measurements: {
        availableSizes: [String],
        fitGuide: String
    },
    reviews: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: Number,
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    tryOns: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: Date,
        imageUrl: String,
        feedback: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
productSchema.index({ amazonId: 1 });
productSchema.index({ 'sustainability.verified': 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });

module.exports = mongoose.model('Product', productSchema); 