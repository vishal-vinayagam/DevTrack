# DevTrack

DevTrack is a personal productivity dashboard for developers. It combines task planning, streak tracking, notes, learning progress, quick-link launchers, analytics, and a Pomodoro workspace in a single app.

## Highlights

- Dashboard with daily productivity snapshot
- Task manager with priority, category, status, and date-based views
- Streak tracking and achievement-style momentum metrics
- Notes workspace for quick learning and work logs
- Course progress tracking with completion analytics
- Quick Launch cards for coding and career links
- Pomodoro session logging
- Profile and preference management
- Local-first persistence via browser storage

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 3 + shadcn/ui components
- Framer Motion (page and component animations)
- Lucide React icons
- Recharts (analytics visuals)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check and build production assets
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build locally

## Application Pages

- Dashboard
- Tasks
- Streaks
- Notes
- Courses
- Analytics
- Pomodoro
- App Launcher
- Profile

## Project Structure

```text
src/
  components/
    layout/        # Header and sidebar navigation
    ui/            # Reusable UI primitives (shadcn-style)
  context/         # Global app state and persistence logic
  hooks/           # Feature hooks (tasks, notes, streaks, courses, pomodoro)
  pages/           # Main page-level screens
  types/           # Shared TypeScript types
  utils/           # Helpers and utility functions
```

## Data & Persistence

App data is persisted in `localStorage` under a single key, so your tasks, notes, shortcuts, and progress survive refreshes in the same browser profile.

## Notes

- This project is currently local-first and does not require a backend.
- If you want cloud sync, auth, or multi-device support, you can add an API layer on top of the existing context/hooks architecture.
