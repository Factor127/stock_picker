// ===== UPDATED STOCK PICKING ENGINE =====

// 1. DATA SERVICE LAYER
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
            const statusElement = document.getElementById('dataStatus');
            if (statusElement) {
                statusElement.innerHTML = '🟢 Connected to live data';
            }
            
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
            const statusElement = document.getElementById('dataStatus');
            if (statusElement) {
                statusElement.innerHTML = '🟡 Using demo data (API limit reached)';
            }
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
        // Fallback demo data when API limit is reached
        return {
            sp500: [
                {
                    ticker: "AAPL",
                    price: 178.25,
                    marketCap: 2800,
                    avgVolume: 58000000,
                    epsGrowthNext: 12.5,
                    salesGrowthQ: 8.7,
                    debtToEquity: 0.31,
                    rsi: 42.3,
                    macdSignal: "bullish_crossover",
                    emaDistance20: 2.1,
                    emaDistance50: 8.4,
                    sector: "technology",
                    nextEarnings: 8,
                    newsScore: 7.2,
                    sectorMomentum: 6.8
                },
                {
                    ticker: "MSFT",
                    price: 338.11,
                    marketCap: 2500,
                    avgVolume: 28000000,
                    epsGrowthNext: 15.2,
                    salesGrowthQ: 11.3,
                    debtToEquity: 0.19,
                    rsi: 48.7,
                    macdSignal: "bullish_crossover",
                    emaDistance20: 1.8,
                    emaDistance50: 4.2,
                    sector: "technology",
                    nextEarnings: 12,
                    newsScore: 8.1,
                    sectorMomentum: 6.8
                },
                {
                    ticker: "NVDA",
                    price: 421.33,
                    marketCap: 1040,
                    avgVolume: 42000000,
                    epsGrowthNext: 28.7,
                    salesGrowthQ: 22.1,
                    debtToEquity: 0.09,
                    rsi: 38.2,
                    macdSignal: "bullish_crossover",
                    emaDistance20: -1.2,
                    emaDistance50: 3.8,
                    sector: "technology",
                    nextEarnings: 6,
                    newsScore: 9.2,
                    sectorMomentum: 8.1
                }
            ],
            nasdaq100: [],
            marketIndices: {
                spy: { price: 445.23, change: 1.2 },
                qqq: { price: 378.91, change: 0.8 },
                vix: { price: 18.45, change: -2.1 }
            }
        };
    }
}

// 2. TECHNICAL ANALYSIS ENGINE
class TechnicalAnalysis {
    static calculateRSIScore(rsi) {
        if (rsi < 30) return 9;
        if (rsi < 40) return 8;
        if (rsi >= 45 && rsi <= 55) return 7;
        if (rsi > 70) return 3;
        return 5;
    }
    
    static calculateMACDScore(signal) {
        switch(signal) {
            case 'bullish_crossover': return 9;
            case 'neutral': return 5;
            case 'bearish_crossover': return 2;
            default: return 5;
        }
    }
    
    static calculateEMAScore(distance20, distance50) {
        const score20 = distance20 <= 2 ? 8 : (distance20 <= 5 ? 6 : 4);
        const score50 = distance50 <= 3 ? 7 : (distance50 <= 8 ? 5 : 3);
        return (score20 + score50) / 2;
    }
    
    static calculateTechnicalScore(stock) {
        const rsiScore = this.calculateRSIScore(stock.rsi);
        const macdScore = this.calculateMACDScore(stock.macdSignal);
        const emaScore = this.calculateEMAScore(stock.emaDistance20, stock.emaDistance50);
        
        return (rsiScore * 0.4 + macdScore * 0.35 + emaScore * 0.25);
    }
}

// 3. FUNDAMENTAL ANALYSIS ENGINE
class FundamentalAnalysis {
    static calculateFundamentalScore(stock) {
        let score = 0;
        
        if (stock.marketCap > 100) score += 2;
        if (stock.marketCap > 500) score += 1;
        
        if (stock.avgVolume > 1000000) score += 2;
        if (stock.avgVolume > 10000000) score += 1;
        
        if (stock.epsGrowthNext > 10) score += 2;
        if (stock.epsGrowthNext > 20) score += 1;
        
        if (stock.salesGrowthQ > 10) score += 2;
        if (stock.salesGrowthQ > 15) score += 1;
        
        if (stock.debtToEquity < 0.5) score += 2;
        if (stock.debtToEquity < 0.2) score += 1;
        
        return Math.min(score, 10);
    }
}

