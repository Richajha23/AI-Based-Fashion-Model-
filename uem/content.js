// Initialize AR overlay
let arOverlay = null;
let isARActive = false;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'initializeAR':
            initializeAROverlay();
            break;
        case 'verifyProduct':
            verifyCurrentProduct();
            break;
    }
    return true;
});

// Initialize AR overlay
async function initializeAROverlay() {
    if (isARActive) return;
    
    try {
        // Create AR overlay container
        arOverlay = document.createElement('div');
        arOverlay.id = 'synthstyle-ar-overlay';
        arOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        // Create AR content
        const arContent = document.createElement('div');
        arContent.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 12px;
            width: 80%;
            max-width: 600px;
            position: relative;
        `;
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        `;
        closeButton.onclick = () => {
            arOverlay.remove();
            isARActive = false;
        };
        
        // Add AR viewport
        const arViewport = document.createElement('div');
        arViewport.id = 'synthstyle-ar-viewport';
        arViewport.style.cssText = `
            width: 100%;
            height: 400px;
            background: #f0f0f0;
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
        `;
        
        // Add controls
        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        `;
        
        const tryOnButton = document.createElement('button');
        tryOnButton.textContent = 'Try On';
        tryOnButton.className = 'synthstyle-button';
        tryOnButton.onclick = () => startTryOn();
        
        const captureButton = document.createElement('button');
        captureButton.textContent = 'Capture';
        captureButton.className = 'synthstyle-button';
        captureButton.onclick = () => captureImage();
        
        controls.appendChild(tryOnButton);
        controls.appendChild(captureButton);
        
        // Assemble AR overlay
        arContent.appendChild(closeButton);
        arContent.appendChild(arViewport);
        arContent.appendChild(controls);
        arOverlay.appendChild(arContent);
        document.body.appendChild(arOverlay);
        
        isARActive = true;
        
        // Initialize AR session
        await initializeARSession();
        
        sendResponse({ success: true });
    } catch (error) {
        console.error('Error initializing AR overlay:', error);
        sendResponse({ success: false, message: error.message });
    }
}

// Initialize AR session
async function initializeARSession() {
    try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Get AR viewport
        const arViewport = document.getElementById('synthstyle-ar-viewport');
        
        // Create video element
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        
        // Add video to viewport
        arViewport.appendChild(video);
        
        // Start AR processing
        startARProcessing(video);
    } catch (error) {
        console.error('Error initializing AR session:', error);
        throw error;
    }
}

// Start AR processing
function startARProcessing(video) {
    // This is a placeholder for actual AR processing
    // In a real implementation, this would use AR.js or similar library
    // to overlay clothing on the video feed
}

// Start try-on process
async function startTryOn() {
    try {
        // Get current product image
        const productImage = document.querySelector('#landingImage');
        if (!productImage) {
            throw new Error('Product image not found');
        }
        
        // Process image for AR overlay
        // This is a placeholder for actual image processing
        // In a real implementation, this would use AI models to process the clothing
        
        // Show success message
        showNotification('Try-on started! Move around to see how it looks.');
    } catch (error) {
        console.error('Error starting try-on:', error);
        showNotification('Error starting try-on. Please try again.');
    }
}

// Capture image
async function captureImage() {
    try {
        // Get AR viewport
        const arViewport = document.getElementById('synthstyle-ar-viewport');
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = arViewport.clientWidth;
        canvas.height = arViewport.clientHeight;
        
        // Draw viewport content to canvas
        const context = canvas.getContext('2d');
        context.drawImage(arViewport, 0, 0);
        
        // Convert to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'synthstyle-tryon.jpg';
        a.click();
        
        // Cleanup
        URL.revokeObjectURL(url);
        
        showNotification('Image captured!');
    } catch (error) {
        console.error('Error capturing image:', error);
        showNotification('Error capturing image. Please try again.');
    }
}

// Verify current product
async function verifyCurrentProduct() {
    try {
        // Get product ID from URL
        const productId = window.location.pathname.split('/').pop();
        
        // Send verification request
        const response = await chrome.runtime.sendMessage({
            action: 'verifyProduct',
            productId: productId
        });
        
        if (response.success && response.verified) {
            showVerificationBadge(response.verificationResult);
        }
    } catch (error) {
        console.error('Error verifying product:', error);
    }
}

// Show verification badge
function showVerificationBadge(verificationResult) {
    const badge = document.createElement('div');
    badge.className = 'synthstyle-verification-badge';
    badge.innerHTML = `
        <div class="badge-content">
            <i class="fas fa-check-circle"></i>
            <span>Verified Sustainable</span>
        </div>
        <div class="badge-details">
            <p>Materials: ${verificationResult.sustainability.materials}</p>
            <p>Labor: ${verificationResult.sustainability.labor}</p>
            <p>Carbon Footprint: ${verificationResult.sustainability.carbonFootprint}</p>
        </div>
    `;
    
    // Add badge to product page
    const productTitle = document.querySelector('#productTitle');
    if (productTitle) {
        productTitle.parentNode.insertBefore(badge, productTitle.nextSibling);
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'synthstyle-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add styles
const styles = document.createElement('style');
styles.textContent = `
    .synthstyle-button {
        background: linear-gradient(135deg, #6B46C1, #F6AD55);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 500;
        transition: transform 0.2s;
    }
    
    .synthstyle-button:hover {
        transform: scale(1.05);
    }
    
    .synthstyle-verification-badge {
        background: white;
        border: 2px solid #6B46C1;
        border-radius: 8px;
        padding: 15px;
        margin: 10px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .badge-content {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #6B46C1;
        font-weight: 600;
        margin-bottom: 10px;
    }
    
    .badge-details {
        font-size: 14px;
        color: #666;
    }
    
    .synthstyle-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #6B46C1;
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

document.head.appendChild(styles);

// Initialize product verification on page load
if (window.location.hostname.includes('amazon')) {
    verifyCurrentProduct();
} 