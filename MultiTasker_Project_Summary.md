# MultiTasker Project Summary

## 📋 Project Overview

**MultiTasker** is a web-based task management application featuring multi-user profiles with drag-and-drop kanban board functionality. It includes real-time search, filtering, priority tagging, and persistent localStorage storage for each user.

### Key Specifications
- **Built with**: HTML, CSS, JavaScript
- **Architecture**: Vanilla JavaScript (no frameworks)
- **Storage**: Browser LocalStorage (per-user data persistence)
- **UI Theme**: Dark mode with vibrant accent colors
- **Responsive**: Mobile-friendly design

---

## 📁 Project Files

| File | Size | Purpose |
|------|------|---------|
| `index.html` | 9,137 bytes | HTML structure and semantic markup |
| `style.css` | 17,494 bytes | Complete styling and responsive design |
| `app.js` | 18,358 bytes | Core JavaScript application logic |
| `README.md` | 288 bytes | Project documentation |

### External Dependencies
- **Google Fonts**: Syne (headings), Inter (body text)
- **Font Awesome 6.5.0**: Comprehensive icon library
- **CDN Link**: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css`

---

## 🎨 Language Composition

| Language | Percentage |
|----------|-----------|
| JavaScript | 40.8% |
| CSS | 38.9% |
| HTML | 20.3% |

---

## 🔧 Complete Function Reference

### **User Profile Management Functions**

#### `loadUsers()`
- **Purpose**: Retrieve all user profiles from localStorage
- **Returns**: Array of user objects or empty array
- **Storage Key**: `'mt-users'`

#### `saveUsers(users)`
- **Purpose**: Persist user profiles to localStorage
- **Parameters**: `users` - Array of user objects
- **Storage Key**: `'mt-users'`

#### `renderUserScreen()`
- **Purpose**: Build and display the user selection screen with cards
- **Actions**:
  - Renders existing user cards with avatars (initials)
  - Adds "New User" card for profile creation
  - Builds color picker dots for user selection
  - Updates UI based on current users

#### `toggleNewUserForm()`
- **Purpose**: Show/hide the new user creation form
- **Toggle State**: Flip between `display: flex` and `display: none`
- **Auto-focus**: Focuses name input when form opens

#### `createUser()`
- **Purpose**: Create a new user profile with selected color
- **Validation**: Requires non-empty name (trimmed)
- **User Object Structure**:
  ```javascript
  {
    id: Date.now().toString(36),      // Unique ID
    name: string,                      // User name
    color: string                      // Hex color code
  }
  ```

#### `selectUser(u)`
- **Purpose**: Select and switch to a user profile
- **Actions**:
  - Sets `currentUser` variable
  - Updates UI with user name and color
  - Loads user's tasks
  - Hides user screen, shows app layout
  - Triggers initial render

#### `switchUser()`
- **Purpose**: Return to user selection screen
- **Actions**: Shows user screen, hides app layout, rerenders user list

---

### **Task Data Management Functions**

#### `taskKey()`
- **Purpose**: Generate unique localStorage key for current user
- **Returns**: `'mt-tasks-' + currentUser.id`
- **Usage**: Enables per-user task storage

#### `loadTasksForUser()`
- **Purpose**: Load tasks specific to current user from localStorage
- **Returns**: Populates global `tasks` array
- **Storage Key**: Dynamic based on `taskKey()`

#### `save()`
- **Purpose**: Persist current tasks array to localStorage
- **Encoding**: JSON stringified
- **Trigger**: Called after every task modification

#### `uid()`
- **Purpose**: Generate unique ID for each task
- **Method**: Combines timestamp and random number
- **Returns**: `Date.now().toString(36) + Math.floor(Math.random() * 9999)`

#### `addTask(data)`
- **Purpose**: Add new task to the beginning of the list
- **Parameters**: `data` object with:
  - `title` - Task title (required)
  - `notes` - Optional task notes
  - `category` - 'work', 'study', or 'personal'
  - `priority` - 'low', 'medium', or 'high'
  - `deadline` - ISO datetime string
  - `status` - 'todo', 'inprogress', or 'done'
- **Task Object Structure**:
  ```javascript
  {
    id: string,
    createdAt: ISO timestamp,
    title: string,
    notes: string,
    category: string,
    priority: string,
    deadline: string,
    status: string
  }
  ```

#### `updateTask(id, data)`
- **Purpose**: Modify existing task by ID
- **Parameters**: `id` (task ID), `data` (fields to update)
- **Updated Fields**: title, notes, category, priority, deadline, status

#### `delTask(id)`
- **Purpose**: Delete a task by ID
- **Actions**: 
  - Filters out matching task
  - Saves changes
  - Shows toast notification
  - Re-renders UI

#### `toggleDone(id)`
- **Purpose**: Toggle task completion status
- **Logic**: Switches status between 'done' and 'todo'
- **Use Case**: Checkbox click handler

---

### **Rendering & Display Functions**

#### `render()`
- **Purpose**: Main render function - filters, sorts, and displays all tasks
- **Process**:
  1. Get search query from input
  2. Filter tasks by search and active filter
  3. Sort filtered list by selected sort mode
  4. Clear all three columns
  5. Distribute tasks to columns based on status
  6. Update counts and badges
  7. Toggle empty state visibility
  8. Update progress ring

#### `buildCard(t)`
- **Purpose**: Create individual task card DOM element
- **Returns**: Fully rendered card div with all event listeners
- **Card Structure**:
  - Checkbox (toggles completion)
  - Title
  - Action buttons (edit, delete)
  - Notes (optional)
  - Meta chips (category, priority, deadline)
- **Event Listeners**:
  - Drag start/end
  - Check click (toggle done)
  - Edit button click
  - Delete button click

#### `updateBadges()`
- **Purpose**: Update sidebar badge counts for all filters
- **Counts Updated**:
  - `all` - Total tasks
  - `today` - Tasks due today
  - `done` - Completed tasks
  - `work` - Work category tasks
  - `study` - Study category tasks
  - `personal` - Personal category tasks

#### `updateProgress()`
- **Purpose**: Update progress ring and statistics
- **Calculations**:
  - Percentage complete: `(done / total) * 100`
  - SVG stroke offset: `circumference - (pct / 100) * circumference`
  - Circumference value: `213.6`
- **Updates**: Percentage display, done/total counts

---

### **Filtering & Sorting**

#### `render()` - Filter Logic
- **'all'**: Shows all tasks
- **'done'**: Shows only completed tasks
- **'today'**: Shows tasks due today (by date only)
- **'work'**, **'study'**, **'personal'**: Shows tasks by category

#### `render()` - Sort Logic
- **'date'** (default): Sort by creation date descending
- **'priority'**: High → Medium → Low
- **'deadline'**: Tasks without deadline last, then by deadline date

#### Sorting Implementation
- **Algorithm**: Bubble sort
- **Priority Map**: `{ high: 0, medium: 1, low: 2 }`

---

### **Modal & Form Functions**

#### `openModal(task)`
- **Purpose**: Open the add/edit task modal
- **Parameters**: `task` (optional - if editing)
- **Actions**:
  - Sets `editId` for edit mode
  - Populates form fields with task data (or empty for new)
  - Sets appropriate status button as active
  - Shows modal overlay
  - Auto-focuses title input

#### `closeModal()`
- **Purpose**: Close and reset the modal
- **Actions**:
  - Hides modal overlay
  - Clears `editId`
  - Resets all form fields to defaults

#### `saveTask()`
- **Purpose**: Validate and save task form data
- **Validation**:
  - Title is required (shows red border if empty)
  - Auto-focus on title if invalid
- **Process**:
  - Collect form data
  - Convert deadline to ISO string
  - Call `addTask()` or `updateTask()`
  - Show toast notification
  - Close modal

#### `openEdit(id)`
- **Purpose**: Find task by ID and open in edit modal
- **Process**: Linear search through tasks array

#### `onCatChange()`
- **Purpose**: Change category select border color to match category
- **Color Map**:
  - `work` → #5b8dee (blue)
  - `study` → #a78bfa (purple)
  - `personal` → #34d399 (teal)

#### `getStatus()`
- **Purpose**: Get currently selected status from modal buttons
- **Returns**: Data attribute value from active status button
- **Default**: 'todo' if no button marked active

---

### **Utility Functions**

#### `fmtDeadline(dt)`
- **Purpose**: Format deadline with urgency classification
- **Returns**: Object with `text` and `cls` properties
- **Logic**:
  - `diff < 0` → 'Overdue' (red class)
  - `diff === 0` → 'Today' + time (amber class)
  - `diff === 86400000` (1 day) → 'Tomorrow'
  - Otherwise → Short date format
- **Time Format**: 2-digit hour and minute

#### `escHtml(str)`
- **Purpose**: Escape HTML entities to prevent injection attacks
- **Replacements**:
  - `&` → `&amp;`
  - `<` → `&lt;`
  - `>` → `&gt;`
  - `"` → `&quot;`

