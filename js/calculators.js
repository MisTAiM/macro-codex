// calculators.js — Respawn and death window interactive calculators

const DEATH_TIMERS = [0, 6, 6, 8, 8, 10, 12, 16, 20, 25, 28, 32, 36, 40, 44, 47, 50, 52, 55];

function deathSeconds(level) {
  return DEATH_TIMERS[Math.min(level, 18)] ?? Math.round(6 + level * 2.8);
}

function deathAction(secs) {
  if (secs >= 50) return 'Full Baron + tower sequence';
  if (secs >= 40) return 'Baron attempt + escape route';
  if (secs >= 30) return 'One objective or two towers';
  if (secs >= 20) return 'Dragon or one tower';
  if (secs >= 12) return 'Tower plates only';
  return 'One wave clear';
}

function formatTime(totalSecs) {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function initRespawnCalc(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const minInput  = el.querySelector('[data-calc="min"]');
  const secInput  = el.querySelector('[data-calc="sec"]');
  const typeSelect = el.querySelector('[data-calc="type"]');
  const output    = el.querySelector('[data-calc="output"]');

  function update() {
    const m   = parseInt(minInput?.value) || 0;
    const s   = parseInt(secInput?.value) || 0;
    const add = parseInt(typeSelect?.value) || 6;
    const total = m * 60 + s + add * 60;
    const setup = total - 90;
    if (output) {
      output.textContent = `Respawns: ${formatTime(total)} | Setup by: ${formatTime(Math.max(0, setup))}`;
    }
  }

  [minInput, secInput, typeSelect].forEach(el => el?.addEventListener('input', update));
  update();
}

export function initDeathCalc(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const slider = el.querySelector('[data-calc="level"]');
  const label  = el.querySelector('[data-calc="level-out"]');
  const output = el.querySelector('[data-calc="output"]');

  function update() {
    const lvl  = parseInt(slider?.value) || 12;
    if (label) label.textContent = lvl;
    const secs = deathSeconds(lvl);
    if (output) output.textContent = `Dead ~${secs}s | Use window for: ${deathAction(secs)}`;
  }

  slider?.addEventListener('input', update);
  update();
}
