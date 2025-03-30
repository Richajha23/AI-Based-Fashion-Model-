const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

// Create a file to write archive data to
const output = fs.createWriteStream(path.join(__dirname, '../synthstyle.zip'));
const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', () => {
    console.log(`Archive created successfully: ${archive.pointer()} total bytes`);
});

// Good practice to catch warnings (specifically stat failures and other non-blocking errors)
archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
        console.warn(err);
    } else {
        throw err;
    }
});

// Good practice to catch this error explicitly
archive.on('error', (err) => {
    throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add files and directories to the archive
const directories = [
    'backend',
    'frontend',
    'models',
    'public',
    'scripts',
    'styles',
    'assets'
];

const files = [
    'package.json',
    'package-lock.json',
    'README.md',
    '.env.example',
    'webpack.config.js'
];

// Add directories
directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
        archive.directory(dirPath, dir);
    }
});

// Add individual files
files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: file });
    }
});

// Finalize the archive
archive.finalize();

// Create a download script
const downloadScript = `
#!/bin/bash

# Download the project
curl -L -o synthstyle.zip https://your-domain.com/synthstyle.zip

# Extract the project
unzip synthstyle.zip

# Install dependencies
cd synthstyle
npm install

# Build the project
npm run build

# Start the development server
npm run dev
`;

fs.writeFileSync(path.join(__dirname, '../download.sh'), downloadScript);
fs.chmodSync(path.join(__dirname, '../download.sh'), '755');

console.log('Download script created successfully'); 