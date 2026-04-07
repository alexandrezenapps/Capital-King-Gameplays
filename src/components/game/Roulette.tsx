import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

interface RouletteProps {
  coins: number;
  energy: number;
  onWin: (amount: number) => void;
  onLose: (amount: number) => void;
  onEnergyUse: () => void;
}

export function Roulette({ coins, energy, onWin, onLose, onEnergyUse }: RouletteProps) {
  const [betType, setBetType] = useState<"red" | "black" | "odd" | "even" | "number">("red");
  const [betValue, setBetValue] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState(1000);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const spin = () => {
    if (energy < 1 || coins < betAmount) return;
    if (betType === "number" && betValue === null) return;

    onEnergyUse();
    setIsSpinning(true);
    setLastResult(null);
    setMessage("");

    setTimeout(() => {
      const result = Math.floor(Math.random() * 37);
      setLastResult(result);
      setIsSpinning(false);

      let win = false;
      let multiplier = 0;

      if (betType === "red" && RED_NUMBERS.includes(result)) { win = true; multiplier = 2; }
      else if (betType === "black" && BLACK_NUMBERS.includes(result)) { win = true; multiplier = 2; }
      else if (betType === "odd" && result !== 0 && result % 2 !== 0) { win = true; multiplier = 2; }
      else if (betType === "even" && result !== 0 && result % 2 === 0) { win = true; multiplier = 2; }
      else if (betType === "number" && result === betValue) { win = true; multiplier = 36; }

      if (win) {
        setMessage("YOU WIN!");
        onWin(betAmount * multiplier);
      } else {
        setMessage("YOU LOSE");
        onLose(betAmount);
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-xl">
      <div className="w-full max-w-md space-y-8">
        {/* Roulette Wheel Visual */}
        <div className="relative flex items-center justify-center h-48">
          <motion.div
            animate={isSpinning ? { rotate: 360 * 5 } : { rotate: 0 }}
            transition={isSpinning ? { duration: 2, ease: "easeOut" } : { duration: 0 }}
            className="w-40 h-40 rounded-full border-8 border-yellow-600 bg-emerald-900 flex items-center justify-center shadow-[0_0_50px_rgba(5,150,105,0.3)]"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-white/10 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {lastResult !== null && !isSpinning && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg",
                        lastResult === 0 ? "bg-emerald-500" : RED_NUMBERS.includes(lastResult) ? "bg-red-500" : "bg-slate-900"
                      )}
                    >
                      {lastResult}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-8 bg-yellow-500 rounded-full shadow-lg z-10" />
        </div>

        {/* Message Area */}
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={cn(
                  "font-black text-xl italic uppercase tracking-tighter",
                  message.includes("WIN") ? "text-yellow-400" : "text-red-400"
                )}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Betting Options */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBetType("red")}
              className={cn(
                "py-2 rounded-xl font-black text-sm uppercase tracking-widest border transition-all",
                betType === "red" ? "bg-red-500 border-red-400 text-white shadow-lg scale-105" : "bg-red-900/20 border-red-900/40 text-red-400"
              )}
            >
              RED (2x)
            </button>
            <button
              onClick={() => setBetType("black")}
              className={cn(
                "py-2 rounded-xl font-black text-sm uppercase tracking-widest border transition-all",
                betType === "black" ? "bg-slate-900 border-slate-700 text-white shadow-lg scale-105" : "bg-slate-900/20 border-slate-900/40 text-slate-400"
              )}
            >
              BLACK (2x)
            </button>
            <button
              onClick={() => setBetType("odd")}
              className={cn(
                "py-2 rounded-xl font-black text-sm uppercase tracking-widest border transition-all",
                betType === "odd" ? "bg-blue-500 border-blue-400 text-white shadow-lg scale-105" : "bg-blue-900/20 border-blue-900/40 text-blue-400"
              )}
            >
              ODD (2x)
            </button>
            <button
              onClick={() => setBetType("even")}
              className={cn(
                "py-2 rounded-xl font-black text-sm uppercase tracking-widest border transition-all",
                betType === "even" ? "bg-purple-500 border-purple-400 text-white shadow-lg scale-105" : "bg-purple-900/20 border-purple-900/40 text-purple-400"
              )}
            >
              EVEN (2x)
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setBetType("number")}
              className={cn(
                "py-2 rounded-xl font-black text-sm uppercase tracking-widest border transition-all",
                betType === "number" ? "bg-yellow-500 border-yellow-400 text-blue-900 shadow-lg scale-105" : "bg-yellow-900/20 border-yellow-900/40 text-yellow-400"
              )}
            >
              SPECIFIC NUMBER (36x)
            </button>
            {betType === "number" && (
              <div className="grid grid-cols-6 gap-1 max-h-24 overflow-y-auto p-2 bg-black/20 rounded-xl">
                {Array.from({ length: 37 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setBetValue(i)}
                    className={cn(
                      "w-full aspect-square rounded flex items-center justify-center text-xs font-bold transition-all",
                      betValue === i ? "bg-yellow-500 text-blue-900" : "bg-white/5 text-white hover:bg-white/10"
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Amount & Spin */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-2">
            {[1000, 5000, 10000, 50000].map(amount => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold border transition-all",
                  betAmount === amount 
                    ? "bg-yellow-500 border-yellow-400 text-blue-900" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                )}
              >
                {amount.toLocaleString()}
              </button>
            ))}
          </div>
          <Button 
            onClick={spin}
            disabled={isSpinning || energy < 1 || coins < betAmount || (betType === "number" && betValue === null)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-6 rounded-2xl shadow-[0_4px_0_#059669] active:translate-y-1 active:shadow-none"
          >
            {isSpinning ? "SPINNING..." : energy < 1 ? "NO ENERGY" : coins < betAmount ? "NOT ENOUGH COINS" : "SPIN WHEEL"}
          </Button>
        </div>
      </div>
    </div>
  );
}
