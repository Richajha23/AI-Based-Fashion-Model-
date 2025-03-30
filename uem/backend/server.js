require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/synthstyle', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/measurements', require('./routes/measurements'));
app.use('/api/verification', require('./routes/verification'));

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('startTryOn', async (data) => {
        try {
            // Process AR try-on request
            const result = await processTryOn(data);
            socket.emit('tryOnResult', result);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('startScan', async (data) => {
        try {
            // Process body scanning
            const measurements = await processBodyScan(data);
            socket.emit('scanResult', measurements);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 