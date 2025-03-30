// Background script for SynthStyle extension

// Cache for product data
const productCache = new Map();

// Smart contract instance for blockchain verification
let sustainabilityContract;

// Initialize Web3 and contract
async function initializeBlockchain() {
    try {
        const web3 = new Web3(Web3.givenProvider);
        const contractAddress = "YOUR_CONTRACT_ADDRESS";
        const contractABI = []; // Your contract ABI
        sustainabilityContract = new web3.eth.Contract(contractABI, contractAddress);
    } catch (error) {
        console.error('Failed to initialize blockchain:', error);
    }
}

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'PRODUCT_CHANGED':
            handleProductChange(request.product, sender.tab.id);
            break;
        case 'VERIFY_SUSTAINABILITY':
            verifySustainability(request.productId, sender.tab.id);
            break;
        case 'GET_CACHED_PRODUCT':
            sendResponse({ product: productCache.get(request.productId) });
            break;
    }
    return true;
});

// Handle product page changes
async function handleProductChange(product, tabId) {
    if (!product || !product.id) return;

    // Cache product data
    productCache.set(product.id, product);

    try {
        // Verify sustainability
        const sustainabilityData = await verifySustainability(product.id);
        
        // Update badge in content script
        chrome.tabs.sendMessage(tabId, {
            type: 'UPDATE_SUSTAINABILITY',
            score: sustainabilityData.score
        });

        // Prepare AR/3D model if available
        if (product.category.includes('Clothing') || product.category.includes('Shoes')) {
            prepareVirtualTryOn(product, tabId);
        }
    } catch (error) {
        console.error('Error handling product change:', error);
    }
}

// Verify product sustainability using blockchain
async function verifySustainability(productId) {
    try {
        const result = await sustainabilityContract.methods.verifyProduct(productId).call();
        return {
            verified: result.verified,
            score: result.score,
            certifications: result.certifications
        };
    } catch (error) {
        console.error('Sustainability verification failed:', error);
        return {
            verified: false,
            score: 0,
            certifications: []
        };
    }
}

// Prepare virtual try-on
async function prepareVirtualTryOn(product, tabId) {
    try {
        // Load 3D model for the product
        const modelUrl = await get3DModelUrl(product.id);
        
        // Send model data to content script
        if (modelUrl) {
            chrome.tabs.sendMessage(tabId, {
                type: 'PREPARE_VIRTUAL_TRYON',
                modelUrl: modelUrl
            });
        }
    } catch (error) {
        console.error('Error preparing virtual try-on:', error);
    }
}

// Get 3D model URL from API
async function get3DModelUrl(productId) {
    // Implementation for getting 3D model URL
    return `https://api.syntstyle.com/models/${productId}.glb`;
}

// Analytics tracking
function trackEvent(eventName, data) {
    // Implementation for analytics tracking
    console.log('Analytics:', eventName, data);
}

// Initialize extension
async function initialize() {
    await initializeBlockchain();
    
    // Set up alarm for periodic cache cleanup
    chrome.alarms.create('cleanCache', { periodInMinutes: 60 });
}

// Clean up cache periodically
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'cleanCache') {
        productCache.clear();
    }
});

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Show onboarding page
        chrome.tabs.create({
            url: 'onboarding.html'
        });
    }
});

// Initialize when extension loads
initialize(); 