import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  MoreVertical,
  Trash2,
  Edit2,
  BellRing
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useStreak } from '@/hooks/useStreak';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCategoryColor, getPriorityColor, formatDate } from '@/utils/helpers';
import type { Task, TaskCategory, TaskPriority } from '@/types';

export function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus, getTaskStats } = useTasks();
  const { incrementTasksCompleted } = useStreak();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'coding' as TaskCategory,
    priority: 'medium' as TaskPriority,
    dueDate: new Date().toISOString().split('T')[0],
    recurrence: 'once' as 'once' | 'daily',
  });

  const taskStats = getTaskStats();
  const today = new Date().toISOString().split('T')[0];
  const pendingTodayCount = tasks.filter(task => task.dueDate === today && task.status !== 'completed').length;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === 'completed') return 1;
      if (b.status === 'completed') return -1;
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, { ...formData });
      setEditingTask(null);
    } else {
      addTask({
        ...formData,
        status: 'pending',
      });
    }

    setFormData({
      title: '',
      description: '',
      category: 'coding',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      recurrence: 'once',
    });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      recurrence: task.recurrence ?? 'once',
    });
    setIsAddDialogOpen(true);
  };

  const handleToggleStatus = (task: Task) => {
    toggleTaskStatus(task.id);
    if (task.status !== 'completed') {
      incrementTasksCompleted();
    }
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
  };

  const resetForm = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      category: 'coding',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      recurrence: 'once',
    });
  };

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Tasks</h1>
          <p className="text-white/60">Manage your daily tasks and stay organized</p>
          <p className="mt-1 text-sm text-cyan-300/80">Use daily recurring tasks for routines, or keep it as a one-time task.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </motion.div>

      {/* Notification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`liquid-glass rounded-2xl border p-4 ${
          pendingTodayCount > 0
            ? 'border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5'
            : 'border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-green-500/5'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${pendingTodayCount > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Task Notification</p>
            <p className="mt-1 text-sm text-white/70">
              {pendingTodayCount > 0
                ? `${pendingTodayCount} task${pendingTodayCount > 1 ? 's are' : ' is'} pending today. Complete them before day end.`
                : 'No pending tasks for today. You are on track.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-4"
      >
        <div className="liquid-glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{taskStats.total}</p>
          <p className="text-sm text-white/60">Total</p>
        </div>
        <div className="liquid-glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{taskStats.completed}</p>
          <p className="text-sm text-white/60">Completed</p>
        </div>
        <div className="liquid-glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{taskStats.inProgress}</p>
          <p className="text-sm text-white/60">In Progress</p>
        </div>
        <div className="liquid-glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white/60">{taskStats.pending}</p>
          <p className="text-sm text-white/60">Pending</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-4 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40"
          />
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[140px] border-white/10 bg-white/5 text-white">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[hsl(201,100%,11%)]">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="coding">Coding</SelectItem>
              <SelectItem value="job">Job</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[130px] border-white/10 bg-white/5 text-white">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[hsl(201,100%,11%)]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Task List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl bg-white/5 py-16"
            >
              <CheckCircle2 className="h-16 w-16 text-white/20" />
              <p className="mt-4 text-lg text-white/60">No tasks found</p>
              <p className="text-sm text-white/40">Create a new task to get started</p>
            </motion.div>
          ) : (
            filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`group flex items-center gap-4 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 ${
                  task.status === 'completed' ? 'opacity-60' : ''
                }`}
              >
                <button
                  onClick={() => handleToggleStatus(task)}
                  className="flex-shrink-0"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                  ) : (
                    <Circle className="h-6 w-6 text-white/40 transition-colors hover:text-white" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-white ${task.status === 'completed' ? 'line-through text-white/40' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="mt-1 truncate text-sm text-white/50">{task.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                      style={{ 
                        backgroundColor: `${getCategoryColor(task.category)}20`,
                        color: getCategoryColor(task.category)
                      }}
                    >
                      {task.category}
                    </span>
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                      style={{ 
                        backgroundColor: `${getPriorityColor(task.priority)}20`,
                        color: getPriorityColor(task.priority)
                      }}
                    >
                      {task.priority}
                    </span>
                    {task.recurrence === 'daily' && (
                      <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-xs text-cyan-300">
                        Daily
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <Calendar className="h-3 w-3" />
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4 text-white/60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-white/10 bg-[hsl(201,100%,11%)]">
                    <DropdownMenuItem
                      onClick={() => handleEdit(task)}
                      className="text-white/80 hover:text-white focus:bg-white/10"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(task.id)}
                      className="text-red-400 hover:text-red-300 focus:bg-white/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="border-white/10 bg-[hsl(201,100%,11%)] text-white">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-display)] text-2xl">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-white/60">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details (optional)"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm text-white/60">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as TaskCategory })}
                >
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[hsl(201,100%,11%)]">
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/60">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}
                >
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[hsl(201,100%,11%)]">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">Due Date</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">Repeat</label>
              <Select
                value={formData.recurrence}
                onValueChange={(v) => setFormData({ ...formData, recurrence: v as 'once' | 'daily' })}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[hsl(201,100%,11%)]">
                  <SelectItem value="once">One-time task</SelectItem>
                  <SelectItem value="daily">Daily recurring task</SelectItem>
                </SelectContent>
              </Select>
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
                {editingTask ? 'Update' : 'Create'} Task
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
