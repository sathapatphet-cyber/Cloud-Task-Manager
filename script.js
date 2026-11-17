// Replace only if you later create a different API.
const API_BASE = 'https://bpbirk4at4.execute-api.us-east-1.amazonaws.com';
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const message = document.getElementById('message');
const count = document.getElementById('count');
const submitButton = document.getElementById('submitButton');

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || payload?.message || `HTTP ${res.status}`);
  return payload;
}

async function loadTasks() {
  message.textContent = '';
  taskList.replaceChildren();
  try {
    const tasks = await apiRequest('/tasks');
    if (!Array.isArray(tasks)) throw new Error('Unexpected response from API');
    tasks.sort((a,b)=>String(a.title||'').localeCompare(String(b.title||'')));
    count.textContent = tasks.length;
    if (tasks.length === 0) {
      const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'No tasks yet. Create your first one above.'; taskList.append(empty);
    }
    for (const task of tasks) taskList.append(renderTask(task));
  } catch (err) {
    message.textContent = `Could not load tasks: ${err.message}. Check your API URL and CORS settings.`;
  }
}

function makeButton(text, handler, cssClass='') {
  const button = document.createElement('button');
  button.type = 'button'; button.textContent = text; button.className = cssClass;
  button.addEventListener('click', handler);
  return button;
}

function renderTask(task) {
  const card = document.createElement('article'); card.className = 'task';
  const head = document.createElement('div'); head.className = 'task-head';
  const title = document.createElement('h3'); title.textContent = task.title || '(untitled)';
  const badge = document.createElement('span'); badge.className = 'status' + (task.status === 'Completed'?' done':''); badge.textContent = task.status || 'Pending';
  head.append(title,badge);
  const detail = document.createElement('p'); detail.textContent = task.description || 'No description';
  const actions = document.createElement('div'); actions.className = 'actions';
  actions.append(
    makeButton('Edit', () => editTask(task)),
    makeButton(task.status === 'Completed'?'Mark pending':'Mark completed', () => setStatus(task, task.status === 'Completed'?'Pending':'Completed')),
    makeButton('Delete', () => deleteTask(task), 'danger')
  );
  card.append(head,detail,actions);
  return card;
}

async function saveUpdate(task, fields) {
  try {
    await apiRequest(`/tasks/${encodeURIComponent(task.taskId)}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...task,...fields})
    });
    await loadTasks();
  } catch (err) { alert('Could not update task: ' + err.message); }
}

async function editTask(task) {
  const title = prompt('Task title:', task.title || '');
  if (title === null) return;
  if (!title.trim()) { alert('Title cannot be empty.'); return; }
  const description = prompt('Description:', task.description || '');
  if (description === null) return;
  await saveUpdate(task, {title:title.trim(),description});
}

async function setStatus(task, status) { await saveUpdate(task,{status}); }
async function deleteTask(task) {
  if (!confirm(`Delete "${task.title}"?`)) return;
  try {
    await apiRequest(`/tasks/${encodeURIComponent(task.taskId)}`,{method:'DELETE'});
    await loadTasks();
  } catch (err) { alert('Could not delete task: '+err.message); }
}

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  if (!title) return;
  submitButton.disabled = true;
  try {
    await apiRequest('/tasks', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title,description})});
    taskForm.reset();
    await loadTasks();
  } catch (err) { message.textContent = 'Could not add task: '+err.message; }
  finally { submitButton.disabled = false; }
});
document.getElementById('refreshButton').addEventListener('click',loadTasks);
loadTasks();
