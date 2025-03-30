const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Web3 = require('web3');
const Product = require('../models/Product');
const User = require('../models/User');

// Initialize Web3
const web3 = new Web3(process.env.BLOCKCHAIN_URL || 'http://localhost:8545');

// Smart contract ABI and address
const contractABI = require('../contracts/SustainabilityVerification.json');
const contractAddress = process.env.CONTRACT_ADDRESS;

// Create contract instance
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Verify product sustainability
router.post('/verify/:amazonId', async (req, res) => {
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

        // Verify on blockchain
        const verificationResult = await verifyOnBlockchain(product);

        // Update product sustainability status
        product.sustainability = {
            ...product.sustainability,
            verified: verificationResult.verified,
            verificationDate: new Date(),
            blockchainHash: verificationResult.hash
        };

        await product.save();

        // Update user's verified items
        if (verificationResult.verified) {
            user.verifiedItems.push({
                productId: product.amazonId,
                verificationDate: new Date(),
                sustainability: product.sustainability
            });
            await user.save();
        }

        res.json(product.sustainability);
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Error verifying product' });
    }
});

// Get verification history
router.get('/history/:amazonId', async (req, res) => {
    try {
        const product = await Product.findOne({ amazonId: req.params.amazonId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const verificationHistory = await getVerificationHistory(product.amazonId);
        res.json(verificationHistory);
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ message: 'Error fetching verification history' });
    }
});

// Helper function to verify on blockchain
async function verifyOnBlockchain(product) {
    try {
        // This is a placeholder for actual blockchain verification
        // In a real implementation, this would interact with a smart contract
        const verificationData = {
            productId: product.amazonId,
            materials: product.sustainability.materials,
            labor: product.sustainability.labor,
            carbonFootprint: product.sustainability.carbonFootprint,
            timestamp: Date.now()
        };

        // Hash the verification data
        const hash = web3.utils.sha256(JSON.stringify(verificationData));

        // Store verification on blockchain
        await contract.methods.storeVerification(
            product.amazonId,
            hash,
            verificationData.materials,
            verificationData.labor,
            verificationData.carbonFootprint
        ).send({ from: process.env.ADMIN_ADDRESS });

        return {
            verified: true,
            hash,
            data: verificationData
        };
    } catch (error) {
        console.error('Blockchain verification error:', error);
        throw error;
    }
}

// Helper function to get verification history
async function getVerificationHistory(productId) {
    try {
        // This is a placeholder for actual blockchain history retrieval
        // In a real implementation, this would query the smart contract
        const events = await contract.getPastEvents('VerificationStored', {
            filter: { productId },
            fromBlock: 0,
            toBlock: 'latest'
        });

        return events.map(event => ({
            timestamp: event.returnValues.timestamp,
            hash: event.returnValues.hash,
            materials: event.returnValues.materials,
            labor: event.returnValues.labor,
            carbonFootprint: event.returnValues.carbonFootprint
        }));
    } catch (error) {
        console.error('History retrieval error:', error);
        throw error;
    }
}

module.exports = router; 