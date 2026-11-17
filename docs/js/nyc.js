/* Local-only interactive evidence: no fetch, chart library or network dependency.
   Every number comes from js/nyc-data.js, which records the notebook cell it was taken from. */
(() => {
  'use strict';
  const data = window.NYC_DATA;
  if (!data) {
    console.error('NYC results are missing: load nyc-data.js before nyc.js.');
    return;
  }
  const q = selector => document.querySelector(selector);
  const NS = 'http://www.w3.org/2000/svg';
  const fmt = n => n.toLocaleString('en-US');
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function svg(tag, attrs = {}, text) {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function setSeg(attr, value) {
    document.querySelectorAll(`[${attr}]`).forEach(b => {
      const on = b.getAttribute(attr) === value;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }
  function bar(widthPct, extra = '') {
    const track = element('div', 'bar-track'); track.setAttribute('aria-hidden', 'true');
    const fill = element('div', `bar-fill ${extra}`.trim()); fill.style.width = `${Math.max(0.6, Math.min(100, widthPct))}%`;
    track.append(fill);
    return track;
  }

  /* ---------- Chapter 02: correlations before and after cleaning ---------- */
  function clean(which) {
    const snapshot = data.cleaning.correlations[which];
    setSeg('data-clean', which);
    q('#corr-distance').textContent = snapshot.tripDistHaversine.toFixed(4);
    q('#corr-duration').textContent = snapshot.durationHaversine.toFixed(4);
    q('#corr-distance-bar').style.width = `${snapshot.tripDistHaversine * 100}%`;
    q('#corr-duration-bar').style.width = `${snapshot.durationHaversine * 100}%`;
    q('#correlation-explanation').textContent = which === 'raw'
      ? 'Before cleaning, Haversine distance has almost no correlation with the distance the meter recorded, which should be impossible for two measurements of the same trip. The outliers and broken coordinates are drowning out the relationship, and Pearson correlation is very sensitive to extreme values like these.'
      : 'After all of the cleaning rules are applied, Haversine distance and the recorded distance agree almost perfectly, and the link with trip duration becomes strong. Keep in mind that this comes from all the rules working together, so it doesn\'t show that removing the bad coordinates alone did this.';
  }
  document.querySelectorAll('[data-clean]').forEach(button => button.addEventListener('click', () => clean(button.dataset.clean)));
  clean('raw');

  /* ---------- Chapter 02: the case file ---------- */
  const ev = data.evidence;
  function ladder(rows, max, note) {
    const box = element('div');
    rows.forEach(([label, value, text, extreme]) => {
      const row = element('div', `ladder-row${extreme ? ' extreme' : ''}`);
      const width = Math.log10(Math.max(1, value)) / Math.log10(max) * 100;
      row.append(element('span', '', label), bar(width), element('span', 'value', text));
      box.append(row);
    });
    if (note) box.append(element('p', 'ladder-note', note));
    return box;
  }
  function dayAxis() {
    const s = svg('svg', { class: 'diagram', viewBox: '0 0 340 120', role: 'img', 'aria-label': 'Where the 2 to 24 hour trips fall on a 24 hour clock' });
    const x = m => 20 + (m / 1440) * 300;
    s.append(svg('rect', { class: 'band', x: x(ev.nearDay.p25), y: 40, width: x(ev.nearDay.max) - x(ev.nearDay.p25), height: 30, rx: 3 }));
    s.append(svg('line', { class: 'axis', x1: x(0), x2: x(1440), y1: 70, y2: 70 }));
    [0, 360, 720, 1080, 1440].forEach(m => {
      s.append(svg('line', { class: 'tick', x1: x(m), x2: x(m), y1: 66, y2: 74 }));
      s.append(svg('text', { class: 'muted', x: x(m), y: 90, 'text-anchor': 'middle' }, `${m / 60}h`));
    });
    [['10%', ev.nearDay.p10], ['25%', ev.nearDay.p25], ['50%', ev.nearDay.p50], ['90%', ev.nearDay.p90]].forEach(([label, m], i) => {
      s.append(svg('circle', { class: 'marker', cx: x(m), cy: 70, r: 4 }));
      s.append(svg('text', { x: x(m), y: i % 2 ? 22 : 34, 'text-anchor': 'middle' }, label));
    });
    s.append(svg('text', { class: 'muted', x: 20, y: 112 }, 'Dots mark the 10th, 25th, 50th and 90th percentile durations.'));
    return s;
  }
  function oceanMap() {
    const s = svg('svg', { class: 'diagram', viewBox: '0 0 340 130', role: 'img', 'aria-label': 'A trip measured from latitude 0, longitude 0 to New York' });
    s.append(svg('path', { class: 'route', d: 'M 60 38 Q 170 0 280 96' }));
    s.append(svg('circle', { class: 'place', cx: 60, cy: 38, r: 6 }), svg('circle', { class: 'marker', cx: 280, cy: 96, r: 6 }));
    s.append(svg('text', { x: 60, y: 62, 'text-anchor': 'middle' }, 'New York'));
    s.append(svg('text', { x: 280, y: 120, 'text-anchor': 'middle' }, '(0, 0), Gulf of Guinea'));
    s.append(svg('text', { x: 170, y: 40, 'text-anchor': 'middle' }, `${fmt(Math.round(ev.zeroCoords.haversineP999))} miles`));
    return s;
  }
  const cases = {
    negative: {
      big: fmt(ev.duration.nonPositive), unit: 'trips that end before they start',
      text: `The shortest recorded duration is ${ev.duration.min} minutes, which means the dropoff was logged before the pickup. A duration of zero or less can’t be a real trip, so these were the first rows to go.`,
      rule: 'Rule: keep only trips that last more than 0 minutes.',
      visual: () => ladder([
        ['Shortest trip', 0, `${ev.duration.min} min`, true],
        ['Median trip', ev.duration.median, `${ev.duration.median.toFixed(1)} min`]
      ], ev.duration.max, 'A negative duration has no bar at all, because a trip can’t take less than no time.')
    },
    long: {
      big: '83 days', unit: `the longest single trip (${fmt(ev.duration.max)} minutes)`,
      text: `Half of all trips take under ${ev.duration.median.toFixed(1)} minutes and 99% take under ${ev.duration.p99} minutes, but the slowest 0.1% start at ${fmt(ev.duration.p999)} minutes. The average trip is 15.3 minutes while the standard deviation is 86.9, which tells you a handful of extreme values are stretching the whole distribution.`,
      rule: 'Rule: keep only trips of at most 120 minutes (the next tab shows why).',
      visual: () => ladder([
        ['Median', ev.duration.median, `${ev.duration.median.toFixed(1)} min`],
        ['99th percentile', ev.duration.p99, `${ev.duration.p99} min`],
        ['99.9th percentile', ev.duration.p999, `${fmt(ev.duration.p999)} min`, true],
        ['Longest trip', ev.duration.max, `${fmt(ev.duration.max)} min`, true]
      ], ev.duration.max, 'Bars are on a log scale, so every step to the right is ten times longer.')
    },
    nearday: {
      big: fmt(ev.nearDay.count), unit: 'trips lasting between 2 and 24 hours',
      text: `Look at where these trips end up on a 24-hour clock. A quarter of them last more than ${fmt(Math.round(ev.nearDay.p25))} minutes and half last more than ${fmt(Math.round(ev.nearDay.p50))}, which is within about 10 minutes of a full day. The ones we sampled in the notebook were only one to four miles long. That looks like meters left running until the next day rather than real journeys.`,
      rule: 'Rule: this is why our duration cutoff is 120 minutes instead of 24 hours.',
      visual: dayAxis
    },
    speed: {
      big: '389 million', unit: 'mph, the fastest “average speed” in the data',
      text: `99.9% of trips average under ${ev.speed.p999.toFixed(0)} mph, which is believable for New York. Above that it goes completely wild: ${ev.speed.p9995} mph at the 99.95th percentile and ${fmt(ev.speed.p9999)} mph at the 99.99th. ${fmt(ev.speed.above100)} trips averaged more than 100 mph, and no taxi in Manhattan does that.`,
      rule: 'Rule: keep only trips with an average speed of at most 100 mph.',
      visual: () => ladder([
        ['99th percentile', ev.speed.p99, `${ev.speed.p99} mph`],
        ['99.9th', ev.speed.p999, `${ev.speed.p999} mph`],
        ['99.95th', ev.speed.p9995, `${ev.speed.p9995} mph`, true],
        ['99.99th', ev.speed.p9999, `${fmt(ev.speed.p9999)} mph`, true],
        ['Fastest', ev.speed.max, '≈389M mph', true]
      ], ev.speed.max, 'The bars are on a log scale again. Speed here is the recorded distance divided by the duration, so a broken timestamp turns into an impossible speed.')
    },
    ocean: {
      big: fmt(ev.zeroCoords.pickup), unit: 'pickups recorded at latitude 0, longitude 0',
      text: `Coordinates of exactly zero put the trip at latitude 0, longitude 0, which is in the ocean off West Africa. That is why the 99.9th percentile of our Haversine distance was ${fmt(ev.zeroCoords.haversineP999)} miles: it is almost exactly the distance from (0, 0) to Midtown Manhattan. ${fmt(ev.zeroCoords.dropoff)} dropoffs had the same problem.`,
      rule: 'Rule: keep only trips that start and end inside a rough box around New York.',
      visual: oceanMap
    }
  };
  function renderCase(key) {
    const c = cases[key];
    setSeg('data-case', key);
    q('#case-big').textContent = c.big;
    q('#case-unit').textContent = c.unit;
    q('#case-text').textContent = c.text;
    q('#case-rule').textContent = c.rule;
    q('#case-visual').replaceChildren(c.visual());
  }
  document.querySelectorAll('[data-case]').forEach(b => b.addEventListener('click', () => renderCase(b.dataset.case)));
  renderCase('negative');

  /* ---------- Chapter 02: where should the cutoff go? ---------- */
  const cutoffs = {
    duration: { info: ev.durationAbove, unit: 'minutes', noun: 'longer than' },
    distance: { info: ev.distanceAbove, unit: 'miles', noun: 'longer than' }
  };
  let cutoffKind = 'duration', cutoffPick = 120;
  function cutoffStory() {
    const { info, unit } = cutoffs[cutoffKind];
    const rows = info.thresholds;
    const i = rows.findIndex(([t]) => t === cutoffPick);
    const [t, n] = rows[i];
    let text = `There were ${fmt(n)} trips ${cutoffs[cutoffKind].noun} ${fmt(t)} ${unit}`;
    if (cutoffKind === 'duration') {
      if (t === 120) text += `, and at 720 minutes there are still ${fmt(rows[5][1])}. Only ${fmt(rows[1][1] - rows[5][1])} trips last between 2 and 12 hours, so most trips longer than 2 hours are actually longer than 12. Real journeys don’t pile up like that, but stuck meters do, which is why we cut at 120.`;
      else if (t === 1440) text += ', so only a handful of trips go past a full day, because the meter problem stops just short of 24 hours.';
      else if (t === 60) text += ', but plenty of genuine trips take more than an hour in New York traffic, so cutting here would throw away real data.';
      else text += `, and from 120 minutes up to 720 the count barely moves, which is the sign that these aren’t ordinary long journeys.`;
    } else {
      if (t === 50) text += `, which is a tiny fraction of the month. The longest recorded trip was ${info.max} miles, more than the drive from New York to Washington and back, so we cut at 50 miles.`;
      else if (t < 50) text += ', but trips to the airports and the suburbs can easily go past this, so a cutoff this low would remove real journeys.';
      else text += ', and by this point there are so few left that they are almost certainly recording errors.';
    }
    return text;
  }
  function renderCutoff() {
    const { info, unit } = cutoffs[cutoffKind];
    setSeg('data-cutoff', cutoffKind);
    const rows = info.thresholds;
    const W = 520, H = 210, left = 10, bottom = 34, top = 24;
    const max = Math.max(...rows.map(r => r[1]));
    const slot = (W - left * 2) / rows.length, bw = slot * 0.62;
    const chart = svg('svg', { class: 'cutoff-chart', viewBox: `0 0 ${W} ${H}`, role: 'group', 'aria-label': `Trips longer than each ${unit} threshold` });
    chart.append(svg('line', { class: 'baseline', x1: left, x2: W - left, y1: H - bottom, y2: H - bottom }));
    rows.forEach(([t, n], i) => {
      const h = Math.max(2, (n / max) * (H - bottom - top));
      const x = left + i * slot + (slot - bw) / 2, y = H - bottom - h;
      const r = svg('rect', { class: `bar${t === info.chosen ? ' chosen' : ''}${t === cutoffPick ? ' selected' : ''}`, x, y, width: bw, height: h, rx: 2, tabindex: 0, role: 'button', 'aria-label': `${fmt(n)} trips longer than ${t} ${unit}` });
      const pick = () => { cutoffPick = t; renderCutoff(); };
      r.addEventListener('click', pick);
      r.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      chart.append(r);
      chart.append(svg('text', { class: 'count', x: x + bw / 2, y: y - 6, 'text-anchor': 'middle' }, fmt(n)));
      chart.append(svg('text', { x: x + bw / 2, y: H - bottom + 16, 'text-anchor': 'middle' }, `> ${fmt(t)}`));
    });
    chart.append(svg('text', { x: W / 2, y: H - 4, 'text-anchor': 'middle' }, `${unit}, with our chosen cutoff in green`));
    q('#cutoff-chart').replaceChildren(chart);
    q('#cutoff-summary').textContent = cutoffStory();
    q('#cutoff-source').textContent = `${info.source}.`;
  }
  document.querySelectorAll('[data-cutoff]').forEach(b => b.addEventListener('click', () => {
    cutoffKind = b.dataset.cutoff; cutoffPick = cutoffs[cutoffKind].info.chosen; renderCutoff();
  }));
  renderCutoff();

  /* ---------- Chapter 02: the cleaning funnel ---------- */
  (() => {
    const steps = data.cleaning.steps;
    const labels = ['Duration between 0 and 120 minutes', 'Recorded distance between 0 and 50 miles', 'Average speed of at most 100 mph', 'Both ends inside the New York box'];
    const removed = steps.slice(1).map((s, i) => steps[i].rows - s.rows);
    const maxRemoved = Math.max(...removed);
    const box = q('#funnel');
    removed.forEach((n, i) => {
      const row = element('div', 'funnel-row');
      const name = element('div', '', labels[i]);
      name.append(element('span', 'remaining', `${fmt(steps[i + 1].rows)} trips left`));
      row.append(name, bar(n / maxRemoved * 100), element('span', 'removed', `−${fmt(n)}`));
      box.append(row);
    });
    const total = steps[0].rows - steps[steps.length - 1].rows;
    const foot = element('div', 'funnel-total');
    foot.append(element('span', '', `Started with ${fmt(steps[0].rows)} trips`), element('strong', '', `Removed ${fmt(total)} in total (${(total / steps[0].rows * 100).toFixed(2)}%)`));
    box.append(foot);
  })();

  /* ---------- Chapter 04: the stage chart ---------- */
  const stages = ['coords', 'distance', 'weekday', 'hour'];
  const stageNames = { coords: 'Coordinates only', distance: '+ Haversine', weekday: '+ Weekday', hour: '+ Pickup hour' };
  const addedNames = { distance: 'Haversine distance', weekday: 'the weekday', hour: 'the pickup hour' };
  const stageTable = { coords: 'Raw coordinates', distance: '+ Haversine', weekday: '+ Weekday', hour: '+ Pickup hour' };
  const models = { linear: 'Linear Regression', tree: 'Decision Tree', boost: 'Histogram Gradient Boosting' };
  const tableModels = { linear: 'Linear Regression', tree: 'Decision Tree', boost: 'Histogram Boosting' };
  let metric = 'rmse', picked = { features: 'distance', model: 'linear' };
  const find = (features, model) => data.scores.find(r => r.features === features && r.model === model);
  function renderStages() {
    setSeg('data-metric', metric);
    const W = 560, H = 270, left = 44, right = 20, top = 16, bottom = 40;
    const values = data.scores.map(r => r[metric]);
    const lo = Math.floor(Math.min(...values) - 0.5), hi = Math.ceil(Math.max(...values) + 0.5);
    const sx = i => left + i * (W - left - right) / (stages.length - 1);
    const sy = v => top + (hi - v) / (hi - lo) * (H - top - bottom);
    const chart = svg('svg', { class: 'stage-chart', viewBox: `0 0 ${W} ${H}`, role: 'group', 'aria-label': `Test ${metric.toUpperCase()} for each model as features are added` });
    for (let v = lo; v <= hi; v += 1) {
      chart.append(svg('line', { class: 'grid', x1: left, x2: W - right, y1: sy(v), y2: sy(v) }));
      chart.append(svg('text', { x: left - 8, y: sy(v) + 3, 'text-anchor': 'end' }, v.toFixed(0)));
    }
    stages.forEach((s, i) => chart.append(svg('text', { class: 'stage-label', x: sx(i), y: H - bottom + 22, 'text-anchor': 'middle' }, stageNames[s])));
    chart.append(svg('text', { x: 4, y: top - 4 }, `${metric.toUpperCase()} (min)`));
    for (const model of Object.keys(models)) {
      const pts = stages.map((s, i) => [i, find(s, model)]).filter(([, r]) => r);
      if (pts.length > 1) chart.append(svg('polyline', { class: `series ${model}`, points: pts.map(([i, r]) => `${sx(i)},${sy(r[metric])}`).join(' ') }));
      pts.forEach(([i, r]) => {
        const on = picked.features === r.features && picked.model === model;
        const c = svg('circle', { class: `point ${model}${on ? ' selected' : ''}`, cx: sx(i), cy: sy(r[metric]), r: on ? 8 : 6, tabindex: 0, role: 'button',
          'aria-label': `${models[model]}, ${stageNames[r.features]}: ${metric.toUpperCase()} ${r[metric].toFixed(4)}` });
        const pick = () => { picked = { features: r.features, model }; renderStages(); };
        c.addEventListener('click', pick);
        c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
        chart.append(c);
      });
    }
    q('#stage-chart').replaceChildren(chart);
    renderPoint();
  }
  function renderPoint() {
    const r = find(picked.features, picked.model);
    const box = q('#point-detail');
    box.replaceChildren();
    box.append(element('h4', '', `${models[picked.model]} · ${stageNames[picked.features]}`));
    const grid = element('div', 'metric-grid');
    for (const m of ['rmse', 'mae']) {
      const cell = element('div', 'metric');
      const value = element('strong', '', r[m].toFixed(4)); value.append(element('em', '', ' min'));
      cell.append(element('small', '', `Test ${m.toUpperCase()}`), value); grid.append(cell);
    }
    box.append(grid);
    if (r.flag) box.append(element('div', 'warning', r.flag));
    box.append(element('p', 'mini', `Taken from ${r.source}${r.depth ? ` (max_depth=${r.depth})` : ''}, scored on the random test split in the saved notebook.`));
    const i = stages.indexOf(r.features);
    const before = i > 0 ? find(stages[i - 1], picked.model) : null;
    const rivals = Object.keys(models).map(m => find(r.features, m)).filter(Boolean);
    const best = rivals.reduce((a, b) => (a[metric] <= b[metric] ? a : b));
    const parts = [];
    if (before) {
      const change = before[metric] - r[metric];
      parts.push(`Moving one step right, adding ${addedNames[r.features]}, took ${models[picked.model]} from ${before[metric].toFixed(4)} to ${r[metric].toFixed(4)}, ${change >= 0 ? 'an improvement' : 'a step back'} of ${Math.abs(change).toFixed(4)} minutes.`);
    } else if (i === 0) {
      parts.push('This is where we start, with only the four coordinates and the passenger count.');
    } else {
      parts.push(`We didn’t run ${models[picked.model]} on the previous feature set, so there is no earlier point to compare with.`);
    }
    if (best.model !== picked.model) parts.push(`At this same stage, switching to ${models[best.model]} would bring the ${metric.toUpperCase()} down to ${best[metric].toFixed(4)}.`);
    else if (rivals.length > 1) parts.push(`This is the best model we ran at this stage.`);
    q('#stage-summary').textContent = parts.join(' ');
  }
  document.querySelectorAll('[data-metric]').forEach(b => b.addEventListener('click', () => { metric = b.dataset.metric; renderStages(); }));
  renderStages();
  const tbody = q('#model-table tbody'); tbody.replaceChildren();
  for (const record of data.scores) {
    const row = element('tr');
    for (const value of [stageTable[record.features], tableModels[record.model], record.rmse.toFixed(4), record.mae.toFixed(4)]) row.append(element('td', '', value));
    tbody.append(row);
  }

  /* ---------- Chapter 04: overfitting, train vs test ---------- */
  (() => {
    const o = ev.overfit;
    const pairs = [
      ['Decision Tree with no depth limit', 'early, half-cleaned data', o.treeTrain, o.treeTest, true],
      ['Histogram Gradient Boosting', 'final features', o.boostTrain, o.boostTest, false]
    ];
    q('#gap-grid').replaceChildren(...pairs.map(([name, note, train, test, bad]) => {
      const card = element('div', `gap-pair${bad ? ' bad' : ''}`);
      card.append(element('h4', '', name), element('p', 'mini', note));
      const ratio = element('div', 'ratio', `${(test / train).toFixed(test / train > 10 ? 0 : 2)}×`);
      card.append(ratio, element('p', 'mini', 'test RMSE divided by train RMSE'));
      for (const [label, value, cls] of [['Train RMSE', train, 'train'], ['Test RMSE', test, 'test']]) {
        const wrap = element('div', cls);
        const head = element('div', 'bar-label'); head.append(element('span', '', label), element('strong', '', value.toFixed(4)));
        wrap.append(head, bar(value / Math.max(train, test) * 100));
        card.append(wrap);
      }
      return card;
    }));
  })();

  /* ---------- Chapter 04: the final comparison with a validation set ---------- */
  (() => {
    const v = data.validation;
    if (!v || !q('#val-lab')) return;
    const rows = [['Linear Regression', v.linear], [`Decision Tree (max_depth=${v.tree.depth})`, v.tree], ['Histogram Gradient Boosting', v.boost]];
    const table = element('table', 'table');
    const head = element('tr');
    ['Model', 'Val RMSE', 'Val MAE', 'Test RMSE', 'Test MAE'].forEach(h => head.append(element('th', '', h)));
    const thead = element('thead'); thead.append(head);
    const body = element('tbody');
    rows.forEach(([name, r]) => {
      const tr = element('tr');
      [name, r.validation.rmse.toFixed(4), r.validation.mae.toFixed(4), r.test.rmse.toFixed(4), r.test.mae.toFixed(4)].forEach(c => tr.append(element('td', '', c)));
      body.append(tr);
    });
    table.append(thead, body);
    const wrap = element('div', 'table-wrap'); wrap.append(table);
    q('#val-scores').replaceChildren(wrap);
    const max = Math.max(...v.tree.search.map(([, r]) => r)), min = Math.min(...v.tree.search.map(([, r]) => r));
    q('#val-depths').replaceChildren(...v.tree.search.map(([depth, r]) => {
      const row = element('div', `ladder-row${depth === v.tree.depth ? '' : ' muted-row'}`);
      row.append(element('span', '', `max_depth=${depth}${depth === v.tree.depth ? ' (picked)' : ''}`), bar(((r - min * 0.98) / (max - min * 0.98)) * 100), element('span', 'value', r.toFixed(4)));
      return row;
    }));
    const gain = (v.linear.test.rmse - v.boost.test.rmse) / v.linear.test.rmse * 100;
    q('#val-summary').textContent = `The depth search picked a depth of ${v.tree.depth}, and the ranking didn’t change: boosting is still clearly the best model at ${v.boost.test.rmse.toFixed(4)} minutes on the test set, followed by the tree at ${v.tree.test.rmse.toFixed(4)} and Linear Regression at ${v.linear.test.rmse.toFixed(4)}, which makes boosting ${gain.toFixed(1)}% better than Linear Regression. One thing to keep in mind is that boosting’s best round was the very last of its ${fmt(v.boost.maxRounds)}, so its validation error was still falling and a few more rounds might help a little.`;
    q('#val-source').textContent = `${v.source}. ${v.split.charAt(0).toUpperCase()}${v.split.slice(1)}.`;
  })();
})();
