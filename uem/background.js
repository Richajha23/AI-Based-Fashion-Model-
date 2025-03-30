// Initialize extension state
let isScanning = false;
let isTryingOn = false;

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'startTryOn':
            handleTryOn(sender.tab.id);
            break;
        case 'startScan':
            handleScan(request.stream);
            break;
        case 'verifyProduct':
            handleProductVerification(request.productId);
            break;
        case 'updateStats':
            updateStats(request.stats);
            break;
    }
    return true; // Keep the message channel open for async responses
});

// Handle virtual try-on process
async function handleTryOn(tabId) {
    if (isTryingOn) {
        return { success: false, message: 'Try-on already in progress' };
    }

    isTryingOn = true;
    try {
        // Inject AR overlay
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['ar-overlay.js']
        });

        // Initialize AR session
        const response = await chrome.tabs.sendMessage(tabId, {
            action: 'initializeAR'
        });

        if (response.success) {
            updateStats({ tryOns: 1 });
            return { success: true };
        }
    } catch (error) {
        console.error('Error in try-on process:', error);
        return { success: false, message: error.message };
    } finally {
        isTryingOn = false;
    }
}

// Handle body scanning process
async function handleScan(stream) {
    if (isScanning) {
        return { success: false, message: 'Scan already in progress' };
    }

    isScanning = true;
    try {
        // Process video stream for body measurements
        const measurements = await processVideoStream(stream);
        
        // Store measurements
        await chrome.storage.local.set({
            bodyMeasurements: measurements
        });

        return { success: true, measurements };
    } catch (error) {
        console.error('Error in scanning process:', error);
        return { success: false, message: error.message };
    } finally {
        isScanning = false;
    }
}

// Process video stream for body measurements
async function processVideoStream(stream) {
    // This is a placeholder for the actual AI processing
    // In a real implementation, this would use computer vision and AI models
    return {
        height: 170,
        chest: 95,
        waist: 80,
        hips: 95
    };
}

// Handle product verification
async function handleProductVerification(productId) {
    try {
        // Verify product on blockchain
        const verificationResult = await verifyOnBlockchain(productId);
        
        if (verificationResult.verified) {
            updateStats({ verifiedItems: 1 });
            return { success: true, verified: true };
        }
        
        return { success: true, verified: false };
    } catch (error) {
        console.error('Error in product verification:', error);
        return { success: false, message: error.message };
    }
}

// Verify product on blockchain
async function verifyOnBlockchain(productId) {
    // This is a placeholder for actual blockchain verification
    // In a real implementation, this would interact with a blockchain network
    return {
        verified: true,
        sustainability: {
            materials: 'Organic Cotton',
            labor: 'Fair Trade Certified',
            carbonFootprint: 'Low'
        }
    };
}

// Update extension statistics
async function updateStats(stats) {
    const currentStats = await chrome.storage.local.get(['verifiedItems', 'tryOns']);
    
    const newStats = {
        verifiedItems: (currentStats.verifiedItems || 0) + (stats.verifiedItems || 0),
        tryOns: (currentStats.tryOns || 0) + (stats.tryOns || 0)
    };
    
    await chrome.storage.local.set(newStats);
    
    // Notify popup to update UI
    chrome.runtime.sendMessage({
        action: 'updateStats'
    });
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
    // Set initial stats
    chrome.storage.local.set({
        verifiedItems: 0,
        tryOns: 0
    });
}); 