// checklist.js — All interactive checklist logic with localStorage persistence

const STORAGE_KEY = 'macro-codex-v1';

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { /* quota exceeded, ignore */ }
}

let state = loadState();

// ── Wire up a checklist container by its listId ──
export function initChecklist(listId) {
  const container = document.getElementById(listId);
  if (!container) return;

  const items    = container.querySelectorAll('.check-item, .priority-item');
  const fillEl   = container.querySelector('.progress-fill');
  const countEl  = container.querySelector('.progress-count');
  const allBtn   = container.querySelector('.cl-btn[data-action="all"]');
  const resetBtn = container.querySelector('.cl-btn[data-action="reset"]');

  // Restore saved state
  const saved = state[listId] || [];
  items.forEach((item, i) => {
    if (saved.includes(i)) item.classList.add('checked');
    item.addEventListener('click', () => toggle(item, i, listId, items, fillEl, countEl));
  });

  if (allBtn)   allBtn.addEventListener('click',   () => checkAll(listId, items, fillEl, countEl));
  if (resetBtn) resetBtn.addEventListener('click', () => clearList(listId, items, fillEl, countEl));

  updateProgress(listId, items, fillEl, countEl);
}

function toggle(item, index, listId, items, fillEl, countEl) {
  item.classList.toggle('checked');
  persist(listId, items);
  updateProgress(listId, items, fillEl, countEl);
  updateFooter();
}

export function checkAll(listId, items, fillEl, countEl) {
  if (!items) {
    const container = document.getElementById(listId);
    if (!container) return;
    items  = container.querySelectorAll('.check-item, .priority-item');
    fillEl = container.querySelector('.progress-fill');
    countEl = container.querySelector('.progress-count');
  }
  items.forEach(item => item.classList.add('checked'));
  persist(listId, items);
  updateProgress(listId, items, fillEl, countEl);
  updateFooter();
}

export function clearList(listId, items, fillEl, countEl) {
  if (!items) {
    const container = document.getElementById(listId);
    if (!container) return;
    items  = container.querySelectorAll('.check-item, .priority-item');
    fillEl = container.querySelector('.progress-fill');
    countEl = container.querySelector('.progress-count');
  }
  items.forEach(item => item.classList.remove('checked'));
  delete state[listId];
  saveState(state);
  updateProgress(listId, items, fillEl, countEl);
  updateFooter();
}

export function resetAll() {
  document.querySelectorAll('.check-item, .priority-item').forEach(el => el.classList.remove('checked'));
  state = {};
  saveState(state);
  document.querySelectorAll('.progress-fill').forEach(el => { el.style.width = '0%'; el.classList.remove('complete'); });
  document.querySelectorAll('.progress-count').forEach(el => {
    const list = el.closest('[id]');
    if (list) {
      const n = list.querySelectorAll('.check-item, .priority-item').length;
      el.textContent = `0 / ${n}`;
    }
  });
  updateFooter();
}

function persist(listId, items) {
  const checked = [];
  items.forEach((item, i) => { if (item.classList.contains('checked')) checked.push(i); });
  state[listId] = checked;
  saveState(state);
}

function updateProgress(listId, items, fillEl, countEl) {
  if (!items) return;
  const total = items.length;
  const done  = [...items].filter(el => el.classList.contains('checked')).length;
  const pct   = total > 0 ? Math.round(done / total * 100) : 0;
  if (fillEl)  { fillEl.style.width = pct + '%'; fillEl.classList.toggle('complete', pct === 100); }
  if (countEl) countEl.textContent = `${done} / ${total}`;
}

export function updateFooter() {
  const total = document.querySelectorAll('.check-item.checked, .priority-item.checked').length;
  const el = document.getElementById('footer-checks');
  if (el) el.textContent = `${total} check${total !== 1 ? 's' : ''} this session`;
}

// Wire up all checklists found in a freshly-loaded section
export function initAllInContainer(container) {
  container.querySelectorAll('[data-checklist]').forEach(el => {
    initChecklist(el.dataset.checklist || el.id);
  });
}
