import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Card {
  suit: string;
  value: string;
  rank: number;
}

const SUITS = ["♠️", "♥️", "♦️", "♣️"];
const VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let i = 0; i < VALUES.length; i++) {
      const value = VALUES[i];
      const rank = i + 2; // 2nd value is 2, 14th value is 14 (Ace)
      deck.push({ suit, value, rank });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

function evaluateHand(hand: Card[]): { name: string; multiplier: number } {
  const ranks = hand.map(c => c.rank).sort((a, b) => a - b);
  const suits = hand.map(c => c.suit);
  
  const isFlush = new Set(suits).size === 1;
  const isStraight = ranks.every((r, i) => i === 0 || r === ranks[i - 1] + 1);
  
  const rankCounts: Record<number, number> = {};
  ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  if (isFlush && isStraight && ranks[0] === 10) return { name: "Royal Flush", multiplier: 250 };
  if (isFlush && isStraight) return { name: "Straight Flush", multiplier: 50 };
  if (counts[0] === 4) return { name: "Four of a Kind", multiplier: 25 };
  if (counts[0] === 3 && counts[1] === 2) return { name: "Full House", multiplier: 9 };
  if (isFlush) return { name: "Flush", multiplier: 6 };
  if (isStraight) return { name: "Straight", multiplier: 4 };
  if (counts[0] === 3) return { name: "Three of a Kind", multiplier: 3 };
  if (counts[0] === 2 && counts[1] === 2) return { name: "Two Pair", multiplier: 2 };
  
  // Jacks or Better
  if (counts[0] === 2) {
    const pairRank = Number(Object.keys(rankCounts).find(r => rankCounts[Number(r)] === 2));
    if (pairRank >= 11) return { name: "Jacks or Better", multiplier: 1 };
  }

  return { name: "No Hand", multiplier: 0 };
}

interface PokerProps {
  coins: number;
  energy: number;
  onWin: (amount: number) => void;
  onLose: (amount: number) => void;
  onEnergyUse: () => void;
}

export function Poker({ coins, energy, onWin, onLose, onEnergyUse }: PokerProps) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [gameState, setGameState] = useState<"betting" | "drawing" | "gameOver">("betting");
  const [bet, setBet] = useState(1000);
  const [message, setMessage] = useState("");

  const deal = () => {
    if (energy < 1 || coins < bet) return;
    onEnergyUse();
    const newDeck = createDeck();
    const newHand = [newDeck.pop()!, newDeck.pop()!, newDeck.pop()!, newDeck.pop()!, newDeck.pop()!];
    setDeck(newDeck);
    setHand(newHand);
    setHeld([false, false, false, false, false]);
    setGameState("drawing");
    setMessage("");
  };

  const draw = () => {
    const newDeck = [...deck];
    const newHand = hand.map((card, i) => held[i] ? card : newDeck.pop()!);
    setDeck(newDeck);
    setHand(newHand);
    
    const result = evaluateHand(newHand);
    setGameState("gameOver");
    if (result.multiplier > 0) {
      setMessage(result.name);
      onWin(bet * result.multiplier);
    } else {
      setMessage("No Hand");
      onLose(bet);
    }
  };

  const toggleHold = (i: number) => {
    if (gameState !== "drawing") return;
    const newHeld = [...held];
    newHeld[i] = !newHeld[i];
    setHeld(newHeld);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-xl">
      <div className="w-full max-w-md space-y-8">
        {/* Hand Area */}
        <div className="flex justify-center gap-1 h-32">
          {hand.length > 0 ? (
            hand.map((card, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <CardView 
                  card={card} 
                  onClick={() => toggleHold(i)} 
                  held={held[i]}
                  selectable={gameState === "drawing"}
                />
                {held[i] && gameState === "drawing" && (
                  <span className="bg-yellow-500 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    HELD
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-16 h-24 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/10 text-4xl">?</div>
              ))}
            </div>
          )}
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
                  message !== "No Hand" ? "text-yellow-400" : "text-red-400"
                )}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          {gameState === "betting" || gameState === "gameOver" ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-center gap-2">
                {[1000, 5000, 10000, 50000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setBet(amount)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border transition-all",
                      bet === amount 
                        ? "bg-yellow-500 border-yellow-400 text-blue-900" 
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    )}
                  >
                    {amount.toLocaleString()}
                  </button>
                ))}
              </div>
              <Button 
                onClick={deal}
                disabled={energy < 1 || coins < bet}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-6 rounded-2xl shadow-[0_4px_0_#059669] active:translate-y-1 active:shadow-none"
              >
                {energy < 1 ? "NO ENERGY" : coins < bet ? "NOT ENOUGH COINS" : "DEAL"}
              </Button>
            </div>
          ) : (
            <Button 
              onClick={draw}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-6 rounded-2xl shadow-[0_4px_0_#2563eb] active:translate-y-1 active:shadow-none"
            >
              DRAW
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CardView({ card, onClick, held, selectable }: { card: Card; onClick: () => void; held: boolean; selectable: boolean }) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0, rotate: -10 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      onClick={onClick}
      className={cn(
        "w-16 h-24 rounded-xl flex flex-col items-center justify-center text-xl font-black shadow-lg border-2 transition-all",
        held ? "ring-4 ring-yellow-500 ring-offset-2 ring-offset-slate-900" : "",
        selectable ? "cursor-pointer hover:scale-105" : "",
        "bg-white border-gray-200 text-gray-900"
      )}
    >
      <div className={cn("absolute top-1 left-1 text-[10px]", card.suit === "♥️" || card.suit === "♦️" ? "text-red-500" : "text-gray-900")}>
        {card.value}
      </div>
      <div className="text-2xl">{card.suit}</div>
      <div className={cn("absolute bottom-1 right-1 text-[10px] rotate-180", card.suit === "♥️" || card.suit === "♦️" ? "text-red-500" : "text-gray-900")}>
        {card.value}
      </div>
    </motion.div>
  );
}
