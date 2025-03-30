// AR Overlay functionality
class AROverlay {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.context = null;
        this.clothingImage = null;
        this.isProcessing = false;
        this.measurements = null;
    }

    // Initialize AR overlay
    async initialize() {
        try {
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            `;

            // Get AR viewport
            const arViewport = document.getElementById('synthstyle-ar-viewport');
            if (!arViewport) {
                throw new Error('AR viewport not found');
            }

            // Add canvas to viewport
            arViewport.appendChild(this.canvas);
            this.context = this.canvas.getContext('2d');

            // Get video element
            this.video = arViewport.querySelector('video');
            if (!this.video) {
                throw new Error('Video element not found');
            }

            // Set canvas size
            this.updateCanvasSize();

            // Get body measurements
            await this.getBodyMeasurements();

            // Start processing
            this.startProcessing();
        } catch (error) {
            console.error('Error initializing AR overlay:', error);
            throw error;
        }
    }

    // Update canvas size
    updateCanvasSize() {
        const arViewport = document.getElementById('synthstyle-ar-viewport');
        this.canvas.width = arViewport.clientWidth;
        this.canvas.height = arViewport.clientHeight;
    }

    // Get body measurements
    async getBodyMeasurements() {
        try {
            const result = await chrome.storage.local.get(['bodyMeasurements']);
            this.measurements = result.bodyMeasurements;
        } catch (error) {
            console.error('Error getting body measurements:', error);
        }
    }

    // Load clothing image
    async loadClothingImage(imageUrl) {
        try {
            this.clothingImage = new Image();
            this.clothingImage.src = imageUrl;
            await new Promise((resolve, reject) => {
                this.clothingImage.onload = resolve;
                this.clothingImage.onerror = reject;
            });
        } catch (error) {
            console.error('Error loading clothing image:', error);
            throw error;
        }
    }

    // Start processing
    startProcessing() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        this.processFrame();
    }

    // Process frame
    processFrame() {
        if (!this.isProcessing) return;

        // Draw video frame
        this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        // If clothing image is loaded, overlay it
        if (this.clothingImage) {
            this.overlayClothing();
        }

        // Request next frame
        requestAnimationFrame(() => this.processFrame());
    }

    // Overlay clothing
    overlayClothing() {
        if (!this.measurements || !this.clothingImage) return;

        // Calculate clothing position and size based on body measurements
        const scale = this.calculateClothingScale();
        const position = this.calculateClothingPosition();

        // Draw clothing with transparency
        this.context.globalAlpha = 0.8;
        this.context.drawImage(
            this.clothingImage,
            position.x,
            position.y,
            this.clothingImage.width * scale,
            this.clothingImage.height * scale
        );
        this.context.globalAlpha = 1.0;
    }

    // Calculate clothing scale
    calculateClothingScale() {
        if (!this.measurements) return 1;

        // This is a simplified calculation
        // In a real implementation, this would use more sophisticated scaling algorithms
        const baseHeight = 170; // Average height in cm
        return this.measurements.height / baseHeight;
    }

    // Calculate clothing position
    calculateClothingPosition() {
        if (!this.measurements) return { x: 0, y: 0 };

        // This is a simplified calculation
        // In a real implementation, this would use body tracking to position clothing
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        return {
            x: centerX - (this.clothingImage.width * this.calculateClothingScale()) / 2,
            y: centerY - (this.clothingImage.height * this.calculateClothingScale()) / 2
        };
    }

    // Stop processing
    stopProcessing() {
        this.isProcessing = false;
    }

    // Clean up
    cleanup() {
        this.stopProcessing();
        if (this.canvas) {
            this.canvas.remove();
        }
    }
}

// Initialize AR overlay when script is loaded
const arOverlay = new AROverlay();

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startTryOn') {
        arOverlay.loadClothingImage(request.imageUrl)
            .then(() => arOverlay.initialize())
            .then(() => sendResponse({ success: true }))
            .catch(error => {
                console.error('Error starting try-on:', error);
                sendResponse({ success: false, message: error.message });
            });
        return true; // Keep the message channel open for async response
    }
}); 