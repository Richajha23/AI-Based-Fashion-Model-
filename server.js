const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve the preview page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'preview.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Preview server running at http://localhost:${PORT}`);
}); 