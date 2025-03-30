import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import Popup from './components/Popup';
import './styles/global.css';

// Define theme
const theme = {
  colors: {
    primary: '#ff00ff',
    secondary: '#00ffff',
    background: '#1a1a1a',
    surface: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#b0b0b0'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)'
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '15px'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px'
  },
  transitions: {
    default: '0.2s ease',
    slow: '0.3s ease'
  }
};

// Initialize the app
const init = () => {
  const container = document.getElementById('app');
  if (!container) {
    console.error('Container element not found');
    return;
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <Popup />
      </ThemeProvider>
    </React.StrictMode>
  );
};

// Load the app when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
} 