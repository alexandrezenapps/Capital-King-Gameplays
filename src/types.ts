export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  level: number;
  coins: number;
  gems: number;
  energy: number;
  maxEnergy: number;
  netWorth: number;
  lastEnergyRefill: number;
  currentLocation: number;
  shields: number;
  selectedSkin: string;
  ownedSkins: string[];
  investments?: {
    [symbol: string]: {
      shares: number;
      avgPrice: number;
    };
  };
  settings?: {
    language: 'en' | 'fr' | 'zh';
    sfxEnabled: boolean;
    musicEnabled: boolean;
    hapticsEnabled: boolean;
    theme: 'dark' | 'light';
    notificationsEnabled: boolean;
  };
}

export interface Building {
  id: string;
  name: string;
  type: 'bank' | 'hotel' | 'shop' | 'penthouse' | 'casino';
  level: number;
  basePrice: number;
  baseIncome: number;
  position: number; // 0-15 for isometric grid
}

export interface GameState {
  user: UserProfile | null;
  buildings: Building[];
  currentLocation: number;
  isRolling: boolean;
  lastRoll: [number, number] | null;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  netWorth: number;
  level: number;
}

export interface Skin {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  level: number;
}
