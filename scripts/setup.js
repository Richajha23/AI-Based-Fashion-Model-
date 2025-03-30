const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
    try {
        console.log('Welcome to SynthStyle Setup!');
        console.log('This script will help you set up your development environment.\n');

        // Check Node.js version
        const nodeVersion = process.version;
        console.log(`Node.js version: ${nodeVersion}`);
        if (parseInt(nodeVersion.slice(1)) < 16) {
            console.error('Error: Node.js version 16 or higher is required');
            process.exit(1);
        }

        // Check if MongoDB is installed
        try {
            execSync('mongod --version', { stdio: 'ignore' });
            console.log('MongoDB is installed');
        } catch (error) {
            console.log('MongoDB is not installed. Installing...');
            // Add MongoDB installation commands based on OS
            if (process.platform === 'darwin') {
                execSync('brew tap mongodb/brew && brew install mongodb-community');
            } else if (process.platform === 'linux') {
                execSync('sudo apt-get install -y mongodb');
            } else {
                console.error('Please install MongoDB manually for your operating system');
                process.exit(1);
            }
        }

        // Create necessary directories
        const directories = [
            'backend/models',
            'backend/services',
            'backend/routes',
            'frontend/components',
            'frontend/pages',
            'frontend/assets',
            'models',
            'public',
            'scripts',
            'styles',
            'assets'
        ];

        directories.forEach(dir => {
            const dirPath = path.join(__dirname, '..', dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`Created directory: ${dir}`);
            }
        });

        // Create .env file if it doesn't exist
        const envPath = path.join(__dirname, '..', '.env');
        if (!fs.existsSync(envPath)) {
            const envTemplate = fs.readFileSync(path.join(__dirname, '..', '.env.example'));
            fs.writeFileSync(envPath, envTemplate);
            console.log('Created .env file from template');
        }

        // Install dependencies
        console.log('\nInstalling dependencies...');
        execSync('npm install', { stdio: 'inherit' });

        // Set up API keys
        console.log('\nSetting up API keys...');
        const openaiKey = await question('Enter your OpenAI API key: ');
        const mongoUri = await question('Enter your MongoDB connection URI: ');
        const ethereumNode = await question('Enter your Ethereum node URL: ');

        // Update .env file with API keys
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent
            .replace('YOUR_OPENAI_API_KEY', openaiKey)
            .replace('YOUR_MONGODB_URI', mongoUri)
            .replace('YOUR_ETHEREUM_NODE_URL', ethereumNode);
        fs.writeFileSync(envPath, envContent);

        // Initialize MongoDB
        console.log('\nInitializing MongoDB...');
        execSync('mongod --dbpath ./data/db', { stdio: 'ignore' });

        // Train initial models
        console.log('\nTraining initial AI models...');
        execSync('npm run train', { stdio: 'inherit' });

        // Build the project
        console.log('\nBuilding the project...');
        execSync('npm run build', { stdio: 'inherit' });

        console.log('\nSetup completed successfully!');
        console.log('\nTo start the development server:');
        console.log('1. Start MongoDB: mongod --dbpath ./data/db');
        console.log('2. Run: npm run dev');
        console.log('\nTo load the extension in Chrome:');
        console.log('1. Open chrome://extensions/');
        console.log('2. Enable Developer mode');
        console.log('3. Click "Load unpacked"');
        console.log('4. Select the dist folder');

        rl.close();
    } catch (error) {
        console.error('Error during setup:', error);
        process.exit(1);
    }
}

setup(); 