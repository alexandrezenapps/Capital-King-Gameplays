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
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let i = 0; i < VALUES.length; i++) {
      const value = VALUES[i];
      let rank = i + 1;
      if (i >= 10) rank = 10;
      if (i === 0) rank = 11; // Ace starts as 11
      deck.push({ suit, value, rank });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

function calculateScore(hand: Card[]): number {
  let score = hand.reduce((acc, card) => acc + card.rank, 0);
  let aces = hand.filter(card => card.value === "A").length;
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
}

interface BlackjackProps {
  coins: number;
  energy: number;
  onWin: (amount: number) => void;
  onLose: (amount: number) => void;
  onEnergyUse: () => void;
}

export function Blackjack({ coins, energy, onWin, onLose, onEnergyUse }: BlackjackProps) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<"betting" | "playing" | "dealerTurn" | "gameOver">("betting");
  const [bet, setBet] = useState(1000);
  const [message, setMessage] = useState("");

  const startNewGame = () => {
    if (energy < 1 || coins < bet) return;
    
    onEnergyUse();
    const newDeck = createDeck();
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];
    
    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameState("playing");
    setMessage("");

    if (calculateScore(pHand) === 21) {
      handleGameOver("Blackjack!", "win");
    }
  };

  const hit = () => {
    const newDeck = [...deck];
    const newCard = newDeck.pop()!;
    const newHand = [...playerHand, newCard];
    
    setDeck(newDeck);
    setPlayerHand(newHand);
    
    if (calculateScore(newHand) > 21) {
      handleGameOver("Bust!", "lose");
    }
  };

  const stand = () => {
    setGameState("dealerTurn");
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];
    
    const playDealer = async () => {
      let score = calculateScore(currentDealerHand);
      while (score < 17) {
        const card = currentDeck.pop()!;
        currentDealerHand.push(card);
        score = calculateScore(currentDealerHand);
        setDealerHand([...currentDealerHand]);
        await new Promise(r => setTimeout(r, 600));
      }

      const pScore = calculateScore(playerHand);
      const dScore = calculateScore(currentDealerHand);

      if (dScore > 21) {
        handleGameOver("Dealer Busts!", "win");
      } else if (dScore > pScore) {
        handleGameOver("Dealer Wins!", "lose");
      } else if (dScore < pScore) {
        handleGameOver("You Win!", "win");
      } else {
        handleGameOver("Push!", "push");
      }
    };

    playDealer();
  };

  const handleGameOver = (msg: string, result: "win" | "lose" | "push") => {
    setMessage(msg);
    setGameState("gameOver");
    if (result === "win") {
      onWin(bet);
    } else if (result === "lose") {
      onLose(bet);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-xl">
      <div className="w-full max-w-md space-y-8">
        {/* Dealer Hand */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-4">
            <span className="text-blue-300 font-bold text-sm uppercase tracking-widest">Dealer</span>
            {gameState !== "betting" && (
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-bold">
                {gameState === "playing" ? "?" : calculateScore(dealerHand)}
              </span>
            )}
          </div>
          <div className="flex justify-center gap-2 h-32">
            {dealerHand.map((card, i) => (
              <CardView key={i} card={card} hidden={i === 1 && gameState === "playing"} />
            ))}
          </div>
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
                  message.includes("Win") || message.includes("Blackjack") ? "text-yellow-400" : "text-red-400"
                )}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player Hand */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-4">
            <span className="text-emerald-300 font-bold text-sm uppercase tracking-widest">Player</span>
            {gameState !== "betting" && (
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold">
                {calculateScore(playerHand)}
              </span>
            )}
          </div>
          <div className="flex justify-center gap-2 h-32">
            {playerHand.map((card, i) => (
              <CardView key={i} card={card} />
            ))}
          </div>
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
                onClick={startNewGame}
                disabled={energy < 1 || coins < bet}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-6 rounded-2xl shadow-[0_4px_0_#059669] active:translate-y-1 active:shadow-none"
              >
                {energy < 1 ? "NO ENERGY" : coins < bet ? "NOT ENOUGH COINS" : "DEAL CARDS"}
              </Button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button 
                onClick={hit}
                disabled={gameState !== "playing"}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-black py-6 rounded-2xl shadow-[0_4px_0_#2563eb] active:translate-y-1 active:shadow-none"
              >
                HIT
              </Button>
              <Button 
                onClick={stand}
                disabled={gameState !== "playing"}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-6 rounded-2xl shadow-[0_4px_0_#dc2626] active:translate-y-1 active:shadow-none"
              >
                STAND
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CardView({ card, hidden }: { card: Card; hidden?: boolean }) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0, rotate: -10 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      className={cn(
        "w-20 h-28 rounded-xl flex flex-col items-center justify-center text-2xl font-black shadow-lg border-2",
        hidden 
          ? "bg-blue-600 border-blue-400" 
          : "bg-white border-gray-200 text-gray-900"
      )}
    >
      {!hidden ? (
        <>
          <div className={cn("absolute top-1 left-2 text-sm", card.suit === "♥️" || card.suit === "♦️" ? "text-red-500" : "text-gray-900")}>
            {card.value}
          </div>
          <div>{card.suit}</div>
          <div className={cn("absolute bottom-1 right-2 text-sm rotate-180", card.suit === "♥️" || card.suit === "♦️" ? "text-red-500" : "text-gray-900")}>
            {card.value}
          </div>
        </>
      ) : (
        <div className="text-white/20 text-4xl">?</div>
      )}
    </motion.div>
  );
}