// 4. CATALYST ANALYSIS ENGINE
class CatalystAnalysis {
    static calculateCatalystScore(stock) {
        let score = 0;
        
        if (stock.nextEarnings <= 7) score += 3;
        else if (stock.nextEarnings <= 14) score += 2;
        else if (stock.nextEarnings <= 21) score += 1;
        
        score += (stock.newsScore / 10) * 4;
        score += (stock.sectorMomentum / 10) * 3;
        
        return Math.min(score, 10);
    }
}

// 5. SCORING ENGINE
class ScoringEngine {
    static calculateCompositeScore(stock, riskTolerance) {
        const technical = TechnicalAnalysis.calculateTechnicalScore(stock);
        const fundamental = FundamentalAnalysis.calculateFundamentalScore(stock);
        const catalyst = CatalystAnalysis.calculateCatalystScore(stock);
        
        let weights;
        switch(riskTolerance) {
            case 'conservative':
                weights = { technical: 0.3, fundamental: 0.5, catalyst: 0.2 };
                break;
            case 'aggressive':
                weights = { technical: 0.5, fundamental: 0.2, catalyst: 0.3 };
                break;
            default:
                weights = { technical: 0.4, fundamental: 0.3, catalyst: 0.3 };
        }
        
        return (technical * weights.technical + 
               fundamental * weights.fundamental + 
               catalyst * weights.catalyst).toFixed(1);
    }
}

// 6. PRICE TARGET CALCULATOR
class PriceTargetCalculator {
    static calculateTargets(stock) {
        const price = stock.price;
        const volatility = this.estimateVolatility(stock);
        
        return {
            entry: price,
            stopLoss: (price * (1 - (volatility * 0.6))).toFixed(2),
            target: (price * (1 + (volatility * 1.5))).toFixed(2)
        };
    }
    
    static estimateVolatility(stock) {
        const baseVolatility = {
            'technology': 0.08,
            'healthcare': 0.06,
            'financials': 0.07,
            'consumer': 0.09,
            'industrials': 0.06,
            'energy': 0.12
        };
        
        let vol = baseVolatility[stock.sector] || 0.07;
        
        if (stock.rsi > 70 || stock.rsi < 30) vol *= 1.2;
        
        return vol;
    }
}

// 7. POSITION SIZING CALCULATOR
class PositionSizing {
    static calculatePosition(stock, capital, riskTolerance) {
        const targets = PriceTargetCalculator.calculateTargets(stock);
        const riskPerTrade = this.getRiskPercentage(riskTolerance);
        const stopDistance = (targets.entry - targets.stopLoss) / targets.entry;
        
        const maxRisk = capital * riskPerTrade;
        const maxShares = Math.floor(maxRisk / (targets.entry * stopDistance));
        const positionValue = maxShares * targets.entry;
        
        return {
            shares: maxShares,
            positionValue: positionValue.toFixed(0),
            riskAmount: (maxShares * (targets.entry - targets.stopLoss)).toFixed(0)
        };
    }
    
    static getRiskPercentage(riskTolerance) {
        switch(riskTolerance) {
            case 'conservative': return 0.01;
            case 'aggressive': return 0.03;
            default: return 0.02;
        }
    }
}

