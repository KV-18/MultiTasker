// ============================================================
//  USER SYSTEM
// ============================================================

var USER_COLORS = ['#5b8dee','#a78bfa','#34d399','#f59e0b','#f87171','#e879f9','#38bdf8','#fb923c'];
var selectedColor = USER_COLORS[0];
var currentUser = null;

function loadUsers() {
  var u = localStorage.getItem('mt-users');
  return u ? JSON.parse(u) : [];
}

function saveUsers(users) {
  localStorage.setItem('mt-users', JSON.stringify(users));
}

function renderUserScreen() {
  var users = loadUsers();
  var grid = document.getElementById('us-grid');
  grid.innerHTML = '';

  // Render existing user cards
  users.forEach(function(u) {
    var card = document.createElement('div');
    card.className = 'us-card';
    card.innerHTML =
      '<div class="us-avatar" style="background:' + u.color + '">' +
        u.name.slice(0, 2).toUpperCase() +
      '</div>' +
      '<div class="us-name">' + u.name + '</div>';
    card.onclick = function() { selectUser(u); };
    grid.appendChild(card);
  });

  // Add "New User" card
  var addCard = document.createElement('div');
  addCard.className = 'us-card us-add';
  addCard.innerHTML =
    '<div class="us-avatar"><i class="fa fa-plus"></i></div>' +
    '<div class="us-name">New User</div>';
  addCard.onclick = toggleNewUserForm;
  grid.appendChild(addCard);

  // Build color picker
  var row = document.getElementById('us-color-row');
  row.innerHTML = '';
  USER_COLORS.forEach(function(c) {
    var dot = document.createElement('div');
    dot.className = 'us-color-dot' + (c === selectedColor ? ' selected' : '');
    dot.style.background = c;
    dot.onclick = function() {
      selectedColor = c;
      document.querySelectorAll('.us-color-dot').forEach(function(d) {
        d.classList.remove('selected');
      });
      dot.classList.add('selected');
    };
    row.appendChild(dot);
  });
}

function toggleNewUserForm() {
  var f = document.getElementById('us-new-form');
  f.style.display = f.style.display === 'flex' ? 'none' : 'flex';
  if (f.style.display === 'flex') {
    document.getElementById('us-new-name').focus();
  }
}

function createUser() {
  var name = document.getElementById('us-new-name').value.trim();
  if (!name) return;
  var users = loadUsers();
  var user = { id: Date.now().toString(36), name: name, color: selectedColor };
  users.push(user);
  saveUsers(users);
  document.getElementById('us-new-name').value = '';
  document.getElementById('us-new-form').style.display = 'none';
  renderUserScreen();
}

function selectUser(u) {
  currentUser = u;
  document.getElementById('cu-name').textContent = u.name;
  document.getElementById('cu-dot').style.background = u.color;
  document.getElementById('user-screen').style.display = 'none';
  document.getElementById('app-layout').style.display = 'flex';
  loadTasksForUser();
  render();
}

function switchUser() {
  document.getElementById('user-screen').style.display = 'flex';
  document.getElementById('app-layout').style.display = 'none';
  renderUserScreen();
}

// ============================================================
//  TASK STATE
// ============================================================

var tasks = [];
var editId = null;
var filter = 'all';
var sort = 'date';

function taskKey() {
  return 'mt-tasks-' + (currentUser ? currentUser.id : 'default');
}

function loadTasksForUser() {
  var saved = localStorage.getItem(taskKey());
  tasks = saved ? JSON.parse(saved) : [];
}

function save() {
  localStorage.setItem(taskKey(), JSON.stringify(tasks));
}

function uid() {
  return Date.now().toString(36) + Math.floor(Math.random() * 9999);
}

// ============================================================
//  TOAST
// ============================================================

function toast(msg) {
  var t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.className = 'show';
  setTimeout(function() { t.className = ''; }, 3000);
}

// ============================================================
//  HELPERS
// ============================================================

function getStatus() {
  var btns = document.getElementById('status-btns').getElementsByClassName('sbtn');
  for (var i = 0; i < btns.length; i++) {
    if (btns[i].classList.contains('active')) {
      return btns[i].getAttribute('data-s');
    }
  }
  return 'todo';
}

