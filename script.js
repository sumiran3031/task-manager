let tasks = JSON.parse(localStorage.getItem('taskflow_tasks') || '[]');
let editingId = null;
let activeFilter = 'all';
let activeCat = 'all';

const taskList       = document.getElementById('task-list');
const emptyState     = document.getElementById('empty-state');
const openModalBtn   = document.getElementById('open-modal-btn');
const closeModalBtn  = document.getElementById('close-modal-btn');
const cancelBtn      = document.getElementById('cancel-btn');
const saveBtn        = document.getElementById('save-btn');
const modalOverlay   = document.getElementById('modal-overlay');
const modalTitle     = document.getElementById('modal-title');
const taskInput      = document.getElementById('task-input');
const taskNotes      = document.getElementById('task-notes');
const taskCategory   = document.getElementById('task-category');
const taskPriority   = document.getElementById('task-priority');
const taskDue        = document.getElementById('task-due');
const searchInput    = document.getElementById('search-input');
const sortSelect     = document.getElementById('sort-select');
const pageTitle      = document.getElementById('page-title');
const pageDate       = document.getElementById('page-date');
const progressBar    = document.getElementById('progress-bar');
const progressText   = document.getElementById('progress-text');

function init() {
  pageDate.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      pageTitle.textContent = btn.querySelector('.filter-icon').nextSibling.textContent.trim();
      render();
    });
  });

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.dataset.cat;
      render();
    });
  });

  searchInput.addEventListener('input', render);
  sortSelect.addEventListener('change', render);

  openModalBtn.addEventListener('click', () => openModal());
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
  saveBtn.addEventListener('click', saveTask);
  taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveTask(); });

  render();
}


function persist() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}


function openModal(taskId = null) {
  editingId = taskId;
  modalTitle.textContent = taskId ? 'Edit Task' : 'New Task';
  saveBtn.textContent = taskId ? 'Save Changes' : 'Save Task';

  if (taskId) {
    const t = tasks.find(t => t.id === taskId);
    taskInput.value    = t.title;
    taskNotes.value    = t.notes || '';
    taskCategory.value = t.category;
    taskPriority.value = t.priority;
    taskDue.value      = t.due || '';
  } else {
    taskInput.value    = '';
    taskNotes.value    = '';
    taskCategory.value = 'work';
    taskPriority.value = 'medium';
    taskDue.value      = '';
  }

  modalOverlay.classList.add('open');
  setTimeout(() => taskInput.focus(), 100);
}

function closeModal() {
  modalOverlay.classList.remove('open');
  editingId = null;
}

function saveTask() {
  const title = taskInput.value.trim();
  if (!title) { taskInput.focus(); taskInput.style.borderColor = '#f05a5a'; setTimeout(() => taskInput.style.borderColor = '', 1000); return; }

  if (editingId) {
    tasks = tasks.map(t => t.id === editingId
      ? { ...t, title, notes: taskNotes.value.trim(), category: taskCategory.value, priority: taskPriority.value, due: taskDue.value }
      : t
    );
  } else {
    tasks.push({
      id:        Date.now().toString(),
      title,
      notes:     taskNotes.value.trim(),
      category:  taskCategory.value,
      priority:  taskPriority.value,
      due:       taskDue.value,
      completed: false,
      createdAt: Date.now()
    });
  }

  persist();
  closeModal();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  persist();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  persist();
  render();
}

function getFilteredTasks() {
  const today = new Date().toISOString().slice(0, 10);
  const query = searchInput.value.toLowerCase();

  let result = tasks.filter(t => {
   
    if (activeFilter === 'today')     return t.due === today;
    if (activeFilter === 'pending')   return !t.completed;
    if (activeFilter === 'completed') return t.completed;
    return true;
  }).filter(t => {
    
    if (activeCat !== 'all') return t.category === activeCat;
    return true;
  }).filter(t => {
    
    return t.title.toLowerCase().includes(query) || (t.notes || '').toLowerCase().includes(query);
  });

  
  const sort = sortSelect.value;
  if (sort === 'newest')   result.sort((a, b) => b.createdAt - a.createdAt);
  if (sort === 'oldest')   result.sort((a, b) => a.createdAt - b.createdAt);
  if (sort === 'az')       result.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'priority') {
    const order = { high: 0, medium: 1, low: 2 };
    result.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  return result;
}


function render() {
  updateBadges();
  updateProgress();

  const filtered = getFilteredTasks();
  taskList.innerHTML = '';

  if (filtered.length === 0) {
    taskList.appendChild(buildEmptyState());
    return;
  }

  filtered.forEach(task => {
    taskList.appendChild(buildCard(task));
  });
}

function buildEmptyState() {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.innerHTML = `
    <div class="empty-emoji">🌿</div>
    <p class="empty-title">Nothing here!</p>
    <p class="empty-sub">No tasks match your current filter.</p>
  `;
  return div;
}

function buildCard(task) {
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = task.due && task.due < today && !task.completed;

  const card = document.createElement('div');
  card.className = `task-card ${task.completed ? 'completed' : ''}`;
  card.dataset.id = task.id;

  const duePill = task.due
    ? `<span class="tag tag-due ${isOverdue ? 'overdue' : ''}">
        ${isOverdue ? '⚠️' : '📅'} ${formatDate(task.due)}
       </span>`
    : '';

  const notesPill = task.notes
    ? `<p class="task-notes">${escapeHtml(task.notes)}</p>`
    : '';

  const catEmoji = { work: '💼', personal: '🏠', health: '💪', shopping: '🛒' };

  card.innerHTML = `
    <button class="task-check" title="Mark complete">${task.completed ? '✓' : ''}</button>
    <div class="task-body">
      <p class="task-title">${escapeHtml(task.title)}</p>
      ${notesPill}
      <div class="task-meta">
        <span class="tag tag-${task.category}">${catEmoji[task.category]} ${task.category}</span>
        <span class="tag tag-priority-${task.priority}">${task.priority}</span>
        ${duePill}
      </div>
    </div>
    <div class="task-actions">
      <button class="action-btn edit" title="Edit">✏️</button>
      <button class="action-btn delete" title="Delete">🗑️</button>
    </div>
  `;

  card.querySelector('.task-check').addEventListener('click', () => toggleTask(task.id));
  card.querySelector('.edit').addEventListener('click', () => openModal(task.id));
  card.querySelector('.delete').addEventListener('click', () => {
    card.style.animation = 'none';
    card.style.opacity   = '0';
    card.style.transform = 'translateX(20px)';
    card.style.transition = 'all 0.2s';
    setTimeout(() => deleteTask(task.id), 200);
  });

  return card;
}

function updateBadges() {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('badge-all').textContent       = tasks.length;
  document.getElementById('badge-today').textContent     = tasks.filter(t => t.due === today).length;
  document.getElementById('badge-pending').textContent   = tasks.filter(t => !t.completed).length;
  document.getElementById('badge-completed').textContent = tasks.filter(t => t.completed).length;
}

function updateProgress() {
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => t.due === today);
  const done = todayTasks.filter(t => t.completed).length;
  const total = todayTasks.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  progressBar.style.width = pct + '%';
  progressText.textContent = total === 0
    ? 'No tasks due today'
    : `${done} of ${total} done`;
}


function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

init();