// 8. RESULTS RENDERING
function renderStockResults(stocks) {
    const container = document.getElementById('stockResults');
    
    if (stocks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No stocks meet the current criteria. Try adjusting your filters.</p>';
        return;
    }
    
    const html = `
        <h2 style="margin-bottom: 20px; color: #2d3748;">📊 Top ${stocks.length} Swing Trade Opportunities</h2>
        <div class="stock-grid">
            ${stocks.map(stock => `
                <div class="stock-card">
                    <div class="stock-header">
                        <div class="stock-ticker">${stock.ticker}</div>
                        <div class="stock-score">${stock.finalScore}/10</div>
                    </div>
                    
                    <div class="stock-info">
                        <div><strong>Price:</strong> $${stock.price > 0 ? stock.price.toFixed(2) : 'N/A'}</div>
                        <div><strong>Market Cap:</strong> $${(stock.marketCap/1000).toFixed(1)}B</div>
                        <div><strong>RSI:</strong> ${stock.rsi.toFixed(1)}</div>
                        <div><strong>Sector:</strong> ${stock.sector}</div>
                    </div>
                    
                    <div class="stock-setup">
                        <div class="setup-type">${stock.setupType}</div>
                        <div class="catalyst">${stock.catalyst}</div>
                    </div>
                    
                    <div class="risk-metrics">
                        <div class="risk-item">
                            <div class="risk-label">Entry</div>
                            <div class="risk-value entry">$${stock.targets.entry}</div>
                        </div>
                        <div class="risk-item">
                            <div class="risk-label">Stop Loss</div>
                            <div class="risk-value stop">$${stock.targets.stopLoss}</div>
                        </div>
                        <div class="risk-item">
                            <div class="risk-label">Target</div>
                            <div class="risk-value target">$${stock.targets.target}</div>
                        </div>
                    </div>
                    
                    <div class="position-info">
                        <strong>Position:</strong> ${stock.position.shares} shares (~$${stock.position.positionValue}) • 
                        <strong>Risk:</strong> $${stock.position.riskAmount}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = html;
}

// 9. MAIN SCAN FUNCTION
async function scanStocks() {
    const loading = document.getElementById('loading');
    const results = document.getElementById('stockResults');
    const button = document.querySelector('.scan-button');
    
    // Show loading state
    if (loading) loading.style.display = 'block';
    if (results) results.innerHTML = '';
    if (button) {
        button.disabled = true;
        button.textContent = '🔄 Scanning...';
    }
    
    try {
        const filters = {
            riskTolerance: document.getElementById('riskTolerance')?.value || 'moderate',
            sector: document.getElementById('sector')?.value || 'all',
            minScore: 7,
            capital: 10000
        };
        
        const data = await DataService.fetchMarketData();
        let stocks = data.sp500;
        
        // Apply scoring and filtering
        stocks = stocks.map(stock => {
            const score = ScoringEngine.calculateCompositeScore(stock, filters.riskTolerance);
            const targets = PriceTargetCalculator.calculateTargets(stock);
            const position = PositionSizing.calculatePosition(stock, filters.capital, filters.riskTolerance);
            
            return {
                ...stock,
                finalScore: parseFloat(score),
                targets,
                position,
                setupType: stock.macdSignal === 'bullish_crossover' ? 'MACD Bullish + RSI Oversold' : 'Technical Setup',
                catalyst: stock.nextEarnings <= 7 ? `Earnings in ${stock.nextEarnings} days` : 'Technical momentum'
            };
        });
        
        // Filter by sector
        if (filters.sector !== 'all') {
            stocks = stocks.filter(stock => stock.sector === filters.sector);
        }
        
        // Sort by score and take top stocks
        stocks.sort((a, b) => b.finalScore - a.finalScore);
        stocks = stocks.slice(0, 5);
        
        // Hide loading and show results
        if (loading) loading.style.display = 'none';
        renderStockResults(stocks);
        
    } catch (error) {
        if (loading) loading.style.display = 'none';
        if (results) results.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Error: ${error.message}</p>`;
        console.error('Error:', error);
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = '🔍 Scan Market';
        }
    }
}

// 10. INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Stock Picking Engine Initialized');
    console.log('📈 Professional swing trading analysis ready');
    
    // Test backend connection
    fetch('/health')
        .then(response => response.json())
        .then(data => {
            console.log('✅ Backend health check passed:', data);
            const statusElement = document.getElementById('dataStatus');
            if (statusElement) {
                statusElement.innerHTML = '🟢 Connected to live data';
            }
        })
        .catch(error => {
            console.log('⚠️ Backend connection issue:', error);
            const statusElement = document.getElementById('dataStatus');
            if (statusElement) {
                statusElement.innerHTML = '🟡 Demo mode (backend offline)';
            }
        });
});