function fmtDeadline(dt) {
  if (!dt) return null;
  var d = new Date(dt);
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var diff = new Date(d.getFullYear(), d.getMonth(), d.getDate()) - today;
  var time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 0)          return { text: 'Overdue', cls: 'overdue' };
  if (diff === 0)         return { text: 'Today ' + time, cls: 'today' };
  if (diff === 86400000)  return { text: 'Tomorrow', cls: '' };
  return { text: d.toLocaleDateString([], { month: 'short', day: 'numeric' }), cls: '' };
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
//  RENDER
// ============================================================

function render() {
  var searchEl = document.getElementById('search');
  var q = searchEl ? searchEl.value.toLowerCase() : '';

  // --- Filter ---
  var list = [];
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    if (q && t.title.toLowerCase().indexOf(q) === -1) continue;
    if (filter === 'all') { list.push(t); continue; }
    if (filter === 'done' && t.status === 'done') { list.push(t); continue; }
    if (filter === 'today' && t.deadline) {
      if (new Date(t.deadline).toDateString() === new Date().toDateString()) {
        list.push(t);
      }
      continue;
    }
    if (t.category === filter) list.push(t);
  }

  // --- Sort (bubble sort) ---
  for (var a = 0; a < list.length - 1; a++) {
    for (var b = 0; b < list.length - 1 - a; b++) {
      var swap = false;
      if (sort === 'priority') {
        var p = { high: 0, medium: 1, low: 2 };
        if ((p[list[b].priority] || 1) > (p[list[b + 1].priority] || 1)) swap = true;
      } else if (sort === 'deadline') {
        if (!list[b].deadline && list[b + 1].deadline) swap = true;
        else if (list[b].deadline && list[b + 1].deadline &&
                 new Date(list[b].deadline) > new Date(list[b + 1].deadline)) swap = true;
      } else {
        if (new Date(list[b].createdAt) < new Date(list[b + 1].createdAt)) swap = true;
      }
      if (swap) { var tmp = list[b]; list[b] = list[b + 1]; list[b + 1] = tmp; }
    }
  }

  // --- Clear columns ---
  ['todo', 'inprogress', 'done'].forEach(function(s) {
    document.getElementById('list-' + s).innerHTML = '';
    document.getElementById('cnt-' + s).textContent = 0;
  });

  // --- Populate columns ---
  var counts = { todo: 0, inprogress: 0, done: 0 };
  for (var k = 0; k < list.length; k++) {
    var col = document.getElementById('list-' + list[k].status);
    if (col) {
      col.appendChild(buildCard(list[k]));
      counts[list[k].status]++;
    }
  }

  // --- Update column counts ---
  for (var s in counts) {
    document.getElementById('cnt-' + s).textContent = counts[s];
  }

  // --- Task count label ---
  var tc = document.getElementById('task-count');
  if (tc) tc.textContent = list.length ? list.length + ' task' + (list.length > 1 ? 's' : '') : '';

  // --- Empty state ---
  var board = document.getElementById('board');
  var empty = document.getElementById('empty');
  if (list.length === 0) {
    board.style.display = 'none';
    empty.style.display = 'block';
  } else {
    board.style.display = 'grid';
    empty.style.display = 'none';
  }

  updateBadges();
  updateProgress();
}

// ============================================================
//  BUILD CARD
//  FIX: addEventListener instead of inline onclick in innerHTML
// ============================================================

