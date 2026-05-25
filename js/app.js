// app.js — Main entry point. Wires all modules together.
import { initNav, showSection, showRole } from './nav.js';
import { initClock } from './clock.js';
import { initRespawnCalc, initDeathCalc } from './calculators.js';
import { initChecklist, resetAll, updateFooter, initAllInContainer } from './checklist.js';
import { WIN_CONDITIONS } from './data.js';
import { initLogs } from './logs-ui.js';

// ── Sections manifest ──
const SECTIONS = [
  { id: 'timers',     label: '01 Timers'     },
  { id: 'waves',      label: '02 Waves'      },
  { id: 'gold',       label: '03 Gold'       },
  { id: 'mid',        label: '04 Mid-Game'   },
  { id: 'vision',     label: '05 Vision'     },
  { id: 'baron',      label: '06 Baron'      },
  { id: 'checklists', label: '07 Checklists' },
  { id: 'roles',      label: '08 Roles'      },
  { id: 'wincond',    label: '09 Win Cond'   },
  { id: 'notes',      label: '10 Notes'      },
  { id: 'logs',       label: '11 Game Log'   },
];

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initNav(SECTIONS);
  initClock();
  updateFooter();
});

// ── Wire up each section after it loads ──
document.addEventListener('sectionLoaded', ({ detail: { id } }) => {
  const sec = document.getElementById('sec-' + id);
  if (!sec) return;

  switch (id) {
    case 'timers':
      initRespawnCalc('calc-respawn');
      initDeathCalc('calc-death');
      break;

    case 'checklists':
      initChecklist('cl-pregame');
      initChecklist('cl-laning');
      initChecklist('cl-postfight');
      initChecklist('cl-behind');
      initChecklist('cl-endgame');
      initChecklist('cl-mistakes');
      sec.querySelector('[data-action="reset-all"]')
        ?.addEventListener('click', resetAll);
      break;

    case 'baron':
      initChecklist('cl-baron');
      break;

    case 'vision':
      initChecklist('cl-vision-early');
      initChecklist('cl-vision-mid');
      break;

    case 'waves':
      initChecklist('cl-roam');
      break;

    case 'roles':
      // Wire role tabs
      sec.querySelectorAll('.role-tab').forEach(btn => {
        btn.addEventListener('click', () => showRole(btn.dataset.role));
      });
      // Wire role checklists
      ['cl-top', 'cl-bot', 'cl-jungle', 'cl-support', 'cl-mid'].forEach(initChecklist);
      // Activate first tab
      showRole('top');
      break;

    case 'wincond':
      initWinCondition(sec);
      break;

    case 'notes':
      initNotes(sec);
      break;

    case 'logs':
      initLogs(sec);
      break;
  }

  // Also catch any remaining checklists via data attribute
  initAllInContainer(sec);
  updateFooter();
});

// ── Win Condition ──
function initWinCondition(container) {
  const output = container.querySelector('#wc-output');
  const saved  = localStorage.getItem('macro-codex-wc');

  container.querySelectorAll('.wc-option').forEach(opt => {
    const type = opt.dataset.wc;
    if (saved === type) {
      opt.classList.add('selected');
      if (output) { output.textContent = WIN_CONDITIONS[type]?.plan || ''; output.classList.add('active'); }
    }
    opt.addEventListener('click', () => {
      container.querySelectorAll('.wc-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const plan = WIN_CONDITIONS[type]?.plan || '';
      if (output) { output.textContent = plan; output.classList.add('active'); }
      localStorage.setItem('macro-codex-wc', type);
    });
  });
}

// ── Notes ──
function initNotes(container) {
  const area    = container.querySelector('#notes-area');
  const saveBtn = container.querySelector('#notes-save');
  const status  = container.querySelector('#notes-saved');
  const clearBtn = container.querySelector('#notes-clear');

  if (area) {
    area.value = localStorage.getItem('macro-codex-notes') || '';
    area.addEventListener('input', () => save());
  }

  function save() {
    if (area) localStorage.setItem('macro-codex-notes', area.value);
    if (status) { status.classList.add('visible'); setTimeout(() => status.classList.remove('visible'), 2000); }
  }

  saveBtn?.addEventListener('click', save);
  clearBtn?.addEventListener('click', () => {
    if (area) area.value = '';
    localStorage.removeItem('macro-codex-notes');
  });
}

// ── Global escape hatch for inline onclick= attributes in section HTML ──
// (allows simple onclick="app.showSection('baron')" in section HTML if needed)
window.app = { showSection, showRole };
