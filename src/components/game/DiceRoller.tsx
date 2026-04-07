import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dices, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DiceRollerProps {
  energy: number;
  onRoll: () => void;
  isRolling: boolean;
  lastRoll: [number, number] | null;
}

export function DiceRoller({ energy, onRoll, isRolling, lastRoll }: DiceRollerProps) {
  const [multiplier, setMultiplier] = useState(1);

  const renderDie = (value: number | null, index: number) => {
    return (
      <motion.div
        key={`${index}-${value}`}
        initial={{ rotateX: 0, rotateY: 0, scale: 0.8, opacity: 0 }}
        animate={isRolling ? {
          rotateX: [0, 360, 720, 1080],
          rotateY: [0, 360, 720, 1080],
          scale: [0.8, 1.1, 0.9, 1],
          opacity: 1
        } : {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          opacity: 1
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "relative w-32 h-32 md:w-44 md:h-44 bg-white rounded-2xl flex items-center justify-center border-b-[8px] border-slate-200 shadow-2xl overflow-hidden",
          index === 0 ? "rotate-12" : "-rotate-12"
        )}
      >
        <div className="grid grid-cols-3 grid-rows-3 gap-2 p-4 w-full h-full">
          {value && Array.from({ length: 9 }).map((_, i) => {
            const show = getDotVisibility(value, i);
            return (
              <div key={i} className="flex items-center justify-center">
                {show && <div className="w-4 h-4 md:w-6 md:h-6 bg-blue-900 rounded-full shadow-inner" />}
              </div>
            );
          })}
        </div>
        {/* Motion Streak */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 rotate-45 pointer-events-none" />
      </motion.div>
    );
  };

  const getDotVisibility = (value: number, index: number) => {
    const patterns: Record<number, number[]> = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };
    return patterns[value]?.includes(index);
  };

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center pt-20 pb-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-blue-900/80 z-10" />
        <img
          src="https://picsum.photos/seed/city/1080/1920?blur=4"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Feedback Message */}
      <AnimatePresence>
        {!isRolling && lastRoll && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-28 z-30"
          >
            <div className="bg-white/90 backdrop-blur-xl px-6 py-3 rounded-full border-b-4 border-slate-200 shadow-xl flex items-center gap-3">
              <div className="bg-yellow-500 p-1 rounded-full">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-headline font-extrabold text-blue-900 text-lg">
                Forward {lastRoll[0] + lastRoll[1]} Steps!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dice Area */}
      <div className="relative z-20 flex gap-8 items-center justify-center perspective-[1000px]">
        {renderDie(lastRoll ? lastRoll[0] : 1, 0)}
        {renderDie(lastRoll ? lastRoll[1] : 1, 1)}
      </div>

      {/* Roll Button */}
      <div className="absolute bottom-32 z-40 w-full flex justify-center px-8">
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-30 rounded-full animate-pulse" />
          <Button
            disabled={isRolling || energy < multiplier}
            onClick={onRoll}
            className="relative h-20 px-16 bg-yellow-500 hover:bg-yellow-400 text-blue-900 rounded-full border-b-[6px] border-yellow-700 shadow-lg active:border-b-0 active:translate-y-1 transition-all"
          >
            <div className="flex items-center gap-3">
              <Dices className={cn("w-8 h-8 fill-blue-900/20", isRolling && "animate-spin")} />
              <span className="font-headline font-black text-3xl tracking-tighter uppercase italic">
                ROLL
              </span>
            </div>
          </Button>
        </div>
      </div>

      {/* HUD Layer */}
      <div className="absolute bottom-60 left-6 z-30">
        <div className="bg-blue-900/80 backdrop-blur-md p-4 rounded-xl border-l-4 border-yellow-500 shadow-xl flex flex-col gap-1">
          <span className="font-label text-[10px] uppercase tracking-widest text-yellow-200">MULTIPLIER</span>
          <div className="flex items-baseline gap-1">
            <span className="font-headline font-black text-2xl text-white italic leading-none">x{multiplier}</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-60 right-6 z-30">
        <div className="bg-blue-900/80 backdrop-blur-md p-4 rounded-xl border-r-4 border-emerald-500 shadow-xl flex flex-col gap-1 items-end">
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