function buildCard(t) {
  var c = document.createElement('div');
  c.className = 'card' + (t.status === 'done' ? ' done-card' : '');
  c.setAttribute('data-id', t.id);
  c.setAttribute('data-cat', t.category);
  c.draggable = true;

  var dl = t.deadline ? fmtDeadline(t.deadline) : null;
  var dlHtml = dl ? '<span class="dl-chip ' + dl.cls + '">' + dl.text + '</span>' : '';

  var checkHtml =
    '<div class="check' + (t.status === 'done' ? ' on' : '') + '" data-id="' + t.id + '">' +
      (t.status === 'done' ? '&#10003;' : '') +
    '</div>';

  var metaHtml =
    '<span class="chip ch-' + t.category + '">' + t.category + '</span>' +
    '<span class="chip pr-' + t.priority + '">' + t.priority + '</span>' +
    dlHtml;

  var notesHtml = t.notes
    ? '<div class="card-notes">' + escHtml(t.notes) + '</div>'
    : '';

  c.innerHTML =
    '<div class="card-top">' +
      checkHtml +
      '<div class="card-title">' + escHtml(t.title) + '</div>' +
      '<div class="card-acts">' +
        '<button class="act-btn edit-btn" data-id="' + t.id + '" title="Edit"><i class="fa fa-pen"></i></button>' +
        '<button class="act-btn del del-btn" data-id="' + t.id + '" title="Delete"><i class="fa fa-trash"></i></button>' +
      '</div>' +
    '</div>' +
    notesHtml +
    '<div class="card-meta">' + metaHtml + '</div>';

  // Attach event listeners directly — this is the fix for edit/delete not working
  c.querySelector('.check').addEventListener('click', function(e) {
    e.stopPropagation();
    toggleDone(t.id);
  });

  c.querySelector('.edit-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    openEdit(t.id);
  });

  c.querySelector('.del-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    delTask(t.id);
  });

  // Drag events
  c.addEventListener('dragstart', function(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('id', t.id);
    c.style.opacity = '0.4';
  });
  c.addEventListener('dragend', function() {
    c.style.opacity = '';
  });

  return c;
}

// ============================================================
//  BADGES & PROGRESS
// ============================================================

function updateBadges() {
  var cnt = { all: tasks.length, today: 0, done: 0, work: 0, study: 0, personal: 0 };
  var now = new Date();
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    if (t.status === 'done') cnt.done++;
    if (t.category) cnt[t.category] = (cnt[t.category] || 0) + 1;
    if (t.deadline && new Date(t.deadline).toDateString() === now.toDateString()) cnt.today++;
  }
  ['all', 'today', 'done', 'work', 'study', 'personal'].forEach(function(k) {
    var el = document.getElementById('badge-' + k);
    if (el) el.textContent = cnt[k] || 0;
  });
}

function updateProgress() {
  var total = tasks.length;
  var done = 0;
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].status === 'done') done++;
  }
  var pct = total === 0 ? 0 : Math.round((done / total) * 100);
  var circumference = 213.6;
  var offset = circumference - (pct / 100) * circumference;

  var fill = document.getElementById('prog-fill');
  if (fill) fill.style.strokeDashoffset = offset;

  var pctEl = document.getElementById('prog-pct');
  if (pctEl) pctEl.textContent = pct + '%';

  var doneN = document.getElementById('prog-done-n');
  if (doneN) doneN.textContent = done;

  var totalN = document.getElementById('prog-total-n');
  if (totalN) totalN.textContent = total;
}

// ============================================================
//  CRUD OPERATIONS
// ============================================================

function addTask(data) {
  tasks.unshift({
    id: uid(),
    createdAt: new Date().toISOString(),
    title: data.title,
    notes: data.notes,
    category: data.category,
    priority: data.priority,
    deadline: data.deadline,
    status: data.status
  });
  save();
  render();
}

function updateTask(id, data) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].title    = data.title;
      tasks[i].notes    = data.notes;
      tasks[i].category = data.category;
      tasks[i].priority = data.priority;
      tasks[i].deadline = data.deadline;
      tasks[i].status   = data.status;
      break;
    }
  }
  save();
  render();
}

function delTask(id) {
  var updated = [];
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id !== id) updated.push(tasks[i]);
  }
  tasks = updated;
  save();
  render();
  toast('Task deleted');
}

function toggleDone(id) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].status = tasks[i].status === 'done' ? 'todo' : 'done';
      break;
    }
  }
  save();
  render();
}

// ============================================================
//  MODAL
// ============================================================

