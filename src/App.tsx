import { useState, useEffect, useCallback } from "react";
import { TopNav } from "./components/layout/TopNav";
import { BottomNav } from "./components/layout/BottomNav";
import { IsometricCity } from "./components/game/IsometricCity";
import { DiceRoller } from "./components/game/DiceRoller";
import { SlotMachine, SYMBOLS } from "./components/game/SlotMachine";
import { Blackjack } from "./components/game/Blackjack";
import { Poker } from "./components/game/Poker";
import { Roulette } from "./components/game/Roulette";
import { BuildingModal } from "./components/game/BuildingModal";
import { SocialView } from "./components/game/SocialView";
import { ShopView } from "./components/game/ShopView";
import { TasksView } from "./components/game/TasksView";
import { StockMarketView } from "./components/game/StockMarketView";
import { StockTicker } from "./components/game/StockTicker";
import { SettingsView } from "./components/game/SettingsView";
import { RaidModal } from "./components/game/RaidModal";
import { UserProfile, Building, LeaderboardEntry } from "./types";
import { INITIAL_ENERGY, MAX_ENERGY, BUILDING_TYPES, ENERGY_REFILL_RATE_MS, ENERGY_REFILL_AMOUNT, TOTAL_TILES, getUpgradeCost, BOARD_TILES, TileType, SKINS } from "./constants";
import confetti from "canvas-confetti";
import { auth, db, onAuthStateChanged, handleFirestoreError, OperationType } from "./firebase";
import { useTranslation } from "./lib/i18n";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { doc, setDoc, onSnapshot, collection, updateDoc, getDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { LogIn, Loader2, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export default function App() {
  const [activeTab, setActiveTab] = useState("build");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<[number, number] | null>(null);
  const [visualLocation, setVisualLocation] = useState<number>(0);
  const [isMoving, setIsMoving] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [emptyPosition, setEmptyPosition] = useState<number | null>(null);

  const [raidResult, setRaidResult] = useState<{ 
    success: boolean; 
    loot: number; 
    targetName: string;
    targetAvatar?: string;
    attackerEmoji?: string;
    type: 'raid' | 'heist';
  } | null>(null);
  const [isRaidModalOpen, setIsRaidModalOpen] = useState(false);

  const { t } = useTranslation(user);

  const [playMode, setPlayMode] = useState<'dice' | 'slots' | 'blackjack' | 'poker' | 'roulette'>('dice');
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastSlotResult, setLastSlotResult] = useState<string[] | null>(null);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsAuthReady(true);
      if (firebaseUser) {
        // Check if user document exists, if not create it
        const userRef = doc(db, "users", firebaseUser.uid);
        const profileRef = doc(db, "profiles", firebaseUser.uid);
        
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || "Tycoon King",
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
              level: 1,
              coins: 100000,
              gems: 500,
              energy: INITIAL_ENERGY,
              maxEnergy: MAX_ENERGY,
              netWorth: 0,
              lastEnergyRefill: Date.now(),
              currentLocation: 0,
              shields: 3,
              selectedSkin: 'king',
              ownedSkins: ['king'],
              settings: {
                language: 'en',
                sfxEnabled: true,
                musicEnabled: true,
                hapticsEnabled: true,
                theme: 'dark',
                notificationsEnabled: true,
              }
            };
            await setDoc(userRef, newUser);
            await setDoc(profileRef, {
              uid: firebaseUser.uid,
              displayName: newUser.displayName,
              photoURL: newUser.photoURL,
              level: newUser.level,
              netWorth: newUser.netWorth
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, "users/profiles");
        }
      } else {
        setUser(null);
        setBuildings([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Sync (User & Buildings)
  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const buildingsRef = collection(db, "users", auth.currentUser.uid, "buildings");

    const unsubUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const userData = snap.data() as UserProfile;
        setUser(userData);
        // Sync visual location if not currently moving
        if (!isMoving) {
          setVisualLocation(userData.currentLocation);
        }
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, "users"));

    const unsubBuildings = onSnapshot(buildingsRef, (snap) => {
      const bList = snap.docs.map(d => d.data() as Building);
      setBuildings(bList);
    }, (error) => handleFirestoreError(error, OperationType.GET, "buildings"));

    return () => {
      unsubUser();
      unsubBuildings();
    };
  }, [isAuthReady, auth.currentUser]);

  // Passive Income & Energy Refill Logic
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user || !auth.currentUser) return;
      
      const userRef = doc(db, "users", auth.currentUser.uid);
      const profileRef = doc(db, "profiles", auth.currentUser.uid);
      
      const totalIncome = buildings.reduce((acc, b) => acc + (b.baseIncome * b.level), 0);
      const incomePerUpdate = (totalIncome / 3600) * 5; // 5 seconds worth of income
      
      const now = Date.now();
      const timeSinceLastRefill = now - user.lastEnergyRefill;
      let energyToAdd = 0;
      let newLastRefill = user.lastEnergyRefill;

      if (timeSinceLastRefill >= ENERGY_REFILL_RATE_MS && user.energy < user.maxEnergy) {
        energyToAdd = Math.floor(timeSinceLastRefill / ENERGY_REFILL_RATE_MS) * ENERGY_REFILL_AMOUNT;
        newLastRefill = now - (timeSinceLastRefill % ENERGY_REFILL_RATE_MS);
      }

      const totalBuildingValue = buildings.reduce((acc, b) => acc + (b.basePrice * b.level), 0);
      const newNetWorth = user.coins + totalBuildingValue + incomePerUpdate;

      try {
        await updateDoc(userRef, {
          coins: user.coins + incomePerUpdate,
          energy: Math.min(user.maxEnergy, user.energy + energyToAdd),
          lastEnergyRefill: newLastRefill,
          netWorth: newNetWorth
        });
        await updateDoc(profileRef, {
          netWorth: newNetWorth
        });
      } catch (error) {
        console.error("Passive update failed", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [buildings, user, auth.currentUser]);

  useEffect(() => {
    const theme = user?.settings?.theme || 'dark';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.settings?.theme]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleUpdateUser = async (updates: Partial<UserProfile>) => {
    if (!auth.currentUser || !user) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const profileRef = doc(db, "profiles", auth.currentUser.uid);
    
    try {
      await updateDoc(userRef, updates);
      if (updates.netWorth !== undefined || updates.displayName !== undefined || updates.photoURL !== undefined || updates.level !== undefined) {
        const profileUpdates: any = {};
        if (updates.netWorth !== undefined) profileUpdates.netWorth = updates.netWorth;
        if (updates.displayName !== undefined) profileUpdates.displayName = updates.displayName;
        if (updates.photoURL !== undefined) profileUpdates.photoURL = updates.photoURL;
        if (updates.level !== undefined) profileUpdates.level = updates.level;
        await updateDoc(profileRef, profileUpdates);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "users/profiles");
    }
  };

  const handleRoll = useCallback(async () => {
    if (!user || user.energy <= 0 || isRolling || isMoving || !auth.currentUser) return;

    setIsRolling(true);
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    try {
      await updateDoc(userRef, { energy: user.energy - 1 });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "users");
    }

    setTimeout(async () => {
      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      const total = die1 + die2;
      
      setLastRoll([die1, die2]);
      setIsRolling(false);
      setIsMoving(true);

      // Animate movement step by step
      let currentPos = user.currentLocation;
      for (let i = 1; i <= total; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        currentPos = (currentPos + 1) % TOTAL_TILES;
        setVisualLocation(currentPos);
      }

      const newLocation = currentPos;
      setIsMoving(false);
      
      const tileType = BOARD_TILES[newLocation];
      let reward = total * 1000; // Base reward for moving
      
      if (auth.currentUser) {
        try {
          // Handle Tile Events
          let shieldsToUpdate = user.shields;
          if (tileType === TileType.GO) {
            reward += 50000;
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
          } else if (tileType === TileType.RAID) {
            await handleRaid();
          } else if (tileType === TileType.TAX) {
            if (shieldsToUpdate > 0) {
              shieldsToUpdate -= 1;
              reward = 0; // Shield blocked the tax/loss
            } else {
              reward -= 20000;
            }
          } else if (tileType === TileType.CHANCE) {
            const chance = Math.random();
            if (chance > 0.7 && shieldsToUpdate < 3) {
              shieldsToUpdate += 1;
              reward = 0;
            } else if (chance > 0.4) {
              reward += 30000;
            } else {
              reward -= 10000;
            }
          }

          const totalBuildingValue = buildings.reduce((acc, b) => acc + (b.basePrice * b.level), 0);
          const newCoins = Math.max(0, user.coins + reward);
          const newNetWorth = newCoins + totalBuildingValue;

          await updateDoc(userRef, { 
            coins: newCoins,
            netWorth: newNetWorth,
            currentLocation: newLocation,
            shields: shieldsToUpdate
          });
          const profileRef = doc(db, "profiles", auth.currentUser.uid);
          await updateDoc(profileRef, { netWorth: newNetWorth });

          // Auto-prompt to buy if tile is empty and it's a property tile
          if (tileType === TileType.PROPERTY) {
            const buildingAtTile = buildings.find(b => b.position === newLocation);
            if (!buildingAtTile) {
              setEmptyPosition(newLocation);
              setSelectedBuilding(null);
              setIsBuildingModalOpen(true);
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, "users/profiles");
        }
      }

      if (die1 === die2) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, 600);
  }, [user, isRolling, isMoving, auth.currentUser, buildings]);

  const handleRaid = async (target?: LeaderboardEntry, type: 'raid' | 'heist' = 'raid') => {
    if (!auth.currentUser || !user) return;

    // Energy check
    const energyCost = type === 'heist' ? 10 : 5;
    if (user.energy < energyCost) return;

    try {
      let finalTarget = target;
      if (!finalTarget) {
        // Fetch potential targets (top 5 players)
        const q = query(collection(db, "profiles"), orderBy("netWorth", "desc"), limit(5));
        const querySnapshot = await getDocs(q);
        const targets = querySnapshot.docs
          .map(doc => doc.data() as LeaderboardEntry)
          .filter(t => t.uid !== auth.currentUser?.uid);

        if (targets.length === 0) return;
        finalTarget = targets[Math.floor(Math.random() * targets.length)];
      }

      const successThreshold = type === 'heist' ? 0.6 : 0.3;
      const lootMultiplier = type === 'heist' ? 0.15 : 0.05;
      const failPenaltyMultiplier = type === 'heist' ? 0.2 : 0.1;

      const success = Math.random() > successThreshold;
      const loot = success 
        ? Math.floor(finalTarget.netWorth * lootMultiplier) 
        : Math.floor(user.coins * failPenaltyMultiplier);
      
      const userRef = doc(db, "users", auth.currentUser.uid);
      const profileRef = doc(db, "profiles", auth.currentUser.uid);
      const targetRef = doc(db, "users", finalTarget.uid);
      const targetProfileRef = doc(db, "profiles", finalTarget.uid);
      const totalBuildingValue = buildings.reduce((acc, b) => acc + (b.basePrice * b.level), 0);

      if (success) {
        const newCoins = user.coins + loot;
        const newNetWorth = newCoins + totalBuildingValue;

        await updateDoc(userRef, { 
          coins: newCoins,
          energy: user.energy - energyCost,
          netWorth: newNetWorth
        });
        await updateDoc(profileRef, { netWorth: newNetWorth });
        
        // Decrement target
        const targetSnap = await getDoc(targetRef);
        if (targetSnap.exists()) {
          const targetData = targetSnap.data() as UserProfile;
          const actualLoot = Math.min(loot, targetData.coins);
          await updateDoc(targetRef, { 
            coins: targetData.coins - actualLoot,
            netWorth: targetData.netWorth - actualLoot
          });
          await updateDoc(targetProfileRef, { netWorth: targetData.netWorth - actualLoot });
        }
      } else {
        const newCoins = Math.max(0, user.coins - loot);
        const newNetWorth = newCoins + totalBuildingValue;

        await updateDoc(userRef, { 
          coins: newCoins,
          energy: user.energy - energyCost,
          netWorth: newNetWorth
        });
        await updateDoc(profileRef, { netWorth: newNetWorth });
      }

      const currentSkin = SKINS.find(s => s.id === user.selectedSkin) || SKINS[0];

      setRaidResult({
        success,
        loot,
        targetName: finalTarget.displayName,
        targetAvatar: finalTarget.photoURL,
        attackerEmoji: currentSkin.emoji,
        type
      });
      setIsRaidModalOpen(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, type);
    }
  };

  const handleSpin = async () => {
    if (!user || user.energy < 1 || !auth.currentUser) return;

    setIsSpinning(true);
    const userRef = doc(db, "users", auth.currentUser.uid);
    const profileRef = doc(db, "profiles", auth.currentUser.uid);

    // Generate results
    const results = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    ];

    // Deduct energy immediately
    await updateDoc(userRef, { energy: user.energy - 1 });

    setTimeout(async () => {
      setIsSpinning(false);
      setLastSlotResult(results);

      let coinReward = 0;
      let gemReward = 0;
      let energyReward = 0;
      let message = "";

      const [s1, s2, s3] = results;

      if (s1 === s2 && s2 === s3) {
        // 3 of a kind
        if (s1 === "7️⃣") { coinReward = 2000000; message = "TRIPLE SEVEN JACKPOT!"; }
        else if (s1 === "💎") { gemReward = 500; message = "GEM OVERLOAD!"; }
        else if (s1 === "👑") { coinReward = 500000; gemReward = 50; message = "ROYAL JACKPOT!"; }
        else if (s1 === "⚡") { energyReward = user.maxEnergy; message = "ENERGY SURGE!"; }
        else if (s1 === "💰") { coinReward = 100000; message = "BIG BAG!"; }
        else { coinReward = 50000; message = "TRIPLE WIN!"; }
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
      } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        // 2 of a kind
        coinReward = 10000;
        message = "Double Match!";
      }

      if (coinReward > 0 || gemReward > 0 || energyReward > 0) {
        try {
          const totalBuildingValue = buildings.reduce((acc, b) => acc + (b.basePrice * b.level), 0);
          const newCoins = user.coins + coinReward;
          const newGems = user.gems + gemReward;
          const newEnergy = Math.min(user.maxEnergy, user.energy + energyReward);
          const newNetWorth = newCoins + totalBuildingValue;

          await updateDoc(userRef, { 
            coins: newCoins, 
            gems: newGems, 
            energy: newEnergy,
            netWorth: newNetWorth 
          });
          await updateDoc(profileRef, { netWorth: newNetWorth });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, "slots");
        }
      }
    }, 2000);
  };

  const handleCasinoWin = async (amount: number) => {
    if (!user || !auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const profileRef = doc(db, "profiles", auth.currentUser.uid);
    const totalBuildingValue = buildings.reduce((acc, b) => acc + (b.basePrice * b.level), 0);
    const newCoins = user.coins + amount;
    const newNetWorth = newCoins + totalBuildingValue;

    try {
      await updateDoc(userRef, { coins: newCoins, netWorth: newNetWorth });
      await updateDoc(profileRef, { netWorth: newNetWorth });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "casino");
    }
  };

  const handleCasinoLose = async (amount: number) => {
    if (!user || !auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const profileRef = doc(db, "profiles", auth.currentUser.uid);
    const totalBuildingValue = buildings.reduce((acc, b) => acc + (b.basePrice * b.level), 0);
    const newCoins = Math.max(0, user.coins - amount);
    const newNetWorth = newCoins + totalBuildingValue;

    try {
      await updateDoc(userRef, { coins: newCoins, netWorth: newNetWorth });
      await updateDoc(profileRef, { netWorth: newNetWorth });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "casino");
    }
  };

  const handleEnergyUse = async () => {
    if (!user || !auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    try {
      await updateDoc(userRef, { energy: user.energy - 1 });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "energy");
    }
  };

  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building);
    setEmptyPosition(null);
    setIsBuildingModalOpen(true);
  };

  const handleEmptyTileClick = (position: number) => {
    setSelectedBuilding(null);
    setEmptyPosition(position);
    setIsBuildingModalOpen(true);
  };

  const handleBuyBuilding = async (type: Building['type'], position: number) => {
    const data = BUILDING_TYPES[type];
    if (!user || user.coins < data.basePrice || !auth.currentUser) return;

    const buildingId = Math.random().toString(36).substr(2, 9);
    const newBuilding: Building = {
      id: buildingId,
      name: data.name,
      type,
      level: 1,
      basePrice: data.basePrice,
      baseIncome: data.baseIncome,
      position
    };

    const userRef = doc(db, "users", auth.currentUser.uid);
    const buildingRef = doc(db, "users", auth.currentUser.uid, "buildings", buildingId);
    const profileRef = doc(db, "profiles", auth.currentUser.uid);

    try {
      await setDoc(buildingRef, newBuilding);
      
      setIsBuilding(true);
      setTimeout(() => setIsBuilding(false), 2000);

      const newBuildings = [...buildings, newBuilding];
      const totalBuildingValue = newBuildings.reduce((acc, b) => acc + (b.basePrice * b.level), 0);
      const newCoins = user.coins - data.basePrice;
      const newNetWorth = newCoins + totalBuildingValue;

      await updateDoc(userRef, { 
        coins: newCoins,
        netWorth: newNetWorth 
      });
      await updateDoc(profileRef, { netWorth: newNetWorth });
      
      setIsBuildingModalOpen(false);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "buildings");
    }
  };

  const handleUpgradeBuilding = async (building: Building) => {
    const upgradePrice = getUpgradeCost(building.basePrice, building.level);
    if (!user || user.coins < upgradePrice || !auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const buildingRef = doc(db, "users", auth.currentUser.uid, "buildings", building.id);
    const profileRef = doc(db, "profiles", auth.currentUser.uid);

    try {
      await updateDoc(buildingRef, { level: building.level + 1 });
      
      setIsBuilding(true);
      setTimeout(() => setIsBuilding(false), 2000);

      const newBuildings = buildings.map(b => b.id === building.id ? { ...b, level: b.level + 1 } : b);
      const totalBuildingValue = newBuildings.reduce((acc, b) => acc + (b.basePrice * b.level), 0);
      const newCoins = user.coins - upgradePrice;
      const newNetWorth = newCoins + totalBuildingValue;

      await updateDoc(userRef, { 
        coins: newCoins,
        netWorth: newNetWorth
      });
      await updateDoc(profileRef, { netWorth: newNetWorth });
      
      setIsBuildingModalOpen(false);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "buildings");
    }
  };

  // Shop Handlers
  const handleSkinChange = async (skinId: string) => {
    if (!auth.currentUser || !user) return;
    
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin) return;

    // Check level requirement
    if (user.level < skin.level) {
      console.warn(`Level ${skin.level} required for skin ${skin.name}`);
      return;
    }

    const isOwned = user.ownedSkins?.includes(skinId);
    const price = skin.price || 0;

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      if (!isOwned) {
        if (user.coins < price) {
          // Not enough coins
          return;
        }
        
        await updateDoc(userRef, { 
          selectedSkin: skinId,
          coins: user.coins - price,
          ownedSkins: [...(user.ownedSkins || []), skinId]
        });
      } else {
        await updateDoc(userRef, { selectedSkin: skinId });
      }
      
      confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "users/profiles");
    }
  };

  const handleBuyEnergy = async (amount: number, price: number) => {
    if (!user || user.gems < price || !auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    try {
      await updateDoc(userRef, {
        energy: Math.min(user.energy + amount, user.maxEnergy),
        gems: user.gems - price
      });
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "users");
    }
  };

  const handleBuyCoins = async (amount: number, price: number) => {
    if (!user || user.gems < price || !auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const profileRef = doc(db, "profiles", auth.currentUser.uid);
    try {
      const totalBuildingValue = buildings.reduce((acc, b) => acc + (b.basePrice * b.level), 0);
      const newCoins = user.coins + amount;
      const newNetWorth = newCoins + totalBuildingValue;

      await updateDoc(userRef, {
        coins: newCoins,
        gems: user.gems - price,
        netWorth: newNetWorth
      });
      await updateDoc(profileRef, { netWorth: newNetWorth });
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "users/profiles");
    }
  };

  const handleBuyGems = async (amount: number, price: number) => {
    if (!user || !auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    try {
      // Simulated IAP - just give the gems
      await updateDoc(userRef, {
        gems: user.gems + amount
      });
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.8 } });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "users");
    }
  };

  // Social Handlers
  const handleClaimTask = async (taskId: string) => {
    if (!user || !auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const profileRef = doc(db, "profiles", auth.currentUser.uid);

    // For now, just give the reward and show confetti
    // In a real app, we'd track claimed tasks in Firestore
    let rewardAmount = 0;
    let rewardType: 'coins' | 'gems' | 'energy' = 'coins';

    if (taskId === 'task_1') { rewardAmount = 50000; rewardType = 'coins'; }
    if (taskId === 'task_2') { rewardAmount = 100; rewardType = 'gems'; }
    if (taskId === 'task_3') { rewardAmount = 10; rewardType = 'energy'; }
    if (taskId === 'task_4') { rewardAmount = 250000; rewardType = 'coins'; }

    try {
      const totalBuildingValue = buildings.reduce((acc, b) => acc + (b.basePrice * b.level), 0);
      
      if (rewardType === 'coins') {
        const newCoins = user.coins + rewardAmount;
        const newNetWorth = newCoins + totalBuildingValue;
        await updateDoc(userRef, { coins: newCoins, netWorth: newNetWorth });
        await updateDoc(profileRef, { netWorth: newNetWorth });
      } else if (rewardType === 'gems') {
        await updateDoc(userRef, { gems: user.gems + rewardAmount });
      } else if (rewardType === 'energy') {
        await updateDoc(userRef, { energy: Math.min(user.maxEnergy, user.energy + rewardAmount) });
      }

      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "tasks");
    }
  };

  const [marketInsight, setMarketInsight] = useState<string | null>(null);

  // Market Insights
  useEffect(() => {
    const insights = [
      t.marketBoom,
      t.marketVolatility,
      t.marketIPO,
      t.marketEnergy,
      t.marketConsumer,
      t.marketBull,
      t.marketBear,
    ];
    const interval = setInterval(() => {
      const insight = insights[Math.floor(Math.random() * insights.length)];
      setMarketInsight(insight);
      setTimeout(() => setMarketInsight(null), 5000);
    }, 30000);
    return () => clearInterval(interval);
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-900">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-900 p-8 text-center">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 rounded-full animate-pulse" />
          <div className="relative w-48 h-48 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20">
            <LogIn className="w-24 h-24 text-white" />
          </div>
        </div>
        <h1 className="font-headline font-black text-5xl text-white mb-4 tracking-tighter uppercase italic">
          Capital King
        </h1>
        <p className="text-blue-200 mb-12 max-w-xs font-medium">
          Build your empire, roll the dice, and become the ultimate tycoon.
        </p>
        <Button
          onClick={handleLogin}
          className="w-full max-w-xs h-16 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-headline font-black text-xl rounded-2xl shadow-[0_6px_0_#705d00] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
        >
          <LogIn className="w-6 h-6" />
          LOGIN WITH GOOGLE
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body select-none overflow-hidden">
      <TopNav user={user} onOpenSettings={() => setActiveTab('settings')} />
      <StockTicker />
      
      <AnimatePresence>
        {marketInsight && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-28 right-4 z-[60] bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-bold text-sm">{marketInsight}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="h-screen pt-24 pb-24">
        {activeTab === 'build' && (
          <IsometricCity 
            buildings={buildings} 
            playerLocation={visualLocation}
            userCoins={user.coins}
            shields={user.shields}
            selectedSkin={user.selectedSkin}
            isMoving={isMoving}
            isBuilding={isBuilding}
            onBuildingClick={handleBuildingClick}
            onEmptyTileClick={handleEmptyTileClick}
          />
        )}
        {activeTab === 'play' && (
          <div className="h-full flex flex-col">
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 flex bg-blue-950/80 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-xl overflow-x-auto max-w-[90vw] scrollbar-hide">
              <button 
                onClick={() => setPlayMode('dice')}
                className={cn(
                  "px-4 py-2 rounded-full font-headline font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                  playMode === 'dice' ? "bg-yellow-500 text-blue-900 shadow-lg" : "text-blue-300 hover:text-white"
                )}
              >
                Board
              </button>
              <button 
                onClick={() => setPlayMode('slots')}
                className={cn(
                  "px-4 py-2 rounded-full font-headline font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                  playMode === 'slots' ? "bg-purple-500 text-white shadow-lg" : "text-blue-300 hover:text-white"
                )}
              >
                Jackpot
              </button>
              <button 
                onClick={() => setPlayMode('blackjack')}
                className={cn(
                  "px-4 py-2 rounded-full font-headline font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                  playMode === 'blackjack' ? "bg-blue-500 text-white shadow-lg" : "text-blue-300 hover:text-white"
                )}
              >
                Blackjack
              </button>
              <button 
                onClick={() => setPlayMode('poker')}
                className={cn(
                  "px-4 py-2 rounded-full font-headline font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                  playMode === 'poker' ? "bg-emerald-500 text-white shadow-lg" : "text-blue-300 hover:text-white"
                )}
              >
                Poker
              </button>
              <button 
                onClick={() => setPlayMode('roulette')}
                className={cn(
                  "px-4 py-2 rounded-full font-headline font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                  playMode === 'roulette' ? "bg-red-500 text-white shadow-lg" : "text-blue-300 hover:text-white"
                )}
              >
                Roulette
              </button>
            </div>

            <div className="flex-1 pt-12">
              {playMode === 'dice' && (
                <DiceRoller 
                  energy={user?.energy || 0} 
                  onRoll={handleRoll}
                  isRolling={isRolling}
                  lastRoll={lastRoll}
                />
              )}
              {playMode === 'slots' && (
                <SlotMachine 
                  energy={user?.energy || 0}
                  onSpin={handleSpin}
                  isSpinning={isSpinning}
                  lastResult={lastSlotResult}
                />
              )}
              {playMode === 'blackjack' && (
                <Blackjack 
                  coins={user?.coins || 0}
                  energy={user?.energy || 0}
                  onWin={handleCasinoWin}
                  onLose={handleCasinoLose}
                  onEnergyUse={handleEnergyUse}
                />
              )}
              {playMode === 'poker' && (
                <Poker 
                  coins={user?.coins || 0}
                  energy={user?.energy || 0}
                  onWin={handleCasinoWin}
                  onLose={handleCasinoLose}
                  onEnergyUse={handleEnergyUse}
                />
              )}
              {playMode === 'roulette' && (
                <Roulette 
                  coins={user?.coins || 0}
                  energy={user?.energy || 0}
                  onWin={handleCasinoWin}
                  onLose={handleCasinoLose}
                  onEnergyUse={handleEnergyUse}
                />
              )}
            </div>
          </div>
        )}
        {activeTab === 'shop' && (
          <ShopView 
            user={user} 
            onBuyEnergy={handleBuyEnergy}
            onBuyCoins={handleBuyCoins}
            onBuyGems={handleBuyGems}
            onSkinChange={handleSkinChange}
          />
        )}
        {activeTab === 'invest' && user && (
          <StockMarketView 
            user={user} 
            onUpdateUser={handleUpdateUser}
          />
        )}
        {activeTab === 'social' && (
          <SocialView 
            user={user} 
            onAttack={(target) => handleRaid(target, 'raid')}
            onHeist={(target) => handleRaid(target, 'heist')}
          />
        )}
        {activeTab === 'tasks' && (
          <TasksView 
            user={user} 
            buildings={buildings}
            onClaimTask={handleClaimTask}
          />
        )}
        {activeTab === 'settings' && user && (
          <SettingsView 
            user={user} 
            onUpdateUser={handleUpdateUser}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} user={user} />

      <BuildingModal 
        building={selectedBuilding}
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
        onBuy={handleBuyBuilding}
        onUpgrade={handleUpgradeBuilding}
        userCoins={user?.coins || 0}
        emptyPosition={emptyPosition}
      />

      <RaidModal 
        isOpen={isRaidModalOpen}
        onClose={() => setIsRaidModalOpen(false)}
        result={raidResult}
      />
    </div>
  );
}
