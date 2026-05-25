// logs-ui.js — UI wiring for the game log section
import {
  loadLogs, addLog, deleteLog, clearAllLogs,
  analyzeGameLog, analyzePatterns,
  severityColor, severityLabel, categoryIcon,
  LOG_FIELDS,
} from './logs.js';

// ── Benchmarks for live feedback ──
const BENCH = {
  csPerMin:    { good: 8.0,  ok: 6.5  },
  visionPerMin:{ good: 1.5,  ok: 1.0  },
};

export function initLogs(container) {
  // Tab switching
  container.querySelectorAll('.log-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.log-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.log-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
      if (tab.dataset.tab === 'log-history')  renderHistory(container);
      if (tab.dataset.tab === 'log-patterns') renderPatterns(container);
    });
  });

  // Toggle buttons
  container.querySelectorAll('.log-toggle-group').forEach(group => {
    group.querySelectorAll('.log-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.log-toggle').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });

  // Live benchmark feedback on numeric inputs
  container.querySelectorAll('.log-input[data-field]').forEach(input => {
    input.addEventListener('input', () => updateBench(container, input));
  });

  // Submit
  container.querySelector('#log-submit')?.addEventListener('click', () => submitLog(container));

  // Clear form
  container.querySelector('#log-clear-form')?.addEventListener('click', () => clearForm(container));

  // Back button (from analysis view)
  container.querySelector('#analysis-back')?.addEventListener('click', () => {
    document.getElementById('log-analysis').style.display = 'none';
    document.getElementById('log-form').classList.add('active');
    const tabs = container.querySelectorAll('.log-tab');
    tabs.forEach(t => t.classList.remove('active'));
    if (tabs[0]) tabs[0].classList.add('active');
  });

  // Clear all logs
  container.querySelector('#log-clear-all')?.addEventListener('click', () => {
    if (confirm('Clear all game logs? This cannot be undone.')) {
      clearAllLogs();
      renderHistory(container);
      renderPatterns(container);
    }
  });
}

// ── Build form data object from current UI state ──
function collectFormData(container) {
  const data = {};

  // Toggle groups
  container.querySelectorAll('.log-toggle-group').forEach(group => {
    const active = group.querySelector('.log-toggle.active');
    if (active) data[group.dataset.field] = active.dataset.val;
  });

  // Inputs and selects
  container.querySelectorAll('[data-field]').forEach(el => {
    if (el.classList.contains('log-toggle')) return; // handled above
    const val = el.value.trim();
    if (val !== '' && val !== '— select —') data[el.dataset.field] = val;
  });

  return data;
}

function clearForm(container) {
  container.querySelectorAll('.log-input, .log-textarea').forEach(el => el.value = '');
  container.querySelectorAll('.log-select').forEach(el => el.selectedIndex = 0);
  container.querySelectorAll('.log-toggle').forEach(b => b.classList.remove('active'));
  container.querySelectorAll('.log-bench').forEach(b => { b.textContent = ''; b.className = 'log-bench'; });
}

function submitLog(container) {
  const data = collectFormData(container);

  // Basic validation
  if (!data.result) { flash(container, 'Select Win or Loss'); return; }
  if (!data.role)   { flash(container, 'Select your role'); return; }

  // Run analysis
  const issues = analyzeGameLog(data);

  // Save
  addLog({ ...data, issueCount: issues.length, severities: issues.map(i => i.severity) });

  // Show analysis view
  showAnalysis(container, data, issues);
}

function showAnalysis(container, data, issues) {
  // Hide form panel, show analysis panel
  document.getElementById('log-form').classList.remove('active');
  const analysisPanel = document.getElementById('log-analysis');
  analysisPanel.style.display = 'block';

  // Title
  const result = (data.result || '?').toUpperCase();
  const champ  = data.champion ? ` — ${data.champion}` : '';
  const role   = data.role ? ` (${data.role.toUpperCase()})` : '';
  document.getElementById('analysis-title').textContent = `${result}${champ}${role}`;

  // Render issues
  const content = document.getElementById('analysis-content');
  if (!content) return;

  if (issues.length === 0) {
    content.innerHTML = `
      <div class="no-issues">
        ✓ No major macro issues detected this game.<br>
        <span style="color:var(--td);font-size:11px">Log more games to identify patterns over time.</span>
      </div>`;
    return;
  }

  content.innerHTML = `
    <div class="callout co-red" style="margin-bottom:16px">
      <strong>${issues.length} issue${issues.length > 1 ? 's' : ''} found.</strong> 
      Click each card to expand the full math, explanation, and fix.
      ${issues.filter(i => i.severity === 'critical').length > 0 ? ' <strong>Fix CRITICAL issues first.</strong>' : ''}
    </div>
    ${issues.map(renderIssueCard).join('')}
  `;

  // Wire expand/collapse
  content.querySelectorAll('.issue-header').forEach(hdr => {
    hdr.addEventListener('click', () => {
      hdr.closest('.issue-card').classList.toggle('expanded');
    });
  });

  // Auto-expand first card
  const first = content.querySelector('.issue-card');
  if (first) first.classList.add('expanded');
}

