// Quick CV: the "skip cutscene" page. A clean one-page resume (summary,
// skills, experience, game projects, education) rendered from CV in data.js,
// on a dark overlay with a small toolbar. Opens from the hotbar, the #cv deep
// link, or automatically on phones (where the game screens are too small to
// read). "Save as PDF" prints just the sheet (print rules in v4.css).

import { PROFILE, LINKS, JOBS, PROJECTS, CV, jobDates } from './data.js';
import { el } from './ui.js';
import { unlockAchievement } from './achievements.js';

const PHONE_MAX_WIDTH = 760; // narrower + portrait = auto-open on first load

let overlay = null;
let lastFocus = null;

const byId = (list, id) => list.find((x) => x.id === id);
const year = (d) => (d === 'Present' ? 'Present' : d.split('/').pop());
const shortUrl = (href) => href.replace(/^mailto:/, '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

function section(title, ...children) {
  const s = el('section', 'cv-section');
  s.appendChild(el('h3', 'cv-section__title', title));
  s.append(...children);
  return s;
}

function bulletList(items) {
  const ul = el('ul', 'cv-bullets');
  items.forEach((t) => ul.appendChild(el('li', null, t)));
  return ul;
}

function entry(title, sub, date, bullets) {
  const item = el('div', 'cv-item');
  const head = el('div', 'cv-item__head');
  const left = el('span', 'cv-item__title', title);
  if (sub) left.appendChild(el('span', 'cv-item__sub', sub));
  head.append(left, el('span', 'cv-item__date', date));
  item.appendChild(head);
  if (bullets?.length) item.appendChild(bulletList(bullets));
  return item;
}

function header() {
  const h = el('header', 'cv-header');
  h.appendChild(el('h2', 'cv-name', PROFILE.name));
  h.appendChild(el('p', 'cv-title', `${CV.headline} · ${PROFILE.location}`));
  const contacts = el('p', 'cv-contacts');
  CV.links
    .map((id) => byId(LINKS, id))
    .filter((l) => l?.href)
    .forEach((l) => {
      const a = el('a', 'cv-contact', shortUrl(l.href));
      a.href = l.href;
      if (!l.href.startsWith('mailto:')) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      contacts.appendChild(a);
    });
  h.appendChild(contacts);
  return h;
}

function skills() {
  const list = el('div', 'cv-skills');
  CV.skills.forEach((g) => {
    const row = el('p', 'cv-skills__row');
    row.appendChild(el('strong', null, `${g.group}: `));
    row.append(g.items.join(', '));
    list.appendChild(row);
  });
  return list;
}

function experience() {
  const list = el('div', 'cv-list');
  CV.jobs.forEach(({ id, bullets }) => {
    const j = byId(JOBS, id);
    if (j) list.appendChild(entry(j.role, j.company, jobDates(j), bullets));
  });
  // Older roles: one small line each, no bullets.
  const early = el('div', 'cv-earlier-list');
  CV.earlier.forEach(({ id, note }) => {
    const j = byId(JOBS, id);
    if (!j) return;
    const item = entry(j.role, `${j.company} · ${note}`, `${year(j.start)}–${year(j.end)}`);
    item.classList.add('cv-item--small');
    early.appendChild(item);
  });
  if (early.children.length) list.appendChild(early);
  return list;
}

function projects() {
  const list = el('div', 'cv-list');
  list.appendChild(el('p', 'cv-note', CV.projectsNote));
  CV.projects.forEach(({ id, stack, bullets }) => {
    const p = byId(PROJECTS, id);
    if (p) list.appendChild(entry(p.title, stack, p.years.replace(' - ', '–'), bullets));
  });
  const jams = PROJECTS.filter((p) => p.tags.includes(CV.jamTag));
  if (jams.length) {
    const years = jams.map((p) => Number(p.years.slice(0, 4)));
    const span = `${Math.min(...years)}–${Math.max(...years)}`;
    list.appendChild(el('p', 'cv-earlier', CV.jamLine.replace('{n}', jams.length).replace('{years}', span)));
  }
  return list;
}

function education() {
  const list = el('div', 'cv-list');
  CV.education.forEach((e) => list.appendChild(entry(e.degree, e.school, e.years)));
  return list;
}

function toolbar() {
  const bar = el('div', 'cv-toolbar');
  bar.appendChild(el('span', 'cv-toolbar__label', 'Quick CV'));
  const actions = el('div', 'cv-toolbar__actions');
  if (PROFILE.cvUrl) {
    const dl = el('a', 'cv-btn', 'Download CV');
    dl.href = PROFILE.cvUrl;
    dl.download = '';
    actions.appendChild(dl);
  }
  const print = el('button', 'cv-btn', 'Save as PDF');
  print.type = 'button';
  print.addEventListener('click', () => window.print());
  const enter = el('button', 'cv-btn cv-btn--primary', 'Enter the game ▶');
  enter.type = 'button';
  enter.addEventListener('click', closeCv);
  const close = el('button', 'cv-btn cv-btn--icon', '✕');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close');
  close.addEventListener('click', closeCv);
  actions.append(print, enter, close);
  bar.appendChild(actions);
  return bar;
}

function build() {
  overlay = el('div', 'cv-overlay');
  overlay.hidden = true;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCv();
  });

  const wrap = el('div', 'cv-wrap');
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-label', `${PROFILE.name} CV`);
  wrap.tabIndex = -1;

  const sheet = el('article', 'cv-sheet');
  sheet.append(
    header(),
    el('p', 'cv-summary', CV.summary),
    section('Skills', skills()),
    section('Experience', experience()),
    section(CV.projectsTitle, projects()),
  );
  if (CV.education.length) sheet.appendChild(section('Education', education()));

  wrap.append(toolbar(), sheet);
  overlay.appendChild(wrap);
  document.body.appendChild(overlay);
}

export function openCv() {
  if (!overlay) build();
  if (!overlay.hidden) return;
  lastFocus = document.activeElement;
  overlay.hidden = false;
  document.body.classList.add('cv-open');
  overlay.querySelector('.cv-wrap').focus();
  unlockAchievement('open_cv');
}

export function closeCv() {
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  document.body.classList.remove('cv-open');
  if (location.hash === '#cv') history.replaceState(null, '', location.pathname + location.search);
  lastFocus?.focus?.();
}

export function isCvOpen() {
  return !!overlay && !overlay.hidden;
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCv();
});

window.addEventListener('hashchange', () => {
  if (location.hash === '#cv') openCv();
});

const isPhone = window.innerWidth <= PHONE_MAX_WIDTH && window.innerHeight > window.innerWidth;
if (location.hash === '#cv' || (isPhone && !location.hash)) openCv();
