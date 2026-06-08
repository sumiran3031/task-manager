# TaskFlow

A clean, casual task manager app built with vanilla JavaScript. Add tasks, set priorities and due dates, filter by category, and track your daily progress — all saved locally in your browser.

## Live Demo
[View Live](https://sumiran3031.github.io/task-manager)

## Features
- Add, edit, and delete tasks
- Set category (Work, Personal, Health, Shopping), priority, and due date
- Filter tasks by All, Today, Pending, or Completed
- Filter by category from the sidebar
- Search tasks by title or notes
- Sort by newest, oldest, priority, or A→Z
- Progress bar tracking today's completed tasks
- Badge counts on each filter tab
- Overdue tasks highlighted automatically
- All data saved to `localStorage` — persists on refresh

## Tech Stack
- HTML5
- CSS3 (CSS variables, Flexbox, smooth transitions)
- Vanilla JavaScript (DOM manipulation, localStorage, array methods)

## What I Learned
- Persisting data with `localStorage` and `JSON.parse` / `JSON.stringify`
- Dynamically building and re-rendering DOM from a JS data array
- Filtering and sorting arrays with `filter()`, `sort()`, and `localeCompare()`
- Managing modal open/close state with CSS class toggling
- Inline event delegation for dynamically created elements
- Date comparison for overdue detection and today's tasks

## How to Run Locally
1. Clone the repo  
   `git clone https://github.com/yourusername/task-manager.git`
2. Open `index.html` in your browser — no build step needed

## Project Structure
```
task-manager/
├── index.html
├── style.css
├── script.js
└── README.md
```

---
Made by [Sumiran Paparkar](https://github.com/sumiran3031)
