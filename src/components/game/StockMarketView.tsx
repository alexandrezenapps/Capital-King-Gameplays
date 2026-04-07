import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, TrendingDown, Search, ArrowUpRight, ArrowDownRight, Wallet, LineChart, PieChart, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/src/types";
import { cn } from "@/lib/utils";
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  history: { time: string; price: number }[];
}

interface StockMarketViewProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

// Generate initial stocks
const generateStocks = (): Stock[] => {
  const baseStocks = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "META", name: "Meta Platforms" },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "JPM", name: "JPMorgan Chase" },
    { symbol: "WMT", name: "Walmart Inc." },
  ];

  return baseStocks.map(s => ({
    ...s,
    price: 100 + Math.random() * 900,
    change: (Math.random() - 0.5) * 20,
    changePercent: (Math.random() - 0.5) * 5,
    history: Array.from({ length: 20 }, (_, i) => ({
      time: `${i}:00`,
      price: 100 + Math.random() * 900
    }))
  }));
};

export function StockMarketView({ user, onUpdateUser }: StockMarketViewProps) {
  const [stocks, setStocks] = useState<Stock[]>(generateStocks());
  const [selectedStock, setSelectedStock] = useState<Stock>(stocks[0]);
  const [amount, setAmount] = useState<number>(1);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Update prices every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(stock => {
        const change = (Math.random() - 0.5) * 10;
        const newPrice = Math.max(1, stock.price + change);
        const newHistory = [...stock.history.slice(1), { time: new Date().toLocaleTimeString(), price: newPrice }];
        const newStock = {
          ...stock,
          price: newPrice,
          change: change,
          changePercent: (change / stock.price) * 100,
          history: newHistory
        };
        if (selectedStock.symbol === stock.symbol) {
          setSelectedStock(newStock);
        }
        return newStock;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedStock.symbol]);

  const handleBuy = async () => {
    const totalCost = selectedStock.price * amount;
    if (user.coins < totalCost) return;

    const currentInvestments = user.investments || {};
    const stockInv = currentInvestments[selectedStock.symbol] || { shares: 0, avgPrice: 0 };
    
    const newShares = stockInv.shares + amount;
    const newAvgPrice = ((stockInv.shares * stockInv.avgPrice) + totalCost) / newShares;

    await onUpdateUser({
      coins: user.coins - totalCost,
      investments: {
        ...currentInvestments,
        [selectedStock.symbol]: {
          shares: newShares,
          avgPrice: newAvgPrice
        }
      }
    });
  };

  const handleSell = async () => {
    const currentInvestments = user.investments || {};
    const stockInv = currentInvestments[selectedStock.symbol];
    if (!stockInv || stockInv.shares < amount) return;

    const totalGain = selectedStock.price * amount;
    const newShares = stockInv.shares - amount;

    const updatedInvestments = { ...currentInvestments };
    if (newShares === 0) {
      delete updatedInvestments[selectedStock.symbol];
    } else {
      updatedInvestments[selectedStock.symbol] = {
        ...stockInv,
        shares: newShares
      };
    }

    await onUpdateUser({
      coins: user.coins + totalGain,
      investments: updatedInvestments
    });
  };

  const portfolioValue = Object.entries(user.investments || {}).reduce((acc, [symbol, inv]) => {
    const stock = stocks.find(s => s.symbol === symbol);
    return acc + (stock ? stock.price * inv.shares : 0);
  }, 0);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-headline font-black text-blue-900 dark:text-white flex items-center gap-2">
            <LineChart className="w-6 h-6 text-emerald-500" />
            Stock Market
          </h2>
          <p className="text-slate-500 text-sm">Invest your coins to grow your empire</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Portfolio Value</p>
            <p className="text-lg font-mono font-bold text-emerald-700 dark:text-emerald-300">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setIsInfoOpen(true)}>
            <Info className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Indices Overview */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: "S&P 500", value: "4,502.31", change: "+1.2%", up: true },
            { name: "NASDAQ", value: "14,125.82", change: "+0.8%", up: true },
            { name: "DOW JONES", value: "34,812.90", change: "-0.3%", up: false },
          ].map((idx) => (
            <div key={idx.name} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{idx.name}</p>
              <div className="flex items-end justify-between">
                <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">{idx.value}</p>
                <p className={`text-xs font-bold flex items-center ${idx.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {idx.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {idx.change}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Popular Stocks</h3>
            <div className="space-y-2">
              {stocks.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => setSelectedStock(stock)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all flex items-center justify-between group",
                    selectedStock.symbol === stock.symbol
                      ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20 text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 text-slate-900 dark:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                      selectedStock.symbol === stock.symbol ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"
                    )}>
                      {stock.symbol[0]}
                    </div>
                    <div className="text-left">
                      <p className="font-bold leading-none mb-1">{stock.symbol}</p>
                      <p className={cn("text-[10px] opacity-60 truncate w-24", selectedStock.symbol === stock.symbol ? "text-white" : "text-slate-500")}>
                        {stock.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold">${stock.price.toFixed(2)}</p>
                    <p className={cn(
                      "text-[10px] font-bold flex items-center justify-end",
                      stock.change >= 0 ? (selectedStock.symbol === stock.symbol ? "text-emerald-200" : "text-emerald-500") : (selectedStock.symbol === stock.symbol ? "text-rose-200" : "text-rose-500")
                    )}>
                      {stock.change >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {Math.abs(stock.changePercent).toFixed(2)}%
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chart & Trading */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-headline font-black text-slate-900 dark:text-white">{selectedStock.name}</h3>
                  <p className="text-slate-500 font-mono">{selectedStock.symbol} • Real-time Market Data</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-mono font-black text-slate-900 dark:text-white">${selectedStock.price.toFixed(2)}</p>
                  <p className={cn("font-bold flex items-center justify-end", selectedStock.change >= 0 ? "text-emerald-500" : "text-rose-500")}>
                    {selectedStock.change >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {Math.abs(selectedStock.change).toFixed(2)} ({Math.abs(selectedStock.changePercent).toFixed(2)}%)
                  </p>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedStock.history}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedStock.change >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={selectedStock.change >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={selectedStock.change >= 0 ? "#10b981" : "#f43f5e"} 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 flex items-center gap-6">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Amount to Trade</p>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => setAmount(Math.max(1, amount - 1))}>-</Button>
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center font-mono font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-2"
                    />
                    <Button variant="outline" onClick={() => setAmount(amount + 1)}>+</Button>
                    <div className="ml-4">
                      <p className="text-[10px] text-slate-500">Total: <span className="font-mono font-bold text-slate-900 dark:text-white">${(selectedStock.price * amount).toLocaleString()}</span></p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSell}
                    disabled={!user.investments?.[selectedStock.symbol] || user.investments[selectedStock.symbol].shares < amount}
                    className="bg-rose-500 hover:bg-rose-600 text-white px-8 h-12 rounded-2xl font-bold"
                  >
                    Sell
                  </Button>
                  <Button 
                    onClick={handleBuy}
                    disabled={user.coins < selectedStock.price * amount}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-12 rounded-2xl font-bold"
                  >
                    Buy
                  </Button>
                </div>
              </div>
            </div>

            {/* Portfolio Details */}
            {user.investments?.[selectedStock.symbol] && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 p-3 rounded-2xl text-white">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Your Position</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Average Price: ${user.investments[selectedStock.symbol].avgPrice.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-mono font-black text-blue-900 dark:text-white">{user.investments[selectedStock.symbol].shares} Shares</p>
                  <p className={cn(
                    "font-bold text-sm",
                    selectedStock.price >= user.investments[selectedStock.symbol].avgPrice ? "text-emerald-500" : "text-rose-500"
                  )}>
                    Profit/Loss: ${((selectedStock.price - user.investments[selectedStock.symbol].avgPrice) * user.investments[selectedStock.symbol].shares).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {isInfoOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-headline font-black text-blue-900 dark:text-white">Market Insights</h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsInfoOpen(false)}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <div className="space-y-4 text-slate-600 dark:text-slate-400">
                  <p>Welcome to the Tycoon Stock Market! Here you can use your coins to invest in the world's most famous companies.</p>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-lg h-fit">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-sm"><span className="font-bold text-slate-900 dark:text-white">Buy Low, Sell High:</span> Watch the real-time charts to time your entries and exits.</p>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg h-fit">
                        <PieChart className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-sm"><span className="font-bold text-slate-900 dark:text-white">Diversify:</span> Spread your coins across multiple stocks to minimize risk.</p>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-lg h-fit">
                        <LineChart className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-sm"><span className="font-bold text-slate-900 dark:text-white">Real-time Data:</span> Prices update every 5 seconds. Stay alert!</p>
                    </li>
                  </ul>
                </div>
                <Button 
                  onClick={() => setIsInfoOpen(false)}
                  className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl font-bold text-lg"
                >
                  Got it!
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