function renderIssueCard(issue) {
  const color = severityColor(issue.severity);
  const label = severityLabel(issue.severity);
  const icon  = categoryIcon(issue.category);

  return `
<div class="issue-card">
  <div class="issue-header">
    <span class="issue-severity" style="background:${color}22;color:${color};border:1px solid ${color}44">${label}</span>
    <span class="issue-title">${icon} ${issue.title}</span>
    <span class="issue-stat">${issue.stat}</span>
    <span class="issue-chevron">▼</span>
  </div>
  <div class="issue-body">
    <div class="issue-section">
      <div class="issue-section-label" style="color:var(--g)">The Math — What This Cost You</div>
      <div class="issue-math">${issue.math.trim()}</div>
    </div>
    <div class="issue-section">
      <div class="issue-section-label" style="color:var(--r)">Root Cause — Why You're Doing This</div>
      <div class="issue-why">${issue.why}</div>
    </div>
    <div class="issue-section">
      <div class="issue-section-label" style="color:var(--gr)">The Fix — Exactly What to Do</div>
      <div class="issue-fix">${issue.fix.trim()}</div>
    </div>
  </div>
</div>`;
}

// ── History ──
function renderHistory(container) {
  const logs = loadLogs();
  const list = container.querySelector('#history-list');
  if (!list) return;

  if (logs.length === 0) {
    list.innerHTML = '<div class="history-empty">No games logged yet. Log your first game to begin coaching analysis.</div>';
    return;
  }

  list.innerHTML = logs.map(log => {
    const sevColors = {
      critical: 'rgba(201,51,51,.15)',
      major:    'rgba(42,157,92,.15)',
      minor:    'rgba(42,127,201,.15)',
    };
    const sevTextColors = {
      critical: 'var(--r)',
      major:    'var(--gr)',
      minor:    'var(--bl)',
    };
    const tags = (log.severities || []).slice(0, 3).map(s =>
      `<span class="hi-issue-tag" style="background:${sevColors[s]};color:${sevTextColors[s]}">${severityLabel(s)}</span>`
    ).join('');

    return `
<div class="history-item ${log.result || ''}" data-id="${log.id}">
  <div class="hi-result ${log.result || ''}">${(log.result || '?').toUpperCase()}</div>
  <div class="hi-meta">
    <div class="hi-champ">${log.champion || 'Unknown'}</div>
    <div class="hi-role">${(log.role || '?').toUpperCase()} · ${log.date || ''} · ${log.gameDuration || '?'}min</div>
    <div class="hi-stats">
      ${log.csPerMin    ? `<span class="hi-stat">CS/min <span>${log.csPerMin}</span></span>` : ''}
      ${log.visionPerMin ? `<span class="hi-stat">Vision <span>${log.visionPerMin}/min</span></span>` : ''}
      ${log.deaths       ? `<span class="hi-stat">Deaths <span>${log.deaths}</span></span>` : ''}
    </div>
    ${tags ? `<div class="hi-issues">${tags}</div>` : ''}
  </div>
  <button class="hi-delete" data-id="${log.id}">Delete</button>
</div>`;
  }).join('');

  // Delete buttons
  list.querySelectorAll('.hi-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      deleteLog(parseInt(btn.dataset.id));
      renderHistory(container);
      renderPatterns(container);
    });
  });

  // Click history item to re-show its analysis
  list.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.classList.contains('hi-delete')) return;
      const id  = parseInt(item.dataset.id);
      const log = loadLogs().find(l => l.id === id);
      if (!log) return;
      const issues = analyzeGameLog(log);
      // Switch to form tab (hides others) then show analysis over it
      container.querySelectorAll('.log-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.log-panel').forEach(p => p.classList.remove('active'));
      if (container.querySelectorAll('.log-tab')[0]) container.querySelectorAll('.log-tab')[0].classList.add('active');
      document.getElementById('log-form').classList.add('active');
      showAnalysis(container, log, issues);
    });
  });
}

