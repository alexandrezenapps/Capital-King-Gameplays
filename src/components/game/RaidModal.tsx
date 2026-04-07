import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Swords, Coins, ShieldAlert, ShieldCheck, X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface RaidResult {
  success: boolean;
  loot: number;
  targetName: string;
  targetAvatar?: string;
  attackerEmoji?: string;
  type: 'raid' | 'heist';
}

interface RaidModalProps {
  result: RaidResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RaidModal({ result, isOpen, onClose }: RaidModalProps) {
  const [stage, setStage] = useState<'versus' | 'attack' | 'result'>('versus');

  useEffect(() => {
    if (isOpen && result) {
      setStage('versus');
      const timer1 = setTimeout(() => setStage('attack'), 1500);
      const timer2 = setTimeout(() => setStage('result'), 3500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen, result]);

  if (!result) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
        <AnimatePresence mode="wait">
          {stage !== 'result' ? (
            <motion.div
              key="battle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="relative w-full aspect-square bg-blue-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 flex flex-col items-center justify-center p-8"
            >
              {/* Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent animate-pulse" />
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2" />
              </div>

              <div className="relative z-10 w-full h-full flex flex-col justify-between items-center py-12">
                {/* Target (Top) */}
                <motion.div
                  animate={stage === 'attack' && !result.success ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl border-4 border-red-500 overflow-hidden bg-slate-800 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                      <img src={result.targetAvatar} alt={result.targetName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    {/* Defense Shield */}
                    {stage === 'attack' && !result.success && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <ShieldAlert className="w-20 h-20 text-blue-400 fill-blue-400/20 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                      </motion.div>
                    )}
                  </div>
                  <span className="text-red-400 font-black text-sm uppercase tracking-widest bg-red-900/50 px-3 py-1 rounded-full border border-red-500/30">
                    {result.targetName}
                  </span>
                </motion.div>

                {/* VS Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  className="bg-yellow-500 text-blue-900 font-black text-4xl p-4 rounded-2xl shadow-xl border-4 border-white z-20 italic tracking-tighter"
                >
                  VS
                </motion.div>

                {/* Attacker (Bottom) */}
                <motion.div
                  animate={stage === 'attack' ? { 
                    y: result.success ? -150 : -50,
                    scale: result.success ? 1.5 : 1.2,
                    rotate: result.success ? [0, 360] : [0, -20, 20, 0]
                  } : {}}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-24 h-24 rounded-2xl border-4 border-emerald-500 bg-emerald-900/50 flex items-center justify-center text-5xl shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    {result.attackerEmoji}
                  </div>
                  <span className="text-emerald-400 font-black text-sm uppercase tracking-widest bg-emerald-900/50 px-3 py-1 rounded-full border border-emerald-500/30">
                    YOU
                  </span>
                </motion.div>
              </div>

              {/* Action Text */}
              <div className="absolute bottom-4 left-0 w-full text-center">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/50 font-bold text-xs uppercase tracking-[0.3em]"
                >
                  {result.type === 'raid' ? 'RAIDING EMPIRE...' : 'EXECUTING HEIST...'}
                </motion.span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-b-[8px] border-slate-200"
            >
              {/* Header */}
              <div className={cn(
                "h-48 flex flex-col items-center justify-center p-6 text-white",
                result.success ? "bg-emerald-600" : "bg-error"
              )}>
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="mb-4"
                >
                  {result.success ? (
                    <ShieldCheck className="w-20 h-20 fill-white/20" />
                  ) : (
                    <ShieldAlert className="w-20 h-20 fill-white/20" />
                  )}
                </motion.div>
                <h2 className="font-headline font-black text-3xl uppercase tracking-tighter italic">
                  {result.success ? `${result.type.toUpperCase()} SUCCESS!` : `${result.type.toUpperCase()} FAILED!`}
                </h2>
              </div>

              {/* Body */}
              <div className="p-8 text-center">
                <p className="text-slate-500 font-medium mb-6">
                  {result.success 
                    ? `You successfully breached ${result.targetName}'s defenses!` 
                    : `${result.targetName}'s security was too strong for your crew.`}
                </p>

                <div className="bg-slate-50 rounded-2xl p-6 mb-8 border-b-2 border-slate-200">
                  <span className="font-label text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    {result.success ? "TOTAL LOOT" : "REPAIR COSTS"}
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <Coins className={cn("w-8 h-8", result.success ? "text-yellow-500 fill-yellow-500" : "text-slate-400")} />
                    <span className={cn(
                      "font-headline font-black text-4xl tracking-tight",
                      result.success ? "text-blue-900" : "text-slate-400"
                    )}>
                      {result.success ? "+" : "-"}{result.loot.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={onClose}
                  className={cn(
                    "w-full h-16 font-headline font-black text-lg tracking-widest uppercase rounded-2xl shadow-lg active:translate-y-1 active:shadow-none transition-all",
                    result.success ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_0_#065f46]" : "bg-slate-800 hover:bg-slate-700 text-white shadow-[0_4px_0_#000000]"
                  )}
                >
                  {result.success ? "COLLECT BOUNTY" : "RETREAT"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
