// RPG skill tree for the Skills screen. Everything about a node — its
// position, which node(s) it connects to, and its project panel content —
// lives in SKILL_NODES below. Add/remove a project by adding/removing an
// entry here; connecting lines and panel placement follow automatically.
//
// x/y are percentages within #skill-tree (0 = left/top, 100 = right/bottom).
// parents: ids this node connects UP to (a node can have more than one,
// e.g. where two branches merge).

const SKILL_NODES = [
  {
    id: 'n1',
    x: 10,
    y: 50,
    parents: [],
    root: true,
    title: 'Project 1',
    description: 'Placeholder description for Project 1 — the root of the tree. Replace with a short summary of what this project does and why it matters.',
    bullets: ['Placeholder highlight one', 'Placeholder highlight two', 'Placeholder highlight three'],
  },
  {
    id: 'n2',
    x: 20,
    y: 60,
    parents: ['n1'],
    title: 'Project 2',
    description: 'Placeholder description for Project 2. Replace with a short summary of what this project does and why it matters.',
    bullets: ['Placeholder highlight one', 'Placeholder highlight two', 'Placeholder highlight three'],
  },
  {
    id: 'n3',
    x: 20,
    y: 40,
    parents: ['n1'],
    title: 'Project 3',
    description: 'Placeholder description for Project 3. Replace with a short summary of what this project does and why it matters.',
    bullets: ['Placeholder highlight one', 'Placeholder highlight two', 'Placeholder highlight three'],
  },
  {
    id: 'n4',
    x: 30,
    y: 60,
    parents: ['n2'],
    title: 'Project 4',
    description: 'Placeholder description for Project 4. Replace with a short summary of what this project does and why it matters.',
    bullets: ['Placeholder highlight one', 'Placeholder highlight two', 'Placeholder highlight three'],
  },
  {
    id: 'n5',
    x: 30,
    y: 40,
    parents: ['n3'],
    title: 'Project 5',
    description: 'Placeholder description for Project 5. Replace with a short summary of what this project does and why it matters.',
    bullets: ['Placeholder highlight one', 'Placeholder highlight two', 'Placeholder highlight three'],
  },
  {
    id: 'n6',
    x: 40,
    y: 60,
    parents: ['n4'],
    title: 'Project 6',
    description: 'Placeholder description for Project 6. Replace with a short summary of what this project does and why it matters.',
    bullets: ['Placeholder highlight one', 'Placeholder highlight two', 'Placeholder highlight three'],
  },
  {
    id: 'n7',
    x: 40,
    y: 40,
    parents: ['n5'],
    title: 'Project 7',
    description: 'Placeholder description for Project 7. Replace with a short summary of what this project does and why it matters.',
    bullets: ['Placeholder highlight one', 'Placeholder highlight two', 'Placeholder highlight three'],
  },
  {
    id: 'n8',
    x: 50,
    y: 60,
    parents: ['n6'],
    title: 'Project 8',
    description: 'Placeholder description for Project 8. Replace with a short summary of what this project does and why it matters.',
    bullets: ['Placeholder highlight one', 'Placeholder highlight two', 'Placeholder highlight three'],
  },
  {
    id: 'n9',
    x: 50,
    y: 40,
    parents: ['n7'],
    title: 'Project 9',
    description: 'Placeholder description for Project 9. Replace with a short summary of what this project does and why it matters.',
    bullets: ['Placeholder highlight one', 'Placeholder highlight two', 'Placeholder highlight three'],
  },
  {
    id: 'n10',
    x: 60,
    y: 50,
    parents: ['n8', 'n9'],
    title: 'Project 10',
    description: 'Placeholder description for Project 10 — where both branches converge. Replace with a short summary of what this project does and why it matters.',
    bullets: ['Placeholder highlight one', 'Placeholder highlight two', 'Placeholder highlight three'],
  },
  {
    id: 'n11',
    x: 70,
    y: 50,
    parents: ['n10'],
    root: true,
    title: 'Project 11',
    description: 'Placeholder description for Project 11 — the capstone. Replace with a short summary of what this project does and why it matters.',
    bullets: ['Placeholder highlight one', 'Placeholder highlight two', 'Placeholder highlight three'],
  },
];

// Panel placement is decided once, from each node's own x/y — no need to
// recompute on resize since these are percentages of the same container.
function panelSideClass(x) {
  return x >= 62 ? 'skill-node--panel-left' : 'skill-node--panel-right';
}

function panelValignClass(y) {
  if (y < 20) return 'skill-node--valign-top';
  if (y > 80) return 'skill-node--valign-bottom';
  return 'skill-node--valign-center';
}

