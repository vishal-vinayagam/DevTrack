import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  FileText,
  Clock,
  List,
  ListChecks,
  Sparkles,
  BetweenVerticalEnd
} from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatRelativeTime } from '@/utils/helpers';
import type { Note } from '@/types';

export function Notes() {
  const { notes, addNote, updateNote, deleteNote, getAllTags, searchNotes, getRecentNotes } = useNotes();
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [lineSpacing, setLineSpacing] = useState<'compact' | 'normal' | 'relaxed'>('normal');
  const [previewNote, setPreviewNote] = useState<Note | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    tagInput: '',
  });

  const allTags = getAllTags();
  const recentNotes = getRecentNotes(5);
  const questionNotesCount = notes.filter(note => /question|q:/i.test(note.title) || /question|q:/i.test(note.content)).length;

  const filteredNotes = searchQuery
    ? searchNotes(searchQuery)
    : selectedTag
    ? notes.filter(n => n.tags.includes(selectedTag))
    : notes;

  const sortedNotes = [...filteredNotes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, { 
        title: formData.title, 
        content: formData.content, 
        tags: formData.tags 
      });
      setEditingNote(null);
    } else {
      addNote(formData.title, formData.content, formData.tags);
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags,
      tagInput: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
  };

  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tags: [],
      tagInput: '',
    });
    setLineSpacing('normal');
  };

  const weeklyQuestionTemplate = `# Weekly Question Plan\n\nDay 1 - Question:\n- Topic:\n- Attempt Notes:\n- Final Answer:\n\nDay 2 - Question:\n- Topic:\n- Attempt Notes:\n- Final Answer:\n\nDay 3 - Question:\n- Topic:\n- Attempt Notes:\n- Final Answer:\n\nDay 4 - Question:\n- Topic:\n- Attempt Notes:\n- Final Answer:\n\nDay 5 - Question:\n- Topic:\n- Attempt Notes:\n- Final Answer:\n\nDay 6 - Question:\n- Topic:\n- Attempt Notes:\n- Final Answer:\n\nDay 7 - Review:\n- Wins:\n- Weak Areas:\n- Plan for Next Week:\n`;

  const insertContent = (text: string) => {
    const textarea = contentRef.current;
    if (!textarea) {
      setFormData(prev => ({ ...prev, content: `${prev.content}${prev.content ? '\n' : ''}${text}` }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    setFormData(prev => {
      const next = `${prev.content.slice(0, start)}${text}${prev.content.slice(end)}`;
      return { ...prev, content: next };
    });

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + text.length;
      textarea.selectionStart = cursor;
      textarea.selectionEnd = cursor;
    });
  };

  const getSpacingClass = () => {
    if (lineSpacing === 'compact') return 'leading-5';
    if (lineSpacing === 'relaxed') return 'leading-8';
    return 'leading-7';
  };

  const createWeeklyQuestionNote = () => {
    resetForm();
    setFormData({
      title: 'Weekly Questions',
      content: weeklyQuestionTemplate,
      tags: ['questions', 'weekly-plan'],
      tagInput: '',
    });
    setLineSpacing('relaxed');
    setIsAddDialogOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const cardVariants = {
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
      {/* Header */}
      <motion.div
        variants={cardVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Notes</h1>
          <p className="text-white/60">Capture ideas, code snippets, and interview prep</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={cardVariants}
        className="grid gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        <div className="liquid-glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{notes.length}</p>
          <p className="text-sm text-white/60">Total Notes</p>
        </div>
        <div className="liquid-glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{allTags.length}</p>
          <p className="text-sm text-white/60">Tags</p>
        </div>
        <div className="liquid-glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{questionNotesCount}</p>
          <p className="text-sm text-white/60">Question Notes</p>
        </div>
        <div className="liquid-glass rounded-xl p-4 text-center sm:col-span-3 lg:col-span-1">
          <p className="text-2xl font-bold text-emerald-300">{recentNotes.length}</p>
          <p className="text-sm text-white/60">Updated This Week</p>
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        className="liquid-glass rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-4 sm:p-5"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl text-white">Weekly Question Planner</h2>
            <p className="mt-1 text-sm text-white/70">
              Create one structured question note for each day and track your regular progress.
            </p>
          </div>
          <Button onClick={createWeeklyQuestionNote} className="btn-primary w-full md:w-auto">
            <Sparkles className="mr-2 h-4 w-4" />
            Create Weekly Template
          </Button>
        </div>
      </motion.div>

      {/* Search and Tags */}
      <motion.div
        variants={cardVariants}
        className="space-y-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40"
          />
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`rounded-full px-3 py-1 text-sm transition-all ${
                selectedTag === null
                  ? 'bg-cyan-500/30 text-cyan-400'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`rounded-full px-3 py-1 text-sm transition-all ${
                  selectedTag === tag
                    ? 'bg-cyan-500/30 text-cyan-400'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Notes Grid */}
      <motion.div
        variants={cardVariants}
        className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {sortedNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full flex flex-col items-center justify-center rounded-2xl bg-white/5 py-16"
            >
              <FileText className="h-16 w-16 text-white/20" />
              <p className="mt-4 text-lg text-white/60">No notes yet</p>
              <p className="text-sm text-white/40">Create your first note to get started</p>
            </motion.div>
          ) : (
            sortedNotes.map((note, index) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group liquid-glass rounded-2xl p-5 transition-all hover:bg-white/10"
                whileHover={{ y: -3 }}
                onClick={() => setPreviewNote(note)}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-white line-clamp-1">{note.title}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(note);
                      }}
                      className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note.id);
                      }}
                      className="rounded p-1 text-white/40 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-6 text-white/60">
                  {note.content}
                </p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60"
                      >
                        #{tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-xs text-white/40">+{note.tags.length - 3}</span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-white/40">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(note.updatedAt)}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-[hsl(201,100%,11%)] p-4 text-white sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-display)] text-2xl">
              {editingNote ? 'Edit Note' : 'New Note'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="mb-2 block text-sm text-white/60">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Note title"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">Content</label>
              <div className="mb-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => insertContent('- Point 1\n- Point 2\n- Point 3\n')}
                  className="h-8 border-white/10 text-xs text-white hover:bg-white/10"
                >
                  <List className="mr-1 h-3.5 w-3.5" />
                  Add Points
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => insertContent('- [ ] Question 1\n- [ ] Question 2\n- [ ] Question 3\n')}
                  className="h-8 border-white/10 text-xs text-white hover:bg-white/10"
                >
                  <ListChecks className="mr-1 h-3.5 w-3.5" />
                  Checklist
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => insertContent(weeklyQuestionTemplate)}
                  className="h-8 border-white/10 text-xs text-white hover:bg-white/10"
                >
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Weekly Questions
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => insertContent('\n\n')}
                  className="h-8 border-white/10 text-xs text-white hover:bg-white/10"
                >
                  <BetweenVerticalEnd className="mr-1 h-3.5 w-3.5" />
                  Add Spacing
                </Button>
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-white/50">Line spacing:</span>
                {(['compact', 'normal', 'relaxed'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setLineSpacing(mode)}
                    className={`rounded-full px-3 py-1 text-xs transition-all ${
                      lineSpacing === mode
                        ? 'bg-cyan-500/30 text-cyan-300'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <Textarea
                ref={contentRef}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your note here..."
                className={`min-h-[240px] border-white/10 bg-white/5 text-white placeholder:text-white/40 ${getSpacingClass()}`}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">Tags</label>
              <div className="flex gap-2">
                <Input
                  value={formData.tagInput}
                  onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-400"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-cyan-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3 sm:pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1 border-white/10 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-primary flex-1">
                {editingNote ? 'Update' : 'Create'} Note
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Note Preview */}
      <Dialog open={Boolean(previewNote)} onOpenChange={(open) => !open && setPreviewNote(null)}>
        <DialogContent className="max-w-3xl border-white/10 bg-[hsl(201,100%,11%)] p-4 text-white sm:p-6">
          {previewNote && (
            <>
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-display)] text-2xl text-white">
                  {previewNote.title}
                </DialogTitle>
                <p className="text-sm text-white/50">
                  Last updated {formatRelativeTime(previewNote.updatedAt)}
                </p>
              </DialogHeader>

              <div className="max-h-[60vh] space-y-4 overflow-y-auto rounded-xl bg-white/5 p-4">
                <p className="whitespace-pre-wrap text-sm leading-7 text-white/85">{previewNote.content}</p>
                {previewNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {previewNote.tags.map(tag => (
                      <span
                        key={tag}
                        className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewNote(null)}
                  className="flex-1 border-white/10 text-white hover:bg-white/10"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  className="btn-primary flex-1"
                  onClick={() => {
                    handleEdit(previewNote);
                    setPreviewNote(null);
                  }}
                >
                  Edit Note
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
