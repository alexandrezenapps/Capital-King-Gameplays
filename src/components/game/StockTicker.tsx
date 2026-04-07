import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Generate 500 stocks for the demo
const generateStocks = (): Stock[] => {
  const baseStocks = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "BRK.B", name: "Berkshire Hathaway" },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "JPM", name: "JPMorgan Chase" },
    { symbol: "UNH", name: "UnitedHealth Group" },
    { symbol: "MA", name: "Mastercard Inc." },
    { symbol: "XOM", name: "Exxon Mobil Corp." },
    { symbol: "LLY", name: "Eli Lilly & Co." },
    { symbol: "AVGO", name: "Broadcom Inc." },
    { symbol: "HD", name: "Home Depot Inc." },
    { symbol: "PG", name: "Procter & Gamble" },
    { symbol: "COST", name: "Costco Wholesale" },
    { symbol: "JNJ", name: "Johnson & Johnson" },
    { symbol: "MRK", name: "Merck & Co." },
    { symbol: "ABBV", name: "AbbVie Inc." },
    { symbol: "CVX", name: "Chevron Corp." },
    { symbol: "CRM", name: "Salesforce Inc." },
    { symbol: "AMD", name: "Advanced Micro Devices" },
    { symbol: "ADBE", name: "Adobe Inc." },
    { symbol: "WMT", name: "Walmart Inc." },
    { symbol: "PEP", name: "PepsiCo Inc." },
    { symbol: "KO", name: "Coca-Cola Co." },
    { symbol: "BAC", name: "Bank of America" },
    { symbol: "NFLX", name: "Netflix Inc." },
    { symbol: "ORCL", name: "Oracle Corp." },
    { symbol: "ACN", name: "Accenture plc" },
    { symbol: "TMO", name: "Thermo Fisher Scientific" },
    { symbol: "LIN", name: "Linde plc" },
    { symbol: "MCD", name: "McDonald's Corp." },
    { symbol: "CSCO", name: "Cisco Systems" },
    { symbol: "ABT", name: "Abbott Laboratories" },
    { symbol: "INTC", name: "Intel Corp." },
    { symbol: "VZ", name: "Verizon Communications" },
    { symbol: "CMCSA", name: "Comcast Corp." },
    { symbol: "DIS", name: "Walt Disney Co." },
    { symbol: "PFE", name: "Pfizer Inc." },
    { symbol: "NKE", name: "NIKE Inc." },
    { symbol: "PM", name: "Philip Morris International" },
    { symbol: "INTU", name: "Intuit Inc." },
    { symbol: "DHR", name: "Danaher Corp." },
    { symbol: "TXN", name: "Texas Instruments" },
    { symbol: "WFC", name: "Wells Fargo & Co." },
    { symbol: "AMAT", name: "Applied Materials" },
    { symbol: "COP", name: "ConocoPhillips" },
  ];

  const stocks: Stock[] = [];
  for (let i = 0; i < 500; i++) {
    const base = baseStocks[i % baseStocks.length];
    const suffix = i >= baseStocks.length ? `-${Math.floor(i / baseStocks.length)}` : "";
    const price = 50 + Math.random() * 500;
    const change = (Math.random() - 0.5) * 10;
    stocks.push({
      symbol: base.symbol + suffix,
      name: base.name + (suffix ? ` Series ${suffix.slice(1)}` : ""),
      price,
      change,
      changePercent: (change / price) * 100,
    });
  }
  return stocks;
};

export function StockTicker() {
  const [stocks, setStocks] = useState<Stock[]>(generateStocks());
  const [isVisible, setIsVisible] = useState(true);

  // Visibility cycle: 10s visible, 5s hidden
  useEffect(() => {
    const cycle = setInterval(() => {
      setIsVisible(prev => !prev);
    }, isVisible ? 10000 : 5000);

    return () => clearInterval(cycle);
  }, [isVisible]);

  // Update prices every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(stock => {
        const change = (Math.random() - 0.5) * 5;
        const newPrice = Math.max(1, stock.price + change);
        return {
          ...stock,
          price: newPrice,
          change: change,
          changePercent: (change / stock.price) * 100
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-16 left-0 w-full z-40 h-8 bg-black/80 backdrop-blur-sm border-y border-white/10 flex items-center overflow-hidden pointer-events-none"
        >
          <div className="flex whitespace-nowrap animate-marquee">
            {stocks.map((stock, idx) => (
              <div key={`${stock.symbol}-${idx}`} className="flex items-center px-6 border-r border-white/5">
                <span className="text-white font-mono font-bold text-xs mr-2">{stock.symbol}</span>
                <span className="text-white/70 font-mono text-xs mr-2">${stock.price.toFixed(2)}</span>
                <span className={`flex items-center font-mono text-[10px] ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stock.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(stock.changePercent).toFixed(2)}%
                </span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {stocks.slice(0, 20).map((stock, idx) => (
              <div key={`dup-${stock.symbol}-${idx}`} className="flex items-center px-6 border-r border-white/5">
                <span className="text-white font-mono font-bold text-xs mr-2">{stock.symbol}</span>
                <span className="text-white/70 font-mono text-xs mr-2">${stock.price.toFixed(2)}</span>
                <span className={`flex items-center font-mono text-[10px] ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stock.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(stock.changePercent).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
          
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 300s linear infinite;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
