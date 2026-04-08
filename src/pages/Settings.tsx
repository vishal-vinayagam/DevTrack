import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Bell, Palette, Clock3, Database, Download } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function Settings() {
  const { state, dispatch } = useApp();
  const { userProfile } = state;

  const [username, setUsername] = useState(userProfile.username);
  const [bio, setBio] = useState(userProfile.bio || '');
  const [theme, setTheme] = useState<'dark' | 'light'>(userProfile.preferences.theme);
  const [notifications, setNotifications] = useState<boolean>(userProfile.preferences.notifications);
  const [pomodoroDuration, setPomodoroDuration] = useState(String(userProfile.preferences.pomodoroDuration));
  const [breakDuration, setBreakDuration] = useState(String(userProfile.preferences.breakDuration));

  const dataSummary = useMemo(() => {
    return {
      tasks: state.tasks.length,
      notes: state.notes.length,
      courses: state.courses.length,
      apps: state.appShortcuts.length,
      notifications: state.notifications.length,
    };
  }, [state.appShortcuts.length, state.courses.length, state.notes.length, state.notifications.length, state.tasks.length]);

  const handleSave = () => {
    const pomodoro = Number.parseInt(pomodoroDuration, 10);
    const shortBreak = Number.parseInt(breakDuration, 10);

    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        username: username.trim() || userProfile.username,
        bio: bio.trim(),
        preferences: {
          ...userProfile.preferences,
          theme,
          notifications,
          pomodoroDuration: Number.isFinite(pomodoro) && pomodoro > 0 ? pomodoro : userProfile.preferences.pomodoroDuration,
          breakDuration: Number.isFinite(shortBreak) && shortBreak > 0 ? shortBreak : userProfile.preferences.breakDuration,
        },
      },
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: crypto.randomUUID(),
        title: 'Settings Updated',
        message: 'Your preferences were saved successfully.',
        type: 'general',
        createdAt: new Date().toISOString(),
        read: false,
      },
    });
  };

  const handleExportData = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'devtrack-backup.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Settings</h1>
        <p className="text-white/60">Manage account, preferences, and app behavior</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="liquid-glass rounded-2xl p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-cyan-300" />
          <h2 className="font-[family-name:var(--font-display)] text-xl text-white">Profile & Theme</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-white/60">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/60">Theme</label>
            <Select value={theme} onValueChange={(value) => setTheme(value as 'dark' | 'light')}>
              <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[hsl(201,100%,11%)]">
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-white/60">Bio</label>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="liquid-glass rounded-2xl p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-cyan-300" />
          <h2 className="font-[family-name:var(--font-display)] text-xl text-white">Productivity Defaults</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-white/60">Pomodoro (min)</label>
            <Input
              type="number"
              min={1}
              value={pomodoroDuration}
              onChange={(e) => setPomodoroDuration(e.target.value)}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/60">Break (min)</label>
            <Input
              type="number"
              min={1}
              value={breakDuration}
              onChange={(e) => setBreakDuration(e.target.value)}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setNotifications(prev => !prev)}
              className="w-full border-white/10 text-white hover:bg-white/10"
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications: {notifications ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="liquid-glass rounded-2xl p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-cyan-300" />
          <h2 className="font-[family-name:var(--font-display)] text-xl text-white">Data & Information</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryItem label="Tasks" value={dataSummary.tasks} />
          <SummaryItem label="Notes" value={dataSummary.notes} />
          <SummaryItem label="Courses" value={dataSummary.courses} />
          <SummaryItem label="Apps" value={dataSummary.apps} />
          <SummaryItem label="Notifications" value={dataSummary.notifications} />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="button" onClick={handleExportData} className="btn-primary">
            <Download className="mr-2 h-4 w-4" />
            Export Backup
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch({ type: 'RESET_DATA' })}
            className="border-red-400/30 text-red-300 hover:bg-red-500/10"
          >
            Reset All Data
          </Button>
        </div>
      </motion.div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} className="btn-primary">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/5 p-3 text-center">
      <p className="text-lg font-semibold text-white">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}
