// Preferences form handler
class PreferencesManager {
    constructor() {
        this.form = document.getElementById('preferencesForm');
        this.preferences = {};
        this.initializeForm();
    }

    async initializeForm() {
        // Load existing preferences
        try {
            const savedPreferences = await this.loadPreferences();
            if (savedPreferences) {
                this.preferences = savedPreferences;
                this.populateForm();
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }

        // Set up form submission handler
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Set up real-time validation
        this.setupValidation();
    }

    async loadPreferences() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['userPreferences'], (result) => {
                resolve(result.userPreferences || null);
            });
        });
    }

    async savePreferences(preferences) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ userPreferences: preferences }, () => {
                resolve();
            });
        });
    }

    populateForm() {
        // Populate form fields with saved preferences
        Object.entries(this.preferences).forEach(([key, value]) => {
            const element = this.form.elements[key];
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'select-multiple') {
                    Array.from(element.options).forEach(option => {
                        option.selected = value.includes(option.value);
                    });
                } else {
                    element.value = value;
                }
            }
        });
    }

    setupValidation() {
        // Real-time validation for measurements
        const measurementInputs = ['height', 'weight', 'bust', 'waist', 'hips'];
        measurementInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => this.validateMeasurement(input));
            }
        });
    }

    validateMeasurement(input) {
        const value = parseFloat(input.value);
        let isValid = true;
        let errorMessage = '';

        switch (input.id) {
            case 'height':
                isValid = value >= 100 && value <= 250;
                errorMessage = 'Height should be between 100cm and 250cm';
                break;
            case 'weight':
                isValid = value >= 30 && value <= 300;
                errorMessage = 'Weight should be between 30kg and 300kg';
                break;
            case 'bust':
            case 'waist':
            case 'hips':
                isValid = value >= 40 && value <= 200;
                errorMessage = 'Measurement should be between 40cm and 200cm';
                break;
        }

        this.updateValidationUI(input, isValid, errorMessage);
    }

    updateValidationUI(input, isValid, errorMessage) {
        const errorElement = this.getOrCreateErrorElement(input);
        
        if (!isValid && input.value) {
            input.classList.add('invalid');
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
        } else {
            input.classList.remove('invalid');
            errorElement.style.display = 'none';
        }
    }

    getOrCreateErrorElement(input) {
        const errorId = `${input.id}-error`;
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = errorId;
            errorElement.className = 'error-message';
            errorElement.style.color = '#ff4444';
            errorElement.style.fontSize = '0.8rem';
            errorElement.style.marginTop = '0.25rem';
            input.parentNode.appendChild(errorElement);
        }
        
        return errorElement;
    }

    async handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(this.form);
        const preferences = {};

        // Process form data
        for (const [key, value] of formData.entries()) {
            if (key === 'colors' || key === 'fabrics' || key === 'sustainability') {
                if (!preferences[key]) {
                    preferences[key] = [];
                }
                preferences[key].push(value);
            } else if (key === 'patterns') {
                preferences[key] = Array.from(this.form.elements[key].selectedOptions).map(option => option.value);
            } else {
                preferences[key] = value;
            }
        }

        try {
            // Save preferences
            await this.savePreferences(preferences);
            this.showSuccessMessage();

            // Notify background script
            chrome.runtime.sendMessage({
                type: 'PREFERENCES_UPDATED',
                preferences: preferences
            });
        } catch (error) {
            console.error('Error saving preferences:', error);
            this.showErrorMessage();
        }
    }

    showSuccessMessage() {
        this.showMessage('Preferences saved successfully!', 'success');
    }

    showErrorMessage() {
        this.showMessage('Error saving preferences. Please try again.', 'error');
    }

    showMessage(text, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = text;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
            z-index: 1000;
        `;

        if (type === 'success') {
            messageElement.style.background = '#4CAF50';
        } else {
            messageElement.style.background = '#ff4444';
        }

        document.body.appendChild(messageElement);

        setTimeout(() => {
            messageElement.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 300);
        }, 3000);
    }
}

// Initialize preferences manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PreferencesManager();
});

// Add necessary styles for animations
const style = document.createElement('style');
style.textContent = `
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

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .invalid {
        border-color: #ff4444 !important;
    }
`;
document.head.appendChild(style); 