const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Rate limiting
let requestCount = 0;
let lastReset = Date.now();
const RATE_LIMIT = 5; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit() {
    const now = Date.now();
    if (now - lastReset > RATE_WINDOW) {
        requestCount = 0;
        lastReset = now;
    }
    
    if (requestCount >= RATE_LIMIT) {
        return false;
    }
    
    requestCount++;
    return true;
}

// Stock quote endpoint
router.get('/quote/:symbol', async (req, res) => {
    if (!checkRateLimit()) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    const { symbol } = req.params;
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data['Error Message']) {
            return res.status(400).json({ error: data['Error Message'] });
        }
        
        res.json(data);
    } catch (error) {
        console.error('Quote fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch quote data' });
    }
});

// Fundamentals endpoint
router.get('/fundamentals/:symbol', async (req, res) => {
    if (!checkRateLimit()) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    const { symbol } = req.params;
    const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data['Error Message']) {
            return res.status(400).json({ error: data['Error Message'] });
        }
        
        res.json(data);
    } catch (error) {
        console.error('Fundamentals fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch fundamentals data' });
    }
});

// Technical indicators endpoint
router.get('/technical/:symbol/:indicator', async (req, res) => {
    if (!checkRateLimit()) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    const { symbol, indicator } = req.params;
    const { interval = 'daily', time_period = 14 } = req.query;
    
    const url = `${BASE_URL}?function=${indicator.toUpperCase()}&symbol=${symbol}&interval=${interval}&time_period=${time_period}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data['Error Message']) {
            return res.status(400).json({ error: data['Error Message'] });
        }
        
        res.json(data);
    } catch (error) {
        console.error('Technical indicator fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch technical data' });
    }
});

// News sentiment endpoint
router.get('/news/:symbol', async (req, res) => {
    if (!checkRateLimit()) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    const { symbol } = req.params;
    const url = `${BASE_URL}?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data['Error Message']) {
            return res.status(400).json({ error: data['Error Message'] });
        }
        
        res.json(data);
    } catch (error) {
        console.error('News sentiment fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch news data' });
    }
});

// Market scan endpoint (fetches multiple stocks)
router.post('/scan', async (req, res) => {
    const { symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'AMD'] } = req.body;
    const results = [];
    
    for (const symbol of symbols.slice(0, 6)) { // Limit to 6 for free tier
        try {
            // Fetch quote and fundamentals in parallel
            const [quoteRes, fundamentalsRes] = await Promise.all([
                fetch(`${req.protocol}://${req.get('host')}/api/quote/${symbol}`),
                fetch(`${req.protocol}://${req.get('host')}/api/fundamentals/${symbol}`)
            ]);
            
            if (quoteRes.ok && fundamentalsRes.ok) {
                const quote = await quoteRes.json();
                const fundamentals = await fundamentalsRes.json();
                
                results.push({
                    symbol,
                    quote,
                    fundamentals,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Delay between requests
            await new Promise(resolve => setTimeout(resolve, 12000));
            
        } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
        }
    }
    
    res.json({ results, count: results.length });
});

module.exports = router;