#### `toast(msg)`
- **Purpose**: Display brief toast notification
- **Parameters**: `msg` - Notification message
- **Duration**: 3000ms (3 seconds)
- **Position**: Bottom-right corner
- **Animation**: Fade in/out

---

### **Event Handlers (IIFE Blocks)**

#### Status Button Toggle
- **Scope**: Modal status buttons (.sbtn elements)
- **Behavior**: Only one button can be active at a time
- **Active Class**: `.active` CSS class

#### Sidebar Navigation Filters
- **Scope**: Navigation items (.nav-item elements)
- **Behavior**: Updates `filter` variable and page title
- **Title Map**:
  ```javascript
  {
    all: 'All Tasks',
    today: 'Today',
    done: 'Completed',
    work: 'Work',
    study: 'Study',
    personal: 'Personal'
  }
  ```

#### Sort Button Click Listeners
- **Scope**: Sort buttons (.sort-btn elements)
- **Behavior**: Updates `sort` variable
- **Re-render**: Triggers `render()` after change

#### Search Input Event
- **Event**: 'input' listener on search field
- **Behavior**: Triggers `render()` on every keystroke

#### Drag and Drop Management
- **Scope**: Task list columns (.task-list elements)
- **Events**:
  - `dragstart`: Sets data and opacity
  - `dragover`: Prevents default, adds visual feedback
  - `dragleave`: Removes visual feedback
  - `drop`: Updates task status, saves, re-renders