function openModal(task) {
  editId = task ? task.id : null;
  document.getElementById('modal-title').textContent = task ? 'Edit Task' : 'New Task';
  document.getElementById('f-title').value    = task ? task.title    : '';
  document.getElementById('f-notes').value    = task ? task.notes    : '';
  document.getElementById('f-cat').value      = task ? task.category : 'work';
  document.getElementById('f-pri').value      = task ? task.priority : 'medium';
  document.getElementById('f-deadline').value = task && task.deadline ? task.deadline.slice(0, 16) : '';

  var target = task ? task.status : 'todo';
  var btns = document.getElementById('status-btns').getElementsByClassName('sbtn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].className = btns[i].getAttribute('data-s') === target ? 'sbtn active' : 'sbtn';
  }

  document.getElementById('modal-overlay').className = 'open';
  document.getElementById('f-title').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').className = '';
  editId = null;
  document.getElementById('f-title').value    = '';
  document.getElementById('f-notes').value    = '';
  document.getElementById('f-deadline').value = '';
  document.getElementById('f-cat').value      = 'work';
  document.getElementById('f-pri').value      = 'medium';
}

function saveTask() {
  var titleEl = document.getElementById('f-title');
  var title = titleEl.value.trim();
  if (!title) {
    titleEl.style.borderColor = '#f87171';
    titleEl.focus();
    setTimeout(function() { titleEl.style.borderColor = ''; }, 1200);
    return;
  }
  var dlVal = document.getElementById('f-deadline').value;
  var data = {
    title:    title,
    notes:    document.getElementById('f-notes').value.trim(),
    category: document.getElementById('f-cat').value,
    priority: document.getElementById('f-pri').value,
    deadline: dlVal ? new Date(dlVal).toISOString() : '',
    status:   getStatus()
  };
  if (editId) {
    updateTask(editId, data);
    toast('Task updated');
  } else {
    addTask(data);
    toast('Task added');
  }
  closeModal();
}

function openEdit(id) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      openModal(tasks[i]);
      return;
    }
  }
}

function onCatChange() {
  var map = { work: '#5b8dee', study: '#a78bfa', personal: '#34d399' };
  document.getElementById('f-cat').style.borderColor = map[document.getElementById('f-cat').value] || '';
}

// ============================================================
//  EVENT BINDINGS
// ============================================================

// Status toggle buttons inside modal
(function() {
  var sBtns = document.getElementById('status-btns').getElementsByClassName('sbtn');
  for (var si = 0; si < sBtns.length; si++) {
    sBtns[si].addEventListener('click', function() {
      var all = document.getElementById('status-btns').getElementsByClassName('sbtn');
      for (var j = 0; j < all.length; j++) all[j].className = 'sbtn';
      this.className = 'sbtn active';
    });
  }
})();

// Sidebar nav filters
(function() {
  var navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(function(item) {
    item.addEventListener('click', function() {
      navItems.forEach(function(n) { n.className = 'nav-item'; });
      this.className = 'nav-item active';
      filter = this.getAttribute('data-filter');
      var titles = {
        all: 'All Tasks', today: 'Today', done: 'Completed',
        work: 'Work', study: 'Study', personal: 'Personal'
      };
      document.getElementById('page-title').textContent = titles[filter] || 'Tasks';
      render();
    });
  });
})();

// Sort buttons
(function() {
  var sortBtns = document.querySelectorAll('.sort-btn');
  sortBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      sortBtns.forEach(function(b) { b.className = 'sort-btn'; });
      this.className = 'sort-btn active';
      sort = this.getAttribute('data-sort');
      render();
    });
  });
})();

// Search input
document.getElementById('search').addEventListener('input', function() {
  render();
});

// Drag & drop on columns
(function() {
  var lists = document.querySelectorAll('.task-list');
  lists.forEach(function(list) {
    list.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.className = 'task-list over';
    });
    list.addEventListener('dragleave', function() {
      this.className = 'task-list';
    });
    list.addEventListener('drop', function(e) {
      e.preventDefault();
      this.className = 'task-list';
      var id = e.dataTransfer.getData('id');
      var ns = this.getAttribute('data-status');
      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) { tasks[i].status = ns; break; }
      }
      save();
      render();
      toast('Moved to ' + (ns === 'inprogress' ? 'In Progress' : ns === 'done' ? 'Done' : 'To Do'));
    });
  });
})();

// Close modal on backdrop click
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// ============================================================
//  INIT
// ============================================================
renderUserScreen();
