import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Timer,
  Coffee,
  Brain,
  Flame,
  Clock,
  Plus,
  Trash2,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type TimerMode = 'work' | 'break';

interface TimerPreset {
  id: string;
  name: string;
  workMinutes: number;
  breakMinutes: number;
}

const MAX_PRESETS = 20;

const defaultPreset: TimerPreset = {
  id: 'preset-default',
  name: 'Classic 25/5',
  workMinutes: 25,
  breakMinutes: 5,
};

export function Pomodoro() {
  const [presets, setPresets] = useState<TimerPreset[]>([defaultPreset]);
  const [selectedPresetId, setSelectedPresetId] = useState(defaultPreset.id);

  const [newPresetName, setNewPresetName] = useState('');
  const [newWorkMinutes, setNewWorkMinutes] = useState('25');
  const [newBreakMinutes, setNewBreakMinutes] = useState('5');

  const selectedPreset = useMemo(
    () => presets.find(preset => preset.id === selectedPresetId) ?? presets[0] ?? defaultPreset,
    [presets, selectedPresetId]
  );

  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(selectedPreset.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (mode === 'work') {
            setCompletedSessions(prevSessions => prevSessions + 1);
            setTotalFocusTime(prevFocus => prevFocus + selectedPreset.workMinutes * 60);
            setMode('break');
            setIsRunning(false);
            return selectedPreset.breakMinutes * 60;
          }

          setMode('work');
          setIsRunning(false);
          return selectedPreset.workMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, mode, selectedPreset.breakMinutes, selectedPreset.workMinutes]);

  const toggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(selectedPreset.workMinutes * 60);
  };

  const skipTimer = () => {
    setIsRunning(false);
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(selectedPreset.breakMinutes * 60);
    } else {
      setMode('work');
      setTimeLeft(selectedPreset.workMinutes * 60);
    }
  };

  const addPreset = () => {
    if (presets.length >= MAX_PRESETS) return;

    const workValue = Number.parseInt(newWorkMinutes, 10);
    const breakValue = Number.parseInt(newBreakMinutes, 10);

    if (!Number.isFinite(workValue) || workValue < 5 || workValue > 180) return;
    if (!Number.isFinite(breakValue) || breakValue < 1 || breakValue > 60) return;

    const name = newPresetName.trim() || `${workValue}/${breakValue}`;

    const preset: TimerPreset = {
      id: crypto.randomUUID(),
      name,
      workMinutes: workValue,
      breakMinutes: breakValue,
    };

    setPresets(prev => [...prev, preset]);
    setSelectedPresetId(preset.id);
    setMode('work');
    setIsRunning(false);
    setTimeLeft(workValue * 60);
    setNewPresetName('');
  };

  const removePreset = (id: string) => {
    if (id === defaultPreset.id) return;

    setPresets(prev => {
      const next = prev.filter(preset => preset.id !== id);
      if (selectedPresetId === id && next.length > 0) {
        setSelectedPresetId(next[0].id);
        setMode('work');
        setIsRunning(false);
        setTimeLeft(next[0].workMinutes * 60);
      }
      return next;
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const total = mode === 'work' ? selectedPreset.workMinutes * 60 : selectedPreset.breakMinutes * 60;
    if (total === 0) return 0;
    return ((total - timeLeft) / total) * 100;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 p-3 sm:space-y-6 sm:p-4 lg:p-8"
    >
      <motion.div variants={sectionVariants}>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Pomodoro</h1>
        <p className="text-white/60">Build your own timer sets, stay focused, and track sessions</p>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        className="liquid-glass rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-4 sm:p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-cyan-300" />
          <h2 className="font-[family-name:var(--font-display)] text-xl text-white">Custom Timer Presets</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Input
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Preset name (optional)"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
          />
          <Input
            type="number"
            min={5}
            max={180}
            value={newWorkMinutes}
            onChange={(e) => setNewWorkMinutes(e.target.value)}
            placeholder="Work (5-180 min)"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
          />
          <Input
            type="number"
            min={1}
            max={60}
            value={newBreakMinutes}
            onChange={(e) => setNewBreakMinutes(e.target.value)}
            placeholder="Break (1-60 min)"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
          />
          <Button
            type="button"
            onClick={addPreset}
            disabled={presets.length >= MAX_PRESETS}
            className="btn-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Timer
          </Button>
        </div>

        <p className="mt-3 text-xs text-white/50">
          {presets.length}/{MAX_PRESETS} timers added. Select any box to activate it.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {presets.map((preset) => {
            const selected = preset.id === selectedPresetId;
            return (
              <motion.button
                key={preset.id}
                onClick={() => {
                  setSelectedPresetId(preset.id);
                  setMode('work');
                  setIsRunning(false);
                  setTimeLeft(preset.workMinutes * 60);
                }}
                className={`group relative rounded-2xl border p-4 text-left transition-all ${
                  selected
                    ? 'border-cyan-400/50 bg-cyan-500/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
                whileHover={{ y: -3 }}
              >
                <p className="text-sm font-semibold text-white">{preset.name}</p>
                <p className="mt-1 text-xs text-white/60">{preset.workMinutes}m focus / {preset.breakMinutes}m break</p>
                {preset.id !== defaultPreset.id && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePreset(preset.id);
                    }}
                    className="absolute right-2 top-2 rounded-md p-1 text-white/40 hover:bg-red-500/20 hover:text-red-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        removePreset(preset.id);
                      }
                    }}
                    aria-label={`Remove ${preset.name} preset`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        className="mx-auto max-w-2xl"
      >
        <div className="liquid-glass rounded-3xl p-4 text-center sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
              mode === 'work' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-orange-500/20 text-orange-300'
            }`}>
              {mode === 'work' ? (
                <>
                  <Brain className="h-5 w-5" />
                  <span className="font-medium">Focus Time</span>
                </>
              ) : (
                <>
                  <Coffee className="h-5 w-5" />
                  <span className="font-medium">Break Time</span>
                </>
              )}
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              Active: {selectedPreset.name}
            </div>
          </div>

          <div className="relative mx-auto mb-6 h-60 w-60 sm:mb-8 sm:h-72 sm:w-72">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />

            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-white/10"
              />
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 110}`}
                strokeDashoffset={`${2 * Math.PI * 110 * (1 - getProgress() / 100)}`}
                className={`transition-all duration-1000 ${mode === 'work' ? 'text-cyan-400' : 'text-orange-400'}`}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-[family-name:var(--font-display)] text-5xl text-white sm:text-6xl">{formatTime(timeLeft)}</span>
              <span className="mt-2 text-white/50">{isRunning ? 'Running' : 'Paused'}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="h-12 w-12 rounded-full border-white/10 text-white hover:bg-white/10"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button
              onClick={toggleTimer}
              className={`h-16 w-16 rounded-full ${isRunning ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30' : 'btn-primary'}`}
            >
              {isRunning ? <Pause className="h-8 w-8" /> : <Play className="ml-1 h-8 w-8" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={skipTimer}
              className="h-12 w-12 rounded-full border-white/10 text-white hover:bg-white/10"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        className="grid gap-3 sm:gap-4 sm:grid-cols-3"
      >
        <div className="liquid-glass rounded-xl p-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
            <Timer className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{completedSessions}</p>
          <p className="text-sm text-white/60">Sessions Today</p>
        </div>

        <div className="liquid-glass rounded-xl p-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
            <Clock className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatDuration(totalFocusTime)}</p>
          <p className="text-sm text-white/60">Focus Time</p>
        </div>

        <div className="liquid-glass rounded-xl p-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
            <Flame className="h-5 w-5 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">{Math.floor(totalFocusTime / (25 * 60))}</p>
          <p className="text-sm text-white/60">Pomodoros</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
