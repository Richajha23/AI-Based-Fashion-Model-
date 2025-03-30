#!/bin/bash

# Install dependencies
npm install

# Create necessary directories
mkdir -p dist/assets

# Build the extension
npm run build

# Copy assets
cp -r assets/* dist/assets/

echo "Build complete! To install the extension in Chrome:"
echo "1. Open Chrome and go to chrome://extensions"
echo "2. Enable 'Developer mode' in the top right"
echo "3. Click 'Load unpacked' and select the 'dist' folder" 