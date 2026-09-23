// RPG skill tree for the Skills screen. Everything about a node — its
// position, which node(s) it connects to, and its project panel content —
// lives in SKILL_NODES below. Add/remove a project by adding/removing an
// entry here; connecting lines and panel placement follow automatically.
//
// x/y are percentages within #skill-tree (0 = left/top, 100 = right/bottom).
// parents: ids this node connects UP to (a node can have more than one,
// e.g. where two branches merge).
// media (optional): path to a .gif/.png/.jpg for the panel's 16:9 preview,
// e.g. media: 'images/projects/rakshasa.gif'. Leave it out and the panel
// shows the "GIF preview" placeholder instead.
// icon (optional): a single character/emoji shown inside the node's circle.
// The circle itself is a fixed size (see .skill-node__hotspot in skills.css)
// regardless of icon — leave it out and the node falls back to "✦".
//
// The project panel is ONE shared element appended to document.body and
// positioned with JS (getBoundingClientRect + clamping), not CSS nested
// under the node. It has to live outside #skills/.main-container: that
// element has `transform: translate(-50%, -50%)` for its centering, and any
// transform (regardless of z-index) creates a stacking context — so nothing
// nested inside it can ever render above a body-level sibling like
// #main-nav. Moving the panel to <body> is what actually escapes that.

import { unlockAchievement } from './achievements.js';

export const SKILL_NODES = [
  {
    id: 'n1',
    x: 12,
    y: 60,
    parents: [],
    root: true,
    title: 'The Return Of Rakshasa (2020)',
    icon: '⚔️',
    description: 'My First game, a fantasy action game created end-to-end include logic and level design. (Practical engineering end project)',
    bullets: ['Game Narrative', 'Dynamic magic system', 'Full Game Development'],
    media: 'gifs/rakshasa.gif',
  },
  // Line 1 (top, y: 40) — "(my own project)" — chained left to right off n1.
  {
    id: 'n2',
    x: 30,
    y: 40,
    parents: ['n1'],
    title: 'Mini projects (2020)',
    icon: '🎮',
    description: 'Testing my skills in game development with small projects. (my own project)',
    bullets: ['Shooting game', 'Environment design', 'Four legs movement & animation'],
    media: 'gifs/mini.gif',
  },
  {
    id: 'n4',
    x: 50,
    y: 40,
    parents: ['n2'],
    title: 'Worlds clicker (2021)',
    icon: '🖱️',
    description: 'A mobile clicker game with unique 3D worlds and a dynamic upgrade system. (my own project)',
    bullets: ['Resources system', 'Upgrade mechanics', 'Android Studio development'],
    media: 'gifs/clicker.gif',
  },
  {
    id: 'n8',
    x: 70,
    y: 40,
    root: true,
    parents: ['n4'],
    title: 'The Greatest Adventurer (2022 - 2024)',
    icon: '🗺️',
    description: 'RPG-like game with growing world eco system and AI NPCs that react to the player. (My own project)',
    bullets: ['Drops system', 'True AI NPC behavior', 'Fast save & load system', 'Attribute system'],
    media: 'gifs/tga.gif',
  },
  {
    id: 'n12',
    x: 90,
    y: 40,
    parents: ['n8'],
    root: true,
    title: 'Ore 2 War (2025 - 2026)',
    icon: '⛏️',
    description: 'Ore2War is a 2–4 player multiplayer game where you gather resources and craft weapons to sell to warring factions, most points wins. (my own project)',
    bullets: ['Multiplayer networking', 'Resource gathering & crafting', 'Deep Faction economy system', 'Hexagon random map generation', ],
    media: 'gifs/ore2war.gif',
  },

  // Line 2 (middle, y: 60, level with n1) — "(GGJ project)".
  {
    id: 'n3',
    x: 30,
    y: 60,
    parents: ['n1'],
    title: 'Final Reversal (2023)',
    icon: '👹',
    description: 'The main hero fight against a Demon boss that each time you get to a certain threshold, the game functionally graded down to the past. From Third person until Text based (GGJ project)',
    bullets: ['2 Days project', 'Mechanical changes', 'Text-based storytelling'],
    media: 'gifs/reversal.gif',
  },
  {
    id: 'n5',
    x: 50,
    y: 60,
    parents: ['n3'],
    title: 'Guns N Ropses (2024)',
    icon: '🪢',
    description: '1V1 Battle game, while balancing on ropes trying to avoid enemy attacks. The first to the top wins. (GGJ project)',
    bullets: ['2 Days project', 'Chaotic rope physics', 'AOE Damage and knockback'],
    media: 'gifs/ropes.gif',
  },
  {
    id: 'n7',
    x: 70,
    y: 60,
    parents: ['n5'],
    title: 'Home Sailors (2025)',
    icon: '⛵',
    description: 'A tiny paper boat navigating a bathroom tub, collecting 15 fish in under 100 seconds. (GGJ project)',
    bullets: ['2 Days project', 'Real-time water physics', 'Full steering controls', 'Obstacle spawning system'],
    media: 'gifs/bubble.gif',
  },
  {
    id: 'n9',
    x: 90,
    y: 60,
    parents: ['n7'],
    title: 'The Mask Tester (2026)',
    icon: '🎭',
    description: 'A platformer game where you can test different masks that give you different POV on the world and reveals hidden platforms. (GGJ project)',
    bullets: ['2 Days project', 'Level design', 'Hidden platform system'],
    media: 'gifs/mask.gif',
  },

  // Line 3 (bottom, y: 80) — "(GMTK project)".
  {
    id: 'n6',
    x: 35,
    y: 80,
    parents: ['n1'],
    title: 'Patrol no more (2023)',
    icon: '🤖',
    description: 'outsmart patrolling robots, use a powerful scaling gun to shrink enemies and consume them to grow stronger. (GMTK project)',
    bullets: ['Smart Patrol AI', 'Scaling mechanics', 'Consumption system'],
    media: 'gifs/patrol.gif',
  },
  {
    id: 'n10',
    x: 62,
    y: 80,
    parents: ['n6'],
    title: 'SoundShift (2025)',
    icon: '🎵',
    description: 'A deck builder rhythm game where you can create your own music and play it. (GMTK project)',
    bullets: ['2 Days project', 'Deck building mechanics', 'Music creation system'],
    media: 'gifs/soundshift.gif',
  },
  {
    id: 'n11',
    x: 90,
    y: 80,
    parents: ['n10'],
    title: 'Flipped Ghost (2026)',
    icon: '👻',
    description: 'A puzzle-platformer game where the timer flips the world and you solve puzzles in ghost form. (GMTK project)',
    bullets: ['2 Days project', 'Gravity flipping mechanics', '2D pixel art', 'Puzzle design'],
    media: 'gifs/flipped.gif',
  },
];

