# SynthStyle - AI-Powered Fashion Shopping Assistant

SynthStyle is a comprehensive fashion shopping assistant that combines AI, AR/VR, and blockchain technologies to provide an immersive and sustainable shopping experience.

## Features

### 1. Virtual Try-On
- Real-time clothing visualization
- Accurate body measurements
- Fit analysis and recommendations
- Multiple view angles

### 2. AR/VR Experience
- AR product visualization
- VR showroom for immersive shopping
- Interactive product exploration
- Real-time customization

### 3. AI-Powered Recommendations
- Personalized style suggestions
- Outfit combinations
- Trend analysis
- Size recommendations

### 4. Sustainability Features
- Blockchain-verified sustainability
- Environmental impact tracking
- Sustainable purchase recommendations
- Carbon footprint calculation

## Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Chrome browser
- Webcam (for virtual try-on)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/synthstyle.git
cd synthstyle
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. Start the development server:
```bash
npm run dev
```

5. Load the extension in Chrome:
- Open Chrome and go to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `dist` folder

### Usage

1. **Virtual Try-On**
   - Click the SynthStyle extension icon
   - Select "Virtual Try-On"
   - Follow the on-screen instructions for body scanning
   - Try on different clothing items

2. **AR/VR Shopping**
   - Click "AR View" to see products in your environment
   - Click "VR Showroom" for an immersive shopping experience
   - Use gestures to interact with products

3. **Style Recommendations**
   - View personalized recommendations
   - Get outfit suggestions
   - Track your style preferences

4. **Sustainability Features**
   - View product sustainability scores
   - Track your environmental impact
   - Get sustainable shopping recommendations

## Project Structure

```
synthstyle/
├── backend/              # Backend services
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   └── server.js        # Main server file
├── frontend/            # Frontend components
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   └── assets/         # Static assets
├── models/             # AI/ML models
├── public/             # Public assets
├── scripts/            # Utility scripts
├── styles/             # CSS styles
└── assets/             # Project assets
```

## Development

### Training AI Models
```bash
npm run train
```

### Collecting Data
```bash
npm run collect-data
```

### Building the Extension
```bash
npm run build
```

## Troubleshooting

### Common Issues

1. **Virtual Try-On Not Working**
   - Ensure your webcam is connected and accessible
   - Check browser permissions
   - Try clearing browser cache

2. **AR/VR Features Not Loading**
   - Verify WebXR support in your browser
   - Check device compatibility
   - Ensure proper permissions

3. **Performance Issues**
   - Clear browser cache
   - Check internet connection
   - Update to latest version

### Support

For additional support:
- Check the [FAQ](docs/FAQ.md)
- Join our [Discord community](https://discord.gg/synthstyle)
- Contact support at support@synthstyle.com

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- TensorFlow.js for AI capabilities
- Three.js for 3D rendering
- Web3.js for blockchain integration
- MediaPipe for pose detection

## Roadmap

- [ ] Enhanced AR features
- [ ] Mobile app development
- [ ] Social sharing features
- [ ] Advanced AI recommendations
- [ ] Multi-language support

## Contact

- Website: https://synthstyle.com
- Email: contact@synthstyle.com
- Twitter: @synthstyle
- Instagram: @synthstyle 