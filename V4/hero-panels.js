// Overview + About panels, rendered from data.js:
//  Overview left   (#hero-details):   Current Quest, vitals, Equipment (stack), Specializations
//  Overview right  (#hero-quest-log):  jobs newest first -> click opens it on the Experience map
//  Overview right  (#hero-loot):       legendary projects -> click opens it on the Projects tree
//  About left      (#about-stats):     stats with their descriptions inline

import { JOBS, PROJECTS, STACK, VITALS, SPECIALIZATIONS, STATS, ASSET, OVERVIEW_LOOT_COUNT } from './data.js';
import { el, chips, questRow, jobsInLogOrder } from './ui.js';
import { openJob } from './map.js';
import { openProject } from './skills-tree.js';


const heading = (text) => el('h3', 'hero-heading', text);

function renderDetails(host) {
  const job = JOBS.find((j) => j.current && !j.side) ?? JOBS[0];
  const quest = el('button', 'current-quest');
  quest.type = 'button';
  quest.appendChild(el('span', 'current-quest__eyebrow', '⚔ Current Quest'));
  quest.appendChild(el('span', 'current-quest__role', job.role));
  quest.appendChild(el('span', 'current-quest__where', `@ ${job.company} · since ${job.start}`));
  quest.addEventListener('click', (e) => {
    e.stopPropagation();
    openJob(job.id);
  });
  host.appendChild(quest);

  const vitals = el('div', 'hero-vitals');
  VITALS.forEach((v) => {
    const row = el('div', `hero-vital hero-vital--${v.color}`);
    row.appendChild(el('span', 'hero-vital__line', `${v.label}: ${v.value}`));
    row.appendChild(el('span', 'hero-vital__caption', v.caption));
    vitals.appendChild(row);
  });
  host.appendChild(vitals);

  host.appendChild(heading('Equipment'));
  const stack = el('div', 'equipment');
  STACK.forEach((g) => {
    const group = el('div', 'equipment__group');
    const list = chips(g.items, 'tag-chips tag-chips--equip');
    const label = el('li', 'equipment__label', g.group);
    list.prepend(label);
    group.appendChild(list);
    stack.appendChild(group);
  });
  host.appendChild(stack);
}

function renderQuestLog(host) {
  host.appendChild(heading('Quest Log'));
  const list = el('div', 'quest-list');
  jobsInLogOrder().forEach((job) => list.appendChild(questRow(job, () => openJob(job.id))));
  host.appendChild(list);
}

function renderLoot(host) {
  host.appendChild(heading('Legendary Loot'));
  const list = el('div', 'loot-list');
  PROJECTS.filter((p) => p.legendary).slice(0, OVERVIEW_LOOT_COUNT).forEach((p) => {
    const row = el('button', 'loot-row');
    row.type = 'button';
    if (p.media) {
      const img = el('img', 'loot-row__media');
      img.src = `${ASSET}${p.media}`;
      img.alt = '';
      img.loading = 'lazy';
      row.appendChild(img);
    }
    const body = el('span', 'loot-row__body');
    body.appendChild(el('span', 'loot-row__title', p.title));
    body.appendChild(el('span', 'loot-row__meta', [p.years, ...p.tags.slice(0, 2)].map((t) => t.replaceAll(' ', '\u00a0')).join(' · ')));
    row.appendChild(body);
    row.addEventListener('click', (e) => {
      e.stopPropagation();
      openProject(p.id);
    });
    list.appendChild(row);
  });
  host.appendChild(list);
  const all = el('button', 'loot-all', `All ${PROJECTS.length} projects →`);
  all.type = 'button';
  all.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelector('.main-nav__link[data-target="skills"]')?.click();
  });
  host.appendChild(all);
}

function renderStats(host) {
  host.appendChild(heading('Stats'));
  const list = el('ul', 'hero-stats');
  STATS.forEach((s) => {
    const li = el('li', 'hero-stat');
    const row = el('div', 'hero-stat__row');
    row.appendChild(el('span', 'hero-stat__icon', s.icon));
    row.appendChild(el('span', 'hero-stat__name', s.name));
    const gradeClass = s.grade.toLowerCase().replace('+', '-plus');
    row.appendChild(el('span', `hero-stat__grade hero-stat__grade--${gradeClass}`, s.grade));
    li.appendChild(row);
    li.appendChild(el('p', 'hero-stat__desc', s.desc));
    list.appendChild(li);
  });
  host.appendChild(list);

  host.appendChild(heading('Specializations'));
  host.appendChild(chips(SPECIALIZATIONS, 'hero-tags'));
}

const hosts = {
  'hero-details': renderDetails,
  'hero-quest-log': renderQuestLog,
  'hero-loot': renderLoot,
  'about-stats': renderStats,
};
Object.entries(hosts).forEach(([id, render]) => {
  const host = document.getElementById(id);
  if (host) render(host);
});
