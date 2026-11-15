// Tiny DOM helpers shared by the screens that render from data.js.

import { JOBS, jobYears } from './data.js';

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export function chips(items, className = 'tag-chips') {
  const list = el('ul', className);
  items.forEach((t) => list.appendChild(el('li', null, t)));
  return list;
}

// Jobs in display order: main jobs newest first, then side quests.
export function jobsInLogOrder() {
  return [...JOBS.filter((j) => !j.side), ...JOBS.filter((j) => j.side)];
}

// One Quest Log row (Overview panel + Experience map list).
export function questRow(job, onSelect) {
  const row = el('button', 'quest-row');
  row.type = 'button';
  if (job.current) row.classList.add('quest-row--current');
  if (job.side) row.classList.add('quest-row--side');

  const head = el('span', 'quest-row__head');
  head.appendChild(el('span', 'quest-row__company', job.company));
  if (job.current) head.appendChild(el('span', 'quest-badge', 'Now'));
  else if (job.side) head.appendChild(el('span', 'quest-badge quest-badge--side', 'Side quest'));
  row.appendChild(head);
  const sub = el('span', 'quest-row__role');
  sub.appendChild(el('span', null, job.role));
  sub.appendChild(el('span', 'quest-row__years', jobYears(job)));
  row.appendChild(sub);

  row.addEventListener('click', (event) => {
    event.stopPropagation();
    onSelect();
  });
  return row;
}
