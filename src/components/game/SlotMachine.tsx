import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, TrendingUp, Coins, Sparkles, Info, X, Diamond, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SlotMachineProps {
  energy: number;
  onSpin: () => void;
  isSpinning: boolean;
  lastResult: string[] | null;
}

export const SYMBOLS = ["💰", "💎", "👑", "⚡", "🍒", "🔔", "7️⃣"];

export function SlotMachine({ energy, onSpin, isSpinning, lastResult }: SlotMachineProps) {
  const [reels, setReels] = useState<string[]>(["👑", "👑", "👑"]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const PAYOUTS = [
    { symbols: "7️⃣ 7️⃣ 7️⃣", reward: "2,000,000 Coins", icon: <Coins className="w-4 h-4 text-yellow-500" /> },
    { symbols: "💎 💎 💎", reward: "500 Gems", icon: <Diamond className="w-4 h-4 text-blue-400" /> },
    { symbols: "👑 👑 👑", reward: "500k Coins + 50 Gems", icon: <Trophy className="w-4 h-4 text-amber-500" /> },
    { symbols: "⚡ ⚡ ⚡", reward: "Full Energy Refill", icon: <Zap className="w-4 h-4 text-emerald-400" /> },
    { symbols: "💰 💰 💰", reward: "100,000 Coins", icon: <Coins className="w-4 h-4 text-yellow-500" /> },
    { symbols: "🍒/🔔 3x", reward: "50,000 Coins", icon: <Coins className="w-4 h-4 text-yellow-500" /> },
    { symbols: "Any 2x", reward: "10,000 Coins", icon: <Coins className="w-4 h-4 text-yellow-500" /> },
  ];

  useEffect(() => {
    if (lastResult) {
      setReels(lastResult);
    }
  }, [lastResult]);

  const handleSpin = () => {
    if (energy < 1 || isSpinning) return;
    onSpin();
  };

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center pt-20 pb-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 to-purple-900/80 z-10" />
        <img
          src="https://picsum.photos/seed/casino/1080/1920?blur=4"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Info Button */}
      <div className="absolute top-24 right-6 z-30">
        <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
          <DialogTrigger 
            render={
              <Button variant="ghost" size="icon" className="bg-purple-900/60 hover:bg-purple-800/80 text-white rounded-full w-10 h-10 backdrop-blur-md border border-white/10">
                <Info className="w-6 h-6" />
              </Button>
            }
          />
          <DialogContent className="bg-slate-950 border-purple-500/30 text-white max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-headline font-black text-2xl text-center text-yellow-500 italic tracking-tighter">
                PAYOUT TABLE
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {PAYOUTS.map((payout, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl tracking-widest font-mono">{payout.symbols}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-200">
                    {payout.icon}
                    {payout.reward}
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest pt-2">
                Cost: 1 Energy per spin
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Jackpot Header */}
      <div className="relative z-20 mb-8 text-center h-20 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {lastResult && !isSpinning && lastResult[0] === lastResult[1] && lastResult[1] === lastResult[2] ? (
            <motion.div
              key="win"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1.2, rotate: 0 }}
              exit={{ scale: 0 }}
              className="bg-yellow-500 text-blue-900 px-6 py-2 rounded-full font-headline font-black text-2xl shadow-[0_0_30px_rgba(251,191,36,0.8)] border-2 border-white"
            >
              BIG WIN!
            </motion.div>
          ) : (
            <motion.div key="header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.h2 
                animate={{ scale: [1, 1.1, 1], color: ["#fbbf24", "#f59e0b", "#fbbf24"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="font-headline font-black text-5xl text-yellow-500 italic tracking-tighter drop-shadow-[0_5px_15px_rgba(251,191,36,0.5)]"
              >
                JACKPOT
              </motion.h2>
              <p className="text-purple-200 font-bold uppercase tracking-widest text-xs mt-2">Spin to Win Big!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slot Machine Body */}
      <div className="relative z-20 bg-slate-900/90 p-6 rounded-[2rem] border-4 border-yellow-500 shadow-[0_0_50px_rgba(251,191,36,0.3)] backdrop-blur-xl">
        <div className="flex gap-4 bg-black/40 p-4 rounded-2xl border-2 border-slate-800 shadow-inner">
          {reels.map((symbol, i) => (
            <div key={i} className="relative w-24 h-32 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl flex items-center justify-center overflow-hidden border border-slate-700">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${i}-${symbol}-${isSpinning}`}
                  initial={{ y: isSpinning ? -100 : 0, opacity: isSpinning ? 0 : 1 }}
                  animate={isSpinning ? {
                    y: [0, 100],
                    opacity: [1, 0]
                  } : {
                    y: 0,
                    opacity: 1
                  }}
                  transition={{ 
                    duration: 0.1, 
                    repeat: isSpinning ? Infinity : 0,
                    ease: "linear"
                  }}
                  className="text-5xl"
                >
                  {symbol}
                </motion.div>
              </AnimatePresence>
              {/* Glass Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Spin Button */}
      <div className="absolute bottom-32 z-40 w-full flex justify-center px-8">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-30 rounded-full animate-pulse" />
          <Button
            disabled={isSpinning || energy < 1}
            onClick={handleSpin}
            className="relative h-20 px-16 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-blue-900 rounded-full border-b-[6px] border-amber-800 shadow-lg active:border-b-0 active:translate-y-1 transition-all"
          >
            <div className="flex items-center gap-3">
              <Sparkles className={cn("w-8 h-8 fill-blue-900/20", isSpinning && "animate-pulse")} />
              <span className="font-headline font-black text-3xl tracking-tighter uppercase italic">
                SPIN
              </span>
            </div>
          </Button>
        </div>
      </div>

      {/* Energy HUD */}
      <div className="absolute bottom-60 right-6 z-30">
        <div className="bg-purple-900/80 backdrop-blur-md p-4 rounded-xl border-r-4 border-emerald-500 shadow-xl flex flex-col gap-1 items-end">
          <span className="font-label text-[10px] uppercase tracking-widest text-emerald-200">ENERGY</span>
          <div className="flex items-center gap-2">
            <span className="font-headline font-black text-2xl text-white leading-none">{energy}</span>
            <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