const PANEL_ID = 'skill-panel-shared';
const PANEL_MARGIN = 16; // gap kept from the viewport edge and from the node
const HIDE_DELAY = 150; // ms grace period so moving the pointer onto the panel doesn't close it

function createNodeElement(node) {
  const el = document.createElement('div');
  el.className = ['skill-node', node.root ? 'skill-node--highlight' : ''].filter(Boolean).join(' ');
  el.dataset.nodeId = node.id;
  el.style.setProperty('--node-x', `${node.x}%`);
  el.style.setProperty('--node-y', `${node.y}%`);

  const hotspot = document.createElement('button');
  hotspot.type = 'button';
  hotspot.className = 'skill-node__hotspot';
  hotspot.setAttribute('aria-expanded', 'false');
  hotspot.setAttribute('aria-describedby', PANEL_ID);
  hotspot.setAttribute('aria-label', node.title);

  // Reuses the same ornate frame as the inventory slots — decorative only,
  // pointer-events:none so it never blocks the hotspot's own clicks.
  const frame = document.createElement('img');
  frame.className = 'skill-node__frame';
  frame.src = 'images/item-slot-container.png';
  frame.alt = '';
  frame.draggable = false;
  hotspot.appendChild(frame);

  const icon = document.createElement('span');
  icon.className = 'skill-node__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = node.icon || '✦'; // ✦ fallback if a node has no icon set
  hotspot.appendChild(icon);

  const particles = document.createElement('span');
  particles.className = 'skill-node__particles';
  particles.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 3; i++) {
    particles.appendChild(document.createElement('span')).className = 'skill-node__particle';
  }
  hotspot.appendChild(particles);

  el.appendChild(hotspot);

  const label = document.createElement('span');
  label.className = 'skill-node__label';
  label.textContent = node.title;
  el.appendChild(label);

  return el;
}

