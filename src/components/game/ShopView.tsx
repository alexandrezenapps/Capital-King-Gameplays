import { UserProfile } from "@/src/types";
import { SHOP_ITEMS, SKINS } from "@/src/constants";
import { Button } from "@/components/ui/button";
import { Zap, Coins, Diamond, ShoppingBag, Sparkles, Shirt, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopViewProps {
  user: UserProfile | null;
  onBuyEnergy: (amount: number, price: number) => void;
  onBuyCoins: (amount: number, price: number) => void;
  onBuyGems: (amount: number, price: number) => void;
  onSkinChange: (skinId: string) => void;
}

export function ShopView({ user, onBuyEnergy, onBuyCoins, onBuyGems, onSkinChange }: ShopViewProps) {
  if (!user) return null;

  return (
    <div className="h-full overflow-y-auto pt-4 pb-32 px-6 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
          <ShoppingBag className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="font-headline font-bold text-yellow-400 uppercase tracking-widest text-xs">Premium Store</span>
          </div>
          <h1 className="font-headline font-black text-4xl mb-2 tracking-tight italic">Tycoon Deals</h1>
          <p className="text-blue-200 font-medium max-w-xs">Boost your empire with exclusive resource packs and energy refills!</p>
        </div>
      </div>

      {/* Energy Section */}
      <div className="space-y-4">
        <h2 className="font-headline font-bold text-slate-400 uppercase tracking-wider text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-500" />
          Energy Refills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SHOP_ITEMS.energy.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-5 flex flex-row items-center justify-between gap-4 border-b-4 border-slate-200 shadow-sm transition-all hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-600 fill-emerald-600/20" />
                </div>
                <div>
                  <p className="font-headline font-bold text-blue-900 text-lg">+{item.amount} Energy</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Instant Refill</p>
                </div>
              </div>
              <Button 
                onClick={() => onBuyEnergy(item.amount, item.price)}
                disabled={user.gems < item.price}
                className="bg-purple-600 hover:bg-purple-700 text-white font-headline font-bold rounded-xl shadow-[0_4px_0_#4c1d95] active:translate-y-1 active:shadow-none flex items-center gap-2 px-4"
              >
                <Diamond className="w-4 h-4 fill-white/20" />
                {item.price}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Coins Section */}
      <div className="space-y-4">
        <h2 className="font-headline font-bold text-slate-400 uppercase tracking-wider text-sm flex items-center gap-2">
          <Coins className="w-4 h-4 text-yellow-500" />
          Coin Packs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SHOP_ITEMS.coins.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-5 flex flex-row items-center justify-between gap-4 border-b-4 border-slate-200 shadow-sm transition-all hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Coins className="w-6 h-6 text-yellow-600 fill-yellow-600/20" />
                </div>
                <div>
                  <p className="font-headline font-bold text-blue-900 text-lg">{item.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Capital Boost</p>
                </div>
              </div>
              <Button 
                onClick={() => onBuyCoins(item.amount, item.price)}
                disabled={user.gems < item.price}
                className="bg-purple-600 hover:bg-purple-700 text-white font-headline font-bold rounded-xl shadow-[0_4px_0_#4c1d95] active:translate-y-1 active:shadow-none flex items-center gap-2 px-4"
              >
                <Diamond className="w-4 h-4 fill-white/20" />
                {item.price}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Gems Section (Simulated IAP) */}
      <div className="space-y-4">
        <h2 className="font-headline font-bold text-slate-400 uppercase tracking-wider text-sm flex items-center gap-2">
          <Diamond className="w-4 h-4 text-purple-500" />
          Gem Vault
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SHOP_ITEMS.gems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-5 flex flex-row items-center justify-between gap-4 border-b-4 border-slate-200 shadow-sm transition-all hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Diamond className="w-6 h-6 text-purple-600 fill-purple-600/20" />
                </div>
                <div>
                  <p className="font-headline font-bold text-blue-900 text-lg">{item.amount.toLocaleString()} Gems</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Premium Currency</p>
                </div>
              </div>
              <Button 
                onClick={() => onBuyGems(item.amount, item.price)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-bold rounded-xl shadow-[0_4px_0_#064e3b] active:translate-y-1 active:shadow-none px-6"
              >
                ${item.price}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Wardrobe Section */}
      <div className="space-y-4">
        <h2 className="font-headline font-bold text-slate-400 uppercase tracking-wider text-sm flex items-center gap-2">
          <Shirt className="w-4 h-4 text-blue-500" />
          Empire Wardrobe
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {SKINS.map((skin) => {
            const isSelected = user.selectedSkin === skin.id;
            const isOwned = user.ownedSkins?.includes(skin.id);
            const isLocked = user.level < skin.level;
            
            return (
              <div 
                key={skin.id} 
                onClick={() => !isLocked && onSkinChange(skin.id)}
                className={cn(
                  "bg-white rounded-3xl p-6 flex flex-col items-center text-center gap-3 border-b-4 transition-all cursor-pointer relative group",
                  isSelected ? "border-blue-500 ring-4 ring-blue-500/20 bg-blue-50" : "border-slate-200 hover:bg-slate-50",
                  isLocked && "opacity-60 grayscale cursor-not-allowed"
                )}
              >
                {isLocked && (
                  <div className="absolute top-2 right-2 bg-slate-800 text-white text-[8px] font-bold px-2 py-1 rounded-full z-10">
                    LVL {skin.level}
                  </div>
                )}
                <div className="text-5xl mb-2 drop-shadow-lg group-hover:scale-110 transition-transform">{skin.emoji}</div>
                <div className="flex-1">
                  <p className="font-headline font-bold text-blue-900 text-sm leading-tight">{skin.name}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">{skin.description}</p>
                </div>
                <div className={cn(
                  "mt-2 flex items-center gap-1 px-2 py-1 rounded-lg",
                  isOwned ? "bg-emerald-100" : isLocked ? "bg-slate-100" : "bg-yellow-100"
                )}>
                  {isOwned ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-700">Owned</span>
                    </>
                  ) : isLocked ? (
                    <>
                      <span className="text-[10px] font-bold text-slate-500">Locked</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-3 h-3 text-yellow-600" />
                      <span className="text-[10px] font-bold text-yellow-700">{skin.price.toLocaleString()}</span>
                    </>
                  )}
                </div>
                {isSelected && (
                  <div className="absolute -top-2 -left-2 bg-blue-500 text-white p-1.5 rounded-full shadow-lg">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
