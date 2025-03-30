const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const measurementsSchema = new mongoose.Schema({
    height: Number,
    weight: Number,
    bust: Number,
    waist: Number,
    hips: Number,
    inseam: Number,
    shoulderWidth: Number,
    armLength: Number
});

const stylePreferencesSchema = new mongoose.Schema({
    colors: [String],
    patterns: [String],
    styles: [String],
    fitPreference: String,
    priceRange: {
        min: Number,
        max: Number
    },
    brands: [String],
    occasions: [String]
});

const sustainabilityPreferencesSchema = new mongoose.Schema({
    organicMaterials: Boolean,
    recycledMaterials: Boolean,
    fairTrade: Boolean,
    veganMaterials: Boolean,
    localProduction: Boolean,
    sustainabilityCertifications: [String]
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    profileImage: String,
    bodyShape: String,
    measurements: measurementsSchema,
    stylePreferences: stylePreferencesSchema,
    sustainabilityPreferences: sustainabilityPreferencesSchema,
    virtualWardrobeItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    favoriteOutfits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outfit'
    }],
    purchaseHistory: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        purchaseDate: Date,
        price: Number,
        sustainabilityScore: Number
    }],
    walletAddress: String,
    sustainabilityScore: {
        type: Number,
        default: 0
    },
    aiPreferences: {
        styleRecommendations: Boolean,
        virtualTryOn: Boolean,
        sustainabilityAlerts: Boolean
    },
    lastBodyScan: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
}, {
    timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Method to calculate and update sustainability score
userSchema.methods.updateSustainabilityScore = async function() {
    const purchases = this.purchaseHistory;
    if (purchases.length === 0) return 0;

    const totalScore = purchases.reduce((acc, purchase) => acc + purchase.sustainabilityScore, 0);
    this.sustainabilityScore = totalScore / purchases.length;
    await this.save();
    return this.sustainabilityScore;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.name}`;
});

const User = mongoose.model('User', userSchema);

module.exports = User; 