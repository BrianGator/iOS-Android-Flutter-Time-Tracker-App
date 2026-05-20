# iOS-Android-Flutter-Time-Tracker-App
### Written by Brian McCarthy

A highly interactive, high-density, full-featured time tracking application equipped with project management, granular task tracking, comprehensive interval reporting, interactive SVG metrics visualization, and secure client-side browser storage auto-persistence.

---

## 🎨 Creative Theme & Aesthetics
- **High-Density Compact Grid Layout**: Custom compact UI tailored for ultra-dense workspaces and mobile frame simulation.
- **Micro-interactions & Dynamic Tickers**: Equipped with simulated live tickers, real-time counters, responsive hover triggers, and frame size transition wrappers.
- **Aesthetic Attributions**: "Written by Brian McCarthy" badge is prominently integrated across every primary panel, menu drawer, and active view header.

---

## 🗂️ Languages Used
1. **TypeScript** (v5.8.x): Full-spectrum script type checking for secure component data binding.
2. **TSX / JSX**: Structuring modular layouts via state-aware React functional modules.
3. **HTML5**: High-fidelity semantic container and browser document markup.
4. **CSS3**: Rich styling driven entirely by Tailwind CSS v4 utility classes.

---

## 🚀 Technologies & Libraries
- **React** (v19.x): Scalable responsive interface framework using functional hooks and context state management.
- **Vite** (v6.x): Rapid bundle packaging and state hot reload compiler system.
- **Tailwind CSS** (v4.x): High contrast dark/light display borders, cards, and adaptive grids.
- **Motion / Framer Motion** (v12.x): Fluent spring animations, drawer sliding pathways, and delete list segment transitions.
- **Lucide React** (v0.x): Standardized and clean UI vector graphic icons.
- **Local Browser Storage**: Automatic JSON serialization for multi-session data persistence without server overhead.

---

## 📂 Project Architecture & Code Map
- `metadata.json` - Custom app configurations, system permissions, and capabilities declaration.
- `package.json` - Build system, lint rules, and third-party dependencies array.
- `index.html` - App HTML entry mountpoint.
- `src/main.tsx` - Initial React bootstrap routing.
- `src/index.css` - Custom primary Tailwind import declarations.
- `src/types.ts` - Shared TypeScript data model interfaces:
  - `Project`: Project details configuration (ID, name).
  - `Task`: Task specific configuration (ID, name).
  - `TimeEntry`: Time tracker records (ID, Project ID, Task ID, Total Time in decimal hours, Date string, Notes).
- `src/TimeEntryContext.tsx` - Core logical state machine provider wrapping local database engines, presets loaders, and action modifiers (`addProject`, `addTask`, `deleteProject`, `deleteTask`, `addTimeEntry`, `deleteTimeEntry`).
- `src/App.tsx` - Root viewport container housing:
  - Wide screen information panel & device frame wrappers.
  - Multi-project statistics tracking modules.
  - Full system reset triggers and pristine JSON state backup export tools.
- `src/components/` - High-Fidelity UI components:
  - `HomeScreen.tsx` - Standard Time log lists, dynamic progress meters, active session timer, and project grouping breakdowns.
  - `AddTimeEntryScreen.tsx` - High-density details log addition forms with date pickers and dynamic form validations.
  - `ProjectManagementScreen.tsx` - Standardized view for creating, checking, and deleting core workspace projects.
  - `TaskManagementScreen.tsx` - Interactive view for creating, check tracking, and deleting granular tasks.
  - `NavigationDrawer.tsx` - Responsive menu drawer with spring slide-in routes.
  - `ReportsScreen.tsx` - Comprehensive date filters with presets, in-app log statement summaries, SVG Bar and Pie charts, and instant .CSV spreadsheet export.

---

## 🖥️ Core Applications & Functions
1. **Time Log Management**: Log project-specific tasks with specialized decimal durations (e.g., 2.5h), recording custom date points and notes.
2. **Folder/Project Organizers**: Categorize work tasks into custom project namespaces.
3. **Task Scope Builders**: Keep tracking aligned with precise items (e.g. Code Review, Client Sync).
4. **Interactive SVG Charts**:
   - **Total Hours per Project Bar Chart**: Smoothly scaled vertical bento bars translating proportional project contributions instantly.
   - **Distribution per Task Pie Chart**: Fully responsive polar SVG arcs mapping task shares with color-coded legends.
5. **Interval Reporting & Presets**: Rapidly analyze specific dates (This Week, Last 7 Days, This Month, All Time) using built-in date selectors.
6. **Robust CSV Spreadsheet Export**: Instantly compiles current report parameters, dates, project/task logs, notes, and billable estimations ($60/hr rate) into standard .CSV.
7. **JSON Database Backups**: One-click data snapshot exporter for absolute data integrity.

---

## 📖 How to Use the Application
1. **Run Dev Environment**: Run `npm run dev` to start the local developer server.
2. **Access Menu Drawer**: Click the hamburger menu in the top-left corner of the header to navigate across views.
3. **Populate Database**:
   - Go to **Projects** to add custom project scopes.
   - Go to **Tasks** to customize work tasks.
   - Go back to **Time Entries** and click **Log New Entry** to record a tracking log.
4. **Check Dashboard**: Explore stats cards at the top of the home screen showing total hours, total billable estimated amounts, top focus project, and session totals.
5. **Analyze Analytics & Reports**:
   - Open the drawer and go to **Reports & Visuals**.
   - Custom-select From/To dates or select preset shortcuts (e.g., "This Week").
   - Review updated SVG chart curves reflecting project hours and task divisions.
   - Click **Export CSV** to download a clean spreadsheet of the filtered data.
6. **State Backup or Reset**: Use the Left Side Info panel options to backup custom storage safely with "Export Data (.JSON)" or clear all tables via "Reset State & Database" respectively.

---

## 🛠️ System Requirements
- **Node.js** Version `18.x` or higher installed.
- **npm** or similar package managers for workspace setup.
- **Web Browser**: Any modern browser (Chrome, Firefox, Safari, Edge) supporting LocalStorage API and SVG 1.1 graphics vectors.

---
*iOS-Android-Flutter-Time-Tracker-App • Written by Brian McCarthy • Built to Perform*
