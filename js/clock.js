// clock.js — Game timer and phase phase indicator logic

let seconds  = 0;
let interval = null;
let running  = false;

const PHASES = [
  { id: 'ph-lane',  label: 'Lane',  start: 0,  end: 14 * 60 },
  { id: 'ph-mid',   label: 'Mid',   start: 14 * 60, end: 20 * 60 },
  { id: 'ph-baron', label: 'Baron', start: 20 * 60, end: 30 * 60 },
  { id: 'ph-elder', label: 'Elder', start: 30 * 60, end: Infinity },
];

export function initClock() {
  const startBtn = document.getElementById('clock-start');
  const resetBtn = document.getElementById('clock-reset');
  if (startBtn) startBtn.addEventListener('click', toggleClock);
  if (resetBtn) resetBtn.addEventListener('click', resetClock);
}

function toggleClock() {
  const btn = document.getElementById('clock-start');
  if (running) {
    clearInterval(interval);
    running = false;
    if (btn) { btn.textContent = 'RESUME'; btn.classList.remove('running'); }
  } else {
    interval = setInterval(tick, 1000);
    running = true;
    if (btn) { btn.textContent = 'PAUSE'; btn.classList.add('running'); }
  }
}

function resetClock() {
  clearInterval(interval);
  running = false;
  seconds = 0;
  const btn = document.getElementById('clock-start');
  if (btn) { btn.textContent = 'START'; btn.classList.remove('running'); }
  render();
}

function tick() {
  seconds++;
  render();
}

function render() {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const display = document.getElementById('clock-display');
  if (display) display.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  updatePhases();
}

function updatePhases() {
  PHASES.forEach(({ id, start, end }) => {
    const dot = document.getElementById(id);
    if (!dot) return;
    dot.classList.remove('active', 'done');
    if (seconds >= end)         dot.classList.add('done');
    else if (seconds >= start)  dot.classList.add('active');
  });
}
