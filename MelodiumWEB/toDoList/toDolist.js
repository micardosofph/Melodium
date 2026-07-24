/* ==========================================================================
   MELODIUM - LÓGICA DA LISTA DE TAREFAS (TO-DO)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const todoForm = document.getElementById('todoForm');
    const taskInput = document.getElementById('taskInput');
    const categorySelect = document.getElementById('categorySelect');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const completedCountEl = document.getElementById('completedCount');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Ícones para cada categoria
    const categoryIcons = {
        Tecnica: '🎸',
        Teoria: '🎼',
        Repertorio: '🎵',
        Outros: '📌'
    };

    // Estado da Aplicação (Carrega do LocalStorage se existir)
    let tasks = JSON.parse(localStorage.getItem('melodium_tasks')) || [];
    let currentFilter = 'all';

    // Salva o estado atual no LocalStorage
    function saveTasks() {
        localStorage.setItem('melodium_tasks', JSON.stringify(tasks));
    }

    // Atualiza o contador de progresso (Ex: 2 / 5)
    function updateCounter() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        completedCountEl.textContent = `${completed} / ${total}`;
    }

    // Renderiza a lista de tarefas
    function renderTasks() {
        // Filtragem
        let filteredTasks = tasks;
        if (currentFilter === 'pending') {
            filteredTasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(t => t.completed);
        }

        // Limpa a lista atual
        taskList.innerHTML = '';

        // Se não houver tarefas para exibir
        if (filteredTasks.length === 0) {
            taskList.appendChild(emptyState);
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';

            // Cria cada item da lista
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.setAttribute('data-id', task.id);

                const icon = categoryIcons[task.category] || '📌';

                li.innerHTML = `
                    <label class="task-checkbox-container" title="Marcar como concluída">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                    <div class="task-content">
                        <span class="task-title">${escapeHtml(task.text)}</span>
                        <span class="task-category-badge">${icon} ${task.category}</span>
                    </div>
                    <button class="btn-delete" title="Excluir tarefa" aria-label="Excluir tarefa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                `;

                // Evento para alternar estado (concluída / pendente)
                const checkbox = li.querySelector('.task-checkbox');
                checkbox.addEventListener('change', () => toggleTask(task.id));

                // Evento para excluir
                const deleteBtn = li.querySelector('.btn-delete');
                deleteBtn.addEventListener('click', () => deleteTask(task.id));

                taskList.appendChild(li);
            });
        }

        updateCounter();
    }

    // Utilitário para evitar XSS ao renderizar texto do usuário
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Adiciona uma nova tarefa
    function addTask(text, category) {
        const newTask = {
            id: Date.now().toString(),
            text: text.trim(),
            category: category,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask); // Adiciona no início da lista
        saveTasks();
        renderTasks();
    }

    // Alterna o status de concluído
    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }

    // Remove uma tarefa
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    // Listener do Formulário
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        const category = categorySelect.value;

        if (text) {
            addTask(text, category);
            taskInput.value = '';
            taskInput.focus();
        }
    });

    // Listeners dos Botões de Filtro
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // Inicialização
    renderTasks();
});