# DevTrack

DevTrack is a modern productivity web app built for developers and students. It combines daily planning, habit consistency, focused work sessions, and learning progress tracking in one place.

Live Link - https://dev-t-r-a-c-k.netlify.app/

## What This Project Includes

- Dashboard with smart productivity summary and notifications
- Task management with priority, status, categories, and recurrence support
- Streak tracking with heatmap and achievement unlock system
- Notes workspace with templates, tags, and full-note popup preview
- Course tracker with progress controls, status actions, and category filters
- Pomodoro timer with customizable timer presets
- App Launcher with quick links, categorized cards, and search suggestions
- Profile and Settings pages for personalization and preferences

## Main Features

### 1. Dashboard
- Daily snapshot for tasks, streak, and progress
- Notification-aware cards for pending tasks and achievements

### 2. Tasks
- Create, edit, delete tasks
- Track pending, in-progress, and completed status
- Daily recurring tasks support

### 3. Streaks and Achievements
- Activity heatmap
- Weekly activity summary
- Editable problem count for today
- Expanded multi-level achievements that unlock automatically

### 4. Notes
- Tag-based notes
- Search and filtering
- Weekly question planner template
- Point/checklist insertion tools
- Full note opens in popup on click

### 5. Courses
- Add/edit/delete courses
- Progress slider and quick increment buttons
- Category/status filters
- Mark complete and reset actions

### 6. Pomodoro
- Start/pause/reset/skip session controls
- Custom timer presets (up to 20)
- Focus-time summary stats

### 7. App Launcher
- Organize links by category
- Search by name/category/url/icon
- Suggested app results for useful queries (for example, "help")

### 8. Settings
- Update profile and theme preferences
- Toggle notifications
- Set default pomodoro and break duration
- Export local backup data
- Reset app data

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 3
- shadcn/ui style component primitives
- Framer Motion
- Lucide React
- date-fns
- Recharts

## Run Locally

1. Install dependencies

```bash
npm install
```
2. Start development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview production build

```bash
npm run preview
```

## Scripts

- `npm run dev` -> start local development server
- `npm run build` -> run TypeScript build and Vite production build
- `npm run lint` -> run ESLint checks
- `npm run preview` -> preview production bundle locally

## Project Structure

```text
src/
  components/
    layout/        # App shell: sidebar, header
    ui/            # Reusable UI primitives
  context/         # Global app state (reducer + persistence)
  hooks/           # Feature hooks (tasks, notes, courses, streaks, pomodoro)
  pages/           # Route-level screens
  types/           # Shared TypeScript models
  utils/           # Utility/helper functions
```

## Data Persistence

This is a local-first app. All data is stored in browser localStorage, including:

- tasks
- notes
- courses
- streak and achievements
- app shortcuts
- notifications
- profile/settings preferences

## UI Notes

- Dark theme focused experience
- Smooth global scrolling and custom black scrollbar styling
- Responsive layout for desktop and mobile

## Known Notes

- No backend or authentication is required.
- Data is device/browser-specific unless exported and imported manually.

## Future Improvements (Optional)

- Cloud sync and authentication
- Multi-device real-time data sync
- Calendar integration
- Notification scheduling and reminders
