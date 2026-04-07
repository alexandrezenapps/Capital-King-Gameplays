import { Building } from "@/src/types";
import { BUILDING_TYPES, TOTAL_TILES, getUpgradeCost, BOARD_TILES, TileType, SKINS } from "@/src/constants";
import { cn } from "@/lib/utils";
import { Landmark, Hotel, ShoppingBag, Home, Clover, ArrowBigUp, Swords, HelpCircle, Receipt, Star, Hammer } from "lucide-react";
import { motion } from "motion/react";

interface IsometricCityProps {
  buildings: Building[];
  playerLocation: number;
  userCoins: number;
  shields: number;
  selectedSkin?: string;
  isMoving?: boolean;
  isBuilding?: boolean;
  onBuildingClick: (building: Building) => void;
  onEmptyTileClick: (position: number) => void;
}

const buildingIcons = {
  bank: Landmark,
  hotel: Hotel,
  shop: ShoppingBag,
  penthouse: Home,
  casino: Clover,
};

export function IsometricCity({ buildings, playerLocation, userCoins, shields, selectedSkin, isMoving, isBuilding, onBuildingClick, onEmptyTileClick }: IsometricCityProps) {
  const grid = Array.from({ length: TOTAL_TILES }, (_, i) => i);
  const currentSkin = SKINS.find(s => s.id === selectedSkin) || SKINS[0];

  return (
    <div className="flex items-center justify-center w-full h-full perspective-[1200px] overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent">
      {/* City Grid Background */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative w-[600px] h-[600px] grid grid-cols-4 grid-rows-4 gap-4 p-8 transform rotateX(60deg) rotateZ(-45deg) transform-style-preserve-3d">
        {grid.map((pos) => {
          const building = buildings.find((b) => b.position === pos);
          const isPlayerHere = playerLocation === pos;
          const canUpgrade = building && userCoins >= getUpgradeCost(building.basePrice, building.level);
          const tileType = BOARD_TILES[pos];
          
          return (
            <div
              key={pos}
              onClick={() => building ? onBuildingClick(building) : onEmptyTileClick(pos)}
              className={cn(
                "relative bg-blue-100/20 dark:bg-slate-800/40 rounded-xl shadow-inner border border-white/5 cursor-pointer transition-all hover:bg-white/10 transform-style-preserve-3d",
                !building && "hover:border-yellow-500/50",
                isPlayerHere && "ring-4 ring-yellow-400 ring-offset-4 ring-offset-transparent",
                isBuilding && isPlayerHere && "animate-pulse ring-emerald-400",
                tileType === TileType.RAID && "bg-red-500/10 border-red-500/20",
                tileType === TileType.GO && "bg-emerald-500/10 border-emerald-500/20",
                tileType === TileType.CHANCE && "bg-purple-500/10 border-purple-500/20",
                tileType === TileType.TAX && "bg-orange-500/10 border-orange-500/20"
              )}
            >
              {/* Tile Base Depth */}
              <div className={cn(
                "absolute inset-0 rounded-xl translate-z-[-10px] shadow-2xl",
                tileType === TileType.RAID ? "bg-red-900/20" : 
                tileType === TileType.GO ? "bg-emerald-900/20" :
                tileType === TileType.CHANCE ? "bg-purple-900/20" :
                tileType === TileType.TAX ? "bg-orange-900/20" :
                "bg-blue-900/20"
              )} />
              
              {/* Tile Label */}
              <div className="absolute bottom-2 left-2 text-[8px] font-headline font-black uppercase tracking-tighter opacity-40">
                {tileType}
              </div>

              {/* Tile Icon for non-property tiles */}
              {!building && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  {tileType === TileType.RAID && <Swords className="w-8 h-8 text-red-500" />}
                  {tileType === TileType.GO && <Star className="w-8 h-8 text-emerald-500" />}
                  {tileType === TileType.CHANCE && <HelpCircle className="w-8 h-8 text-purple-500" />}
                  {tileType === TileType.TAX && <Receipt className="w-8 h-8 text-orange-500" />}
                </div>
              )}
              
              {/* Tile Coordinates */}
              <div className="absolute top-2 left-2 text-[6px] font-mono text-slate-400/50 uppercase tracking-tighter">
                SEC-{Math.floor(pos/4)}-{pos%4}
              </div>

              {isPlayerHere && (
                <motion.div 
                  layoutId="player"
                  className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none transform-style-preserve-3d"
                  initial={{ scale: 0, z: 100 }}
                  animate={{ 
                    scale: (isMoving || isBuilding) ? 1.2 : 1, 
                    z: (isMoving || isBuilding) ? 100 : 50,
                    rotateY: (isMoving || isBuilding) ? [0, 360] : [0, 10, -10, 0],
                    y: (isMoving || isBuilding) ? [0, -20, 0] : [0, -10, 0]
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    rotateY: { repeat: Infinity, duration: (isMoving || isBuilding) ? 0.8 : 3, ease: "easeInOut" },
                    y: { repeat: Infinity, duration: (isMoving || isBuilding) ? 0.4 : 0.8 }
                  }}
                >
                  <div className="relative w-16 h-16 transform-style-preserve-3d">
                    {/* Character Shadow */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-black/40 blur-md rounded-full" />
                    
                    {/* Character Body */}
                    <div className={cn(
                      "w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-2xl border-4 border-white flex items-center justify-center relative overflow-hidden transition-all duration-300",
                      (isMoving || isBuilding) && "shadow-[0_0_30px_rgba(250,204,21,0.8)] scale-110"
                    )}>
                      {/* Building Tool Icon */}
                      {isBuilding && (
                        <>
                          <motion.div
                            animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow-md z-30"
                          >
                            <Hammer className="w-4 h-4 text-blue-900" />
                          </motion.div>
                          <motion.div
                            animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute inset-0 bg-emerald-400/30 rounded-full blur-xl -z-10"
                          />
                        </>
                      )}
                      {/* Shield Dome */}
                      {shields > 0 && (
                        <motion.div 
                          animate={{ opacity: [0.1, 0.3, 0.1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-blue-400/40 z-20"
                        />
                      )}
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      <span className="text-3xl drop-shadow-md relative z-10">{currentSkin.emoji}</span>
                    </div>
                    {isBuilding && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: -40 }}
                        className="absolute whitespace-nowrap bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg border border-white"
                      >
                        BUILDING...
                      </motion.div>
                    )}
                    {isMoving && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: -40 }}
                        className="absolute whitespace-nowrap bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg border border-white"
                      >
                        MOVING...
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
              {building && (
                <motion.div
                  initial={{ z: 100, opacity: 0 }}
                  animate={{ z: 20, opacity: 1 }}
                  whileHover={{ z: 40, scale: 1.05 }}
                  className={cn(
                    "absolute bottom-4 left-4 w-24 h-32 rounded-lg shadow-2xl flex flex-col items-center justify-center border-b-8 transition-transform transform-style-preserve-3d",
                    building.type === 'bank' && "bg-gradient-to-t from-primary to-primary-container border-blue-900",
                    building.type === 'hotel' && "bg-gradient-to-t from-secondary to-secondary-container border-yellow-700",
                    building.type === 'shop' && "bg-gradient-to-t from-tertiary to-tertiary-container border-emerald-900",
                    building.type === 'penthouse' && "bg-gradient-to-t from-primary to-primary-container border-blue-900",
                    building.type === 'casino' && "bg-gradient-to-t from-slate-800 to-slate-600 border-black"
                  )}
                >
                  {/* Upgrade Badge */}
                  <div className="absolute -top-4 -right-4 bg-error text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg border-2 border-white animate-bounce">
                    LVL {building.level}
                  </div>

                  {canUpgrade && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-50">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="bg-yellow-400 text-blue-900 p-1 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.8)] border-2 border-white"
                      >
                        <ArrowBigUp className="w-4 h-4 fill-current" />
                      </motion.div>
                    </div>
                  )}

                  {(() => {
                    const Icon = buildingIcons[building.type];
                    return <Icon className="w-12 h-12 text-white mb-2 fill-white/20" />;
                  })()}
                  
                  <span className="font-label text-[8px] text-white/80 uppercase font-bold text-center px-2">
                    {BUILDING_TYPES[building.type].name}
                  </span>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
