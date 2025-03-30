const { OpenAI } = require('openai');
const Product = require('../models/Product');
const User = require('../models/User');

class UserExperienceService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async initialize() {
        try {
            console.log('User Experience Service initialized');
        } catch (error) {
            console.error('Error initializing User Experience Service:', error);
            throw error;
        }
    }

    async getPersonalizedDashboard(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Get user's style preferences and measurements
            const preferences = user.stylePreferences;
            const measurements = user.measurements;

            // Get personalized recommendations
            const recommendations = await this.getPersonalizedRecommendations(user);

            // Get virtual wardrobe
            const wardrobe = await this.getVirtualWardrobe(userId);

            // Get sustainability insights
            const sustainabilityInsights = await this.getSustainabilityInsights(userId);

            return {
                user: {
                    name: user.name,
                    preferences,
                    measurements
                },
                recommendations,
                wardrobe,
                sustainabilityInsights,
                quickActions: this.getQuickActions(user)
            };
        } catch (error) {
            console.error('Error getting personalized dashboard:', error);
            throw this.handleError(error);
        }
    }

    async getPersonalizedRecommendations(user) {
        try {
            // Get user's style preferences and purchase history
            const preferences = user.stylePreferences;
            const purchaseHistory = user.purchaseHistory;

            // Get trending items
            const trendingItems = await this.getTrendingItems(preferences);

            // Get personalized recommendations based on user's style
            const personalizedItems = await this.getPersonalizedItems(user);

            // Get outfit suggestions
            const outfitSuggestions = await this.getOutfitSuggestions(user);

            return {
                trendingItems,
                personalizedItems,
                outfitSuggestions
            };
        } catch (error) {
            console.error('Error getting personalized recommendations:', error);
            throw this.handleError(error);
        }
    }

    async getVirtualWardrobe(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Get user's virtual wardrobe items
            const wardrobeItems = user.virtualWardrobe;

            // Organize items by category
            const organizedWardrobe = this.organizeWardrobe(wardrobeItems);

            // Get outfit combinations
            const outfitCombinations = await this.getOutfitCombinations(wardrobeItems);

            return {
                items: organizedWardrobe,
                outfitCombinations,
                statistics: this.getWardrobeStatistics(wardrobeItems)
            };
        } catch (error) {
            console.error('Error getting virtual wardrobe:', error);
            throw this.handleError(error);
        }
    }

    async getSustainabilityInsights(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Get user's sustainability score
            const sustainabilityScore = user.sustainabilityScore;

            // Get purchase history with sustainability metrics
            const purchaseHistory = await this.getSustainablePurchaseHistory(userId);

            // Get sustainability recommendations
            const recommendations = await this.getSustainabilityRecommendations(user);

            return {
                score: sustainabilityScore,
                purchaseHistory,
                recommendations,
                impact: this.calculateEnvironmentalImpact(user)
            };
        } catch (error) {
            console.error('Error getting sustainability insights:', error);
            throw this.handleError(error);
        }
    }

    async virtualTryOn(userId, productId) {
        try {
            const user = await User.findById(userId);
            const product = await Product.findById(productId);

            if (!user || !product) {
                throw new Error('User or product not found');
            }

            // Get user's measurements
            const measurements = user.measurements;

            // Get product details
            const productDetails = {
                size: product.sizes,
                material: product.materials,
                fit: product.styleAttributes.fit
            };

            // Perform virtual try-on
            const tryOnResult = await this.performVirtualTryOn(measurements, productDetails);

            // Get fit analysis
            const fitAnalysis = await this.analyzeFit(tryOnResult);

            // Get style recommendations
            const styleRecommendations = await this.getStyleRecommendations(user, product);

            return {
                success: true,
                tryOnResult,
                fitAnalysis,
                styleRecommendations,
                measurements: this.getMeasurementComparison(measurements, productDetails)
            };
        } catch (error) {
            console.error('Error in virtual try-on:', error);
            throw this.handleError(error);
        }
    }

    async getARExperience(userId, productId) {
        try {
            const user = await User.findById(userId);
            const product = await Product.findById(productId);

            if (!user || !product) {
                throw new Error('User or product not found');
            }

            // Get user's environment
            const userEnvironment = await this.getUserEnvironment(userId);

            // Create AR experience
            const arExperience = await this.createARExperience(product, userEnvironment);

            // Get interaction guides
            const interactionGuides = this.getInteractionGuides();

            return {
                success: true,
                arExperience,
                interactionGuides,
                tips: this.getARTips()
            };
        } catch (error) {
            console.error('Error getting AR experience:', error);
            throw this.handleError(error);
        }
    }

    async getVRShowroom(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Get user's preferences for showroom layout
            const layout = await this.getShowroomLayout(user);

            // Create VR environment
            const vrEnvironment = await this.createVRShowroom(user, layout);

            // Get navigation guides
            const navigationGuides = this.getNavigationGuides();

            return {
                success: true,
                vrEnvironment,
                navigationGuides,
                tips: this.getVRTips()
            };
        } catch (error) {
            console.error('Error getting VR showroom:', error);
            throw this.handleError(error);
        }
    }

    // Helper methods
    organizeWardrobe(items) {
        return items.reduce((acc, item) => {
            const category = item.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});
    }

    getWardrobeStatistics(items) {
        return {
            totalItems: items.length,
            categories: Object.keys(this.organizeWardrobe(items)).length,
            mostWorn: this.getMostWornItems(items),
            leastWorn: this.getLeastWornItems(items)
        };
    }

    calculateEnvironmentalImpact(user) {
        return {
            carbonFootprint: this.calculateCarbonFootprint(user),
            waterUsage: this.calculateWaterUsage(user),
            wasteReduction: this.calculateWasteReduction(user)
        };
    }

    getQuickActions(user) {
        return [
            {
                name: 'Virtual Try-On',
                icon: 'camera',
                action: 'tryOn'
            },
            {
                name: 'AR View',
                icon: 'ar',
                action: 'arView'
            },
            {
                name: 'VR Showroom',
                icon: 'vr',
                action: 'vrShowroom'
            },
            {
                name: 'Style Recommendations',
                icon: 'style',
                action: 'recommendations'
            }
        ];
    }

    handleError(error) {
        // Add user-friendly error messages
        const errorMessages = {
            'User not found': 'We couldn\'t find your account. Please try logging in again.',
            'Product not found': 'The product you\'re looking for is no longer available.',
            'Network error': 'Please check your internet connection and try again.',
            'Server error': 'Something went wrong. Please try again later.'
        };

        return {
            message: errorMessages[error.message] || 'An unexpected error occurred.',
            code: error.code || 'UNKNOWN_ERROR',
            details: error.message
        };
    }
}

module.exports = new UserExperienceService(); 