const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    name: String,
    percentage: Number,
    sustainabilityScore: Number,
    origin: String,
    certifications: [String],
    recycledContent: Number,
    organicContent: Number
});

const sizeSchema = new mongoose.Schema({
    name: String,
    measurements: {
        bust: Number,
        waist: Number,
        hips: Number,
        length: Number,
        shoulderWidth: Number,
        sleeveLength: Number
    },
    stockQuantity: Number
});

const blockchainVerificationSchema = new mongoose.Schema({
    transactionHash: String,
    contractAddress: String,
    verificationDate: Date,
    verifier: String,
    sustainabilityCertificates: [{
        name: String,
        issuer: String,
        validUntil: Date,
        certificateHash: String
    }],
    supplyChainData: [{
        stage: String,
        location: String,
        timestamp: Date,
        verificationHash: String
    }]
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    brand: {
        type: String,
        required: true,
        index: true
    },
    description: String,
    category: {
        type: String,
        required: true,
        index: true
    },
    subCategory: String,
    price: {
        current: Number,
        original: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    images: [{
        url: String,
        type: {
            type: String,
            enum: ['main', 'thumbnail', '3d', 'ar']
        }
    }],
    materials: [materialSchema],
    sizes: [sizeSchema],
    colors: [{
        name: String,
        hexCode: String,
        images: [String]
    }],
    style: {
        occasion: [String],
        season: [String],
        fit: String,
        pattern: String
    },
    sustainability: {
        overallScore: {
            type: Number,
            min: 0,
            max: 100
        },
        waterUsage: Number,
        carbonFootprint: Number,
        recycledMaterials: Boolean,
        organicMaterials: Boolean,
        sustainablePackaging: Boolean,
        manufacturingImpact: {
            energyEfficiency: Number,
            wasteManagement: Number,
            laborConditions: Number
        }
    },
    blockchain: {
        verification: blockchainVerificationSchema,
        nftTokenId: String,
        smartContractAddress: String
    },
    ar: {
        modelUrl: String,
        textureUrl: String,
        animations: [{
            name: String,
            url: String
        }]
    },
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        },
        reviews: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            rating: Number,
            comment: String,
            date: Date,
            fit: String,
            verified: Boolean
        }]
    },
    metadata: {
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: Date,
        isActive: {
            type: Boolean,
            default: true
        },
        tags: [String]
    }
}, {
    timestamps: true
});

// Indexes for better query performance
productSchema.index({ 'sustainability.overallScore': 1 });
productSchema.index({ 'price.current': 1 });
productSchema.index({ 'ratings.average': 1 });

// Method to calculate and update sustainability score
productSchema.methods.calculateSustainabilityScore = function() {
    const {
        waterUsage,
        carbonFootprint,
        recycledMaterials,
        organicMaterials,
        sustainablePackaging,
        manufacturingImpact
    } = this.sustainability;

    const scores = [
        waterUsage || 0,
        carbonFootprint || 0,
        recycledMaterials ? 100 : 0,
        organicMaterials ? 100 : 0,
        sustainablePackaging ? 100 : 0,
        manufacturingImpact?.energyEfficiency || 0,
        manufacturingImpact?.wasteManagement || 0,
        manufacturingImpact?.laborConditions || 0
    ];

    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    this.sustainability.overallScore = Math.round(averageScore);
    return this.sustainability.overallScore;
};

// Method to verify blockchain data
productSchema.methods.verifyBlockchainData = async function() {
    // Implementation for blockchain verification
    // This would interact with the smart contract
    return true;
};

// Virtual for full product URL
productSchema.virtual('productUrl').get(function() {
    return `/products/${this._id}`;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 