function createSharedPanel() {
  const panel = document.createElement('div');
  panel.className = 'skill-panel';
  panel.id = PANEL_ID;
  panel.setAttribute('role', 'tooltip');

  const title = document.createElement('h3');
  title.className = 'skill-panel__title';
  panel.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'skill-panel__desc';
  panel.appendChild(desc);

  const bullets = document.createElement('ul');
  bullets.className = 'skill-panel__bullets';
  panel.appendChild(bullets);

  // Media area: shows mediaImg when a node sets `media`, otherwise falls
  // back to the "GIF preview" placeholder — see fillPanel below.
  const media = document.createElement('div');
  media.className = 'skill-panel__media';

  const mediaImg = document.createElement('img');
  mediaImg.className = 'skill-panel__media-img';
  mediaImg.hidden = true;
  media.appendChild(mediaImg);

  const mediaLabel = document.createElement('span');
  mediaLabel.className = 'skill-panel__media-label';
  mediaLabel.textContent = 'GIF preview';
  media.appendChild(mediaLabel);

  panel.appendChild(media);

  document.body.appendChild(panel);
  return { panel, title, desc, bullets, mediaImg, mediaLabel };
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

  const {
    panel,
    title: panelTitle,
    desc: panelDesc,
    bullets: panelBullets,
    mediaImg: panelMediaImg,
    mediaLabel: panelMediaLabel,
  } = createSharedPanel();
  let openNodeId = null;
  let hideTimer = null;
  const hoveredNodes = new Set();

  function fillPanel(node) {
    panelTitle.textContent = node.title;
    panelDesc.textContent = node.description;
    panelBullets.replaceChildren();
    node.bullets.forEach((point) => {
      const li = document.createElement('li');
      li.textContent = point;
      panelBullets.appendChild(li);
    });

    if (node.media) {
      panelMediaImg.src = node.media;
      panelMediaImg.alt = `${node.title} preview`;
      panelMediaImg.hidden = false;
      panelMediaLabel.hidden = true;
    } else {
      panelMediaImg.hidden = true;
      panelMediaImg.removeAttribute('src');
      panelMediaLabel.hidden = false;
    }
  }

  function positionPanelNear(hotspot) {
    const hotspotRect = hotspot.getBoundingClientRect();
    // Panel is already in the DOM with opacity 0 (not display:none), so it
    // has real, measurable dimensions before we decide where to put it.
    const panelRect = panel.getBoundingClientRect();

    let left = hotspotRect.right + PANEL_MARGIN;
    if (left + panelRect.width > window.innerWidth - PANEL_MARGIN) {
      left = hotspotRect.left - PANEL_MARGIN - panelRect.width;
    }
    left = Math.max(PANEL_MARGIN, Math.min(left, window.innerWidth - panelRect.width - PANEL_MARGIN));

    let top = hotspotRect.top + hotspotRect.height / 2 - panelRect.height / 2;
    top = Math.max(PANEL_MARGIN, Math.min(top, window.innerHeight - panelRect.height - PANEL_MARGIN));

    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }

  function showPanel(node, hotspot) {
    clearTimeout(hideTimer);
    openNodeId = node.id;
    fillPanel(node);
    positionPanelNear(hotspot);
    panel.classList.add('is-visible');

    hoveredNodes.add(node.id);
    if (hoveredNodes.size === SKILL_NODES.length) unlockAchievement('hover_skills');
  }

  function hidePanel() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      panel.classList.remove('is-visible');
      openNodeId = null;
      nodeEls.forEach((el) => {
        el.classList.remove('is-open');
        el.querySelector('.skill-node__hotspot')?.setAttribute('aria-expanded', 'false');
      });
    }, HIDE_DELAY);
  }

  function cancelHide() {
    clearTimeout(hideTimer);
  }

  panel.addEventListener('pointerenter', cancelHide);
  panel.addEventListener('pointerleave', hidePanel);

  function drawLines() {
    const rootRect = root.getBoundingClientRect();
    if (!rootRect.width || !rootRect.height) return;

    svg.setAttribute('width', rootRect.width);
    svg.setAttribute('height', rootRect.height);
    svg.setAttribute('viewBox', `0 0 ${rootRect.width} ${rootRect.height}`);
    svg.replaceChildren();

    let edgeIndex = 0;
    SKILL_NODES.forEach((node) => {
      node.parents.forEach((parentId) => {
        const a = nodeEls.get(node.id)?.querySelector('.skill-node__hotspot');
        const b = nodeEls.get(parentId)?.querySelector('.skill-node__hotspot');
        if (!a || !b) return;

        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        const x1 = aRect.left + aRect.width / 2 - rootRect.left;
        const y1 = aRect.top + aRect.height / 2 - rootRect.top;
        const x2 = bRect.left + bRect.width / 2 - rootRect.left;
        const y2 = bRect.top + bRect.height / 2 - rootRect.top;

        // Base line (the static conduit) plus a shimmer overlay: a short
        // bright dash that travels its length on a loop, using
        // pathLength="100" so one shared CSS keyframe animation works
        // identically regardless of each line's actual pixel length.
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', 'skill-tree__line');
        line.dataset.a = node.id;
        line.dataset.b = parentId;
        svg.appendChild(line);

        const shimmer = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        shimmer.setAttribute('x1', x1);
        shimmer.setAttribute('y1', y1);
        shimmer.setAttribute('x2', x2);
        shimmer.setAttribute('y2', y2);
        shimmer.setAttribute('pathLength', '100');
        shimmer.setAttribute('class', 'skill-tree__line-shimmer');
        shimmer.style.animationDelay = `${-(edgeIndex * 0.6).toFixed(2)}s`;
        shimmer.dataset.a = node.id;
        shimmer.dataset.b = parentId;
        svg.appendChild(shimmer);

        edgeIndex += 1;
      });
    });
  }

  function setLinesLit(nodeId, lit) {
    svg
      .querySelectorAll(`.skill-tree__line[data-a="${nodeId}"], .skill-tree__line[data-b="${nodeId}"],
         .skill-tree__line-shimmer[data-a="${nodeId}"], .skill-tree__line-shimmer[data-b="${nodeId}"]`)
      .forEach((line) => {
        line.classList.toggle('is-lit', lit);
      });
  }

  nodeEls.forEach((el, id) => {
    const hotspot = el.querySelector('.skill-node__hotspot');
    if (!hotspot) return;
    const node = SKILL_NODES.find((n) => n.id === id);

    hotspot.addEventListener('pointerenter', () => {
      setLinesLit(id, true);
      showPanel(node, hotspot);
      el.classList.add('is-open');
      hotspot.setAttribute('aria-expanded', 'true');
    });
    hotspot.addEventListener('pointerleave', () => {
      setLinesLit(id, false);
      hidePanel();
    });
    hotspot.addEventListener('focus', () => {
      setLinesLit(id, true);
      showPanel(node, hotspot);
      el.classList.add('is-open');
      hotspot.setAttribute('aria-expanded', 'true');
    });
    hotspot.addEventListener('blur', () => {
      setLinesLit(id, false);
      hidePanel();
    });

    // Touch: tap toggles the panel open/closed for this node (hover doesn't
    // apply on touch, so pointerenter above won't have fired first).
    hotspot.addEventListener('click', (event) => {
      event.stopPropagation();
      if (openNodeId === id && panel.classList.contains('is-visible')) {
        cancelHide();
        panel.classList.remove('is-visible');
        openNodeId = null;
        el.classList.remove('is-open');
        hotspot.setAttribute('aria-expanded', 'false');
      } else {
        showPanel(node, hotspot);
        el.classList.add('is-open');
        hotspot.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (panel.contains(event.target)) return;
    hidePanel();
  });

  window.addEventListener('resize', () => {
    drawLines();
    if (openNodeId) {
      const hotspot = nodeEls.get(openNodeId)?.querySelector('.skill-node__hotspot');
      if (hotspot) positionPanelNear(hotspot);
    }
  });

  drawLines();
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
