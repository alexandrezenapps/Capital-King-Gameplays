import { UserProfile } from "@/src/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Coins, Diamond, Zap, ShieldCheck, Settings } from "lucide-react";
import { useTranslation } from "@/src/lib/i18n";

interface TopNavProps {
  user: UserProfile | null;
  onOpenSettings?: () => void;
}

export function TopNav({ user, onOpenSettings }: TopNavProps) {
  const { t } = useTranslation(user);
  if (!user) return null;

  const logoUrl = "https://picsum.photos/seed/capital-king-logo/200/200"; // Placeholder for now

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 py-3 bg-blue-900/80 dark:bg-slate-900/80 backdrop-blur-md rounded-b-3xl shadow-lg border-b border-white/10">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenSettings}
          className="relative group active:scale-95 transition-all"
        >
          <Avatar className="w-10 h-10 border-2 border-yellow-500 shadow-md">
            <AvatarImage src={user.photoURL} alt={user.displayName} />
            <AvatarFallback>{user.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-blue-900 text-[10px] font-black px-1 rounded-full border border-blue-900">
            {user.level}
          </div>
          <div className="absolute -top-1 -left-1 bg-blue-600 text-white p-1 rounded-full border border-blue-900 opacity-0 group-hover:opacity-100 transition-opacity">
            <Settings className="w-3 h-3" />
          </div>
        </button>
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg border border-white/20">
            <span className="text-xl">👑</span>
          </div>
          <span className="font-headline font-black text-white tracking-tighter text-sm hidden sm:block uppercase italic">
            Capital King <span className="text-yellow-500 ml-1">{t.level} {user.level}</span>
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex items-center bg-blue-950/50 rounded-full px-3 py-1.5 gap-2 border border-white/10">
          <Coins className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="font-headline font-bold text-white text-sm">
            {user.coins.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center bg-blue-950/50 rounded-full px-3 py-1.5 gap-2 border border-white/10">
          <Diamond className="w-4 h-4 text-purple-400 fill-purple-400" />
          <span className="font-headline font-bold text-white text-sm">
            {user.gems.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center bg-blue-950/50 rounded-full px-3 py-1.5 gap-2 border border-white/10">
          <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
          <span className="font-headline font-bold text-white text-sm">
            {user.energy}/{user.maxEnergy}
          </span>
        </div>
        <div className="flex items-center bg-blue-950/50 rounded-full px-3 py-1.5 gap-2 border border-white/10">
          <ShieldCheck className="w-4 h-4 text-blue-400 fill-blue-400" />
          <span className="font-headline font-bold text-white text-sm">
            {user.shields}/3
          </span>
        </div>
      </div>
    </header>
  );
}
