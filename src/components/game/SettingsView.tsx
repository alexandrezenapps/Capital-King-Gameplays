import { useState } from "react";
import { motion } from "motion/react";
import { Settings, Globe, Volume2, Music, Bell, Moon, Sun, Smartphone, Check, LogOut } from "lucide-react";
import { UserProfile } from "@/src/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation, Language } from "@/src/lib/i18n";
import { auth } from "@/src/firebase";
import { signOut } from "firebase/auth";

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

export function SettingsView({ user, onUpdateUser }: SettingsViewProps) {
  const { t } = useTranslation(user);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const currentSettings = user.settings || {
    language: 'en',
    sfxEnabled: true,
    musicEnabled: true,
    hapticsEnabled: true,
    theme: 'dark',
    notificationsEnabled: true,
  };

  const updateSetting = async (key: string, value: any) => {
    setIsSaving(true);
    const newSettings = { ...currentSettings, [key]: value };
    await onUpdateUser({ settings: newSettings });
    setIsSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-headline font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
            {t.settings}
          </h2>
          <p className="text-slate-500 text-sm font-medium">{t.welcome}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Language Selection */}
        <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">{t.language}</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => updateSetting('language', lang.code)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all",
                  currentSettings.language === lang.code
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                    : "bg-slate-50 border-transparent dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span className={cn("font-bold", currentSettings.language === lang.code ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400")}>
                    {lang.label}
                  </span>
                </div>
                {currentSettings.language === lang.code && (
                  <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Audio & Feedback */}
        <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-purple-500" />
            Audio & Feedback
          </h3>
          <div className="space-y-4">
            <ToggleItem 
              icon={Volume2} 
              label={t.sfx} 
              active={currentSettings.sfxEnabled} 
              onToggle={() => updateSetting('sfxEnabled', !currentSettings.sfxEnabled)}
              color="text-blue-500"
            />
            <ToggleItem 
              icon={Music} 
              label={t.music} 
              active={currentSettings.musicEnabled} 
              onToggle={() => updateSetting('musicEnabled', !currentSettings.musicEnabled)}
              color="text-purple-500"
            />
            <ToggleItem 
              icon={Smartphone} 
              label={t.haptics} 
              active={currentSettings.hapticsEnabled} 
              onToggle={() => updateSetting('hapticsEnabled', !currentSettings.hapticsEnabled)}
              color="text-emerald-500"
            />
          </div>
        </section>

        {/* Appearance & Notifications */}
        <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="flex items-center gap-3">
                {currentSettings.theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                <span className="font-bold text-slate-700 dark:text-slate-300">{t.theme}</span>
              </div>
              <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-xl">
                <button 
                  onClick={() => updateSetting('theme', 'light')}
                  className={cn("px-3 py-1 rounded-lg text-xs font-bold transition-all", currentSettings.theme === 'light' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}
                >
                  {t.light}
                </button>
                <button 
                  onClick={() => updateSetting('theme', 'dark')}
                  className={cn("px-3 py-1 rounded-lg text-xs font-bold transition-all", currentSettings.theme === 'dark' ? "bg-slate-900 text-white shadow-sm" : "text-slate-500")}
                >
                  {t.dark}
                </button>
              </div>
            </div>
            <ToggleItem 
              icon={Bell} 
              label={t.notifications} 
              active={currentSettings.notificationsEnabled} 
              onToggle={() => updateSetting('notificationsEnabled', !currentSettings.notificationsEnabled)}
              color="text-rose-500"
            />
          </div>
        </section>

        {/* Account */}
        <Button
          variant="outline"
          onClick={() => signOut(auth)}
          className="w-full h-14 rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/20 flex items-center justify-center gap-2 font-bold"
        >
          <LogOut className="w-5 h-5" />
          {t.logout}
        </Button>

        <p className="text-center text-slate-400 text-xs font-medium pt-4">
          Capital King v1.2.0 • Built with ❤️ for Tycoons
        </p>
      </div>

      {/* Save Notification */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: showSaved ? 0 : 100, opacity: showSaved ? 1 : 0 }}
        className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2"
      >
        <Check className="w-4 h-4" />
        <span className="font-bold text-sm">{t.saved}</span>
      </motion.div>
    </div>
  );
}

function ToggleItem({ icon: Icon, label, active, onToggle, color }: { icon: any, label: string, active: boolean, onToggle: () => void, color: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
      <div className="flex items-center gap-3">
        <Icon className={cn("w-5 h-5", color)} />
        <span className="font-bold text-slate-700 dark:text-slate-300">{label}</span>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          "w-12 h-6 rounded-full transition-all relative",
          active ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
          active ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );
}
