const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files with proper CSP headers
app.use(express.static('public'));

// Add CSP headers to allow inline scripts and styles
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline'; " +
        "connect-src 'self' https://www.alphavantage.co; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:;"
    );
    next();
});

// API Routes
app.use('/api', require('./routes/api'));

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Stock Picker Engine running on port ${PORT}`);
    console.log(`📊 Visit: http://localhost:${PORT}`);
});