- **Toast Notification**: Shows column name after drop

#### Modal Backdrop Click
- **Behavior**: Closes modal only when clicking backdrop itself
- **Prevents**: Accidental closure when clicking modal content

#### Escape Key Handler
- **Behavior**: Closes modal on Escape key press
- **Key**: `e.key === 'Escape'`

---

## 🎯 Feature Set

### Core Features
✅ **Multi-user Profiles** - Create and switch between user profiles  
✅ **User Customization** - Choose profile color from 8 options  
✅ **Task CRUD** - Create, read, update, delete tasks  
✅ **Kanban Board** - Three-column task organization  
✅ **Drag & Drop** - Move tasks between columns  

### Task Organization
✅ **Categories** - Work, Study, Personal  
✅ **Priority Levels** - Low, Medium, High  
✅ **Deadlines** - Optional task deadlines with urgency indicators  
✅ **Notes** - Optional task details  
✅ **Completion Tracking** - Mark tasks as done with checkbox  

### Filtering & Search
✅ **Real-time Search** - Search tasks by title  
✅ **Category Filtering** - Filter by task category  
✅ **Status Filtering** - View To Do, In Progress, Done  
✅ **Today Filter** - Show tasks due today  
✅ **Smart Sorting** - Sort by date, priority, or deadline  

### UI/UX Features
✅ **Progress Ring** - Visual completion percentage  
✅ **Badge Counts** - Task counts by filter  
✅ **Toast Notifications** - User action feedback  
✅ **Empty State** - Helpful message when no tasks exist  
✅ **Responsive Design** - Works on mobile and desktop  
✅ **Dark Theme** - Eye-friendly dark interface  

### Data Persistence
✅ **LocalStorage** - All data saved locally per user  
✅ **Per-User Storage** - Each user has isolated task data  
✅ **Auto-save** - Changes saved immediately  

---

## 🎨 UI Color Palette

### Primary Colors
- **Primary Blue**: #5b8dee
- **Purple**: #a78bfa
- **Teal/Green**: #34d399
- **Amber/Orange**: #f59e0b
- **Red**: #f87171
- **Sky Blue**: #38bdf8

### Background Colors
- **Dark Background**: #0e1016
- **Card Background**: #161820
- **Border Color**: #252731
- **Text Color**: #dddbd6
- **Muted Text**: #555868

### Category & Priority Colors
- **Work**: Blue (#5b8dee)
- **Study**: Purple (#a78bfa)
- **Personal**: Teal (#34d399)
- **High Priority**: Red (#f87171)
- **Medium Priority**: Amber (#f59e0b)
- **Low Priority**: Green (#34d399)

---

## 📱 Responsive Breakpoints

- **Medium Screens** (≤820px): Single-column kanban board
- **Small Screens** (≤600px): Stacked sidebar layout

---

## 🔐 Security Considerations

1. **HTML Escaping**: All user input is HTML-escaped using `escHtml()` function
2. **Input Validation**: Title field requires non-empty value
3. **Client-side Storage**: All data stored locally in browser
4. **No External API Calls**: No server-side dependencies

---

## 📊 Data Structure

### User Object
```javascript
{
  id: "timestamp36base",      // Unique identifier
  name: "John Doe",           // User name
  color: "#5b8dee"            // Hex color code
}
```

### Task Object
```javascript
{
  id: "timestamp36base9999",  // Unique task ID
  createdAt: "2026-06-17T...",// ISO timestamp
  title: "Complete project",   // Task title (required)
  notes: "Add tests",         // Optional notes
  category: "work",           // 'work'|'study'|'personal'
  priority: "high",           // 'low'|'medium'|'high'
  deadline: "2026-06-20T...", // Optional ISO datetime
  status: "inprogress"        // 'todo'|'inprogress'|'done'
}
```

---

## 💾 localStorage Keys

- **Users**: `mt-users` → JSON array of user objects
- **Tasks**: `mt-tasks-{userId}` → JSON array of task objects

---

## 🚀 Getting Started

1. Open `index.html` in a web browser
2. Create your user profile with a name and color
3. Click "New Task" to create your first task
4. Drag and drop tasks between columns to organize
5. Use filters and search to manage your tasks
6. Your data persists automatically!

---

## 📝 License

This project is open source and available for personal and commercial use.

---

**Project Statistics**
- **Total Lines of Code (app.js)**: 569 lines
- **Total Lines of Code (style.css)**: 1000+ lines
- **Total Lines of Code (index.html)**: 257 lines
- **Functions Defined**: 30+ core functions
- **Event Listeners**: 10+ handler blocks

