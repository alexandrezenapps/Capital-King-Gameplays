import { UserProfile, Building } from "@/src/types";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Trophy, Zap, Coins, Diamond, Star, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string;
  reward: { type: 'coins' | 'gems' | 'energy'; amount: number };
  target: number;
  current: number;
  claimed: boolean;
}

interface TasksViewProps {
  user: UserProfile | null;
  buildings: Building[];
  onClaimTask: (taskId: string) => void;
}

export function TasksView({ user, buildings, onClaimTask }: TasksViewProps) {
  if (!user) return null;

  // Mock tasks based on user state for now
  const tasks: Task[] = [
    {
      id: 'task_1',
      title: 'Empire Builder',
      description: 'Own at least 3 buildings in your city.',
      reward: { type: 'coins', amount: 50000 },
      target: 3,
      current: buildings.length,
      claimed: false, // This should be tracked in DB
    },
    {
      id: 'task_2',
      title: 'High Roller',
      description: 'Reach Level 5 to prove your tycoon status.',
      reward: { type: 'gems', amount: 100 },
      target: 5,
      current: user.level,
      claimed: false,
    },
    {
      id: 'task_3',
      title: 'Energy Surge',
      description: 'Have at least 10 energy remaining.',
      reward: { type: 'energy', amount: 10 },
      target: 10,
      current: user.energy,
      claimed: false,
    },
    {
      id: 'task_4',
      title: 'Millionaire Club',
      description: 'Reach a Net Worth of $1,000,000.',
      reward: { type: 'coins', amount: 250000 },
      target: 1000000,
      current: user.netWorth,
      claimed: false,
    }
  ];

  return (
    <div className="h-full overflow-y-auto pt-4 pb-32 px-6 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-teal-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
          <Trophy className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-headline font-bold text-yellow-400 uppercase tracking-widest text-xs">Daily Rewards</span>
          </div>
          <h1 className="font-headline font-black text-4xl mb-2 tracking-tight italic">Tycoon Missions</h1>
          <p className="text-emerald-200 font-medium max-w-xs">Complete these challenges to earn massive rewards and grow your empire!</p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const isCompleted = task.current >= task.target;
          const progress = Math.min(100, (task.current / task.target) * 100);

          return (
            <div key={task.id} className="bg-white rounded-2xl p-6 border-b-4 border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-headline font-bold text-xl text-blue-900 mb-1 flex items-center gap-2">
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-300" />}
                    {task.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium">{task.description}</p>
                </div>
                <div className="text-right">
                  <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2">
                    {task.reward.type === 'coins' && <Coins className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                    {task.reward.type === 'gems' && <Diamond className="w-4 h-4 text-purple-500 fill-purple-500" />}
                    {task.reward.type === 'energy' && <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />}
                    <span className="font-headline font-black text-blue-900">+{task.reward.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Progress</span>
                  <span>{task.current.toLocaleString()} / {task.target.toLocaleString()}</span>
                </div>
                <Progress value={progress} className="h-2 bg-slate-100" />
              </div>

              <Button
                onClick={() => onClaimTask(task.id)}
                disabled={!isCompleted || task.claimed}
                className={cn(
                  "w-full h-12 font-headline font-black rounded-xl transition-all",
                  isCompleted && !task.claimed
                    ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_0_#065f46] active:translate-y-1 active:shadow-none"
                    : "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed"
                )}
              >
                {task.claimed ? "CLAIMED" : isCompleted ? "CLAIM REWARD" : "IN PROGRESS"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