function createNodeElement(node) {
  const el = document.createElement('div');
  el.className = ['skill-node', panelSideClass(node.x), panelValignClass(node.y), node.root ? 'skill-node--highlight' : '']
    .filter(Boolean)
    .join(' ');
  el.dataset.nodeId = node.id;
  el.style.setProperty('--node-x', `${node.x}%`);
  el.style.setProperty('--node-y', `${node.y}%`);

  const panelId = `skill-panel-${node.id}`;

  const hotspot = document.createElement('button');
  hotspot.type = 'button';
  hotspot.className = 'skill-node__hotspot';
  hotspot.setAttribute('aria-expanded', 'false');
  hotspot.setAttribute('aria-describedby', panelId);
  hotspot.setAttribute('aria-label', node.title);
  hotspot.innerHTML = '<span class="skill-node__icon" aria-hidden="true">&#10022;</span>';
  el.appendChild(hotspot);

  const label = document.createElement('span');
  label.className = 'skill-node__label';
  label.textContent = node.title;
  el.appendChild(label);

  const panel = document.createElement('div');
  panel.className = 'skill-panel';
  panel.id = panelId;
  panel.setAttribute('role', 'tooltip');

  const title = document.createElement('h3');
  title.className = 'skill-panel__title';
  title.textContent = node.title;
  panel.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'skill-panel__desc';
  desc.textContent = node.description;
  panel.appendChild(desc);

  const bullets = document.createElement('ul');
  bullets.className = 'skill-panel__bullets';
  node.bullets.forEach((point) => {
    const li = document.createElement('li');
    li.textContent = point;
    bullets.appendChild(li);
  });
  panel.appendChild(bullets);

  // Placeholder for a looping project GIF — swap this div for
  // <img class="skill-panel__media" src="path/to.gif" alt="..."> later.
  const media = document.createElement('div');
  media.className = 'skill-panel__media';
  media.setAttribute('aria-hidden', 'true');
  media.innerHTML = '<span class="skill-panel__media-label">GIF preview</span>';
  panel.appendChild(media);

  el.appendChild(panel);
  return el;
}

function initSkillTree() {
  const root = document.getElementById('skill-tree');
  if (!root) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'skill-tree__lines');
  svg.setAttribute('aria-hidden', 'true');
  root.appendChild(svg);

  const nodeEls = new Map();
  SKILL_NODES.forEach((node) => {
    const el = createNodeElement(node);
    root.appendChild(el);
    nodeEls.set(node.id, el);
  });

  function drawLines() {
    const rootRect = root.getBoundingClientRect();
    if (!rootRect.width || !rootRect.height) return;

    svg.setAttribute('width', rootRect.width);
    svg.setAttribute('height', rootRect.height);
    svg.setAttribute('viewBox', `0 0 ${rootRect.width} ${rootRect.height}`);
    svg.replaceChildren();

    SKILL_NODES.forEach((node) => {
      node.parents.forEach((parentId) => {
        const a = nodeEls.get(node.id)?.querySelector('.skill-node__hotspot');
        const b = nodeEls.get(parentId)?.querySelector('.skill-node__hotspot');
        if (!a || !b) return;

        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', aRect.left + aRect.width / 2 - rootRect.left);
        line.setAttribute('y1', aRect.top + aRect.height / 2 - rootRect.top);
        line.setAttribute('x2', bRect.left + bRect.width / 2 - rootRect.left);
        line.setAttribute('y2', bRect.top + bRect.height / 2 - rootRect.top);
        line.setAttribute('class', 'skill-tree__line');
        line.dataset.a = node.id;
        line.dataset.b = parentId;
        svg.appendChild(line);
      });
    });
  }

  function setLinesLit(nodeId, lit) {
    svg.querySelectorAll(`line[data-a="${nodeId}"], line[data-b="${nodeId}"]`).forEach((line) => {
      line.classList.toggle('is-lit', lit);
    });
  }

  function closeAll(except) {
    nodeEls.forEach((el) => {
      if (el === except) return;
      el.classList.remove('is-open');
      el.querySelector('.skill-node__hotspot')?.setAttribute('aria-expanded', 'false');
    });
  }

  nodeEls.forEach((el, id) => {
    const hotspot = el.querySelector('.skill-node__hotspot');
    if (!hotspot) return;

    hotspot.addEventListener('pointerenter', () => setLinesLit(id, true));
    hotspot.addEventListener('pointerleave', () => setLinesLit(id, false));
    hotspot.addEventListener('focus', () => setLinesLit(id, true));
    hotspot.addEventListener('blur', () => setLinesLit(id, false));

    hotspot.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = el.classList.toggle('is-open');
      hotspot.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) closeAll(el);
    });
  });

  document.addEventListener('click', () => closeAll(null));

  drawLines();
  window.addEventListener('resize', drawLines);
  window.addEventListener('load', drawLines);

  // The tree lives on the Skills screen, which starts hidden (opacity: 0)
  // behind Hero — its geometry is still valid while hidden (opacity doesn't
  // affect layout), but redraw once more when it actually becomes visible
  // in case anything shifted while unmeasured (e.g. fonts finishing load).
  document.getElementById('main-nav')
    ?.querySelector('[data-target="skills"]')
    ?.addEventListener('click', () => requestAnimationFrame(drawLines));
}

initSkillTree();
