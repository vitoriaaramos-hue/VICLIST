/**
 * Orbit - Data Store & Persistence
 * Camada completa de dados offline-first com localStorage
 */

const STORAGE_KEYS = {
  TASKS: 'orbit_tasks_v2',
  CATEGORIES: 'orbit_categories_v2',
  PROJECTS: 'orbit_projects_v2',
  HABITS: 'orbit_habits_v2',
  USER: 'orbit_user_v2',
  THEME: 'orbit_theme_v2',
};

// Data Formatter Helpers
function getTodayIso() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysIso(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_CATEGORIES = [
  { id: 'cat-work', name: 'Trabalho', color: '#6366f1', icon: 'briefcase', description: 'Reuniões, entregas e metas profissionais' },
  { id: 'cat-study', name: 'Estudos', color: '#a855f7', icon: 'graduationCap', description: 'Cursos, leitura e certificações' },
  { id: 'cat-personal', name: 'Pessoal', color: '#3b82f6', icon: 'user', description: 'Compromissos e vida particular' },
  { id: 'cat-health', name: 'Saúde', color: '#10b981', icon: 'heartPulse', description: 'Treinos, consultas e bem-estar' },
  { id: 'cat-projects', name: 'Projetos', color: '#f59e0b', icon: 'folder', description: 'Iniciativas de médio e longo prazo' },
  { id: 'cat-finances', name: 'Finanças', color: '#06b6d4', icon: 'wallet', description: 'Contas, investimentos e planejamento' },
];

const DEFAULT_PROJECTS = [
  {
    id: 'proj-redesign',
    name: 'Redesign do Aplicativo Web',
    description: 'Reformulação da identidade visual e fluxo de experiência do usuário.',
    color: '#6366f1',
    deadline: addDaysIso(18),
    createdAt: addDaysIso(-10)
  },
  {
    id: 'proj-cert',
    name: 'Certificação Cloud Architecture',
    description: 'Estudos diários para o exame profissional e laboratórios práticos.',
    color: '#a855f7',
    deadline: addDaysIso(40),
    createdAt: addDaysIso(-12)
  },
  {
    id: 'proj-lifestyle',
    name: 'Rotina Saudável 2026',
    description: 'Manter consistência nos treinos, ingestão hídrica e sono de qualidade.',
    color: '#10b981',
    deadline: addDaysIso(60),
    createdAt: addDaysIso(-20)
  }
];

function generateInitialTasks() {
  const today = getTodayIso();
  const yesterday = addDaysIso(-1);
  const tomorrow = addDaysIso(1);
  const in3Days = addDaysIso(3);
  const in5Days = addDaysIso(5);

  return [
    {
      id: 'task-1',
      title: 'Apresentar proposta de arquitetura para a equipe',
      description: 'Revisar os diagramas de blocos, cronograma de entregas e fluxo de dados do novo sistema.',
      dueDate: today,
      dueTime: '15:30',
      priority: 'urgent',
      status: 'in_progress',
      categoryId: 'cat-work',
      projectId: 'proj-redesign',
      subtasks: [
        { id: 'sub-1', title: 'Ajustar slides do fluxo de autenticação', completed: true },
        { id: 'sub-2', title: 'Exportar métricas de performance estimadas', completed: true },
        { id: 'sub-3', title: 'Compartilhar pauta no canal do Slack', completed: false }
      ],
      tags: ['Arquitetura', 'Q4', 'Prioritário'],
      createdAt: addDaysIso(-2)
    },
    {
      id: 'task-2',
      title: 'Finalizar módulo de persistência e testes',
      description: 'Garantir cobertura de testes unitários para a camada de armazenamento local e sincronização.',
      dueDate: today,
      dueTime: '18:00',
      priority: 'high',
      status: 'todo',
      categoryId: 'cat-projects',
      projectId: 'proj-redesign',
      subtasks: [
        { id: 'sub-4', title: 'Testar salvamento automático de rascunhos', completed: false },
        { id: 'sub-5', title: 'Validar importação e exportação de backups JSON', completed: false }
      ],
      tags: ['Frontend', 'Qualidade'],
      createdAt: addDaysIso(-1)
    },
    {
      id: 'task-3',
      title: 'Revisar relatório financeiro mensal e conciliação',
      description: 'Conferir despesas operacionais da empresa e atualizar planilha orçamentária.',
      dueDate: yesterday,
      dueTime: '17:00',
      priority: 'high',
      status: 'todo',
      categoryId: 'cat-finances',
      subtasks: [
        { id: 'sub-6', title: 'Baixar extratos bancários em PDF', completed: true },
        { id: 'sub-7', title: 'Lançar comprovantes de despesas reembolsáveis', completed: false }
      ],
      tags: ['Contabilidade', 'Urgente'],
      createdAt: addDaysIso(-3)
    },
    {
      id: 'task-4',
      title: 'Comprar itens do almoço e suplementos',
      description: 'Passar no mercado após o treino da manhã para repor frutas, aveia e creatina.',
      dueDate: today,
      dueTime: '12:30',
      priority: 'medium',
      status: 'completed',
      categoryId: 'cat-health',
      projectId: 'proj-lifestyle',
      subtasks: [
        { id: 'sub-8', title: 'Frutas da estação', completed: true },
        { id: 'sub-9', title: 'Castanhas e aveia', completed: true }
      ],
      tags: ['Mercado', 'Alimentação'],
      createdAt: addDaysIso(-1),
      completedAt: today
    },
    {
      id: 'task-5',
      title: 'Capítulo 4: Padrões de Projeto em Sistemas Distribuídos',
      description: 'Anotar os principais insights sobre consistência eventual e replicação de dados.',
      dueDate: tomorrow,
      dueTime: '20:00',
      priority: 'medium',
      status: 'todo',
      categoryId: 'cat-study',
      projectId: 'proj-cert',
      subtasks: [
        { id: 'sub-10', title: 'Ler 25 páginas', completed: false },
        { id: 'sub-11', title: 'Criar flashcards de revisão no Anki', completed: false }
      ],
      tags: ['Livro', 'Certificação'],
      createdAt: today
    },
    {
      id: 'task-6',
      title: 'Agendar consulta anual com cardiologista',
      description: 'Ligar para a clínica ou agendar pelo aplicativo do convênio.',
      dueDate: in3Days,
      dueTime: '10:00',
      priority: 'low',
      status: 'todo',
      categoryId: 'cat-health',
      subtasks: [],
      tags: ['Checkup', 'Saúde'],
      createdAt: today
    },
    {
      id: 'task-7',
      title: 'Planejar roteiro das férias de fim de ano',
      description: 'Pesquisar passagens, acomodações e principais pontos turísticos.',
      dueDate: in5Days,
      dueTime: '',
      priority: 'low',
      status: 'todo',
      categoryId: 'cat-personal',
      subtasks: [
        { id: 'sub-12', title: 'Comparar preços de passagens', completed: false },
        { id: 'sub-13', title: 'Listar opções de hospedagem próximas à praia', completed: false }
      ],
      tags: ['Viagem', 'Férias'],
      createdAt: today
    },
    {
      id: 'task-8',
      title: 'Daily Standup com equipe de desenvolvimento',
      description: 'Alinhamento rápido de 15 minutos sobre as entregas do dia.',
      dueDate: today,
      dueTime: '09:00',
      priority: 'medium',
      status: 'completed',
      categoryId: 'cat-work',
      subtasks: [],
      tags: ['Agile', 'Reunião'],
      createdAt: yesterday,
      completedAt: today
    }
  ];
}

function generateInitialHabits() {
  const today = getTodayIso();
  const d1 = addDaysIso(-1);
  const d2 = addDaysIso(-2);
  const d3 = addDaysIso(-3);

  return [
    {
      id: 'hab-1',
      title: 'Beber 2.5L de água',
      description: 'Manter garrafa sempre por perto e monitorar ao longo do dia',
      frequency: 'daily',
      color: '#06b6d4',
      icon: 'sparkles',
      completedDates: [d2, d1, today],
      streak: 3,
      createdAt: addDaysIso(-25)
    },
    {
      id: 'hab-2',
      title: 'Ler 20 páginas de um livro',
      description: 'Leitura focada antes de dormir ou após o almoço',
      frequency: 'daily',
      color: '#a855f7',
      icon: 'bookOpen',
      completedDates: [d3, d2, d1],
      streak: 3,
      createdAt: addDaysIso(-20)
    },
    {
      id: 'hab-3',
      title: 'Exercício físico ou caminhada',
      description: 'Ao menos 40 minutos de movimentação ativa',
      frequency: 'daily',
      color: '#10b981',
      icon: 'dumbbell',
      completedDates: [d2, today],
      streak: 1,
      createdAt: addDaysIso(-30)
    },
    {
      id: 'hab-4',
      title: 'Meditação / Respiração (10m)',
      description: 'Pausa matinal para foco e redução de estresse',
      frequency: 'daily',
      color: '#6366f1',
      icon: 'smile',
      completedDates: [d1, today],
      streak: 2,
      createdAt: addDaysIso(-15)
    }
  ];
}

const DEFAULT_USER = {
  userName: 'Lucas Silva',
  userEmail: 'lucas.silva@exemplo.com',
  userTitle: 'Engenheiro de Software & Produtividade',
  userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  theme: 'light',
  defaultPriority: 'medium',
  notificationsEnabled: true
};

// Store Object
const Store = {
  tasks: [],
  categories: [],
  projects: [],
  habits: [],
  user: { ...DEFAULT_USER },
  listeners: [],

  init() {
    this.load();
    this.applyTheme();
  },

  load() {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      this.tasks = savedTasks ? JSON.parse(savedTasks) : generateInitialTasks();

      const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      this.categories = savedCategories ? JSON.parse(savedCategories) : DEFAULT_CATEGORIES;

      const savedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      this.projects = savedProjects ? JSON.parse(savedProjects) : DEFAULT_PROJECTS;

      const savedHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
      this.habits = savedHabits ? JSON.parse(savedHabits) : generateInitialHabits();

      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        this.user = { ...DEFAULT_USER, ...JSON.parse(savedUser) };
      }
    } catch (e) {
      console.error('Erro ao carregar dados do LocalStorage:', e);
      this.tasks = generateInitialTasks();
      this.categories = DEFAULT_CATEGORIES;
      this.projects = DEFAULT_PROJECTS;
      this.habits = generateInitialHabits();
      this.user = { ...DEFAULT_USER };
    }
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(this.habits));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user));
    } catch (e) {
      console.error('Erro ao salvar no LocalStorage:', e);
    }
    this.notify();
  },

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    for (let listener of this.listeners) {
      listener();
    }
  },

  applyTheme() {
    const theme = this.user.theme || 'light';
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  },

  setTheme(theme) {
    this.user.theme = theme;
    this.applyTheme();
    this.save();
  },

  // Task Operations
  createTask(data) {
    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      dueDate: data.dueDate || '',
      dueTime: data.dueTime || '',
      priority: data.priority || 'medium',
      status: data.status || 'todo',
      categoryId: data.categoryId || this.categories[0]?.id || 'cat-work',
      projectId: data.projectId || '',
      subtasks: data.subtasks || [],
      tags: data.tags || [],
      createdAt: getTodayIso()
    };
    this.tasks.unshift(newTask);
    this.save();
    return newTask;
  },

  updateTask(id, updates) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const current = this.tasks[idx];
      const isFinishing = updates.status === 'completed' && current.status !== 'completed';
      this.tasks[idx] = {
        ...current,
        ...updates,
        completedAt: isFinishing ? getTodayIso() : (updates.status && updates.status !== 'completed' ? null : current.completedAt)
      };
      if (isFinishing) fireConfetti();
      this.save();
    }
  },

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save();
  },

  toggleTaskComplete(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      const nowDone = task.status !== 'completed';
      task.status = nowDone ? 'completed' : 'todo';
      task.completedAt = nowDone ? getTodayIso() : null;
      if (nowDone) fireConfetti();
      this.save();
    }
  },

  duplicateTask(id) {
    const source = this.tasks.find(t => t.id === id);
    if (source) {
      const duplicated = {
        ...source,
        id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        title: source.title + ' (Cópia)',
        status: 'todo',
        createdAt: getTodayIso(),
        completedAt: null
      };
      this.tasks.unshift(duplicated);
      this.save();
    }
  },

  toggleSubtask(taskId, subtaskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task && task.subtasks) {
      const st = task.subtasks.find(s => s.id === subtaskId);
      if (st) {
        st.completed = !st.completed;
        const allCompleted = task.subtasks.length > 0 && task.subtasks.every(s => s.completed);
        if (allCompleted && task.status !== 'completed') {
          task.status = 'completed';
          task.completedAt = getTodayIso();
          fireConfetti();
        }
        this.save();
      }
    }
  },

  // Project Operations
  createProject(data) {
    const newProject = {
      id: 'proj-' + Date.now(),
      name: data.name.trim(),
      description: data.description ? data.description.trim() : '',
      color: data.color || '#6366f1',
      deadline: data.deadline || '',
      createdAt: getTodayIso()
    };
    this.projects.push(newProject);
    this.save();
    return newProject;
  },

  updateProject(id, updates) {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.projects[idx] = { ...this.projects[idx], ...updates };
      this.save();
    }
  },

  deleteProject(id) {
    this.projects = this.projects.filter(p => p.id !== id);
    // Unlink tasks
    this.tasks.forEach(t => {
      if (t.projectId === id) t.projectId = '';
    });
    this.save();
  },

  // Habit Operations
  createHabit(data) {
    const newHabit = {
      id: 'hab-' + Date.now(),
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      frequency: data.frequency || 'daily',
      color: data.color || '#6366f1',
      icon: data.icon || 'flame',
      completedDates: [],
      streak: 0,
      createdAt: getTodayIso()
    };
    this.habits.push(newHabit);
    this.save();
    return newHabit;
  },

  updateHabit(id, updates) {
    const idx = this.habits.findIndex(h => h.id === id);
    if (idx !== -1) {
      this.habits[idx] = { ...this.habits[idx], ...updates };
      this.save();
    }
  },

  deleteHabit(id) {
    this.habits = this.habits.filter(h => h.id !== id);
    this.save();
  },

  toggleHabitDate(id, dateStr) {
    const habit = this.habits.find(h => h.id === id);
    if (habit) {
      const hasDate = habit.completedDates.includes(dateStr);
      if (hasDate) {
        habit.completedDates = habit.completedDates.filter(d => d !== dateStr);
      } else {
        habit.completedDates.push(dateStr);
        fireConfetti();
      }

      // Recompute streak
      const todayStr = getTodayIso();
      let streak = 0;
      let check = new Date();
      if (!habit.completedDates.includes(todayStr)) {
        check.setDate(check.getDate() - 1);
      }

      for (let i = 0; i < 365; i++) {
        const year = check.getFullYear();
        const month = String(check.getMonth() + 1).padStart(2, '0');
        const day = String(check.getDate()).padStart(2, '0');
        const dStr = `${year}-${month}-${day}`;
        if (habit.completedDates.includes(dStr)) {
          streak++;
          check.setDate(check.getDate() - 1);
        } else {
          break;
        }
      }
      habit.streak = streak;
      this.save();
    }
  },

  // Category Operations
  createCategory(data) {
    const newCat = {
      id: 'cat-' + Date.now(),
      name: data.name.trim(),
      description: data.description ? data.description.trim() : '',
      color: data.color || '#6366f1',
      icon: data.icon || 'folder'
    };
    this.categories.push(newCat);
    this.save();
    return newCat;
  },

  updateCategory(id, updates) {
    const idx = this.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.categories[idx] = { ...this.categories[idx], ...updates };
      this.save();
    }
  },

  deleteCategory(id) {
    this.categories = this.categories.filter(c => c.id !== id);
    this.save();
  },

  // Profile Update
  updateProfile(data) {
    this.user = { ...this.user, ...data };
    this.save();
  },

  // Backup & Reset
  exportJson() {
    const payload = {
      tasks: this.tasks,
      categories: this.categories,
      projects: this.projects,
      habits: this.habits,
      user: this.user,
      version: '2.0-vanilla',
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(payload, null, 2);
  },

  importJson(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.tasks)) this.tasks = data.tasks;
      if (Array.isArray(data.categories)) this.categories = data.categories;
      if (Array.isArray(data.projects)) this.projects = data.projects;
      if (Array.isArray(data.habits)) this.habits = data.habits;
      if (data.user) this.user = { ...DEFAULT_USER, ...data.user };
      this.save();
      this.applyTheme();
      return true;
    } catch (e) {
      console.error('Falha ao importar backup:', e);
      return false;
    }
  },

  resetAll() {
    this.tasks = generateInitialTasks();
    this.categories = DEFAULT_CATEGORIES;
    this.projects = DEFAULT_PROJECTS;
    this.habits = generateInitialHabits();
    this.user = { ...DEFAULT_USER };
    this.save();
    this.applyTheme();
  }
};
