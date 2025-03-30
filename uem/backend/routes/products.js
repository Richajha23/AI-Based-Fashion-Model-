const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const User = require('../models/User');

// Get product by Amazon ID
router.get('/:amazonId', async (req, res) => {
    try {
        const product = await Product.findOne({ amazonId: req.params.amazonId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Product fetch error:', error);
        res.status(500).json({ message: 'Error fetching product' });
    }
});

// Add product review
router.post('/:amazonId/reviews', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const product = await Product.findOne({ amazonId: req.params.amazonId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Add review
        product.reviews.push({
            userId: user._id,
            rating: req.body.rating,
            comment: req.body.comment
        });

        await product.save();

        res.json(product.reviews[product.reviews.length - 1]);
    } catch (error) {
        console.error('Review error:', error);
        res.status(500).json({ message: 'Error adding review' });
    }
});

// Save try-on result
router.post('/:amazonId/tryons', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const product = await Product.findOne({ amazonId: req.params.amazonId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Add try-on record
        product.tryOns.push({
            userId: user._id,
            imageUrl: req.body.imageUrl,
            feedback: req.body.feedback
        });

        // Update user's try-ons
        user.tryOns.push({
            productId: product.amazonId,
            imageUrl: req.body.imageUrl
        });

        await Promise.all([product.save(), user.save()]);

        res.json(product.tryOns[product.tryOns.length - 1]);
    } catch (error) {
        console.error('Try-on save error:', error);
        res.status(500).json({ message: 'Error saving try-on' });
    }
});

// Get verified sustainable products
router.get('/sustainable/verified', async (req, res) => {
    try {
        const products = await Product.find({
            'sustainability.verified': true
        }).select('name imageUrl sustainability');

        res.json(products);
    } catch (error) {
        console.error('Sustainable products error:', error);
        res.status(500).json({ message: 'Error fetching sustainable products' });
    }
});

// Search products
router.get('/search', async (req, res) => {
    try {
        const { query, category, brand } = req.query;
        const searchQuery = {};

        if (query) {
            searchQuery.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        if (category) {
            searchQuery.category = category;
        }

        if (brand) {
            searchQuery.brand = brand;
        }

        const products = await Product.find(searchQuery)
            .select('name imageUrl price category brand sustainability')
            .limit(20);

        res.json(products);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Error searching products' });
    }
});

module.exports = router; 