document.addEventListener('DOMContentLoaded', function() {
    // Initialize buttons
    const tryOnButton = document.getElementById('startTryOn');
    const scanButton = document.getElementById('startScan');
    
    // Add ripple effect to buttons
    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        button.appendChild(ripple);
        
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }
    
    tryOnButton.addEventListener('click', createRipple);
    scanButton.addEventListener('click', createRipple);
    
    // Handle try-on button click
    tryOnButton.addEventListener('click', async function() {
        this.disabled = true;
        this.innerHTML = '<span class="button-content"><i class="fas fa-spinner fa-spin"></i> Processing...</span>';
        
        try {
            // Send message to background script to start try-on process
            const response = await chrome.runtime.sendMessage({
                action: 'startTryOn'
            });
            
            if (response.success) {
                // Update UI with success state
                this.innerHTML = '<span class="button-content"><i class="fas fa-check"></i> Try-On Started</span>';
            } else {
                throw new Error('Failed to start try-on');
            }
        } catch (error) {
            console.error('Error starting try-on:', error);
            this.innerHTML = '<span class="button-content"><i class="fas fa-exclamation-circle"></i> Error</span>';
        } finally {
            setTimeout(() => {
                this.disabled = false;
                this.innerHTML = '<span class="button-content"><i class="fas fa-tshirt"></i> Start Try-On</span>';
            }, 3000);
        }
    });
    
    // Handle scan button click
    scanButton.addEventListener('click', async function() {
        this.disabled = true;
        this.innerHTML = '<span class="button-content"><i class="fas fa-spinner fa-spin"></i> Scanning...</span>';
        
        try {
            // Request camera permission
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Send message to background script to start scanning process
            const response = await chrome.runtime.sendMessage({
                action: 'startScan',
                stream: stream
            });
            
            if (response.success) {
                // Update UI with success state
                this.innerHTML = '<span class="button-content"><i class="fas fa-check"></i> Scan Complete</span>';
            } else {
                throw new Error('Failed to complete scan');
            }
        } catch (error) {
            console.error('Error during scan:', error);
            this.innerHTML = '<span class="button-content"><i class="fas fa-exclamation-circle"></i> Error</span>';
        } finally {
            setTimeout(() => {
                this.disabled = false;
                this.innerHTML = '<span class="button-content"><i class="fas fa-camera"></i> Scan Body</span>';
            }, 3000);
        }
    });
    
    // Update stats
    function updateStats() {
        chrome.storage.local.get(['verifiedItems', 'tryOns'], function(result) {
            document.querySelector('.stat-number:nth-child(1)').textContent = result.verifiedItems || 0;
            document.querySelector('.stat-number:nth-child(2)').textContent = result.tryOns || 0;
        });
    }
    
    // Listen for stats updates
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'updateStats') {
            updateStats();
        }
    });
    
    // Initial stats update
    updateStats();
}); 