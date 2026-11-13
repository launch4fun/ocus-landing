/**
 * OCUS — LANDING PAGE ENGINE
 * Minimalist Interactions · Metrics Counter · Audience Auto-Switcher · Platform DAG · Screenshot Showcase
 */

(function () {
  'use strict';

  // 1. ARIADNE THREAD SCROLL PROGRESS
  const progressFill = document.getElementById('ariadneProgress');
  function updateScrollProgress() {
    if (!progressFill) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressFill.style.width = Math.min(100, Math.max(0, pct)) + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  // 2. CALENDLY BOOKING TRIGGERS & IMMEDIATE SCROLL
  function scrollToBooking(e) {
    if (e) e.preventDefault();
    const section = document.getElementById('booking');
    if (section) {
      const html = document.documentElement;
      const prevBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      section.scrollIntoView({ block: 'start' });
      html.style.scrollBehavior = prevBehavior;
      if (history.pushState) {
        history.pushState(null, null, '#booking');
      } else {
        location.hash = '#booking';
      }
    }
  }

  const bookButtons = document.querySelectorAll('.action-book-demo');
  bookButtons.forEach(btn => {
    btn.addEventListener('click', scrollToBooking);
  });

  const popupBtn = document.getElementById('calendlyPopupBtn');
  if (popupBtn) {
    popupBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
        window.Calendly.initPopupWidget({ url: 'https://calendly.com/your-team' });
      } else {
        scrollToBooking();
      }
    });
  }

  // 3. HERO METRICS COUNT-UP ANIMATION
  function initMetricsCountUp() {
    const metricBar = document.querySelector('.hero-metric-bar');
    if (!metricBar) return;
    let hasAnimated = false;

    const daysEl = document.getElementById('metricDays');
    const nodesEl = document.getElementById('metricNodes');
    const fundsEl = document.getElementById('metricFunds');
    const passEl = document.getElementById('metricPassport');

    function runAnimation() {
      if (hasAnimated) return;
      hasAnimated = true;

      const duration = 1400;
      const startTime = performance.now();

      function frame(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic curve for natural decelerating stop
        const ease = 1 - Math.pow(1 - progress, 3);

        if (daysEl) {
          const val = Math.round(105 * ease);
          daysEl.textContent = val + ' Days';
        }
        if (nodesEl) {
          const val = Math.round(31 * ease);
          nodesEl.textContent = val + ' Nodes';
        }
        if (fundsEl) {
          const v1 = Math.round(125 * ease);
          const v2 = Math.round(730 * ease);
          fundsEl.textContent = '€' + v1 + 'k–€' + v2 + 'k';
        }
        if (passEl) {
          const val = Math.round(100 * ease);
          passEl.textContent = val + '% Flat';
        }

        if (progress < 1) {
          requestAnimationFrame(frame);
        }
      }

      requestAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runAnimation();
          observer.disconnect();
        }
      });
    }, { threshold: 0.15 });

    observer.observe(metricBar);
  }
  initMetricsCountUp();

  // 4. AUDIENCE PROFILES AUTO-SWITCHER TIMER (ZERO-LAG DETERMINISTIC ENGINE)
  function initAudienceAutoSwitcher() {
    const tabButtons = Array.from(document.querySelectorAll('.profile-tab-btn'));
    const stagePanes = Array.from(document.querySelectorAll('.profile-card-stage'));
    const section = document.getElementById('profiles');
    if (!tabButtons.length || !stagePanes.length) return;

    let currentIndex = 0;
    let switchTimeout = null;
    let isPaused = false;
    const intervalMs = 4500;

    function resetTimerBars() {
      tabButtons.forEach(b => {
        const fill = b.querySelector('.tab-timer-fill');
        if (fill) {
          fill.style.transition = 'none';
          fill.style.width = '0%';
        }
      });
    }

    function selectTab(index) {
      if (switchTimeout) {
        clearTimeout(switchTimeout);
        switchTimeout = null;
      }
      currentIndex = index;
      const activeBtn = tabButtons[index];
      const targetId = activeBtn.dataset.target;

      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      stagePanes.forEach(p => p.classList.remove('active'));

      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-selected', 'true');
      const activePane = document.getElementById(targetId);
      if (activePane) activePane.classList.add('active');

      resetTimerBars();

      if (!isPaused) {
        const fillEl = activeBtn.querySelector('.tab-timer-fill');
        if (fillEl) {
          void fillEl.offsetWidth; // trigger reflow
          fillEl.style.transition = `width ${intervalMs}ms linear`;
          fillEl.style.width = '100%';
        }
        switchTimeout = setTimeout(() => {
          selectTab((currentIndex + 1) % tabButtons.length);
        }, intervalMs);
      }
    }

    tabButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        selectTab(idx);
      });
    });

    if (section) {
      section.addEventListener('mouseenter', () => {
        isPaused = true;
        if (switchTimeout) {
          clearTimeout(switchTimeout);
          switchTimeout = null;
        }
        const activeBtn = tabButtons[currentIndex];
        const fillEl = activeBtn ? activeBtn.querySelector('.tab-timer-fill') : null;
        if (fillEl) {
          const computedWidth = window.getComputedStyle(fillEl).width;
          fillEl.style.transition = 'none';
          fillEl.style.width = computedWidth;
        }
      });

      section.addEventListener('mouseleave', () => {
        isPaused = false;
        selectTab(currentIndex);
      });
    }

    selectTab(0);
  }
  initAudienceAutoSwitcher();

  // 5. REAL PLATFORM OPERATIONS DAG ENGINE (EXTRACTED FROM OCUS.JS)
  function initPlatformDag() {
    const svg = document.getElementById('dagSvg');
    const cam = document.getElementById('dagCam');
    const stage = document.getElementById('dagStage');
    if (!svg || !cam || !stage) return;

    const gO = document.getElementById('dagO');
    const gE = document.getElementById('dagE');
    const gP = document.getElementById('dagP');
    const gN = document.getElementById('dagN');

    const inspector = document.getElementById('dagInspector');
    const inspTitle = document.getElementById('dagInspTitle');
    const inspBadge = document.getElementById('dagInspBadge');
    const inspOwner = document.getElementById('dagInspOwner');
    const inspEst = document.getElementById('dagInspEst');
    const inspTasks = document.getElementById('dagInspChecklist');
    const inspClose = document.getElementById('dagInspClose');

    const cZ = document.getElementById('dagZoomVal');
    const cX = document.getElementById('dagCoordX');
    const cY = document.getElementById('dagCoordY');

    const zIn = document.getElementById('dagZoomIn');
    const zOut = document.getElementById('dagZoomOut');
    const zReset = document.getElementById('dagZoomReset');

    const NS = 'http://www.w3.org/2000/svg';
    function mk(tag, attrs, parent) {
      const el = document.createElementNS(NS, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(el);
      return el;
    }

    // 8 Branches & 31 Leaf Tasks (Identical to Ocus Platform)
    const BR = [
      { id: 'lic', t: 'Licensing', leaves: [
        { id: 'casp', t: 'CASP authorisation', st: 'risk', o: 'Law firm', d: 16, c: [['Home member state chosen', 1], ['Application filed', 1], ['Authorisation granted', 0]] },
        { id: 'pass', t: 'EEA passporting', st: 'wip', o: 'Law firm', d: 3, c: [['Target countries listed', 1], ['Notification to regulator', 1], ['Local rules per country', 0]] },
        { id: 'psd2', t: 'EMT & PSD2 scope', st: 'todo', o: 'Law firm', d: 4, c: [['Map EMT flows', 0], ['Decide if PSD2 licence needed', 0]] },
        { id: 'mkt', t: 'Marketing by country', st: 'wip', o: 'Compliance', d: 2, c: [['Risk warnings', 1], ['Ads in local language', 0]] },
        { id: 'us', t: 'US customers', st: 'todo', o: 'Compliance', d: 3, c: [['Serve or geoblock', 0], ['Permitted stablecoins only', 0]] }
      ]},
      { id: 'bank', t: 'Banking & fiat', leaves: [
        { id: 'bank1', t: 'Primary bank', st: 'ok', o: 'Finance', d: 6, c: [['Account opened', 1], ['Client IBANs live', 1]] },
        { id: 'bank2', t: 'Backup bank', st: 'todo', o: 'Finance', d: 7, c: [['Second provider chosen', 0], ['Account opened', 0]] },
        { id: 'safe', t: 'Safeguarding', st: 'risk', o: 'Finance', d: 3, c: [['Segregated accounts', 1], ['Daily reconciliation', 0]] },
        { id: 'ramp', t: 'On / off ramps', st: 'ok', o: 'CTO', d: 4, c: [['Provider live', 1], ['SEPA Instant', 1]] }
      ]},
      { id: 'coin', t: 'Stablecoins', leaves: [
        { id: 'pick', t: 'Stablecoin selection', st: 'ok', o: 'CEO', d: 1, c: [['EURC', 1], ['USDC', 1], ['MiCA status checked', 1]] },
        { id: 'share', t: 'Issuer revenue share', st: 'todo', o: 'CEO', d: 5, c: [['Agreement with issuer', 0], ['Balance tracking for payouts', 0]] },
        { id: 'tok', t: 'Token & chain status', st: 'wip', o: 'CTO', d: 2, c: [['Contract list per chain', 1], ['Change alerts', 0]] },
        { id: 'resv', t: 'Reserve checks', st: 'warn', o: 'Finance', d: 3, c: [['Daily balance check', 0], ['Monthly report', 0]] }
      ]},
      { id: 'cust', t: 'Custody', leaves: [
        { id: 'custp', t: 'Custody provider', st: 'ok', o: 'CTO', d: 6, c: [['Selected', 1], ['Integrated', 1]] },
        { id: 'sign', t: 'Signing policies', st: 'wip', o: 'CTO', d: 2, c: [['Approval rules', 1], ['Address whitelist', 0]] },
        { id: 'rec', t: 'Key recovery', st: 'todo', o: 'CTO', d: 3, c: [['Procedure written', 0], ['Recovery drill', 0]] }
      ]},
      { id: 'aml', t: 'KYC & AML', leaves: [
        { id: 'kyc', t: 'KYC / KYB', st: 'ok', o: 'Compliance', d: 4, c: [['Provider live', 1], ['Onboarding flows', 1]] },
        { id: 'kyt', t: 'Transaction monitoring', st: 'wip', o: 'Compliance', d: 4, c: [['Provider live', 1], ['Rules tuned', 0]] },
        { id: 'tr', t: 'Travel Rule', st: 'risk', o: 'Compliance', d: 6, c: [['Provider chosen', 0], ['Integration', 0]] },
        { id: 'sanc', t: 'Sanctions screening', st: 'ok', o: 'Compliance', d: 2, c: [['EU and OFAC lists', 1], ['Geoblocking', 1]] },
        { id: 'mlro', t: 'MLRO', st: 'ok', o: 'CEO', d: 3, c: [['Appointed', 1], ['Approved by regulator', 1]] }
      ]},
      { id: 'fin', t: 'Finance', leaves: [
        { id: 'model', t: 'Financial model', st: 'wip', o: 'Finance', d: 2, c: [['Uploaded', 1], ['Reviewed', 0]] },
        { id: 'own', t: 'MiCA own funds', st: 'warn', o: 'Finance', d: 3, c: [['Requirement computed', 0], ['Funds set aside', 1]] },
        { id: 'run', t: 'Runway to licence', st: 'wip', o: 'Finance', d: 2, c: [['Spend plan', 1], ['Buffer for delay', 0]] },
        { id: 'acc', t: 'Crypto accounting', st: 'todo', o: 'Finance', d: 5, c: [['Tool chosen', 0], ['Chart of accounts', 0]] }
      ]},
      { id: 'tax', t: 'Tax & reporting', leaves: [
        { id: 'dac8', t: 'DAC8 / CARF', st: 'warn', o: 'Finance', d: 6, c: [['Customer self-certifications', 0], ['First report in 2027', 0]] },
        { id: 'reg', t: 'Regulator reporting', st: 'todo', o: 'Compliance', d: 2, c: [['Reporting calendar', 0]] },
        { id: 'aud', t: 'Statutory audit', st: 'todo', o: 'Finance', d: 4, c: [['Auditor appointed', 0]] }
      ]},
      { id: 'tech', t: 'Tech & DORA', leaves: [
        { id: 'dora', t: 'DORA register', st: 'wip', o: 'CTO', d: 3, c: [['Vendor list', 1], ['Submitted to regulator', 0]] },
        { id: 'inc', t: 'Incident response', st: 'todo', o: 'CTO', d: 3, c: [['Plan written', 0], ['Tabletop drill', 0]] },
        { id: 'pen', t: 'Penetration test', st: 'todo', o: 'CTO', d: 4, c: [['Vendor chosen', 0], ['Report received', 0]] }
      ]}
    ];

    const LEAF = {}, BRM = {};
    BR.forEach(b => {
      BRM[b.id] = b;
      b.leaves.forEach(l => {
        l.b = b.id;
        LEAF[l.id] = l;
      });
    });

    // Polar Geometry Calculations
    const SX = 1.55, R1 = 190, R2 = 345, R2b = 410;
    const pos = { core: { x: 0, y: 0 } };

    BR.forEach((b, i) => {
      const a = (-90 + 22.5 + i * 45) * Math.PI / 180;
      b.a = a;
      pos[b.id] = { x: Math.cos(a) * R1 * SX, y: Math.sin(a) * R1 };
      const n = b.leaves.length, st = 9.5 * Math.PI / 180;
      b.leaves.forEach((l, j) => {
        const aa = a + (j - (n - 1) / 2) * st;
        const r = j % 2 ? R2b : R2;
        pos[l.id] = { x: Math.cos(aa) * r * SX, y: Math.sin(aa) * r, a: aa };
      });
    });

    // Render concentric orbits and crosshair axes
    [R1, R2, R2b + 40].forEach(r => mk('ellipse', { cx: 0, cy: 0, rx: r * SX, ry: r, class: 'dag-orb' }, gO));
    mk('line', { x1: -760, y1: 0, x2: 760, y2: 0, class: 'dag-axis' }, gO);
    mk('line', { x1: 0, y1: -480, x2: 0, y2: 480, class: 'dag-axis' }, gO);

    // Build edges
    const EDGES = [], NODES = {};
    function createEdge(from, to, brId) {
      const a = pos[from], b = pos[to];
      let d;
      if (from === 'core') {
        d = `M${a.x},${a.y} L${b.x},${b.y}`;
      } else {
        const B = BRM[from], r = (R1 + R2) / 2;
        d = `M${a.x},${a.y} Q${Math.cos(B.a) * r * SX},${Math.sin(B.a) * r} ${b.x},${b.y}`;
      }
      const p = mk('path', { d, class: 'dag-ed' }, gE);
      const len = p.getTotalLength();
      const dot = mk('circle', { r: 2.2, class: 'dag-pt' }, gP);
      dot.style.opacity = 0.7;
      EDGES.push({ p, len, from, to, br: brId, dot, t: Math.random(), v: 0.0012 + Math.random() * 0.001 });
    }

    BR.forEach(b => {
      createEdge('core', b.id, b.id);
      b.leaves.forEach(l => createEdge(b.id, l.id, b.id));
    });

    function lpos(a, r) {
      const c = Math.cos(a);
      if (c > 0.3) return { x: r + 9, y: 4, an: 'start' };
      if (c < -0.3) return { x: -r - 9, y: 4, an: 'end' };
      return { x: 0, y: Math.sin(a) > 0 ? r + 18 : -r - 20, an: 'middle' };
    }

    function createNode(id, kind) {
      const P = pos[id];
      const g = mk('g', { class: `dag-nd ${kind} ${kind === 'leaf' ? LEAF[id].st : ''}`, 'data-id': id, tabindex: 0 }, gN);
      g.style.transform = `translate(${P.x}px,${P.y}px)`;
      const r = kind === 'br' ? 16 : kind === 'core' ? 24 : 9;

      mk('circle', { r: r + 12, class: 'hit' }, g);
      if (kind === 'core') {
        mk('circle', { r: r + 12, class: 'cring' }, g);
        mk('circle', { r: r + 22, class: 'cring', style: 'opacity:0.4' }, g);
      }
      const b = mk('circle', { r, class: 'b' }, g);
      mk('circle', { r: kind === 'core' ? 5 : kind === 'br' ? 4.5 : 3.5, class: 'in' }, g);

      let lb, sb;
      if (kind === 'core') {
        lb = mk('text', { y: r + 36, 'text-anchor': 'middle', class: 'lb' }, g);
        lb.textContent = 'PayFlow EU';
        sb = mk('text', { y: r + 50, 'text-anchor': 'middle', class: 'sb' }, g);
        sb.textContent = 'ENTITY · CASP · LT';
      } else {
        const L = lpos(kind === 'br' ? BRM[id].a : P.a, r + 4);
        lb = mk('text', { x: L.x, y: L.y, 'text-anchor': L.an, class: 'lb' }, g);
        lb.textContent = kind === 'br' ? BRM[id].t : LEAF[id].t;
        sb = mk('text', { x: L.x, y: L.y + 13, 'text-anchor': L.an, class: 'sb' }, g);
        if (kind === 'leaf') {
          const stStr = LEAF[id].st.toUpperCase();
          sb.textContent = `${stStr} · ${LEAF[id].o}`;
        }
      }

      NODES[id] = { g, b, r, kind };

      g.addEventListener('click', e => {
        e.stopPropagation();
        inspectNode(id, kind);
      });
    }

    createNode('core', 'core');
    BR.forEach(b => {
      createNode(b.id, 'br');
      b.leaves.forEach(l => createNode(l.id, 'leaf'));
    });

    // Node Inspector Trigger
    function inspectNode(id, kind) {
      Object.values(NODES).forEach(n => n.g.classList.remove('selected'));
      EDGES.forEach(e => e.p.classList.remove('active-edge'));

      if (!inspector) return;

      if (kind === 'core') {
        inspTitle.textContent = 'PayFlow EU · CASP SPV';
        inspBadge.textContent = 'Active Perimeter';
        inspBadge.className = 'dag-insp-badge ok';
        inspOwner.textContent = 'EEA Hub: Vilnius, Lithuania';
        inspEst.textContent = 'Total nodes: 40';
        inspTasks.innerHTML = `
          <li>✓ MiCA Article 59 perimeter established</li>
          <li>✓ 100% segregated fiat safeguarding</li>
          <li>✓ Automated DORA incident reporting</li>
        `;
        NODES[id].g.classList.add('selected');
        inspector.classList.add('visible');
        return;
      }

      if (kind === 'br') {
        const br = BRM[id];
        inspTitle.textContent = `${br.t} (Domain Area)`;
        inspBadge.textContent = `${br.leaves.length} Checkpoints`;
        inspBadge.className = 'dag-insp-badge wip';
        inspOwner.textContent = 'Area Head: Executive Committee';
        inspEst.textContent = 'Branch: Operations';
        inspTasks.innerHTML = br.leaves.map(l => `
          <li><span style="color:${l.st === 'ok' ? 'var(--accent-ok)' : l.st === 'risk' ? 'var(--accent-risk)' : 'var(--accent-warn)'}">●</span> ${l.t} (${l.st})</li>
        `).join('');
        NODES[id].g.classList.add('selected');
        inspector.classList.add('visible');
        return;
      }

      const l = LEAF[id];
      NODES[id].g.classList.add('selected');
      EDGES.filter(e => e.to === id || e.from === id).forEach(e => e.p.classList.add('active-edge'));

      inspTitle.textContent = l.t;
      const stMap = {
        risk: ['Problem', 'risk'],
        warn: ['Attention', 'warn'],
        wip: ['In Progress', 'wip'],
        todo: ['Not Started', 'todo'],
        ok: ['Completed', 'ok']
      };
      const [lbl, cls] = stMap[l.st] || ['Status', 'todo'];
      inspBadge.textContent = lbl;
      inspBadge.className = `dag-insp-badge ${cls}`;
      inspOwner.textContent = `Owner: ${l.o}`;
      inspEst.textContent = `Runway: ${l.d} days`;

      inspTasks.innerHTML = l.c.map(([tx, done]) => `
        <li>${done ? '✓' : '○'} <span style="${done ? 'color:var(--text-main);font-weight:500' : 'color:var(--text-muted)'}">${tx}</span></li>
      `).join('');

      inspector.classList.add('visible');
    }

    if (inspClose) {
      inspClose.addEventListener('click', () => {
        inspector.classList.remove('visible');
        Object.values(NODES).forEach(n => n.g.classList.remove('selected'));
        EDGES.forEach(e => e.p.classList.remove('active-edge'));
      });
    }

    // Camera Physics (Pan, Wheel Zoom, Controls - Enlarged default view)
    const C = { x: 0, y: 0, k: 1.05 };
    const pad4 = n => (n < 0 ? '−' : '+') + String(Math.abs(Math.round(n))).padStart(4, '0');

    function applyCamera() {
      cam.setAttribute('transform', `translate(${C.x.toFixed(2)},${C.y.toFixed(2)}) scale(${C.k.toFixed(4)})`);
      if (cZ) cZ.textContent = C.k.toFixed(2);
      if (cX) cX.textContent = pad4(-C.x / C.k);
      if (cY) cY.textContent = pad4(-C.y / C.k);
    }
    applyCamera();

    let drag = null;
    stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.dag-nd') || e.target.closest('.dag-inspector-panel') || e.target.closest('.dag-legend-bar') || e.target.closest('.dag-zoom-controls')) return;
      drag = { sx: e.clientX, sy: e.clientY, x: C.x, y: C.y, moved: false };
      stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      C.x = drag.x + dx;
      C.y = drag.y + dy;
      applyCamera();
    });

    stage.addEventListener('pointerup', () => {
      if (drag && !drag.moved && inspector) {
        inspector.classList.remove('visible');
        Object.values(NODES).forEach(n => n.g.classList.remove('selected'));
        EDGES.forEach(e => e.p.classList.remove('active-edge'));
      }
      drag = null;
    });

    if (zIn) zIn.onclick = () => { C.k = Math.min(2.8, C.k * 1.25); applyCamera(); };
    if (zOut) zOut.onclick = () => { C.k = Math.max(0.45, C.k / 1.25); applyCamera(); };
    if (zReset) zReset.onclick = () => { C.x = 0; C.y = 0; C.k = 1.05; applyCamera(); };

    // Energy Pulses along edges loop
    function pulseLoop() {
      EDGES.forEach(e => {
        e.t = (e.t + e.v) % 1;
        const pt = e.p.getPointAtLength(e.t * e.len);
        e.dot.setAttribute('cx', pt.x);
        e.dot.setAttribute('cy', pt.y);
      });
      requestAnimationFrame(pulseLoop);
    }
    requestAnimationFrame(pulseLoop);

    // Fast Auto-Switcher & Visual Timer for Graph Filters (2.4s cycle)
    const legendBtns = Array.from(document.querySelectorAll('.dag-lg-btn'));
    let activeFilterIdx = 0;
    const CYCLE_MS = 2400;
    let filterTimer = null;
    let isFilterPaused = false;

    function applyFilter(idx) {
      if (!legendBtns.length) return;
      activeFilterIdx = idx % legendBtns.length;
      legendBtns.forEach((b, i) => {
        b.classList.toggle('active', i === activeFilterIdx);
      });
      const activeBtn = legendBtns[activeFilterIdx];
      const filter = activeBtn.dataset.f;

      Object.values(NODES).forEach(n => {
        if (filter === 'all' || n.kind === 'core' || n.kind === 'br') {
          n.g.classList.remove('dimmed');
        } else {
          const l = LEAF[n.g.dataset.id];
          if (l && l.st === filter) {
            n.g.classList.remove('dimmed');
          } else {
            n.g.classList.add('dimmed');
          }
        }
      });

      EDGES.forEach(e => {
        if (filter === 'all') {
          e.p.classList.remove('dimmed');
        } else {
          const l = LEAF[e.to];
          if (l && l.st === filter) {
            e.p.classList.remove('dimmed');
          } else {
            e.p.classList.add('dimmed');
          }
        }
      });
    }

    function startFilterCycle() {
      if (filterTimer) clearInterval(filterTimer);
      filterTimer = setInterval(() => {
        if (!isFilterPaused) {
          applyFilter(activeFilterIdx + 1);
        }
      }, CYCLE_MS);
    }

    legendBtns.forEach((btn, idx) => {
      btn.addEventListener('click', function () {
        applyFilter(idx);
        startFilterCycle();
      });
      btn.addEventListener('mouseenter', () => { isFilterPaused = true; });
      btn.addEventListener('mouseleave', () => { isFilterPaused = false; });
    });

    applyFilter(0);
    startFilterCycle();
  }
  initPlatformDag();

  // 6. SCROLLYTELLING CIRCUIT LINE IN SHOWCASE (STRAIGHT LINES WITH ROUNDED CORNERS)
  function initShowcaseCircuit() {
    const list = document.getElementById('showcaseList');
    const pathBg = document.getElementById('showcaseCircuitBg');
    const pathActive = document.getElementById('showcaseCircuitActive');
    if (!list || !pathBg || !pathActive) return;

    let pathLength = 0;

    function buildPath() {
      const rows = Array.from(list.querySelectorAll('.showcase-row'));
      if (rows.length < 2) return;

      const listRect = list.getBoundingClientRect();
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        pathBg.style.display = 'none';
        pathActive.style.display = 'none';
        return;
      }

      pathBg.style.display = '';
      pathActive.style.display = '';

      const R = 28;
      const media0 = rows[0].querySelector('.showcase-media');
      const media1 = rows[1].querySelector('.showcase-media');
      if (!media0 || !media1) return;

      const m0Rect = media0.getBoundingClientRect();
      const m1Rect = media1.getBoundingClientRect();

      const xLeft = Math.round(m0Rect.left + m0Rect.width / 2 - listRect.left);
      const xRight = Math.round(m1Rect.left + m1Rect.width / 2 - listRect.left);

      let d = `M ${xLeft} 0`;

      for (let i = 0; i < rows.length; i++) {
        const curRow = rows[i];
        const curTop = curRow.offsetTop;
        const curBottom = curTop + curRow.offsetHeight;
        const isLeft = (i % 2 === 0);
        const curX = isLeft ? xLeft : xRight;

        if (i < rows.length - 1) {
          const nextRow = rows[i + 1];
          const nextTop = nextRow.offsetTop;
          const midY = Math.round((curBottom + nextTop) / 2);
          const nextX = isLeft ? xRight : xLeft;

          d += ` L ${curX} ${midY - R}`;

          if (nextX > curX) {
            d += ` Q ${curX} ${midY} ${curX + R} ${midY}`;
            d += ` L ${nextX - R} ${midY}`;
            d += ` Q ${nextX} ${midY} ${nextX} ${midY + R}`;
          } else {
            d += ` Q ${curX} ${midY} ${curX - R} ${midY}`;
            d += ` L ${nextX + R} ${midY}`;
            d += ` Q ${nextX} ${midY} ${nextX} ${midY + R}`;
          }
        } else {
          d += ` L ${curX} ${curBottom}`;
        }
      }

      pathBg.setAttribute('d', d);
      pathActive.setAttribute('d', d);

      pathLength = pathActive.getTotalLength();
      pathActive.style.strokeDasharray = `${pathLength} ${pathLength}`;
      pathActive.style.strokeDashoffset = `${pathLength}`;
      updateScrollProgress();
    }

    function updateScrollProgress() {
      if (!pathLength) return;
      const rows = list.querySelectorAll('.showcase-row');
      if (rows.length < 2) return;

      const firstRect = rows[0].getBoundingClientRect();
      const lastRect = rows[rows.length - 1].getBoundingClientRect();
      const windowH = window.innerHeight;

      const startY = windowH * 0.75;
      const endY = windowH * 0.45;

      const totalDist = (lastRect.top - firstRect.top) + (startY - endY);
      const scrolled = startY - firstRect.top;

      const progress = Math.max(0, Math.min(1, scrolled / totalDist));
      pathActive.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', buildPath);
    window.addEventListener('load', buildPath);

    list.querySelectorAll('.showcase-img').forEach(img => {
      if (img.complete) {
        buildPath();
      } else {
        img.addEventListener('load', buildPath);
      }
    });

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => buildPath());
      ro.observe(list);
    }

    // Initial build
    buildPath();
    setTimeout(buildPath, 100);
    setTimeout(buildPath, 400);
  }
  initShowcaseCircuit();

  // 7. NAVBAR ACTIVE SECTION SCROLL SPY (BOLD ON ACTIVE BLOCK)
  function initNavScrollSpy() {
    const navLinks = Array.from(document.querySelectorAll('.nav-link[data-section]'));
    if (!navLinks.length) return;

    const sections = navLinks.map(link => {
      const id = link.dataset.section;
      return { id, link, el: document.getElementById(id) };
    }).filter(s => s.el);

    function checkActiveSection() {
      const scrollY = window.pageYOffset;
      const windowH = window.innerHeight;
      let activeSection = null;

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        const rect = sec.el.getBoundingClientRect();
        const top = rect.top + scrollY;
        const bottom = top + rect.height;

        if (scrollY + 160 >= top && scrollY + 160 < bottom) {
          activeSection = sec;
          break;
        }
      }

      if (!activeSection && (scrollY + windowH >= document.body.scrollHeight - 100)) {
        activeSection = sections[sections.length - 1];
      }

      navLinks.forEach(l => l.classList.remove('active'));
      if (activeSection) {
        activeSection.link.classList.add('active');
      }
    }

    window.addEventListener('scroll', checkActiveSection, { passive: true });
    checkActiveSection();
  }
  initNavScrollSpy();

})();
