import { useState, useEffect } from "react";
import { UserProfile, LeaderboardEntry } from "@/src/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Swords, Search, Users, Trophy, Loader2, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db, handleFirestoreError, OperationType } from "@/src/firebase";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";

interface SocialViewProps {
  user: UserProfile | null;
  onAttack: (target: LeaderboardEntry) => void;
  onHeist: (target: LeaderboardEntry) => void;
}

export function SocialView({ user, onAttack, onHeist }: SocialViewProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [targets, setTargets] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const profilesRef = collection(db, "profiles");
        
        // Fetch Leaderboard
        const lbQuery = query(profilesRef, orderBy("netWorth", "desc"), limit(10));
        const lbSnap = await getDocs(lbQuery);
        const lbData = lbSnap.docs.map(doc => doc.data() as LeaderboardEntry);
        setLeaderboard(lbData);

        // Fetch Potential Targets (excluding self)
        if (user) {
          const targetQuery = query(profilesRef, where("uid", "!=", user.uid), limit(5));
          const targetSnap = await getDocs(targetQuery);
          const targetData = targetSnap.docs.map(doc => doc.data() as LeaderboardEntry);
          setTargets(targetData);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "profiles");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pt-4 pb-32 px-6 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-blue-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
          <Swords className="w-48 h-48" />
        </div>
        <h1 className="font-headline font-extrabold text-4xl mb-2 tracking-tight">Choose Your Target</h1>
        <p className="text-blue-200 font-medium max-w-xs">Scan the network for the wealthiest empires. Strike now or plot a heist!</p>
      </div>

      {/* Target List */}
      <div className="space-y-4">
        <h2 className="font-headline font-bold text-slate-400 uppercase tracking-wider text-sm flex items-center gap-2">
          <Users className="w-4 h-4" />
          Empire Network
        </h2>
        {targets.length > 0 ? (
          targets.map((target) => (
            <div key={target.uid} className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 transition-all hover:bg-slate-50 border-l-8 border-error shadow-sm">
              <div className="relative">
                <Avatar className="w-20 h-20 rounded-2xl border-2 border-slate-100">
                  <AvatarImage src={target.photoURL} />
                  <AvatarFallback>{target.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white">
                  LVL {target.level}
                </div>
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h3 className="font-headline font-bold text-xl text-blue-900">{target.displayName}</h3>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-yellow-600 font-bold">
                  <span className="text-sm tracking-wide uppercase opacity-70">Estimated Loot:</span>
                  <span className="text-lg">{(target.netWorth * 0.05).toLocaleString()} Coins</span>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  onClick={() => onAttack(target)}
                  className="flex-1 sm:flex-none bg-error hover:bg-red-600 text-white font-headline font-black rounded-xl shadow-[0_4px_0_#93000a] active:translate-y-1 active:shadow-none uppercase tracking-widest text-xs"
                >
                  ATTACK
                </Button>
                <Button 
                  onClick={() => onHeist(target)}
                  className="flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-headline font-black rounded-xl shadow-[0_4px_0_#705d00] active:translate-y-1 active:shadow-none uppercase tracking-widest text-xs"
                >
                  HEIST
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium italic">No other empires found yet. Build yours and wait for rivals!</p>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="space-y-4">
        <h2 className="font-headline font-bold text-slate-400 uppercase tracking-wider text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Hall of Wealth
        </h2>
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          {leaderboard.map((entry, index) => (
            <div key={entry.uid} className="flex items-center gap-4 p-4 border-b border-slate-50 last:border-none">
              <div className="w-8 text-center font-black text-xl text-slate-300">
                #{index + 1}
              </div>
              <Avatar className="w-12 h-12 border-2 border-slate-50">
                <AvatarImage src={entry.photoURL} />
                <AvatarFallback>{entry.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-bold text-blue-900">{entry.displayName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">LVL {entry.level}</p>
              </div>
              <div className="text-right">
                <p className="font-headline font-black text-emerald-600">
                  ${(entry.netWorth / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
