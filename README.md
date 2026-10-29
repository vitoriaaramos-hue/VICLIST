# Orbit - Assistente Pessoal de Produtividade & Gerenciador de Tarefas

O **Orbit** é uma plataforma moderna, intuitiva e completa de organização pessoal e gerenciamento de tarefas inspirada nos melhores produtos de produtividade do mercado (como Notion, Todoist e Linear), desenvolvida inteiramente com **HTML5, CSS3 e JavaScript puro (Vanilla)**.

Sem dependências externas pesadas ou necessidade de processos de build complexos: basta abrir o arquivo `index.html` diretamente em qualquer navegador!

---

## 🌟 Funcionalidades Principais

### 1. 📊 Dashboard Inteligente
- Saudação dinâmica personalizada de acordo com o turno do dia (*Bom dia*, *Boa tarde*, *Boa noite*).
- Data atual em português com contadores de tarefas para o dia e tarefas com prazo expirado.
- Barra de progresso interativa calculada a partir das atividades reais.
- Lista prioritária de tarefas urgentes e de alta importância.
- Acompanhamento rápido dos hábitos diários diretamente na tela inicial.
- Entrada ultrarrápida (*Quick Task Input*) para criar novas atividades em segundos.

### 2. ✅ Gestão Completa de Tarefas (CRUD & Checklist)
- **Criação e Edição Completa**: Título, descrição rica, data de vencimento, horário, prioridade (*Baixa*, *Média*, *Alta*, *Urgente*), status (*A Fazer*, *Em Andamento*, *Concluída*), categoria, projeto e etiquetas.
- **Checklists e Subtarefas**: Permite adicionar múltiplos itens de checklist com progresso automático.
- **Etiquetas (Tags)**: Classificação customizável por hashtags.
- **Badges Inteligentes de Prazo**: Identificação automática de tarefas *Hoje*, *Amanhã*, *Atrasada* ou por data formatada.
- **Filtros Avançados**: Por status, prioridade, categoria, projeto, período e busca textual em tempo real.
- **Ordenação**: Por prazo mais próximo, maior prioridade, mais recentes ou ordem alfabética.
- **Duplicação de Tarefas**: Duplique qualquer tarefa com 1 clique.
- **Efeito Confetti**: Animação nativa de celebração em Canvas ao concluir atividades.

### 3. 📅 Minha Agenda / Calendário
- Três modos de visualização: **Mês**, **Semana** e **Dia**.
- Navegação entre meses (*Anterior*, *Próximo*, *Hoje*).
- Clique direto em qualquer dia do calendário para criar tarefas com a data preenchida.
- Destaque para tarefas atrasadas e vencimentos imediatos.

### 4. 📌 Quadro Kanban Visual
- Colunas estruturadas: **A Fazer**, **Em Andamento** e **Concluído**.
- Arraste e solte (*HTML5 Drag and Drop*) nativo, leve e responsivo.
- Botão rápido `+` para criar tarefas já na coluna de destino.
- Badges visuais de prioridade, etiquetas e contadores de subtarefas em cada card.

### 5. 🎯 Gestão de Projetos
- Crie iniciativas com nome, descrição, cor de identificação e prazo final (*Deadline*).
- Medidor de progresso percentual calculado a partir das tarefas associadas.
- Contagem em tempo real de tarefas pendentes e concluídas por projeto.

### 6. 🔥 Acompanhamento de Hábitos & Rotina
- Rastreador diário e semanal para hábitos recorrentes (ex: beber água, leitura, exercícios físicos, meditação).
- Histórico visual dos últimos 7 dias com marcação interativa por clique.
- Contador de sequência (*Streak*) de dias consecutivos sem quebrar o hábito.
- Medidor percentual de consistência diária.

### 7. 📈 Estatísticas & Métricas de Produtividade
- Gráfico de área em Canvas: **Evolução da semana** (tarefas criadas vs concluídas nos últimos 7 dias).
- Gráfico de barras em Canvas: **Distribuição por prioridade**.
- Indicadores visuais: **Volume e taxa de conclusão por categoria**.
- Todos os gráficos calculados dinamicamente a partir dos dados reais do usuário.

### 8. 🏷️ Categorias Personalizáveis
- Categorias padrão: *Trabalho*, *Estudos*, *Pessoal*, *Saúde*, *Projetos*, *Finanças*.
- Criador e editor de categorias com paleta de cores e seleção de ícones modernos.

### 9. ⚙️ Configurações & Persistência
- Alternância entre **Modo Claro**, **Modo Escuro** e **Sincronizado com o Sistema**.
- Perfil do usuário: Nome, cargo, e-mail e URL do avatar.
- **Backup e Restauração**:
  - Exportação completa em arquivo `JSON` com 1 clique.
  - Importação de backup para restaurar dados em qualquer navegador ou computador.
  - Opção para restaurar os dados de demonstração iniciais.

### 10. ⌨️ Atalhos de Teclado
- `Ctrl + K` ou `Cmd + K`: Busca rápida global (tarefas, projetos e categorias).
- `N` ou `C`: Criar nova tarefa imediatamente.
- `Ctrl + /`: Guia de atalhos em pop-up.
- `ESC`: Fechar modais e janelas.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semântico**: Estrutura acessível e moderna.
- **CSS3 Moderno**: Variáveis CSS (Custom Properties), Flexbox, Grid e suporte nativo a Dark Mode.
- **JavaScript ES6+ (Vanilla)**: Manipulação nativa da DOM, Canvas API para gráficos de alta performance e confetti nativo.
- **LocalStorage API**: Persistência de dados offline-first sem necessidade de servidor ou banco externo.

---

## 🚀 Como Executar o Projeto

### Opção 1: Direto no Navegador (Mais Rápido)
Basta dar dois cliques no arquivo `index.html` ou abri-lo com qualquer navegador moderno (Chrome, Edge, Firefox, Safari).

### Opção 2: Servidor Local (Python / Node / Live Server)
Se desejar executar através de um servidor HTTP local:

```bash
# Com Python 3:
python -m http.server 8000

# Ou com Node.js (npx serve):
npx serve .
```

Acesse em `http://localhost:8000`.
