/* Buildless and file:// friendly. All content is local; no remote requests.
   Numbers come from js/xg-data.js (generated from the notebook outputs).
   The two fitted Logistic Regression models come from js/xg-models.js (exported by the notebook). */
(() => {
  'use strict';
  const data = window.XG_DATA;
  const models = window.XG_MODELS;
  if (!data) {
    console.error('xG results are missing: load xg-data.js before xg.js.');
    return;
  }
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const pct = v => `${(v * 100).toFixed(1)}%`;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function svg(tag, attrs = {}) {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
  }
  function setSeg(group, attr, value) {
    group.querySelectorAll(`[${attr}]`).forEach(b => {
      const on = b.getAttribute(attr) === value;
      b.className = on ? 'active' : '';
      b.setAttribute('aria-pressed', String(on));
    });
  }
  function barRow(label, valueText, widthPct, extra = '') {
    const row = el('div', `bar-row ${extra}`.trim());
    const head = el('div', 'bar-label');
    head.append(el('span', '', label), el('strong', '', valueText));
    const track = el('div', 'bar-track'); track.setAttribute('aria-hidden', 'true');
    const fill = el('div', 'bar-fill'); fill.style.width = `${Math.max(0, Math.min(100, widthPct))}%`;
    track.append(fill); row.append(head, track);
    return row;
  }
  function addRow(parent, values) {
    const tr = document.createElement('tr');
    values.forEach((value, index) => { const cell = document.createElement(index ? 'td' : 'th'); if (!index) cell.scope = 'row'; cell.textContent = value; tr.append(cell); });
    parent.append(tr);
  }

  /* ---------- Pitch drawing. StatsBomb pitch is 120 x 80 yards, attacking towards x = 120.
     We draw the attacking half: svg x = location_y (0..80), svg y = 120 - location_x (0..60). ---------- */
  const toSvg = (x, y) => [y, 120 - x];
  function drawMarkings(root) {
    const g = svg('g');
    g.append(
      svg('rect', { class: 'line', x: 0, y: 0, width: 80, height: 60 }),
      svg('rect', { class: 'line', x: 18, y: 0, width: 44, height: 18 }),
      svg('rect', { class: 'line', x: 30, y: 0, width: 20, height: 6 }),
      svg('path', { class: 'line', d: 'M32 18 A10 10 0 0 0 48 18' }),
      svg('path', { class: 'line', d: 'M30 60 A10 10 0 0 1 50 60' }),
      svg('circle', { class: 'spot', cx: 40, cy: 12, r: 0.45 }),
      svg('rect', { class: 'goal', x: 36, y: -1.6, width: 8, height: 1.6 })
    );
    root.append(g);
    return g;
  }
  function newPitch(label) {
    const s = svg('svg', { class: 'pitch', viewBox: '-2 -3 84 64', role: 'img', 'aria-label': label });
    return s;
  }

  /* ---------- Chapter 02: where do goals come from? ---------- */
  const edaViews = {
    width: {
      title: 'Goal rate across the width of the pitch',
      rows: data.y_bins, shade: 'width', unit: l => `y ${l}`, lead: true,
      text: 'Notice how the goal rate peaks in the middle of the pitch (y between 38 and 42) and falls away on both sides. That shape is a hill, and Logistic Regression only gets one number for location_y, so it can tilt towards one side but it can never make the middle special.'
    },
    depth: {
      title: 'Goal rate by how far up the pitch',
      rows: data.x_bins, shade: 'depth', unit: l => `x ${l}`, lead: true,
      text: 'The closer the shot is to the goal line, the more often it goes in, from about 1% for shots more than 30 yards out up to 25% in the last 6 yards. At least this column moves in one direction, which a straight line can handle.'
    },
    distance: {
      title: 'Goal rate by distance to goal (engineered)',
      rows: data.distance_bins, shade: 'distance', unit: l => `${l} yd`, lead: true,
      text: 'Measuring the straight-line distance to the centre of the goal turns the pitch into rings around the goal, and the goal rate goes up with every step closer you take.'
    },
    angle: {
      title: 'Goal rate by shooting angle (engineered)',
      rows: data.angle_bins, shade: null, unit: l => `${l}°`, lead: true,
      text: 'This is the angle between the two posts as seen from the ball, so a wide angle means the shooter can see a lot of the goal. The goal rate rises with the angle at almost every step, which is exactly the kind of pattern a straight line can learn.'
    },
    defenders: {
      title: 'Goal rate by defenders in the way (engineered)',
      rows: data.defenders_in_the_way.map(([n, count, rate]) => [`${n} defender${n === 1 ? '' : 's'} · ${count.toLocaleString()} shots`, rate]),
      shade: null,
      text: 'With nobody between the ball and the goal, 13.8% of shots go in, and a single defender in the way more than halves that. The groups with more than 4 defenders contain very few shots, so we wouldn’t read much into those bars.'
    },
    body: {
      title: 'The header puzzle',
      rows: data.body_part.map(([part, rate, x]) => [`${part} · avg location_x ${x.toFixed(1)}`, rate]),
      shade: null,
      text: 'Headers score about as often as shots with the foot (10.7% against 10.5% for the right foot), which looked wrong to us until we noticed that headers are taken about 10 yards closer to goal on average. The location was doing the work, not the head.'
    }
  };
  const binLabel = label => label.replace(/[(\]]/g, '').replace(', ', '–');
  function shadeColor(rate, max) {
    const t = Math.min(1, rate / max);
    return `rgba(33, 102, 87, ${0.08 + t * 0.72})`;
  }
  let edaView = 'width';
  function renderEda() {
    const view = edaViews[edaView];
    setSeg($('eda-buttons'), 'data-view', edaView);
    const max = Math.max(...view.rows.map(r => r[1]));
    $('eda-bars').replaceChildren(...view.rows.map(([label, rate]) => barRow(view.unit ? view.unit(binLabel(label)) : label, pct(rate), rate / 0.5 * 100, view.lead && rate === max ? 'lead' : '')));
    $('eda-summary').textContent = view.text;
    const holder = $('eda-pitch');
    holder.replaceChildren();
    $('eda-pitch-panel').hidden = !view.shade;
    $('eda-grid').classList.toggle('single', !view.shade);
    if (!view.shade) return;
    const pitch = newPitch(view.title);
    const clip = svg('clipPath', { id: 'eda-clip' }); clip.append(svg('rect', { x: 0, y: 0, width: 80, height: 60 }));
    pitch.append(clip);
    const shades = svg('g', { 'clip-path': 'url(#eda-clip)' });
    const range = l => l.replace(/[(\]]/g, '').split(', ').map(Number);
    if (view.shade === 'width') {
      view.rows.forEach(([label, rate]) => {
        const [a, b] = range(label);
        shades.append(svg('rect', { x: a, y: 0, width: b - a, height: 60, fill: shadeColor(rate, max) }));
        const t = svg('text', { class: 'band-label', x: (a + b) / 2, y: 30 }); t.textContent = `${Math.round(rate * 100)}%`; shades.append(t);
      });
    } else if (view.shade === 'depth') {
      view.rows.forEach(([label, rate]) => {
        let [a, b] = range(label); a = Math.max(a, 60); b = Math.min(b, 120);
        shades.append(svg('rect', { x: 0, y: 120 - b, width: 80, height: b - a, fill: shadeColor(rate, max) }));
        const t = svg('text', { class: 'band-label', x: 72, y: 120 - (a + b) / 2 + 0.8 }); t.textContent = `${Math.round(rate * 100)}%`; shades.append(t);
      });
    } else {
      [...view.rows].reverse().forEach(([label, rate]) => {
        const [, b] = range(label);
        shades.append(svg('circle', { cx: 40, cy: 0, r: Math.min(b, 100), fill: shadeColor(rate, max), stroke: 'white', 'stroke-width': 0.15 }));
      });
      view.rows.forEach(([label, rate]) => {
        const [a, b] = range(label);
        const mid = (a + Math.min(b, 40)) / 2;
        const t = svg('text', { class: 'band-label', x: 40 + mid * 0.71, y: mid * 0.71 + 0.8 }); t.textContent = `${Math.round(rate * 100)}%`; shades.append(t);
      });
    }
    pitch.append(shades);
    drawMarkings(pitch);
    holder.append(pitch);
  }
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => { edaView = b.dataset.view; renderEda(); }));
  renderEda();

  /* ---------- Feature code, mirrored from the notebook ---------- */
  const POST1 = 36, POST2 = 44;
  function shotFeatures(shot, defenders, keeper) {
    const { x, y } = shot;
    const distance = Math.sqrt((120 - x) ** 2 + (40 - y) ** 2);
    const post1 = Math.atan2(POST1 - y, 120 - x);
    const post2 = Math.atan2(POST2 - y, 120 - x);
    const angle = (post2 - post1) * 180 / Math.PI;
    let inTheWay = 0, closest = 30, closestIndex = -1;
    const flags = defenders.map((p, i) => {
      const d = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      if (d < closest) { closest = d; closestIndex = i; }
      const a = Math.atan2(p.y - y, p.x - x);
      const blocking = p.x > x && post1 <= a && a <= post2;
      if (blocking) inTheWay += 1;
      return blocking;
    });
    const keeperDistance = Math.sqrt((120 - keeper.x) ** 2 + (40 - keeper.y) ** 2);
    return { distance, angle, inTheWay, closest, closestIndex, keeperDistance, flags };
  }
  function featureValues(shot, body, f) {
    const v = {
      location_x: shot.x, location_y: shot.y, minute: 45, period: 1,
      under_pressure: 0, first_time: 0, one_on_one: 0, open_goal: 0, follows_dribble: 0, aerial_won: 0,
      'technique_Normal': 1, 'shot_type_Open Play': 1, 'play_pattern_Regular Play': 1,
      distance_to_goal: f.distance, shot_angle: f.angle, defenders_in_the_way: f.inTheWay,
      closest_defender: f.closest, keeper_distance: f.keeperDistance,
      header_distance: body === 'Head' ? f.distance : 0
    };
    if (body !== 'Head') v[`body_part_${body}`] = 1;
    return v;
  }
  function predict(model, values) {
    let z = model.intercept;
    const parts = model.features.map((name, i) => {
      const value = values[name] ?? 0;
      const push = model.coef[i] * (value - model.mean[i]) / model.scale[i];
      z += push;
      return { name, push };
    });
    return { xg: 1 / (1 + Math.exp(-z)), parts };
  }
  const whyGroups = {
    distance_to_goal: 'Distance to goal', shot_angle: 'Shooting angle', defenders_in_the_way: 'Defenders in the way',
    closest_defender: 'Space to the nearest defender', keeper_distance: 'Keeper off his line', header_distance: 'Body part',
    location_x: 'Position on the pitch (x, y)', location_y: 'Position on the pitch (x, y)'
  };

  function missingModels(holderId) {
    const box = el('div', 'empty'); box.setAttribute('role', 'status');
    box.append(el('strong', '', 'The model file hasn’t loaded.'),
      el('p', '', 'This demo runs the two Logistic Regression models saved by the notebook, so it needs js/xg-models.js. You can rebuild that file from the notebook’s export with tools/build_xg_data.py.'));
    $(holderId).replaceChildren(box);
  }

  /* ---------- Chapter 04: take the shot ---------- */
  const start = () => ({
    shooter: { x: 104, y: 33 },
    keeper: { x: 118.5, y: 40 },
    defenders: [{ x: 110, y: 37 }, { x: 108, y: 45 }],
    body: 'Right Foot'
  });
  let scene = start();
  function renderShot() {
    if (!models) { missingModels('shot-stage'); return; }
    const f = shotFeatures(scene.shooter, scene.defenders, scene.keeper);
    const raw = predict(models.raw, featureValues(scene.shooter, scene.body, f));
    const eng = predict(models.engineered, featureValues(scene.shooter, scene.body, f));
    setSeg($('body-buttons'), 'data-body', scene.body);
    $('add-defender').disabled = scene.defenders.length >= 6;
    $('remove-defender').disabled = scene.defenders.length === 0;

    const pitch = $('shot-pitch');
    const layer = pitch.querySelector('#shot-layer');
    layer.replaceChildren();
    const [sx, sy] = toSvg(scene.shooter.x, scene.shooter.y);
    layer.append(svg('polygon', { class: 'cone', points: `${sx},${sy} ${POST1},0 ${POST2},0` }));
    if (f.closestIndex >= 0) {
      const d = scene.defenders[f.closestIndex]; const [dx, dy] = toSvg(d.x, d.y);
      layer.append(svg('line', { class: 'closest-line', x1: sx, y1: sy, x2: dx, y2: dy }));
    }
    const player = (who, p, cls, label, index) => {
      const [cx, cy] = toSvg(p.x, p.y);
      const g = svg('g');
      const c = svg('circle', { class: `player ${cls}`, cx, cy, r: who === 'shooter' ? 1.9 : 1.7, tabindex: 0, role: 'button',
        'aria-label': `${label}. Drag, or use arrow keys to move.`, 'data-who': who, 'data-index': index ?? '' });
      const t = svg('text', { class: 'player-label', x: cx, y: cy }); t.textContent = who === 'shooter' ? '⚽' : who === 'keeper' ? 'GK' : String(index + 1);
      g.append(c, t); layer.append(g);
    };
    scene.defenders.forEach((d, i) => player('defender', d, `defender${f.flags[i] ? ' in-the-way' : ''}`, `Defender ${i + 1}${f.flags[i] ? ', in the way' : ''}`, i));
    player('keeper', scene.keeper, 'keeper', 'Goalkeeper');
    player('shooter', scene.shooter, 'shooter', 'Shooter');

    const rows = [
      ['Distance to goal', 'yards to the centre of the goal', f.distance.toFixed(1)],
      ['Shooting angle', 'degrees of the goal mouth visible', `${f.angle.toFixed(1)}°`],
      ['Defenders in the way', 'inside the shaded cone', String(f.inTheWay)],
      ['Nearest defender', 'in yards, capped at 30', f.closest.toFixed(1)],
      ['Keeper distance', 'yards from the centre of the goal', f.keeperDistance.toFixed(1)]
    ];
    $('shot-readings').replaceChildren(...rows.map(([name, hint, value]) => {
      const tr = document.createElement('tr'); const th = document.createElement('th'); th.scope = 'row';
      th.append(name, el('small', '', hint)); const td = el('td', '', value); tr.append(th, td); return tr;
    }));
    $('xg-raw').textContent = raw.xg.toFixed(3);
    $('xg-eng').textContent = eng.xg.toFixed(3);
    $('xg-raw-bar').style.width = `${Math.min(100, raw.xg * 100)}%`;
    $('xg-eng-bar').style.width = `${Math.min(100, eng.xg * 100)}%`;

    const groups = {};
    eng.parts.forEach(({ name, push }) => {
      const group = whyGroups[name] || (name.startsWith('body_part_') ? 'Body part' : null);
      if (group) groups[group] = (groups[group] || 0) + push;
    });
    const top = Object.entries(groups).map(([name, push]) => ({ name, push })).filter(p => Math.abs(p.push) > 0.005).sort((a, b) => Math.abs(b.push) - Math.abs(a.push)).slice(0, 5);
    const maxPush = Math.max(0.5, ...top.map(p => Math.abs(p.push)));
    $('why-rows').replaceChildren(...top.map(p => {
      const row = el('div', 'why-row');
      const bar = el('div', 'why-bar'); const span = el('span', p.push > 0 ? 'up' : 'down');
      span.style.width = `${Math.abs(p.push) / maxPush * 50}%`; bar.append(span);
      row.append(el('span', '', `${p.name} ${p.push > 0 ? '↑' : '↓'}`), bar);
      return row;
    }));

    const diff = eng.xg - raw.xg;
    let story;
    const clear = predict(models.engineered, featureValues(scene.shooter, scene.body, { ...f, inTheWay: 0 })).xg;
    if (f.inTheWay >= 2) story = `${f.inTheWay} defenders are standing in the shaded cone. The engineered model sees them and says ${eng.xg.toFixed(3)}, where the same shot with nobody in the way would be ${clear.toFixed(3)}. The raw model cannot see any defenders, so it says ${raw.xg.toFixed(3)} either way.`;
    else if (raw.xg - eng.xg > 0.08 && f.angle < 18) story = `From this tight angle the raw model gets fooled, because x on its own says the shot is close to goal. It has no idea that the shooter can only see ${f.angle.toFixed(1)}° of the goal mouth, which the engineered model does know, so it gives a much lower xG.`;
    else if (f.keeperDistance > 6) story = `The keeper has come ${f.keeperDistance.toFixed(1)} yards away from the centre of his goal, and only the engineered model knows about it, which is why its xG is so much higher than the raw model’s.`;
    else if (Math.abs(diff) < 0.02) story = `Here the two models roughly agree. Try dragging a defender into the shaded cone, or moving the shooter out towards the byline, and watch them split apart.`;
    else story = `The engineered model says ${eng.xg.toFixed(3)} and the raw model says ${raw.xg.toFixed(3)}. The raw model only knows the position of the shot and the body part (everything else is held fixed here), so moving the defenders or the keeper never changes its number.`;
    $('shot-summary').textContent = story;
  }
  function svgPoint(pitch, event) {
    const pt = pitch.createSVGPoint(); pt.x = event.clientX; pt.y = event.clientY;
    const p = pt.matrixTransform(pitch.getScreenCTM().inverse());
    const y = Math.max(0, Math.min(80, p.x));
    const x = Math.max(60, Math.min(120, 120 - p.y));
    return { x, y };
  }
  function target(who, index) {
    return who === 'shooter' ? scene.shooter : who === 'keeper' ? scene.keeper : scene.defenders[Number(index)];
  }
  function setupShotLab() {
    if (!models) { missingModels('shot-stage'); return; }
    const pitch = $('shot-pitch');
    drawMarkings(pitch);
    pitch.append(svg('g', { id: 'shot-layer' }));
    let drag = null;
    pitch.addEventListener('pointerdown', event => {
      const node = event.target.closest('[data-who]');
      if (node) {
        drag = { who: node.dataset.who, index: node.dataset.index };
        pitch.setPointerCapture(event.pointerId);
      } else {
        const p = svgPoint(pitch, event);
        scene.shooter = { x: Math.min(p.x, 119.5), y: p.y };
        renderShot();
      }
    });
    pitch.addEventListener('pointermove', event => {
      if (!drag) return;
      const p = svgPoint(pitch, event);
      const t = target(drag.who, drag.index);
      t.x = drag.who === 'shooter' ? Math.min(p.x, 119.5) : p.x; t.y = p.y;
      renderShot();
    });
    const stop = () => { drag = null; };
    pitch.addEventListener('pointerup', stop);
    pitch.addEventListener('pointercancel', stop);
    pitch.addEventListener('keydown', event => {
      const node = event.target.closest('[data-who]');
      if (!node) return;
      const step = event.shiftKey ? 2 : 0.5;
      const t = target(node.dataset.who, node.dataset.index);
      const moves = { ArrowUp: [step, 0], ArrowDown: [-step, 0], ArrowLeft: [0, -step], ArrowRight: [0, step] };
      if (!moves[event.key]) return;
      event.preventDefault();
      t.x = Math.max(60, Math.min(node.dataset.who === 'shooter' ? 119.5 : 120, t.x + moves[event.key][0]));
      t.y = Math.max(0, Math.min(80, t.y + moves[event.key][1]));
      const who = node.dataset.who, index = node.dataset.index;
      renderShot();
      pitch.querySelector(`[data-who="${who}"][data-index="${index}"]`)?.focus();
    });
    document.querySelectorAll('[data-body]').forEach(b => b.addEventListener('click', () => { scene.body = b.dataset.body; renderShot(); }));
    $('add-defender').addEventListener('click', () => { scene.defenders.push({ x: 112, y: 30 + scene.defenders.length * 4 }); renderShot(); });
    $('remove-defender').addEventListener('click', () => { scene.defenders.pop(); renderShot(); });
    $('reset-shot').addEventListener('click', () => { scene = start(); renderShot(); });
    document.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
      const presets = {
        tapin: { shooter: { x: 116.5, y: 40.5 }, keeper: { x: 119, y: 38.5 }, defenders: [{ x: 115, y: 44 }] },
        crowded: { shooter: { x: 106, y: 40 }, keeper: { x: 118.5, y: 40 }, defenders: [{ x: 109, y: 39.5 }, { x: 112, y: 41 }, { x: 114, y: 39 }] },
        tight: { shooter: { x: 115, y: 22 }, keeper: { x: 119, y: 36.5 }, defenders: [{ x: 116, y: 31 }] },
        oneonone: { shooter: { x: 109, y: 42 }, keeper: { x: 113, y: 41 }, defenders: [{ x: 100, y: 46 }] }
      };
      scene = { ...presets[b.dataset.preset], body: scene.body }; renderShot();
    }));
    renderShot();
  }
  setupShotLab();

  /* ---------- Chapter 05: the scoreboard ---------- */
  let feats = 'raw';
  const scales = { logloss: [0.23, 0.285], auc: [0.70, 0.83] };
  function renderScores() {
    const evaluation = $('score-eval').value;
    const metric = $('score-metric').value;
    const lowerBetter = metric === 'logloss';
    setSeg($('feat-buttons'), 'data-feats', feats);
    const set = data.scores[feats];
    const rows = Object.entries(set).map(([model, s]) => ({ model, value: s[evaluation][metric] }));
    rows.sort((a, b) => lowerBetter ? a.value - b.value : b.value - a.value);
    const [lo, hi] = scales[metric];
    const width = v => lowerBetter ? (v - lo) / (hi - lo) * 100 : (v - lo) / (hi - lo) * 100;
    const bars = rows.map((r, i) => barRow(`${i + 1}. ${r.model}${r.model === 'Decision Tree' ? ` (depth ${data.tree_depth[feats]})` : ''}`, r.value.toFixed(4), width(r.value), i === 0 ? 'lead' : ''));
    if (evaluation === 'test') bars.push(barRow('StatsBomb’s own xG (reference, not our model)', data.statsbomb[metric].toFixed(4), width(data.statsbomb[metric]), 'reference'));
    $('score-bars').replaceChildren(...bars);
    $('score-axis').textContent = lowerBetter
      ? `This is log loss, so lower is better. The bars start at ${lo} so that the small gaps are easier to see.`
      : `This is AUC, so higher is better. The bars start at ${lo} so that the small gaps are easier to see.`;
    $('score-context').textContent = `${feats === 'raw' ? 'Raw columns' : 'With football features'} · ${evaluation === 'test' ? 'Test' : 'Validation'} ${metric === 'logloss' ? 'log loss' : 'AUC'}`;
    const lr = set['Logistic Regression'][evaluation], xgb = set['XGBoost'][evaluation];
    const gap = (lr.logloss - xgb.logloss) / xgb.logloss * 100;
    const aucGap = lr.auc - xgb.auc;
    let text = feats === 'raw'
      ? `XGBoost is clearly ahead in this round, with Logistic Regression’s ${evaluation} log loss ${gap.toFixed(1)}% higher and its AUC ${Math.abs(aucGap).toFixed(3)} lower.`
      : `The two models are now level, with Logistic Regression’s ${evaluation} log loss ${Math.abs(gap).toFixed(2)}% ${gap < 0 ? 'lower' : 'higher'} than XGBoost’s and its AUC ${Math.abs(aucGap).toFixed(4)} ${aucGap >= 0 ? 'higher' : 'lower'}.`;
    if (feats === 'engineered' && evaluation === 'test') text += ' By the rule we wrote down before running the rematch (within 1% on log loss and 0.01 on AUC), that makes Logistic Regression competitive.';
    $('score-summary').textContent = text;
    $('score-table').replaceChildren();
    Object.entries(set).forEach(([model, s]) => addRow($('score-table'), [model, s.validation.logloss.toFixed(4), s.validation.auc.toFixed(4), s.test.logloss.toFixed(4), s.test.auc.toFixed(4)]));
    addRow($('score-table'), ['StatsBomb xG (reference)', '—', '—', data.statsbomb.logloss.toFixed(4), data.statsbomb.auc.toFixed(4)]);
    $('score-caption').textContent = `${feats === 'raw' ? 'Raw columns' : 'With football features'}: every score as printed in the notebook`;
    $('depth-table').replaceChildren();
    data.depth_search[feats].forEach(([depth, loss]) => addRow($('depth-table'), [String(depth), loss.toFixed(4), depth === data.tree_depth[feats] ? 'chosen' : '']));
  }
  document.querySelectorAll('[data-feats]').forEach(b => b.addEventListener('click', () => { feats = b.dataset.feats; renderScores(); }));
  $('score-eval').addEventListener('change', renderScores);
  $('score-metric').addEventListener('change', renderScores);
  renderScores();

  /* ---------- Chapter 05: what Logistic Regression learned ---------- */
  const engineered = ['distance_to_goal', 'shot_angle', 'defenders_in_the_way', 'closest_defender', 'keeper_distance', 'header_distance'];
  const football = [...engineered, 'location_x', 'location_y', 'body_part_Right Foot', 'body_part_Left Foot'];
  const readings = {
    distance_to_goal: 'This is the biggest effect by far. The further the shot is from goal, the lower the xG, which is the oldest rule in football.',
    location_x: 'This overlaps with distance, because both of them measure how far up the pitch the shot is, so the effect gets shared between the two. That’s why we don’t read this one on its own.',
    defenders_in_the_way: 'Every extra defender standing between the ball and the goal pushes the xG down.',
    shot_angle: 'The more of the goal mouth the shooter can see, the higher the xG.',
    closest_defender: 'On its own this looked flat in the EDA, but next to distance it is clearly positive, which means that from the same spot, more space around the shooter leads to more goals.',
    keeper_distance: 'The further the keeper is from the centre of his goal, the higher the xG, so rushing out or being caught out of position costs goals.',
    header_distance: 'This one is almost zero, which means our idea that headers fade with distance added very little, because the body-part columns already tell the model that headers are worse.',
    'body_part_Right Foot': 'This is positive compared with headers, which are the dropped category. From the same spot, a shot with the foot beats a header, and that finally solves the header puzzle from Chapter 02.',
    'body_part_Left Foot': 'It tells the same story as the right foot, since from the same spot a shot with the foot beats a header.',
    location_y: 'This one is tiny, because once the model knows the angle, being left or right of the goal barely matters.',
    'shot_type_Open Play': 'This is compared with direct free kicks, which are the dropped category. Once distance is known, open-play shots go in a bit less often. Our guess is that free kicks are clean strikes with nobody pressing the shooter, but we didn’t test that.',
    aerial_won: 'Shots that come right after winning an aerial duel go in less often, probably because they tend to be scrappy, contested headers.',
    under_pressure: 'This is slightly positive, which we didn’t expect. It is small and it overlaps with the defender features, so we wouldn’t read much into it.'
  };
  let coefView = 'football', selectedCoef = 'distance_to_goal';
  function renderCoefs() {
    setSeg($('coef-buttons'), 'data-coefview', coefView);
    const list = data.coefficients.filter(([name]) => coefView === 'all' || football.includes(name));
    const max = Math.max(...data.coefficients.map(([, v]) => Math.abs(v)));
    $('coef-list').replaceChildren(...list.map(([name, value]) => {
      const row = el('button', `coef-row${engineered.includes(name) ? ' engineered' : ''}${name === selectedCoef ? ' selected' : ''}`);
      row.type = 'button'; row.setAttribute('aria-pressed', String(name === selectedCoef));
      const track = el('span', 'coef-track'); const bar = el('span', value >= 0 ? 'up' : 'down');
      bar.style.width = `${Math.abs(value) / max * 50}%`; track.append(bar);
      row.append(el('span', 'name', name), track, el('span', 'value', value.toFixed(3)));
      row.addEventListener('click', () => { selectedCoef = name; renderCoefs(); });
      return row;
    }));
    const value = data.coefficients.find(([n]) => n === selectedCoef)[1];
    $('coef-reading').textContent = `${selectedCoef} = ${value.toFixed(3)}. ${readings[selectedCoef] || (value >= 0 ? 'This gives the xG a small push up.' : 'This gives the xG a small push down.') + ' The features were standardised, so you can compare its size with the others.'}`;
  }
  document.querySelectorAll('[data-coefview]').forEach(b => b.addEventListener('click', () => { coefView = b.dataset.coefview; renderCoefs(); }));
  renderCoefs();

  /* ---------- Code: verbatim notebook cells ---------- */
  document.querySelectorAll('code[data-code]').forEach(node => { node.textContent = data.code[node.dataset.code]; });
  const excerpts = [
    ['01 / Split by match, like the Seoul day split', 'split'],
    ['02 / What the model is not allowed to see', 'leakage'],
    ['03 / Distance and shooting angle', 'distance_angle'],
    ['04 / Reading the freeze frame', 'freeze_frame'],
    ['05 / Headers from far away', 'header'],
    ['06 / XGBoost with the same settings as Seoul', 'xgboost'],
    ['07 / Ten match splits to check that we didn’t just get lucky', 'repeats']
  ];
  excerpts.forEach(([title, key]) => {
    const details = document.createElement('details');
    const summary = el('summary', '', title);
    const block = el('div', 'code-block');
    const toolbar = el('div', 'code-top');
    const button = el('button', 'copy', 'Copy'); button.type = 'button';
    button.addEventListener('click', async () => { try { await navigator.clipboard.writeText(data.code[key]); button.textContent = 'Copied'; setTimeout(() => button.textContent = 'Copy', 1500); } catch { button.textContent = 'Select code to copy'; } });
    toolbar.append(el('span', '', 'PYTHON / FINAL NOTEBOOK EXCERPT'), button);
    const pre = el('pre', 'code'); const code = el('code', '', data.code[key]); pre.append(code);
    block.append(toolbar, pre); details.append(summary, block); $('code-excerpts').append(details);
  });
})();
