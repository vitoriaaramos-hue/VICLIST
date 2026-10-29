/**
 * Orbit - Aplicação Principal em Vanilla JavaScript
 * Controlador central de navegação, renderizadores e interações
 */

// Global App Object
const App = {
  currentTab: 'dashboard',
  currentEditingTaskId: null,
  taskModalSubtasks: [],
  filters: {
    search: '',
    status: 'all',
    priority: 'all',
    categoryId: 'all',
    projectId: 'all',
    sort: 'dueDate_asc'
  },
  confirmAction: null,

  init() {
    Store.init();

    // Populate placeholder icons
    this.renderStaticIcons();

    // Setup Event Listeners
    this.setupListeners();

    // Handle hash routing
    this.handleRoute();
    window.addEventListener('hashchange', () => this.handleRoute());

    // Subscribe to store updates to auto-refresh current view
    Store.subscribe(() => {
      this.updateBadges();
      this.renderCurrentView();
    });

    // Initial render
    this.updateBadges();
    this.renderCurrentView();

    // Keyboard shortcuts
    this.setupKeyShortcuts();
  },

  renderStaticIcons() {
    document.querySelectorAll('[data-icon]').forEach(el => {
      const name = el.getAttribute('data-icon');
      el.innerHTML = Icons.get(name);
    });

    const logoPlaceholder = document.getElementById('logo-icon-placeholder');
    if (logoPlaceholder) logoPlaceholder.innerHTML = Icons.get('sparkles');

    const sidebarPlus = document.getElementById('sidebar-plus-icon');
    if (sidebarPlus) sidebarPlus.innerHTML = Icons.get('plus');

    this.updateThemeIcon();
  },

  updateThemeIcon() {
    const isDark = document.body.classList.contains('dark');
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.innerHTML = isDark ? Icons.get('sun') : Icons.get('moon');
    }
  },

  setupListeners() {
    // Navigation Tabs
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.getAttribute('data-tab');
        this.navigateTo(tab);
      });
    });

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobile-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Theme toggle button
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const next = document.body.classList.contains('dark') ? 'light' : 'dark';
        Store.setTheme(next);
        this.updateThemeIcon();
        this.showToast('Tema alterado', next === 'dark' ? 'Modo Escuro ativado' : 'Modo Claro ativado');
      });
    }

    // Header & Sidebar Search trigger
    const openSearch = () => this.openSearchModal();
    document.getElementById('header-search-btn')?.addEventListener('click', openSearch);
    document.getElementById('sidebar-quick-search')?.addEventListener('click', openSearch);

    // Shortcuts Modal Trigger
    document.getElementById('shortcuts-help-btn')?.addEventListener('click', () => {
      this.openModal('modal-shortcuts');
    });

    // Add Task Buttons
    const openNewTask = () => this.openTaskModal();
    document.getElementById('header-add-task-btn')?.addEventListener('click', openNewTask);
    document.getElementById('sidebar-add-task-btn')?.addEventListener('click', openNewTask);

    // User avatar click opens settings
    document.getElementById('header-user-avatar')?.addEventListener('click', () => this.navigateTo('settings'));
    document.getElementById('sidebar-user-card')?.addEventListener('click', () => this.navigateTo('settings'));

    // Dashboard Quick Task form
    const dashInput = document.getElementById('dash-quick-task-input');
    const dashSubmit = document.getElementById('dash-quick-task-submit');
    const submitDashQuick = () => {
      if (dashInput && dashInput.value.trim()) {
        Store.createTask({
          title: dashInput.value.trim(),
          dueDate: getTodayIso()
        });
        dashInput.value = '';
        this.showToast('Tarefa criada!', 'Adicionada para hoje com sucesso.');
      }
    };
    dashSubmit?.addEventListener('click', submitDashQuick);
    dashInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitDashQuick();
    });

    // Tasks Page Quick Input
    const tasksInput = document.getElementById('tasks-quick-input');
    const tasksSubmit = document.getElementById('tasks-quick-submit');
    const submitTasksQuick = () => {
      if (tasksInput && tasksInput.value.trim()) {
        Store.createTask({
          title: tasksInput.value.trim(),
          dueDate: getTodayIso()
        });
        tasksInput.value = '';
        this.showToast('Tarefa criada!', 'Tarefa cadastrada com sucesso.');
      }
    };
    tasksSubmit?.addEventListener('click', submitTasksQuick);
    tasksInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitTasksQuick();
    });

    // Tasks Page Filters
    const searchFilter = document.getElementById('tasks-search-filter');
    searchFilter?.addEventListener('input', (e) => {
      this.filters.search = e.target.value;
      this.renderTasks();
    });

    document.querySelectorAll('.filter-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-status-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filters.status = btn.getAttribute('data-status');
        this.renderTasks();
      });
    });

    // Toggle more filters
    document.getElementById('toggle-more-filters-btn')?.addEventListener('click', () => {
      const box = document.getElementById('tasks-more-filters');
      if (box) {
        box.style.display = box.style.display === 'none' ? 'grid' : 'none';
      }
    });

    document.getElementById('filter-priority-select')?.addEventListener('change', (e) => {
      this.filters.priority = e.target.value;
      this.renderTasks();
    });

    document.getElementById('filter-category-select')?.addEventListener('change', (e) => {
      this.filters.categoryId = e.target.value;
      this.renderTasks();
    });

    document.getElementById('filter-project-select')?.addEventListener('change', (e) => {
      this.filters.projectId = e.target.value;
      this.renderTasks();
    });

    document.getElementById('sort-tasks-select')?.addEventListener('change', (e) => {
      this.filters.sort = e.target.value;
      this.renderTasks();
    });

    // Forms Handlers
    this.setupForms();
  },

  setupForms() {
    // Priority Selector in Task Modal
    document.querySelectorAll('.priority-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('task-priority-value').value = btn.getAttribute('data-priority');
      });
    });

    // Subtasks add button in modal
    const subtaskInput = document.getElementById('new-subtask-text');
    const subtaskBtn = document.getElementById('btn-add-subtask');
    const addSubtaskItem = () => {
      if (subtaskInput && subtaskInput.value.trim()) {
        this.taskModalSubtasks.push({
          id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
          title: subtaskInput.value.trim(),
          completed: false
        });
        subtaskInput.value = '';
        this.renderTaskModalSubtasks();
      }
    };
    subtaskBtn?.addEventListener('click', addSubtaskItem);
    subtaskInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addSubtaskItem();
      }
    });

    // Form Task Submit
    document.getElementById('form-task')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('task-title-input').value.trim();
      if (!title) return;

      const desc = document.getElementById('task-desc-input').value;
      const dueDate = document.getElementById('task-date-input').value;
      const dueTime = document.getElementById('task-time-input').value;
      const priority = document.getElementById('task-priority-value').value;
      const categoryId = document.getElementById('task-category-select').value;
      const projectId = document.getElementById('task-project-select').value;
      const tagsRaw = document.getElementById('task-tags-input').value;
      const tags = tagsRaw.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);

      if (this.currentEditingTaskId) {
        Store.updateTask(this.currentEditingTaskId, {
          title,
          description: desc,
          dueDate,
          dueTime,
          priority,
          categoryId,
          projectId,
          subtasks: this.taskModalSubtasks,
          tags
        });
        this.showToast('Tarefa atualizada!', title);
      } else {
        Store.createTask({
          title,
          description: desc,
          dueDate,
          dueTime,
          priority,
          categoryId,
          projectId,
          subtasks: this.taskModalSubtasks,
          tags
        });
        this.showToast('Tarefa criada com sucesso!', title);
      }

      this.closeModals();
    });

    // Form Project Submit
    document.getElementById('form-project')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('project-id-field').value;
      const name = document.getElementById('project-name-input').value.trim();
      const desc = document.getElementById('project-desc-input').value.trim();
      const color = document.getElementById('project-color-input').value;
      const deadline = document.getElementById('project-deadline-input').value;

      if (!name) return;

      if (id) {
        Store.updateProject(id, { name, description: desc, color, deadline });
        this.showToast('Projeto atualizado!', name);
      } else {
        Store.createProject({ name, description: desc, color, deadline });
        this.showToast('Projeto criado!', name);
      }
      this.closeModals();
    });

    // Form Habit Submit
    document.getElementById('form-habit')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('habit-id-field').value;
      const title = document.getElementById('habit-title-input').value.trim();
      const desc = document.getElementById('habit-desc-input').value.trim();
      const color = document.getElementById('habit-color-input').value;
      const frequency = document.getElementById('habit-frequency-select').value;

      if (!title) return;

      if (id) {
        Store.updateHabit(id, { title, description: desc, color, frequency });
        this.showToast('Hábito atualizado!', title);
      } else {
        Store.createHabit({ title, description: desc, color, frequency });
        this.showToast('Hábito criado!', title);
      }
      this.closeModals();
    });

    // Form Category Submit
    document.getElementById('form-category')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('category-id-field').value;
      const name = document.getElementById('category-name-input').value.trim();
      const desc = document.getElementById('category-desc-input').value.trim();
      const color = document.getElementById('category-color-input').value;

      if (!name) return;

      if (id) {
        Store.updateCategory(id, { name, description: desc, color });
        this.showToast('Categoria atualizada!', name);
      } else {
        Store.createCategory({ name, description: desc, color });
        this.showToast('Categoria criada!', name);
      }
      this.closeModals();
    });

    // Profile Settings Form
    document.getElementById('settings-profile-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('settings-input-name').value.trim();
      const email = document.getElementById('settings-input-email').value.trim();
      const title = document.getElementById('settings-input-title').value.trim();
      const avatar = document.getElementById('settings-input-avatar').value.trim();

      Store.updateProfile({ userName: name, userEmail: email, userTitle: title, userAvatar: avatar });
      this.showToast('Perfil salvo!', 'Suas preferências foram atualizadas com sucesso.');
    });

    // Theme Choice Buttons in Settings
    document.querySelectorAll('.theme-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        Store.setTheme(theme);
        this.updateThemeIcon();
        this.renderSettings();
        this.showToast('Tema atualizado!', `Modo configurado para: ${theme}`);
      });
    });

    // Confirm Delete Action button
    document.getElementById('btn-confirm-delete-action')?.addEventListener('click', () => {
      if (this.confirmAction) {
        this.confirmAction();
        this.confirmAction = null;
      }
      this.closeModals();
    });

    // Global Search real-time typing
    document.getElementById('global-search-input')?.addEventListener('input', (e) => {
      this.renderGlobalSearchResults(e.target.value);
    });
  },

  setupKeyShortcuts() {
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag);

      // Ctrl + K or Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearchModal();
        return;
      }

      // Ctrl + / or ?
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        this.openModal('modal-shortcuts');
        return;
      }

      // ESC to close modal
      if (e.key === 'Escape') {
        this.closeModals();
        return;
      }

      // N or C to create task when not typing
      if (!isInput) {
        if (e.key === 'n' || e.key === 'N' || e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          this.openTaskModal();
        } else if (e.key === '?') {
          e.preventDefault();
          this.openModal('modal-shortcuts');
        }
      }
    });
  },

  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const validTabs = ['dashboard', 'tasks', 'calendar', 'kanban', 'projects', 'habits', 'stats', 'settings'];
    this.currentTab = validTabs.includes(hash) ? hash : 'dashboard';

    // Update active nav items
    document.querySelectorAll('[data-tab]').forEach(el => {
      if (el.getAttribute('data-tab') === this.currentTab) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Update page views
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    const activeView = document.getElementById('view-' + this.currentTab);
    if (activeView) activeView.classList.add('active');

    // Close mobile drawer if open
    document.getElementById('sidebar')?.classList.remove('mobile-open');

    // Scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.renderCurrentView();
  },

  navigateTo(tab) {
    window.location.hash = tab;
  },

  setFilter(type, value) {
    if (type === 'status') {
      this.filters.status = value;
      document.querySelectorAll('.filter-status-btn').forEach(btn => {
        if (btn.getAttribute('data-status') === value) btn.classList.add('active');
        else btn.classList.remove('active');
      });
    }
  },

  updateBadges() {
    const todayStr = getTodayIso();
    const todayTasks = Store.tasks.filter(t => t.dueDate === todayStr && t.status !== 'completed');
    const totalPending = Store.tasks.filter(t => t.status !== 'completed').length;

    // Badges in sidebar
    const badgeTasks = document.getElementById('nav-badge-tasks');
    if (badgeTasks) badgeTasks.textContent = totalPending;

    const badgeToday = document.getElementById('nav-badge-today');
    if (badgeToday) {
      badgeToday.textContent = todayTasks.length;
      badgeToday.style.display = todayTasks.length > 0 ? 'inline-block' : 'none';
    }

    const badgeProjects = document.getElementById('nav-badge-projects');
    if (badgeProjects) badgeProjects.textContent = Store.projects.length;

    const badgeHabits = document.getElementById('nav-badge-habits');
    if (badgeHabits) badgeHabits.textContent = Store.habits.length;

    // Header user and date info
    const dateDay = document.getElementById('header-date-day');
    const dateSub = document.getElementById('header-date-sub');
    if (dateDay && dateSub) {
      const now = new Date();
      const options = { weekday: 'long', day: 'numeric', month: 'short' };
      dateDay.textContent = now.toLocaleDateString('pt-BR', options);
      const overdueCount = Store.tasks.filter(t => this.isTaskOverdue(t)).length;
      dateSub.textContent = `${todayTasks.length} hoje` + (overdueCount > 0 ? ` • ${overdueCount} atrasada(s)` : '');
    }

    // Avatar and name
    const avatars = [
      document.getElementById('header-user-avatar'),
      document.getElementById('sidebar-user-avatar'),
      document.getElementById('settings-preview-avatar')
    ];
    avatars.forEach(img => {
      if (img) img.src = Store.user.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
    });

    const sideName = document.getElementById('sidebar-user-name');
    if (sideName) sideName.textContent = Store.user.userName;

    const sideEmail = document.getElementById('sidebar-user-email');
    if (sideEmail) sideEmail.textContent = Store.user.userEmail;
  },

  renderCurrentView() {
    switch (this.currentTab) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'tasks':
        this.renderTasks();
        break;
      case 'calendar':
        CalendarView.render();
        break;
      case 'kanban':
        Kanban.render();
        break;
      case 'projects':
        this.renderProjects();
        break;
      case 'habits':
        this.renderHabits();
        break;
      case 'stats':
        this.renderStats();
        break;
      case 'settings':
        this.renderSettings();
        break;
    }
  },

  // Helper date status
  isTaskOverdue(task) {
    if (!task.dueDate || task.status === 'completed') return false;
    const today = getTodayIso();
    if (task.dueDate < today) return true;
    if (task.dueDate === today && task.dueTime) {
      const now = new Date();
      const currentHm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      return currentHm > task.dueTime;
    }
    return false;
  },

  getDueDateBadgeHtml(task) {
    if (!task.dueDate) {
      return '<span class="task-due-badge due-normal">Sem prazo</span>';
    }
    const today = getTodayIso();
    const tomorrow = addDaysIso(1);

    if (this.isTaskOverdue(task)) {
      return `<span class="task-due-badge due-overdue">${Icons.get('alert', 'icon-sm')} Atrasada</span>`;
    }
    if (task.dueDate === today) {
      const timeStr = task.dueTime ? `, ${task.dueTime}` : '';
      return `<span class="task-due-badge due-today">${Icons.get('clock', 'icon-sm')} Hoje${timeStr}</span>`;
    }
    if (task.dueDate === tomorrow) {
      const timeStr = task.dueTime ? `, ${task.dueTime}` : '';
      return `<span class="task-due-badge due-normal">${Icons.get('clock', 'icon-sm')} Amanhã${timeStr}</span>`;
    }

    const parts = task.dueDate.split('-');
    const formatted = `${parts[2]}/${parts[1]}`;
    return `<span class="task-due-badge due-normal">${Icons.get('calendar', 'icon-sm')} ${formatted}</span>`;
  },

  // 1. Render Dashboard
  renderDashboard() {
    const hour = new Date().getHours();
    let greet = 'Bom dia';
    if (hour >= 12 && hour < 18) greet = 'Boa tarde';
    else if (hour >= 18 || hour < 5) greet = 'Boa noite';

    const firstName = Store.user.userName.split(' ')[0] || 'Produtor';
    const greetEl = document.getElementById('welcome-greeting');
    if (greetEl) greetEl.textContent = `${greet}, ${firstName}! 👋`;

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const dateStrEl = document.getElementById('dash-date-str');
    if (dateStrEl) dateStrEl.textContent = dateFormatted;

    // Metrics
    const todayStr = getTodayIso();
    const todayTasks = Store.tasks.filter(t => t.dueDate === todayStr);
    const todayDone = todayTasks.filter(t => t.status === 'completed');
    const todayPending = todayTasks.filter(t => t.status !== 'completed');
    const totalPending = Store.tasks.filter(t => t.status !== 'completed').length;
    const totalCompleted = Store.tasks.filter(t => t.status === 'completed').length;
    const overdueCount = Store.tasks.filter(t => this.isTaskOverdue(t)).length;

    document.getElementById('kpi-today-count').textContent = todayTasks.length;
    document.getElementById('kpi-pending-count').textContent = totalPending;
    document.getElementById('kpi-overdue-count').textContent = overdueCount;
    document.getElementById('kpi-completed-count').textContent = totalCompleted;

    const percent = todayTasks.length > 0 ? Math.round((todayDone.length / todayTasks.length) * 100) : 0;
    document.getElementById('dash-progress-percent').textContent = `${percent}%`;
    document.getElementById('dash-progress-fill').style.width = `${percent}%`;
    document.getElementById('dash-tasks-done-count').textContent = `${todayDone.length} concluídas`;
    document.getElementById('dash-tasks-pending-count').textContent = `${todayPending.length} pendentes`;

    // Today Habits
    const habitsContainer = document.getElementById('dash-habits-container');
    if (habitsContainer) {
      if (Store.habits.length === 0) {
        habitsContainer.innerHTML = '<p style="font-size: 12px; color: var(--text-muted); grid-column: 1/-1;">Nenhum hábito cadastrado. Vá em Hábitos para criar o primeiro.</p>';
      } else {
        habitsContainer.innerHTML = Store.habits.map(h => {
          const isDone = h.completedDates.includes(todayStr);
          return `
            <div class="habit-quick-item ${isDone ? 'completed' : ''}" onclick="Store.toggleHabitDate('${h.id}', '${todayStr}')">
              <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                <div style="width: 28px; height: 28px; border-radius: 8px; background: ${h.color}; display: flex; align-items: center; justify-content: center; color: #fff;">
                  ${Icons.get(h.icon || 'flame', 'icon-sm')}
                </div>
                <span style="font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${h.title}</span>
              </div>
              <div style="width: 20px; height: 20px; border-radius: 6px; border: 2px solid ${isDone ? '#10b981' : 'var(--border-color)'}; background: ${isDone ? '#10b981' : 'transparent'}; color: #fff; display: flex; align-items: center; justify-content: center;">
                ${isDone ? Icons.get('check', 'icon-sm') : ''}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Priority Tasks
    const priorityList = document.getElementById('dash-priority-tasks-list');
    if (priorityList) {
      const highTasks = Store.tasks.filter(t => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high')).slice(0, 5);
      if (highTasks.length === 0) {
        priorityList.innerHTML = `
          <div style="text-align: center; padding: 30px; background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
            <span class="nav-icon" data-icon="checkCircle" style="width: 32px; height: 32px; color: #10b981; margin-bottom: 8px;"></span>
            <p style="font-size: 13px; font-weight: 600;">Nenhuma tarefa urgente ou alta pendente!</p>
            <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Suas metas mais importantes estão sob controle.</p>
          </div>
        `;
      } else {
        priorityList.innerHTML = highTasks.map(t => this.renderTaskRowHtml(t)).join('');
      }
    }

    // Today Schedule List
    const scheduleList = document.getElementById('dash-today-schedule-list');
    if (scheduleList) {
      if (todayTasks.length === 0) {
        scheduleList.innerHTML = '<p style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 20px 0;">Sem atividades agendadas para hoje.</p>';
      } else {
        scheduleList.innerHTML = todayTasks.map(t => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: var(--bg-card-subtle); border-radius: var(--radius-md); margin-bottom: 6px; font-size: 12px;">
            <div style="min-width: 0; padding-right: 8px;">
              <p style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${t.status === 'completed' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${t.title}</p>
              ${t.dueTime ? `<span style="font-size: 10px; color: var(--primary); font-weight: 600;">às ${t.dueTime}</span>` : ''}
            </div>
            <button class="btn-ghost btn-sm" onclick="Store.toggleTaskComplete('${t.id}')">
              ${t.status === 'completed' ? '<span style="color: #10b981; font-weight: 700;">Feito</span>' : '<span style="color: var(--text-muted);">Pendente</span>'}
            </button>
          </div>
        `).join('');
      }
    }
  },

  // 2. Render Tasks Page
  renderTasks() {
    const subtitle = document.getElementById('tasks-counter-subtitle');
    const container = document.getElementById('tasks-list-container');
    if (!container) return;

    // Populate Category & Project Filter options if empty
    this.populateFilterDropdowns();

    // Filter Tasks
    let list = Store.tasks.filter(task => {
      // Search
      if (this.filters.search.trim()) {
        const q = this.filters.search.toLowerCase();
        const mTitle = task.title.toLowerCase().includes(q);
        const mDesc = task.description && task.description.toLowerCase().includes(q);
        const mTags = task.tags && task.tags.some(tag => tag.toLowerCase().includes(q));
        if (!mTitle && !mDesc && !mTags) return false;
      }

      // Status
      if (this.filters.status === 'pending' && task.status === 'completed') return false;
      if (this.filters.status === 'completed' && task.status !== 'completed') return false;
      if (this.filters.status === 'overdue' && !this.isTaskOverdue(task)) return false;
      if (this.filters.status === 'today' && task.dueDate !== getTodayIso()) return false;

      // Priority
      if (this.filters.priority !== 'all' && task.priority !== this.filters.priority) return false;

      // Category
      if (this.filters.categoryId !== 'all' && task.categoryId !== this.filters.categoryId) return false;

      // Project
      if (this.filters.projectId !== 'all' && task.projectId !== this.filters.projectId) return false;

      return true;
    });

    // Sort
    list.sort((a, b) => {
      if (this.filters.sort === 'dueDate_asc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (this.filters.sort === 'dueDate_desc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return b.dueDate.localeCompare(a.dueDate);
      }
      if (this.filters.sort === 'priority_desc') {
        const weights = { urgent: 4, high: 3, medium: 2, low: 1 };
        return weights[b.priority] - weights[a.priority];
      }
      if (this.filters.sort === 'created_desc') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      if (this.filters.sort === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    if (subtitle) {
      const completed = Store.tasks.filter(t => t.status === 'completed').length;
      subtitle.textContent = `${list.length} tarefa(s) listada(s) • ${completed} concluída(s)`;
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px; background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-xl);">
          <span class="nav-icon" data-icon="checkSquare" style="width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 12px;"></span>
          <h3 style="font-size: 16px; font-weight: 700;">Nenhuma tarefa encontrada</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px; max-width: 400px; margin-left: auto; margin-right: auto;">
            Tente alterar os filtros aplicados ou crie uma nova tarefa agora mesmo.
          </p>
          <button class="btn btn-primary" style="margin-top: 16px;" onclick="App.openTaskModal()">Criar Tarefa</button>
        </div>
      `;
    } else {
      container.innerHTML = list.map(t => this.renderTaskRowHtml(t)).join('');
    }
  },

  populateFilterDropdowns() {
    const catSelect = document.getElementById('filter-category-select');
    if (catSelect && catSelect.children.length <= 1) {
      catSelect.innerHTML = '<option value="all">Todas</option>' + Store.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    const projSelect = document.getElementById('filter-project-select');
    if (projSelect && projSelect.children.length <= 1) {
      projSelect.innerHTML = '<option value="all">Todos</option>' + Store.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
  },

  renderTaskRowHtml(task) {
    const isDone = task.status === 'completed';
    const cat = Store.categories.find(c => c.id === task.categoryId);
    const proj = Store.projects.find(p => p.id === task.projectId);
    const subtasksDone = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;

    const priorityBadges = {
      urgent: '<span class="badge badge-urgent"><span class="badge-dot"></span>Urgente</span>',
      high: '<span class="badge badge-high"><span class="badge-dot"></span>Alta</span>',
      medium: '<span class="badge badge-medium"><span class="badge-dot"></span>Média</span>',
      low: '<span class="badge badge-low"><span class="badge-dot"></span>Baixa</span>'
    };

    return `
      <div class="task-row ${isDone ? 'completed' : ''}" id="task-row-${task.id}">
        <div class="task-left">
          <button class="task-check-btn" onclick="Store.toggleTaskComplete('${task.id}')" title="Marcar como concluída">
            ${isDone ? Icons.get('check', 'icon-sm') : ''}
          </button>
          <div class="task-content">
            <div class="task-title" onclick="App.openTaskModal('${task.id}')">
              <span>${task.title}</span>
              ${priorityBadges[task.priority] || ''}
            </div>

            ${task.description ? `<p class="task-desc">${task.description}</p>` : ''}

            <div class="task-meta-pills">
              ${cat ? `
                <span class="task-meta-tag">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${cat.color}; display: inline-block;"></span>
                  <span>${cat.name}</span>
                </span>
              ` : ''}

              ${proj ? `
                <span class="task-meta-tag">
                  ${Icons.get('folder', 'icon-sm')}
                  <span>${proj.name}</span>
                </span>
              ` : ''}

              ${totalSubtasks > 0 ? `
                <span class="task-meta-tag" style="color: ${subtasksDone === totalSubtasks ? '#10b981' : 'var(--text-muted)'}; font-weight: 600;">
                  ${Icons.get('checkSquare', 'icon-sm')}
                  <span>${subtasksDone}/${totalSubtasks}</span>
                </span>
              ` : ''}

              ${task.tags && task.tags.length > 0 ? task.tags.map(t => `<span class="kbd">#${t}</span>`).join('') : ''}
            </div>
          </div>
        </div>

        <div class="task-right">
          ${this.getDueDateBadgeHtml(task)}

          <button class="task-action-btn" onclick="App.openTaskModal('${task.id}')" title="Editar">
            ${Icons.get('edit')}
          </button>
          <button class="task-action-btn" onclick="Store.duplicateTask('${task.id}')" title="Duplicar">
            ${Icons.get('copy')}
          </button>
          <button class="task-action-btn" onclick="App.confirmDeleteTask('${task.id}')" title="Excluir" style="color: var(--danger);">
            ${Icons.get('trash')}
          </button>
        </div>
      </div>
    `;
  },

  // 3. Render Projects Page
  renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    if (Store.projects.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-xl);">
          <span class="nav-icon" data-icon="folder" style="width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 12px;"></span>
          <h3 style="font-size: 16px; font-weight: 700;">Nenhum projeto cadastrado</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Crie projetos para agrupar suas atividades e acompanhar seu progresso geral.</p>
          <button class="btn btn-primary" style="margin-top: 16px;" onclick="App.openProjectModal()">Criar Projeto</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = Store.projects.map(proj => {
      const projTasks = Store.tasks.filter(t => t.projectId === proj.id);
      const doneCount = projTasks.filter(t => t.status === 'completed').length;
      const pendingCount = projTasks.length - doneCount;
      const progress = projTasks.length > 0 ? Math.round((doneCount / projTasks.length) * 100) : 0;

      return `
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                <span style="width: 14px; height: 14px; border-radius: 50%; background: ${proj.color}; flex-shrink: 0; box-shadow: 0 0 0 3px var(--bg-card-subtle);"></span>
                <h3 style="font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${proj.name}</h3>
              </div>
              <div style="display: flex; gap: 4px;">
                <button class="btn-ghost btn-sm" onclick="App.openProjectModal('${proj.id}')" title="Editar">${Icons.get('edit')}</button>
                <button class="btn-ghost btn-sm" style="color: var(--danger);" onclick="App.confirmDeleteProject('${proj.id}')" title="Excluir">${Icons.get('trash')}</button>
              </div>
            </div>

            ${proj.description ? `<p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5;">${proj.description}</p>` : ''}

            ${proj.deadline ? `
              <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); margin-bottom: 16px; background: var(--bg-card-subtle); padding: 6px 10px; border-radius: var(--radius-sm);">
                ${Icons.get('calendar', 'icon-sm')}
                <span>Prazo: <strong>${proj.deadline.split('-').reverse().join('/')}</strong></span>
              </div>
            ` : ''}

            <!-- Progress Bar -->
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 6px;">
                <span style="color: var(--text-muted);">Conclusão</span>
                <span>${progress}%</span>
              </div>
              <div style="background: var(--bg-card-subtle); height: 8px; border-radius: var(--radius-full); overflow: hidden;">
                <div style="background: ${proj.color}; height: 100%; width: ${progress}%; border-radius: var(--radius-full); transition: width 0.3s ease;"></div>
              </div>
            </div>

            <!-- Stats badges -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; text-align: center; margin-bottom: 16px;">
              <div style="background: var(--bg-card-subtle); padding: 8px; border-radius: var(--radius-md);">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); display: block;">Pendentes</span>
                <span style="font-size: 15px; font-weight: 700;">${pendingCount}</span>
              </div>
              <div style="background: var(--bg-card-subtle); padding: 8px; border-radius: var(--radius-md);">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); display: block;">Concluídas</span>
                <span style="font-size: 15px; font-weight: 700; color: #10b981;">${doneCount}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 14px;">
            <button class="btn btn-outline btn-sm" onclick="App.openTaskModalPrefill({ projectId: '${proj.id}' })">
              ${Icons.get('plus', 'icon-sm')} Tarefa
            </button>
            <button class="btn btn-ghost btn-sm" onclick="App.navigateTo('tasks'); App.filters.projectId = '${proj.id}'; App.renderTasks();">
              Ver Tarefas &rarr;
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // 4. Render Habits Page
  renderHabits() {
    const container = document.getElementById('habits-list-container');
    if (!container) return;

    if (Store.habits.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px; background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-xl);">
          <span class="nav-icon" data-icon="flame" style="width: 40px; height: 40px; color: var(--warning); margin-bottom: 12px;"></span>
          <h3 style="font-size: 16px; font-weight: 700;">Nenhum hábito cadastrado</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Acompanhe hábitos de estudo, leitura, saúde e treino com contadores de sequência.</p>
          <button class="btn btn-primary" style="margin-top: 16px;" onclick="App.openHabitModal()">Criar Primeiro Hábito</button>
        </div>
      `;
      return;
    }

    // Past 7 days
    const days = [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      days.push({
        iso: `${year}-${month}-${day}`,
        label: dayNames[d.getDay()],
        num: day,
        isToday: i === 0
      });
    }

    container.innerHTML = Store.habits.map(h => {
      return `
        <div class="habit-card">
          <div class="habit-info">
            <div class="habit-icon-box" style="background: ${h.color};">
              ${Icons.get(h.icon || 'flame')}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h4 style="font-size: 15px; font-weight: 700;">${h.title}</h4>
                ${h.streak > 0 ? `
                  <span class="badge" style="background: var(--warning-light); color: var(--warning-text); border: 1px solid rgba(245, 158, 11, 0.3);">
                    ${Icons.get('flame', 'icon-sm')} ${h.streak} ${h.streak === 1 ? 'dia' : 'dias'}
                  </span>
                ` : ''}
              </div>
              ${h.description ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${h.description}</p>` : ''}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
            <div class="habit-days-row">
              ${days.map(d => {
                const done = h.completedDates.includes(d.iso);
                return `
                  <div class="habit-day-bubble">
                    <span class="habit-bubble-label" style="${d.isToday ? 'color: var(--primary); font-weight: 800;' : ''}">${d.label}</span>
                    <button class="habit-bubble-btn ${done ? 'completed' : ''}" 
                      style="${done ? `background: ${h.color}; border-color: ${h.color};` : ''}"
                      onclick="Store.toggleHabitDate('${h.id}', '${d.iso}')"
                      title="${d.num} de ${d.label} - Clique para alternar">
                      ${done ? Icons.get('check', 'icon-sm') : ''}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>

            <div style="display: flex; gap: 4px; border-left: 1px solid var(--border-color); padding-left: 12px;">
              <button class="btn-ghost btn-sm" onclick="App.openHabitModal('${h.id}')" title="Editar">${Icons.get('edit')}</button>
              <button class="btn-ghost btn-sm" style="color: var(--danger);" onclick="App.confirmDeleteHabit('${h.id}')" title="Excluir">${Icons.get('trash')}</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // 5. Render Stats Page
  renderStats() {
    setTimeout(() => {
      Charts.renderWeeklyChart('chart-weekly', Store.tasks);
      Charts.renderPriorityChart('chart-priority', Store.tasks);
    }, 50);

    const catContainer = document.getElementById('stats-category-bars');
    if (catContainer) {
      catContainer.innerHTML = Store.categories.map(cat => {
        const catTasks = Store.tasks.filter(t => t.categoryId === cat.id);
        const done = catTasks.filter(t => t.status === 'completed').length;
        const percent = catTasks.length > 0 ? Math.round((done / catTasks.length) * 100) : 0;

        return `
          <div style="background: var(--bg-card-subtle); padding: 16px; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: ${cat.color};"></span>
                <span style="font-weight: 700; font-size: 13px;">${cat.name}</span>
              </div>
              <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${catTasks.length} tarefas</span>
            </div>
            <div style="background: var(--bg-card); height: 8px; border-radius: var(--radius-full); overflow: hidden; margin-bottom: 6px;">
              <div style="background: ${cat.color}; height: 100%; width: ${percent}%; border-radius: var(--radius-full);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
              <span>${done} concluída(s)</span>
              <span>${percent}%</span>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  // 6. Render Settings Page
  renderSettings() {
    const inputName = document.getElementById('settings-input-name');
    const inputEmail = document.getElementById('settings-input-email');
    const inputTitle = document.getElementById('settings-input-title');
    const inputAvatar = document.getElementById('settings-input-avatar');

    if (inputName) inputName.value = Store.user.userName || '';
    if (inputEmail) inputEmail.value = Store.user.userEmail || '';
    if (inputTitle) inputTitle.value = Store.user.userTitle || '';
    if (inputAvatar) inputAvatar.value = Store.user.userAvatar || '';

    // Active theme button highlight
    const curTheme = Store.user.theme || 'light';
    document.querySelectorAll('.theme-choice-btn').forEach(btn => {
      if (btn.getAttribute('data-theme') === curTheme) {
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');
      } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
      }
    });

    // Categories list in settings
    const catList = document.getElementById('settings-categories-list');
    if (catList) {
      catList.innerHTML = Store.categories.map(c => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-card-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: ${c.color};"></span>
            <span style="font-size: 13px; font-weight: 600;">${c.name}</span>
          </div>
          <div style="display: flex; gap: 4px;">
            <button class="btn-ghost btn-sm" onclick="App.openCategoryModal('${c.id}')">${Icons.get('edit', 'icon-sm')}</button>
            <button class="btn-ghost btn-sm" style="color: var(--danger);" onclick="App.confirmDeleteCategory('${c.id}')">${Icons.get('trash', 'icon-sm')}</button>
          </div>
        </div>
      `).join('');
    }
  },

  // Modal Controls
  openModal(modalId) {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    this.currentEditingTaskId = null;
    this.taskModalSubtasks = [];
  },

  // Open Task Modal
  openTaskModal(taskId = null) {
    this.currentEditingTaskId = taskId;
    const modalTitle = document.getElementById('modal-task-title');
    const submitBtn = document.getElementById('btn-save-task');

    // Populate Category options
    const catSelect = document.getElementById('task-category-select');
    if (catSelect) {
      catSelect.innerHTML = Store.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    // Populate Project options
    const projSelect = document.getElementById('task-project-select');
    if (projSelect) {
      projSelect.innerHTML = '<option value="">Nenhum projeto</option>' + Store.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    if (taskId) {
      const task = Store.tasks.find(t => t.id === taskId);
      if (!task) return;
      modalTitle.textContent = 'Editar Tarefa';
      submitBtn.textContent = 'Salvar Alterações';

      document.getElementById('task-id-field').value = task.id;
      document.getElementById('task-title-input').value = task.title;
      document.getElementById('task-desc-input').value = task.description || '';
      document.getElementById('task-date-input').value = task.dueDate || '';
      document.getElementById('task-time-input').value = task.dueTime || '';
      document.getElementById('task-priority-value').value = task.priority || 'medium';
      document.getElementById('task-category-select').value = task.categoryId || Store.categories[0]?.id;
      document.getElementById('task-project-select').value = task.projectId || '';
      document.getElementById('task-tags-input').value = task.tags ? task.tags.join(', ') : '';

      this.taskModalSubtasks = task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : [];
      this.renderTaskModalSubtasks();

      document.querySelectorAll('.priority-btn').forEach(b => {
        if (b.getAttribute('data-priority') === task.priority) b.classList.add('active');
        else b.classList.remove('active');
      });
    } else {
      modalTitle.textContent = 'Nova Tarefa';
      submitBtn.textContent = 'Criar Tarefa';

      document.getElementById('task-id-field').value = '';
      document.getElementById('task-title-input').value = '';
      document.getElementById('task-desc-input').value = '';
      document.getElementById('task-date-input').value = getTodayIso();
      document.getElementById('task-time-input').value = '';
      document.getElementById('task-priority-value').value = 'medium';
      document.getElementById('task-category-select').value = Store.categories[0]?.id || '';
      document.getElementById('task-project-select').value = '';
      document.getElementById('task-tags-input').value = '';

      this.taskModalSubtasks = [];
      this.renderTaskModalSubtasks();

      document.querySelectorAll('.priority-btn').forEach(b => {
        if (b.getAttribute('data-priority') === 'medium') b.classList.add('active');
        else b.classList.remove('active');
      });
    }

    this.openModal('modal-task');
    setTimeout(() => document.getElementById('task-title-input')?.focus(), 100);
  },

  openTaskModalPrefill(prefill = {}) {
    this.openTaskModal();
    if (prefill.dueDate) document.getElementById('task-date-input').value = prefill.dueDate;
    if (prefill.projectId) document.getElementById('task-project-select').value = prefill.projectId;
    if (prefill.categoryId) document.getElementById('task-category-select').value = prefill.categoryId;
  },

  renderTaskModalSubtasks() {
    const list = document.getElementById('subtasks-list-modal');
    if (!list) return;

    if (this.taskModalSubtasks.length === 0) {
      list.innerHTML = '<p style="font-size: 11px; color: var(--text-muted); padding: 4px 0;">Nenhum item na checklist.</p>';
      return;
    }

    list.innerHTML = this.taskModalSubtasks.map((st, idx) => `
      <div class="subtask-row">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1;">
          <input type="checkbox" ${st.completed ? 'checked' : ''} onchange="App.taskModalSubtasks[${idx}].completed = this.checked">
          <span style="${st.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${st.title}</span>
        </label>
        <button type="button" class="btn-ghost btn-sm" onclick="App.taskModalSubtasks.splice(${idx}, 1); App.renderTaskModalSubtasks();" style="color: var(--danger);">
          ${Icons.get('trash', 'icon-sm')}
        </button>
      </div>
    `).join('');
  },

  // Project Modal
  openProjectModal(projectId = null) {
    const modalTitle = document.getElementById('modal-project-title');
    if (projectId) {
      const p = Store.projects.find(proj => proj.id === projectId);
      if (!p) return;
      modalTitle.textContent = 'Editar Projeto';
      document.getElementById('project-id-field').value = p.id;
      document.getElementById('project-name-input').value = p.name;
      document.getElementById('project-desc-input').value = p.description || '';
      document.getElementById('project-color-input').value = p.color || '#6366f1';
      document.getElementById('project-deadline-input').value = p.deadline || '';
    } else {
      modalTitle.textContent = 'Novo Projeto';
      document.getElementById('project-id-field').value = '';
      document.getElementById('project-name-input').value = '';
      document.getElementById('project-desc-input').value = '';
      document.getElementById('project-color-input').value = '#6366f1';
      document.getElementById('project-deadline-input').value = '';
    }
    this.openModal('modal-project');
  },

  // Habit Modal
  openHabitModal(habitId = null) {
    const modalTitle = document.getElementById('modal-habit-title');
    if (habitId) {
      const h = Store.habits.find(item => item.id === habitId);
      if (!h) return;
      modalTitle.textContent = 'Editar Hábito';
      document.getElementById('habit-id-field').value = h.id;
      document.getElementById('habit-title-input').value = h.title;
      document.getElementById('habit-desc-input').value = h.description || '';
      document.getElementById('habit-color-input').value = h.color || '#06b6d4';
      document.getElementById('habit-frequency-select').value = h.frequency || 'daily';
    } else {
      modalTitle.textContent = 'Novo Hábito';
      document.getElementById('habit-id-field').value = '';
      document.getElementById('habit-title-input').value = '';
      document.getElementById('habit-desc-input').value = '';
      document.getElementById('habit-color-input').value = '#06b6d4';
      document.getElementById('habit-frequency-select').value = 'daily';
    }
    this.openModal('modal-habit');
  },

  // Category Modal
  openCategoryModal(catId = null) {
    const modalTitle = document.getElementById('modal-category-title');
    if (catId) {
      const c = Store.categories.find(item => item.id === catId);
      if (!c) return;
      modalTitle.textContent = 'Editar Categoria';
      document.getElementById('category-id-field').value = c.id;
      document.getElementById('category-name-input').value = c.name;
      document.getElementById('category-desc-input').value = c.description || '';
      document.getElementById('category-color-input').value = c.color || '#6366f1';
    } else {
      modalTitle.textContent = 'Nova Categoria';
      document.getElementById('category-id-field').value = '';
      document.getElementById('category-name-input').value = '';
      document.getElementById('category-desc-input').value = '';
      document.getElementById('category-color-input').value = '#6366f1';
    }
    this.openModal('modal-category');
  },

  // Search Modal
  openSearchModal() {
    this.openModal('modal-search');
    const input = document.getElementById('global-search-input');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 100);
      this.renderGlobalSearchResults('');
    }
  },

  renderGlobalSearchResults(query) {
    const container = document.getElementById('global-search-results');
    if (!container) return;

    if (!query.trim()) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 24px;">Comece digitando para buscar em tarefas, projetos e categorias...</p>';
      return;
    }

    const q = query.toLowerCase();
    const tasks = Store.tasks.filter(t => t.title.toLowerCase().includes(q) || (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))).slice(0, 5);
    const projects = Store.projects.filter(p => p.name.toLowerCase().includes(q)).slice(0, 3);
    const categories = Store.categories.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3);

    if (tasks.length === 0 && projects.length === 0 && categories.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 24px;">Nenhum resultado encontrado para "' + query + '"</p>';
      return;
    }

    let html = '';

    if (tasks.length > 0) {
      html += `<div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Tarefas (${tasks.length})</div>`;
      html += tasks.map(t => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-card-subtle); border-radius: var(--radius-md); margin-bottom: 6px; cursor: pointer;" onclick="App.closeModals(); App.openTaskModal('${t.id}')">
          <span style="font-size: 13px; font-weight: 600; ${t.status === 'completed' ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${t.title}</span>
          ${this.getDueDateBadgeHtml(t)}
        </div>
      `).join('');
    }

    if (projects.length > 0) {
      html += `<div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin: 12px 0 6px 0;">Projetos (${projects.length})</div>`;
      html += projects.map(p => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-card-subtle); border-radius: var(--radius-md); margin-bottom: 6px; cursor: pointer;" onclick="App.closeModals(); App.navigateTo('projects');">
          <span style="font-size: 13px; font-weight: 600;"><span style="color: ${p.color};">&bull;</span> ${p.name}</span>
          <span>&rarr;</span>
        </div>
      `).join('');
    }

    container.innerHTML = html;
  },

  // Confirm Dialog
  confirmDeleteTask(taskId) {
    const task = Store.tasks.find(t => t.id === taskId);
    if (!task) return;
    document.getElementById('modal-confirm-title').textContent = 'Excluir Tarefa';
    document.getElementById('modal-confirm-msg').textContent = `Tem certeza que deseja excluir "${task.title}"? Esta ação não pode ser desfeita.`;
    this.confirmAction = () => {
      Store.deleteTask(taskId);
      this.showToast('Tarefa excluída', task.title);
    };
    this.openModal('modal-confirm');
  },

  confirmDeleteProject(projId) {
    const p = Store.projects.find(item => item.id === projId);
    if (!p) return;
    document.getElementById('modal-confirm-title').textContent = 'Excluir Projeto';
    document.getElementById('modal-confirm-msg').textContent = `Tem certeza que deseja excluir "${p.name}"? As tarefas vinculadas a ele permanecerão salvas.`;
    this.confirmAction = () => {
      Store.deleteProject(projId);
      this.showToast('Projeto excluído', p.name);
    };
    this.openModal('modal-confirm');
  },

  confirmDeleteHabit(habitId) {
    const h = Store.habits.find(item => item.id === habitId);
    if (!h) return;
    document.getElementById('modal-confirm-title').textContent = 'Excluir Hábito';
    document.getElementById('modal-confirm-msg').textContent = `Tem certeza que deseja excluir "${h.title}"? O histórico de consistência será apagado.`;
    this.confirmAction = () => {
      Store.deleteHabit(habitId);
      this.showToast('Hábito excluído', h.title);
    };
    this.openModal('modal-confirm');
  },

  confirmDeleteCategory(catId) {
    const c = Store.categories.find(item => item.id === catId);
    if (!c) return;
    document.getElementById('modal-confirm-title').textContent = 'Excluir Categoria';
    document.getElementById('modal-confirm-msg').textContent = `Deseja remover a categoria "${c.name}"?`;
    this.confirmAction = () => {
      Store.deleteCategory(catId);
      this.showToast('Categoria removida', c.name);
    };
    this.openModal('modal-confirm');
  },

  // Toast Notifications
  showToast(title, subtitle = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `
      <div style="color: var(--primary); display: flex;">${Icons.get('sparkles')}</div>
      <div style="flex: 1; min-width: 0;">
        <h5 style="font-size: 13px; font-weight: 700; line-height: 1.2;">${title}</h5>
        ${subtitle ? `<p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${subtitle}</p>` : ''}
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Backup Import & Export
  exportBackup() {
    const jsonStr = Store.exportJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbit-backup-${getTodayIso()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Backup exportado!', 'Arquivo JSON salvo no seu computador.');
  },

  importBackup(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const ok = Store.importJson(e.target.result);
      if (ok) {
        this.showToast('Backup restaurado!', 'Suas tarefas e hábitos foram importados.');
      } else {
        alert('O arquivo selecionado não é um backup JSON válido do Orbit.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  },

  resetToDefaults() {
    if (confirm('Deseja recarregar os dados de demonstração iniciais? Seus dados atuais serão substituídos.')) {
      Store.resetAll();
      this.showToast('Dados restaurados!', 'Os exemplos de tarefas e projetos foram carregados.');
    }
  }
};

// Kanban Module
const Kanban = {
  draggedTaskId: null,

  render() {
    const cols = ['todo', 'in_progress', 'completed'];
    cols.forEach(col => {
      const container = document.getElementById('kanban-tasks-' + col);
      const countEl = document.getElementById('kanban-count-' + col);
      if (!container) return;

      const tasks = Store.tasks.filter(t => t.status === col);
      if (countEl) countEl.textContent = tasks.length;

      if (tasks.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 24px 0; color: var(--text-muted); font-size: 12px; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">Nenhuma tarefa nesta etapa</div>';
      } else {
        container.innerHTML = tasks.map(t => this.renderCardHtml(t)).join('');
      }
    });
  },

  renderCardHtml(task) {
    const cat = Store.categories.find(c => c.id === task.categoryId);
    const priorityPills = {
      urgent: '<span class="badge badge-urgent"><span class="badge-dot"></span>Urgente</span>',
      high: '<span class="badge badge-high"><span class="badge-dot"></span>Alta</span>',
      medium: '<span class="badge badge-medium"><span class="badge-dot"></span>Média</span>',
      low: '<span class="badge badge-low"><span class="badge-dot"></span>Baixa</span>'
    };

    return `
      <div class="kanban-card" draggable="true" ondragstart="Kanban.onDragStart(event, '${task.id}')" onclick="App.openTaskModal('${task.id}')">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          ${priorityPills[task.priority] || ''}
          ${cat ? `<span style="font-size: 11px; color: var(--text-muted); font-weight: 600;"><span style="color: ${cat.color};">&bull;</span> ${cat.name}</span>` : ''}
        </div>
        <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 4px; line-height: 1.4;">${task.title}</h4>
        ${task.description ? `<p style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${task.description}</p>` : ''}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color); font-size: 11px;">
          ${App.getDueDateBadgeHtml(task)}
          ${task.subtasks && task.subtasks.length > 0 ? `<span style="color: var(--text-muted);">${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length} itens</span>` : ''}
        </div>
      </div>
    `;
  },

  onDragStart(e, taskId) {
    this.draggedTaskId = taskId;
    e.dataTransfer.setData('text/plain', taskId);
  },

  onDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  },

  onDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  },

  onDrop(e, targetStatus) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const taskId = e.dataTransfer.getData('text/plain') || this.draggedTaskId;
    if (taskId) {
      Store.updateTask(taskId, { status: targetStatus });
      this.render();
    }
  }
};

// Calendar Module
const CalendarView = {
  viewDate: new Date(),
  mode: 'month',

  render() {
    const area = document.getElementById('calendar-render-area');
    const headerTitle = document.getElementById('calendar-header-title');
    if (!area) return;

    // Set Header Month Title
    if (headerTitle) {
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      headerTitle.textContent = `${monthNames[this.viewDate.getMonth()]} de ${this.viewDate.getFullYear()}`;
    }

    // Update Mode Buttons
    document.querySelectorAll('.cal-mode-btn').forEach(btn => {
      if (btn.getAttribute('data-calmode') === this.mode) btn.classList.add('active');
      else btn.classList.remove('active');
      btn.onclick = () => {
        this.mode = btn.getAttribute('data-calmode');
        this.render();
      };
    });

    if (this.mode === 'month') {
      this.renderMonth(area);
    } else if (this.mode === 'week') {
      this.renderWeek(area);
    } else {
      this.renderDay(area);
    }
  },

  prev() {
    if (this.mode === 'month') this.viewDate.setMonth(this.viewDate.getMonth() - 1);
    else if (this.mode === 'week') this.viewDate.setDate(this.viewDate.getDate() - 7);
    else this.viewDate.setDate(this.viewDate.getDate() - 1);
    this.render();
  },

  next() {
    if (this.mode === 'month') this.viewDate.setMonth(this.viewDate.getMonth() + 1);
    else if (this.mode === 'week') this.viewDate.setDate(this.viewDate.getDate() + 7);
    else this.viewDate.setDate(this.viewDate.getDate() + 1);
    this.render();
  },

  goToToday() {
    this.viewDate = new Date();
    this.render();
  },

  renderMonth(area) {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const todayStr = getTodayIso();

    let html = `
      <div class="cal-weekdays">
        <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
      </div>
      <div class="cal-days-grid">
    `;

    // Prev month days filler
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      html += `<div class="cal-day-cell other-month"><span class="cal-day-number">${d}</span></div>`;
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const dayStr = String(day).padStart(2, '0');
      const mStr = String(month + 1).padStart(2, '0');
      const cellIso = `${year}-${mStr}-${dayStr}`;
      const isToday = cellIso === todayStr;

      const dayTasks = Store.tasks.filter(t => t.dueDate === cellIso);

      html += `
        <div class="cal-day-cell ${isToday ? 'is-today' : ''}" onclick="App.openTaskModalPrefill({ dueDate: '${cellIso}' })">
          <span class="cal-day-number">${day}</span>
          <div class="cal-day-tasks">
            ${dayTasks.map(t => `
              <div class="cal-task-pill" onclick="event.stopPropagation(); App.openTaskModal('${t.id}')" title="${t.title}">
                ${t.title}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    html += '</div>';
    area.innerHTML = html;
  },

  renderWeek(area) {
    const curr = new Date(this.viewDate);
    const first = curr.getDate() - curr.getDay();
    const weekDays = [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < 7; i++) {
      const next = new Date(curr.getTime());
      next.setDate(first + i);
      const y = next.getFullYear();
      const m = String(next.getMonth() + 1).padStart(2, '0');
      const d = String(next.getDate()).padStart(2, '0');
      weekDays.push({
        iso: `${y}-${m}-${d}`,
        label: dayNames[i],
        dayNum: next.getDate()
      });
    }

    area.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; min-height: 400px;">
        ${weekDays.map(d => {
          const tasks = Store.tasks.filter(t => t.dueDate === d.iso);
          return `
            <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 12px; display: flex; flex-direction: column;">
              <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">${d.label}</span>
                <span style="font-size: 14px; font-weight: 800;">${d.dayNum}</span>
              </div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 6px; overflow-y: auto;">
                ${tasks.map(t => `
                  <div style="background: var(--bg-card); padding: 8px; border-radius: var(--radius-md); font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid var(--border-color);" onclick="App.openTaskModal('${t.id}')">
                    ${t.title}
                  </div>
                `).join('')}
              </div>
              <button class="btn btn-outline btn-sm" style="margin-top: 8px;" onclick="App.openTaskModalPrefill({ dueDate: '${d.iso}' })">+ Tarefa</button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderDay(area) {
    const y = this.viewDate.getFullYear();
    const m = String(this.viewDate.getMonth() + 1).padStart(2, '0');
    const d = String(this.viewDate.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    const tasks = Store.tasks.filter(t => t.dueDate === iso);

    area.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 16px; font-weight: 700;">Tarefas deste dia (${tasks.length})</h3>
          <button class="btn btn-primary btn-sm" onclick="App.openTaskModalPrefill({ dueDate: '${iso}' })">+ Criar para este dia</button>
        </div>
        ${tasks.length === 0 ? '<p style="text-align: center; color: var(--text-muted); padding: 40px 0;">Nenhuma tarefa agendada para esta data.</p>' : tasks.map(t => App.renderTaskRowHtml(t)).join('')}
      </div>
    `;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
