// nav.js — Section routing and role tab switching

export function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const section = document.getElementById('sec-' + id);
  const btn     = document.querySelector(`.nav-btn[data-section="${id}"]`);

  if (section) {
    // Load section HTML if not yet loaded
    if (!section.dataset.loaded) {
      loadSection(section, id);
    }
    section.classList.add('active');
  }

  if (btn) btn.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadSection(el, id) {
  el.innerHTML = '<div class="section-loading">Loading</div>';
  try {
    const res  = await fetch(`/sections/${id}.html`);
    const html = await res.text();
    el.innerHTML = html;
    el.dataset.loaded = '1';
    // Fire an event so app.js can wire up any interactivity in the new content
    document.dispatchEvent(new CustomEvent('sectionLoaded', { detail: { id } }));
  } catch (e) {
    el.innerHTML = `<div class="section-loading" style="color:#c93333">Failed to load section: ${id}</div>`;
  }
}

export function showRole(id) {
  document.querySelectorAll('.role-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.role-tab').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('role-' + id);
  const btn   = document.querySelector(`.role-tab[data-role="${id}"]`);
  if (panel) panel.classList.add('active');
  if (btn)   btn.classList.add('active');
}

export function initNav(sections) {
  const inner = document.querySelector('.nav-inner');
  if (!inner) return;

  sections.forEach(({ id, label }) => {
    const btn = document.createElement('button');
    btn.className = 'nav-btn';
    btn.dataset.section = id;
    btn.textContent = label;
    btn.addEventListener('click', () => showSection(id));
    inner.appendChild(btn);

    // Create the section shell
    const sec = document.createElement('section');
    sec.id = 'sec-' + id;
    sec.className = 'section';
    document.querySelector('.main').appendChild(sec);
  });

  // Load first section immediately
  if (sections.length > 0) showSection(sections[0].id);
}
