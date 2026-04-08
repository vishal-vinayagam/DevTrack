import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  PlayCircle, 
  CheckCircle2, 
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  GraduationCap,
  RotateCcw,
  TrendingUp
} from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Course } from '@/types';

export function Courses() {
  const { 
    courses, 
    addCourse, 
    updateCourse, 
    deleteCourse, 
    updateProgress,
    incrementProgress,
    getCourseStats,
    getAllCategories
  } = useCourses();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    platform: '',
    category: 'Programming',
    totalLessons: 0,
  });

  const courseStats = getCourseStats();
  const courseCategories = getAllCategories();

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    const statusOrder = { 'in-progress': 0, 'not-started': 1, 'completed': 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return b.progress - a.progress;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.platform.trim()) return;

    if (editingCourse) {
      updateCourse(editingCourse.id, { 
        title: formData.title, 
        platform: formData.platform,
        category: formData.category,
        totalLessons: formData.totalLessons,
      });
      setEditingCourse(null);
    } else {
      addCourse({
        title: formData.title,
        platform: formData.platform,
        category: formData.category,
        totalLessons: formData.totalLessons,
        progress: 0,
      });
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      platform: course.platform,
      category: course.category,
      totalLessons: course.totalLessons,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCourse(id);
  };

  const handleProgressChange = (course: Course, newProgress: number) => {
    updateProgress(course.id, newProgress);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      platform: '',
      category: 'Programming',
      totalLessons: 0,
    });
  };

  const getStatusIcon = (status: Course['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case 'in-progress':
        return <PlayCircle className="h-5 w-5 text-cyan-400" />;
      default:
        return <Clock className="h-5 w-5 text-white/40" />;
    }
  };

  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20';
      case 'in-progress':
        return 'text-cyan-400 bg-cyan-500/20';
      default:
        return 'text-white/60 bg-white/10';
    }
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
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Courses</h1>
          <p className="text-white/60">Track your learning journey and progress</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-4"
      >
        <div className="liquid-glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{courseStats.total}</p>
          <p className="text-sm text-white/60">Total</p>
        </div>
        <div className="liquid-glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{courseStats.completed}</p>
          <p className="text-sm text-white/60">Completed</p>
        </div>
        <div className="liquid-glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{courseStats.inProgress}</p>
          <p className="text-sm text-white/60">In Progress</p>
        </div>
        <div className="liquid-glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{Math.round(courseStats.averageProgress)}%</p>
          <p className="text-sm text-white/60">Avg Progress</p>
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
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[160px] border-white/10 bg-white/5 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[hsl(201,100%,11%)]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[170px] border-white/10 bg-white/5 text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[hsl(201,100%,11%)]">
            <SelectItem value="all">All Categories</SelectItem>
            {courseCategories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Course Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full flex flex-col items-center justify-center rounded-2xl bg-white/5 py-16"
            >
              <GraduationCap className="h-16 w-16 text-white/20" />
              <p className="mt-4 text-lg text-white/60">No courses yet</p>
              <p className="text-sm text-white/40">Add your first course to start tracking</p>
            </motion.div>
          ) : (
            filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="liquid-glass group rounded-xl p-5 transition-all hover:bg-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getStatusColor(course.status)}`}>
                      {getStatusIcon(course.status)}
                    </div>
                    <div>
                      <h3 className="font-medium text-white line-clamp-1">{course.title}</h3>
                      <p className="text-sm text-white/50">{course.platform}</p>
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
                        onClick={() => handleEdit(course)}
                        className="text-white/80 hover:text-white focus:bg-white/10"
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                                onClick={() => updateProgress(course.id, 100)}
                                className="text-white/80 hover:text-white focus:bg-white/10"
                              >
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Mark Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateProgress(course.id, 0)}
                                className="text-white/80 hover:text-white focus:bg-white/10"
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reset Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem
                        onClick={() => handleDelete(course.id)}
                        className="text-red-400 hover:text-red-300 focus:bg-white/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-white/60">Progress</span>
                    <span className="text-sm font-medium text-white">{course.progress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={course.progress} className="flex-1 h-2" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={course.progress}
                      onChange={(e) => handleProgressChange(course, parseInt(e.target.value))}
                      className="w-20 accent-cyan-500"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => incrementProgress(course.id, 1)}
                      className="h-7 border-white/10 px-2 text-xs text-white hover:bg-white/10"
                    >
                      +1 Lesson
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => incrementProgress(course.id, 5)}
                      className="h-7 border-white/10 px-2 text-xs text-white hover:bg-white/10"
                    >
                      +5 Lessons
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-white/50">
                    {course.completedLessons} / {course.totalLessons} lessons
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                    {course.category}
                  </span>
                </div>

                {course.completedDate && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed on {new Date(course.completedDate).toLocaleDateString()}
                  </div>
                )}
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
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-white/60">Course Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Advanced React Patterns"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">Platform</label>
              <Input
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                placeholder="e.g., Udemy, Coursera, YouTube"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">Category</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[hsl(201,100%,11%)]">
                  <SelectItem value="Programming">Programming</SelectItem>
                  <SelectItem value="Frontend">Frontend</SelectItem>
                  <SelectItem value="Backend">Backend</SelectItem>
                  <SelectItem value="Data Structures">Data Structures</SelectItem>
                  <SelectItem value="System Design">System Design</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="Career">Career</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">Total Lessons</label>
              <Input
                type="number"
                min="0"
                value={formData.totalLessons}
                onChange={(e) => setFormData({ ...formData, totalLessons: parseInt(e.target.value) || 0 })}
                className="border-white/10 bg-white/5 text-white"
              />
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
                {editingCourse ? 'Update' : 'Add'} Course
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
