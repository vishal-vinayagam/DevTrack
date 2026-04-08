import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  Globe,
  Code,
  Briefcase,
  BookOpen,
  Youtube,
  MessageSquare,
  MoreHorizontal,
  Search
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AppShortcut } from '@/types';

const iconOptions = [
  { name: 'Code', icon: Code },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Youtube', icon: Youtube },
  { name: 'MessageSquare', icon: MessageSquare },
  { name: 'Globe', icon: Globe },
];

const suggestedApps = [
  { name: 'Help Center', url: 'https://support.google.com/', category: 'General', icon: 'Globe', color: '#22c55e' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com/', category: 'Coding', icon: 'Code', color: '#f59e0b' },
  { name: 'Roadmap.sh', url: 'https://roadmap.sh/', category: 'Career', icon: 'Briefcase', color: '#3b82f6' },
  { name: 'DevDocs', url: 'https://devdocs.io/', category: 'Coding', icon: 'BookOpen', color: '#06b6d4' },
];

const defaultColor = '#06b6d4';
const categoryOptions = ['Coding', 'Career', 'General'];

export function AppLauncher() {
  const { state, dispatch } = useApp();
  const { appShortcuts } = state;
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppShortcut | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    icon: 'Globe',
    color: defaultColor,
    category: 'General',
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredApps = appShortcuts.filter(app => {
    if (!normalizedQuery) return true;

    return (
      app.name.toLowerCase().includes(normalizedQuery) ||
      app.category.toLowerCase().includes(normalizedQuery) ||
      app.url.toLowerCase().includes(normalizedQuery) ||
      app.icon.toLowerCase().includes(normalizedQuery)
    );
  });

  const suggestedResults = suggestedApps.filter(app => {
    if (!normalizedQuery) return false;
    const alreadyExists = appShortcuts.some(existing => existing.name.toLowerCase() === app.name.toLowerCase());
    if (alreadyExists) return false;

    return (
      app.name.toLowerCase().includes(normalizedQuery) ||
      app.category.toLowerCase().includes(normalizedQuery) ||
      app.url.toLowerCase().includes(normalizedQuery) ||
      normalizedQuery.includes('help')
    );
  });

  const groupedApps = filteredApps.reduce((acc, app) => {
    if (!acc[app.category]) {
      acc[app.category] = [];
    }
    acc[app.category].push(app);
    return acc;
  }, {} as Record<string, AppShortcut[]>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) return;

    let url = formData.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    if (editingApp) {
      const updatedApp: AppShortcut = {
        ...editingApp,
        name: formData.name,
        url,
        icon: formData.icon,
        color: formData.color,
        category: formData.category,
      };
      dispatch({ type: 'UPDATE_SHORTCUT', payload: updatedApp });
      setEditingApp(null);
    } else {
      const newApp: AppShortcut = {
        id: crypto.randomUUID(),
        name: formData.name,
        url,
        icon: formData.icon,
        color: formData.color,
        category: formData.category,
      };
      dispatch({ type: 'ADD_SHORTCUT', payload: newApp });
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (app: AppShortcut) => {
    setEditingApp(app);
    setFormData({
      name: app.name,
      url: app.url,
      icon: app.icon,
      color: app.color,
      category: app.category,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_SHORTCUT', payload: id });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      icon: 'Globe',
      color: defaultColor,
      category: 'General',
    });
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(i => i.name === iconName);
    return iconOption ? iconOption.icon : Globe;
  };

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">App Launcher</h1>
          <p className="text-white/60">Quick access to your favorite platforms</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          className="btn-primary self-start sm:self-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add App
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40"
        />
      </motion.div>

      {/* Apps Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {normalizedQuery && suggestedResults.length > 0 && (
          <div>
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl text-cyan-300">Suggestions</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {suggestedResults.map((app) => {
                const IconComponent = getIconComponent(app.icon);
                return (
                  <a
                    key={app.name}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="liquid-glass rounded-xl p-4 transition-all hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${app.color}20` }}>
                        <IconComponent className="h-5 w-5" style={{ color: app.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{app.name}</p>
                        <p className="truncate text-xs text-white/50">{app.category}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {Object.entries(groupedApps).length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 py-16">
            <Globe className="h-16 w-16 text-white/20" />
            <p className="mt-4 text-lg text-white/60">No apps yet</p>
            <p className="text-sm text-white/40">Try searching by app name, category, or url</p>
          </div>
        ) : (
          Object.entries(groupedApps).map(([category, apps], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * categoryIndex }}
            >
              <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl text-white">
                {category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {apps.map((app, index) => {
                    const IconComponent = getIconComponent(app.icon);
                    return (
                      <motion.div
                        key={app.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative liquid-glass rounded-xl p-4 transition-all hover:bg-white/10 h-full"
                      >
                        <div className="flex items-start gap-3">
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex min-w-0 flex-1 items-center gap-3"
                          >
                            <div 
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                              style={{ backgroundColor: `${app.color}20` }}
                            >
                              <IconComponent 
                                className="h-6 w-6" 
                                style={{ color: app.color }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white truncate">{app.name}</h3>
                              <p className="text-sm text-white/50 truncate">{app.url.replace(/^https?:\/\//, '')}</p>
                            </div>
                            <ExternalLink className="h-4 w-4 shrink-0 text-white/30" />
                          </a>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 self-start opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4 text-white/60" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="border-white/10 bg-[hsl(201,100%,11%)]">
                              <DropdownMenuItem
                                onClick={() => handleEdit(app)}
                                className="text-white/80 hover:text-white focus:bg-white/10"
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(app.id)}
                                className="text-red-400 hover:text-red-300 focus:bg-white/10"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="border-white/10 bg-[hsl(201,100%,11%)] text-white">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-display)] text-2xl">
              {editingApp ? 'Edit App' : 'Add New App'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-white/60">App Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., LeetCode"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">URL</label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="e.g., leetcode.com"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">Category</label>
              <Select
                value={categoryOptions.includes(formData.category) ? formData.category : 'General'}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="z-[70] border-white/10 bg-[hsl(201,100%,11%)] text-white" position="popper">
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category} className="text-white focus:bg-white/10 focus:text-white">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">Icon</label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: option.name })}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                        formData.icon === option.name
                          ? 'bg-cyan-500/30 text-cyan-400 ring-2 ring-cyan-400'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">Color</label>
              <div className="flex flex-wrap gap-2">
                {['#06b6d4', '#a855f7', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6', '#ec4899', '#ffffff'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`h-8 w-8 rounded-full transition-all ${
                      formData.color === color ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1 border-white/10 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-primary flex-1">
                {editingApp ? 'Update' : 'Add'} App
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
