import { ShoppingCart, ClipboardList, Hammer, Dices, Users, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/src/types";
import { useTranslation } from "@/src/lib/i18n";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: UserProfile | null;
}

export function BottomNav({ activeTab, onTabChange, user }: BottomNavProps) {
  const { t } = useTranslation(user);

  const tabs = [
    { id: 'shop', icon: ShoppingCart, label: t.shop },
    { id: 'tasks', icon: ClipboardList, label: t.tasks },
    { id: 'build', icon: Hammer, label: t.build, isMain: true },
    { id: 'invest', icon: TrendingUp, label: t.invest },
    { id: 'play', icon: Dices, label: t.play },
    { id: 'social', icon: Users, label: t.social },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 pb-6 bg-blue-900 dark:bg-slate-900 rounded-t-[3rem] h-24 shadow-[0_-10px_30px_rgba(0,0,0,0.2)] border-t border-white/5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.isMain) {
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center bg-yellow-500 text-blue-900 rounded-full w-16 h-16 -mt-12 border-4 border-blue-900 shadow-[0_4px_0_#705d00] transition-all active:scale-95",
                isActive && "scale-110"
              )}
            >
              <Icon className="w-8 h-8 fill-blue-900/20" />
              <span className="font-body font-bold text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center transition-all active:scale-95 duration-100 relative",
              isActive ? "text-emerald-400" : "text-blue-300 hover:text-white"
            )}
          >
            {tab.id === 'play' && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1 rounded-full border border-white animate-bounce">
                NEW
              </span>
            )}
            <Icon className={cn("w-6 h-6 mb-1", isActive && "fill-emerald-400/20")} />
            <span className="font-body font-bold text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
