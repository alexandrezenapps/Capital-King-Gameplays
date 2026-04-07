import { Building } from "@/src/types";
import { BUILDING_TYPES, getUpgradeCost } from "@/src/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Landmark, Hotel, ShoppingBag, Home, Clover, Coins, TrendingUp, Shield, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BuildingModalProps {
  building: Building | null;
  isOpen: boolean;
  onClose: () => void;
  onBuy: (type: Building['type'], position: number) => void;
  onUpgrade: (building: Building) => void;
  userCoins: number;
  emptyPosition: number | null;
}

const buildingIcons = {
  bank: Landmark,
  hotel: Hotel,
  shop: ShoppingBag,
  penthouse: Home,
  casino: Clover,
};

export function BuildingModal({
  building,
  isOpen,
  onClose,
  onBuy,
  onUpgrade,
  userCoins,
  emptyPosition
}: BuildingModalProps) {
  const isNew = !building;
  const types = Object.keys(BUILDING_TYPES) as Array<Building['type']>;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="relative w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-b-[8px] border-slate-200">
          {/* Hero Section */}
          <div className={cn(
            "relative h-64 p-6 flex items-center justify-center overflow-visible",
            isNew ? "bg-blue-900" : "bg-gradient-to-b from-blue-900 to-blue-700"
          )}>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute -bottom-12 w-48 h-48 transform rotate-3 drop-shadow-2xl">
                {building ? (
                  (() => {
                    const Icon = buildingIcons[building.type];
                    return <Icon className="w-full h-full text-white fill-white/20" />;
                  })()
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/10 rounded-full border-4 border-dashed border-white/30">
                    <span className="text-white font-black text-4xl">?</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="pt-16 px-8 pb-8">
            {building ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-headline font-extrabold text-2xl text-blue-900 tracking-tight">
                    {BUILDING_TYPES[building.type].name}
                  </h2>
                  <Badge className="bg-emerald-500 text-white font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Level {building.level}
                  </Badge>
                </div>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed font-body">
                  The crown jewel of your financial empire. Secure the city's wealth and watch your treasury overflow.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl border-b-2 border-slate-200">
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Upgrade Price</span>
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-headline font-bold text-xl text-blue-900">
                        {getUpgradeCost(BUILDING_TYPES[building.type].basePrice, building.level).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border-b-2 border-slate-200">
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Passive Income</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      <span className="font-headline font-bold text-xl text-blue-900">
                        {(BUILDING_TYPES[building.type].baseIncome * building.level).toLocaleString()}
                        <span className="text-xs font-medium text-slate-400 ml-1">/hr</span>
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => onUpgrade(building)}
                  disabled={userCoins < getUpgradeCost(BUILDING_TYPES[building.type].basePrice, building.level)}
                  className="w-full h-16 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-headline font-black text-lg tracking-widest uppercase rounded-2xl shadow-[0_4px_0_#705d00] active:translate-y-1 active:shadow-none transition-all"
                >
                  UPGRADE
                </Button>
              </>
            ) : (
              <>
                <h2 className="font-headline font-extrabold text-2xl text-blue-900 tracking-tight mb-4 text-center">
                  Build New Property
                </h2>
                <div className="grid grid-cols-1 gap-3 mb-6 max-h-[300px] overflow-y-auto p-2">
                  {types.map((type) => {
                    const data = BUILDING_TYPES[type];
                    const Icon = buildingIcons[type];
                    return (
                      <button
                        key={type}
                        onClick={() => emptyPosition !== null && onBuy(type, emptyPosition)}
                        disabled={userCoins < data.basePrice}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border-b-2 border-slate-200 hover:bg-slate-100 transition-all active:translate-y-1 active:border-b-0 disabled:opacity-50"
                      >
                        <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-blue-900">{data.name}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Coins className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            {data.basePrice.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-emerald-600">+{data.baseIncome}/hr</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