// ── Patterns ──
function renderPatterns(container) {
  const logs    = loadLogs();
  const content = container.querySelector('#patterns-content');
  if (!content) return;

  if (logs.length < 2) {
    content.innerHTML = '<div class="history-empty">Log at least 2 games to generate a pattern report.</div>';
    return;
  }

  const patterns = analyzePatterns(logs);

  // Aggregate stats
  const avg = key => {
    const vals = logs.map(l => parseFloat(l[key])).filter(v => !isNaN(v));
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null;
  };

  const avgCS     = avg('csPerMin');
  const avgVision = avg('visionPerMin');
  const avgDeaths = avg('deaths');
  const avgFog    = avg('deathsInFog');
  const wins      = logs.filter(l => l.result === 'win').length;

  const statsHtml = `
<div class="lbl" style="margin-top:0">Aggregate Stats — ${logs.length} Games</div>
<div class="stat-grid" style="margin-bottom:20px">
  ${avgCS     ? `<div class="stat-card"><div class="stat-big ${parseFloat(avgCS) >= 8 ? 'green' : parseFloat(avgCS) >= 6.5 ? '' : 'red'}">${avgCS}</div><div class="stat-sub">Avg CS / min</div></div>` : ''}
  ${avgVision ? `<div class="stat-card"><div class="stat-big ${parseFloat(avgVision) >= 1.5 ? 'green' : parseFloat(avgVision) >= 1.0 ? '' : 'red'}">${avgVision}</div><div class="stat-sub">Avg Vision / min</div></div>` : ''}
  ${avgDeaths ? `<div class="stat-card"><div class="stat-big">${avgDeaths}</div><div class="stat-sub">Avg Deaths</div></div>` : ''}
  ${avgFog    ? `<div class="stat-card"><div class="stat-big ${parseFloat(avgFog) > 1 ? 'red' : 'green'}">${avgFog}</div><div class="stat-sub">Avg Fog Deaths</div></div>` : ''}
  <div class="stat-card"><div class="stat-big">${wins}W ${logs.length - wins}L</div><div class="stat-sub">Record</div></div>
</div>`;

  const patternsHtml = patterns.map(p => `
<div class="pattern-card ${p.type}">
  <div class="pattern-header">
    <span class="pattern-title">${p.title}</span>
    <span class="pattern-freq ${p.type === 'summary' ? 'ok' : ''}">${p.frequency}</span>
  </div>
  <div class="pattern-msg">${p.message}</div>
</div>`).join('');

  const priorityIssues = patterns.filter(p => p.type === 'recurring');
  const focusHtml = priorityIssues.length > 0 ? `
<div class="lbl">Your #1 Practice Priority Right Now</div>
<div class="callout co-red">
  <strong>${priorityIssues[0].title}</strong> is your most recurring macro problem.
  Before your next game, re-read the fix for this specific issue in the analysis section.
  Log your next 3 games focusing <em>only</em> on eliminating this one mistake.
  Everything else is secondary until this pattern breaks.
</div>` : `
<div class="callout co-green">
  <strong>No severe recurring patterns detected.</strong> Keep logging games — patterns emerge more clearly after 5+ entries.
</div>`;

  content.innerHTML = statsHtml + `<div class="lbl">Detected Patterns</div>` + patternsHtml + focusHtml;
}

// ── Live benchmark feedback ──
function updateBench(container, input) {
  const field = input.dataset.field;
  const bench = container.querySelector(`.log-bench[data-bench="${field}"]`);
  if (!BENCH[field] || !bench) return;

  const val = parseFloat(input.value);
  if (isNaN(val)) { bench.textContent = ''; bench.className = 'log-bench'; return; }

  if (val >= BENCH[field].good) {
    bench.textContent = '✓ Challenger target';
    bench.className   = 'log-bench good';
    input.classList.remove('warn', 'bad'); input.classList.add('good');
  } else if (val >= BENCH[field].ok) {
    bench.textContent = '⚠ Below target';
    bench.className   = 'log-bench warn';
    input.classList.remove('good', 'bad'); input.classList.add('warn');
  } else {
    bench.textContent = '✗ Problem area';
    bench.className   = 'log-bench bad';
    input.classList.remove('good', 'warn'); input.classList.add('bad');
  }
}

function flash(container, msg) {
  const btn = container.querySelector('#log-submit');
  if (!btn) return;
  const orig = btn.textContent;
  btn.textContent = msg;
  btn.style.color = 'var(--r)';
  setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 2000);
}
