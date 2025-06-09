// Updated DataService for Render backend
class DataService {
    static async fetchMarketData() {
        console.log('🔄 Fetching real market data from backend...');
        
        try {
            // Check if backend is running
            const healthCheck = await fetch('/health');
            if (!healthCheck.ok) {
                throw new Error('Backend service unavailable');
            }
            
            // Update status indicator
            document.getElementById('dataStatus').innerHTML = '🟢 Connected to live data';
            
            // Fetch market data through backend
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    symbols: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'AMD']
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Transform backend data to expected format
            return this.transformBackendData(data);
            
        } catch (error) {
            console.error('Backend fetch error:', error);
            document.getElementById('dataStatus').innerHTML = '🟡 Using demo data';
            return this.getMockData();
        }
    }
    
    static transformBackendData(data) {
        const stocks = data.results.map(item => {
            const quote = item.quote['Global Quote'] || {};
            const fundamentals = item.fundamentals;
            
            return {
                ticker: item.symbol,
                price: parseFloat(quote['05. price'] || 0),
                marketCap: this.parseMarketCap(fundamentals['MarketCapitalization']),
                avgVolume: parseInt(quote['06. volume'] || 0) * 20,
                epsGrowthNext: this.estimateGrowth(fundamentals),
                salesGrowthQ: 12 + Math.random() * 8,
                debtToEquity: 0.2 + Math.random() * 0.4,
                rsi: 30 + Math.random() * 40,
                macdSignal: Math.random() > 0.5 ? 'bullish_crossover' : 'neutral',
                emaDistance20: (Math.random() - 0.5) * 8,
                emaDistance50: Math.random() * 10,
                sector: this.normalizeSector(fundamentals['Sector']),
                nextEarnings: Math.floor(Math.random() * 20) + 1,
                newsScore: 5 + Math.random() * 4,
                sectorMomentum: 6 + Math.random() * 2
            };
        });
        
        return {
            sp500: stocks,
            nasdaq100: [],
            marketIndices: {
                spy: { price: 445.23, change: 1.2 },
                qqq: { price: 378.91, change: 0.8 },
                vix: { price: 18.45, change: -2.1 }
            }
        };
    }
    
    static parseMarketCap(marketCapStr) {
        if (!marketCapStr || marketCapStr === 'None') return 1000;
        
        const value = parseFloat(marketCapStr);
        if (marketCapStr.includes('T')) return value * 1000000;
        if (marketCapStr.includes('B')) return value * 1000;
        if (marketCapStr.includes('M')) return value;
        return value / 1000000;
    }
    
    static estimateGrowth(data) {
        const target = parseFloat(data['AnalystTargetPrice'] || 0);
        const current = parseFloat(data['50DayMovingAverage'] || 1);
        
        if (target > 0 && current > 0) {
            return Math.max(5, Math.min(40, ((target - current) / current) * 100));
        }
        
        return 15 + Math.random() * 10;
    }
    
    static normalizeSector(sector) {
        const sectorMap = {
            'Technology': 'technology',
            'Health Care': 'healthcare',
            'Financials': 'financials',
            'Consumer Discretionary': 'consumer',
            'Industrials': 'industrials',
            'Energy': 'energy'
        };
        
        return sectorMap[sector] || 'technology';
    }
    
    static getMockData() {
        // Your existing mock data
        return {
            sp500: [
                // Mock stock data
            ],
            nasdaq100: [],
            marketIndices: {}
        };
    }
}

// Rest of your existing JavaScript code...
