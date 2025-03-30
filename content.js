// Content script for Amazon product pages
let currentProduct = null;

// Product information extractor
class ProductExtractor {
    static getProductId() {
        const urlMatch = window.location.pathname.match(/\/dp\/([A-Z0-9]+)/);
        return urlMatch ? urlMatch[1] : null;
    }

    static getProductDetails() {
        return {
            id: this.getProductId(),
            title: document.getElementById('productTitle')?.textContent.trim(),
            price: document.querySelector('.a-price-whole')?.textContent,
            category: document.querySelector('#wayfinding-breadcrumbs_container')?.textContent.trim(),
            images: Array.from(document.querySelectorAll('#altImages img')).map(img => img.src),
            description: document.querySelector('#productDescription')?.textContent.trim()
        };
    }
}

// Virtual Try-On Overlay
class VirtualTryOnOverlay {
    constructor() {
        this.overlay = null;
        this.canvas = null;
    }

    create() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'syntstyle-tryon-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            display: none;
        `;

        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        `;

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 24px;
            color: white;
            background: none;
            border: none;
            cursor: pointer;
        `;
        closeButton.onclick = () => this.hide();

        this.overlay.appendChild(this.canvas);
        this.overlay.appendChild(closeButton);
        document.body.appendChild(this.overlay);
    }

    show() {
        this.overlay.style.display = 'block';
    }

    hide() {
        this.overlay.style.display = 'none';
    }

    updateCanvas(imageData) {
        const ctx = this.canvas.getContext('2d');
        // Implementation for updating canvas with virtual try-on
    }
}

// Sustainability Badge
class SustainabilityBadge {
    constructor() {
        this.badge = null;
    }

    create(score) {
        this.badge = document.createElement('div');
        this.badge.id = 'syntstyle-sustainability-badge';
        this.badge.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 10px 15px;
            background: linear-gradient(135deg, #8A2BE2, #FF8C00);
            color: white;
            border-radius: 8px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        this.updateScore(score);
        document.body.appendChild(this.badge);
    }

    updateScore(score) {
        if (this.badge) {
            this.badge.textContent = `Sustainability Score: ${score}%`;
            this.badge.style.background = score > 70 
                ? 'linear-gradient(135deg, #4CAF50, #8BC34A)'
                : 'linear-gradient(135deg, #FF5722, #FF9800)';
        }
    }
}

// Initialize components
const tryOnOverlay = new VirtualTryOnOverlay();
const sustainabilityBadge = new SustainabilityBadge();
tryOnOverlay.create();

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'GET_PRODUCT_ID':
            sendResponse({ productId: ProductExtractor.getProductId() });
            break;
        case 'GET_PRODUCT_DETAILS':
            sendResponse({ product: ProductExtractor.getProductDetails() });
            break;
        case 'SHOW_VIRTUAL_TRYON':
            tryOnOverlay.show();
            tryOnOverlay.updateCanvas(request.imageData);
            sendResponse({ success: true });
            break;
        case 'UPDATE_SUSTAINABILITY':
            sustainabilityBadge.create(request.score);
            sendResponse({ success: true });
            break;
    }
    return true;
});

// Initialize product tracking
function initializeProductTracking() {
    const productId = ProductExtractor.getProductId();
    if (productId && productId !== currentProduct) {
        currentProduct = productId;
        chrome.runtime.sendMessage({
            type: 'PRODUCT_CHANGED',
            product: ProductExtractor.getProductDetails()
        });
    }
}

// Watch for product page changes
const observer = new MutationObserver(initializeProductTracking);
observer.observe(document.body, { childList: true, subtree: true });
initializeProductTracking(); 