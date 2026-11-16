/* The year timeline, the scoreboard of winners and the three-exams cards.
   Day-level data comes from js/seoul-days.js (rebuilt by tools/build_seoul_days.py with the notebook's split code);
   scores come from js/seoul-data.js. No network requests. */
(() => {
  'use strict';
  const data = window.SEOUL_DATA;
  const days = window.SEOUL_DAYS;
  if (!data || !days) {
    console.error('Seoul data is missing: load seoul-data.js and seoul-days.js before seoul-year.js.');
    return;
  }
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const fmt = n => n.toLocaleString('en-US');
  const css = name => getComputedStyle(document.body).getPropertyValue(name).trim();
  function el(tag, className, text) {
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
  const testWinner = split => [...data.splits[split].scores].sort((a, b) => a.test.rmse - b.test.rmse)[0];

  /* ---------- The scoreboard: who wins on each split ---------- */
  const strip = $('winner-strip');
  if (strip) {
    strip.replaceChildren(...['random', 'chronological', 'day'].map(split => {
      const s = data.splits[split];
      const win = testWinner(split);
      const card = el('div', `winner-card${win.model === 'Linear Regression' ? ' upset' : ''}`);
      const runnerUp = [...s.scores].sort((a, b) => a.test.rmse - b.test.rmse)[1];
      card.append(el('small', '', s.title), el('strong', '', `${win.model} wins`),
        el('span', '', `Test RMSE ${win.test.rmse.toFixed(1)} bikes, against ${runnerUp.test.rmse.toFixed(1)} for ${runnerUp.model}`));
      return card;
    }));
  }

  /* ---------- A year of bike rentals ---------- */
  const sets = ['Train', 'Validation', 'Test'];
  const views = {
    seasons: {
      key: [['Winter', '--winter'], ['Spring', '--spring'], ['Summer', '--summer'], ['Autumn', '--autumn']],
      text: 'Each bar is one day of the year, and its height is the number of bikes rented that day. Winter days average about 5,400 rentals while summer days average about 24,800, and demand peaks in June. The twelve empty days are days when the service wasn’t running at all.'
    },
    random: {
      key: [['Train', '--train'], ['Validation', '--validation'], ['Test', '--test']],
      text: 'With random rows, every single day of the year gets cut up between the sets, and 363 of the 365 days have hours in all three. So when the model is tested on an hour, it has usually already trained on other hours from that very same day.'
    },
    chronological: {
      key: [['Train', '--train'], ['Validation', '--validation'], ['Test', '--test']],
      text: 'The chronological split trains on 1 December to 7 July, validates on 8 July to 18 September, and tests on 19 September to 30 November. The models never see a single autumn day while training, and then they are tested on nothing but autumn.'
    },
    day: {
      key: [['Train', '--train'], ['Validation', '--validation'], ['Test', '--test']],
      text: 'The season-stratified split keeps every day whole, and each set gets days from all four seasons spread across the whole year. Nothing from a test day leaks into training, and no season is left out.'
    }
  };
  let view = 'seasons';
  const W = 730, H = 230, top = 12, bottom = 26;
  const maxBikes = Math.max(...days.map(d => d.bikes));
  const barW = W / days.length;
  const y = v => (H - bottom) - (v / maxBikes) * (H - bottom - top);
  function longDate(iso) {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }
  function readout(d) {
    if (!d) return '';
    let text = `${longDate(d.date)} · ${d.season} · ${fmt(d.bikes)} bikes`;
    if (d.bikes === 0) text += ' (service not running)';
    if (view !== 'seasons') {
      const hours = d[view];
      text += ` · ${sets.map((s, i) => hours[i] ? `${hours[i]}h ${s.toLowerCase()}` : '').filter(Boolean).join(', ')}`;
    }
    return text;
  }
  function renderYear() {
    document.querySelectorAll('[data-year]').forEach(b => {
      const on = b.dataset.year === view;
      b.className = on ? 'active' : '';
      b.setAttribute('aria-pressed', String(on));
    });
    const chart = svg('svg', { class: 'year-chart', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Daily bike rentals from December 2017 to November 2018, coloured by ${view === 'seasons' ? 'season' : 'the set each hour belongs to'}` });
    const colors = Object.fromEntries(views[view].key.map(([name, v]) => [name, css(v)]));
    days.forEach((d, i) => {
      const x = i * barW;
      if (view === 'seasons') {
        chart.append(svg('rect', { x, y: y(d.bikes), width: barW + 0.2, height: (H - bottom) - y(d.bikes), fill: colors[d.season] }));
        return;
      }
      let base = H - bottom;
      const h = (H - bottom) - y(d.bikes);
      d[view].forEach((hours, s) => {
        if (!hours) return;
        const segment = h * hours / 24;
        base -= segment;
        chart.append(svg('rect', { x, y: base, width: barW + 0.2, height: segment, fill: colors[sets[s]] }));
      });
    });
    chart.append(svg('line', { class: 'baseline', x1: 0, x2: W, y1: H - bottom, y2: H - bottom }));
    days.forEach((d, i) => {
      if (d.date.endsWith('-01')) {
        const label = new Date(`${d.date}T00:00:00`).toLocaleDateString('en-GB', { month: 'short' });
        chart.append(svg('text', { x: i * barW + 2, y: H - 8 }, label));
      }
    });
    const cursor = svg('line', { class: 'cursor', x1: -10, x2: -10, y1: top, y2: H - bottom });
    chart.append(cursor);
    const move = event => {
      const pt = chart.createSVGPoint(); pt.x = event.clientX; pt.y = event.clientY;
      const p = pt.matrixTransform(chart.getScreenCTM().inverse());
      const i = Math.max(0, Math.min(days.length - 1, Math.floor(p.x / barW)));
      cursor.setAttribute('x1', i * barW + barW / 2); cursor.setAttribute('x2', i * barW + barW / 2);
      $('year-readout').textContent = readout(days[i]);
    };
    chart.addEventListener('pointermove', move);
    chart.addEventListener('pointerdown', move);
    $('year-chart').replaceChildren(chart);
    $('year-key').replaceChildren(...views[view].key.map(([name, v]) => { const s = el('span', '', name); s.style.setProperty('--swatch', css(v)); return s; }));
    $('year-summary').textContent = views[view].text;
    $('year-readout').textContent = 'Move your mouse over the chart, or tap it, to read any single day.';
  }
  if ($('year-chart')) {
    document.querySelectorAll('[data-year]').forEach(b => b.addEventListener('click', () => { view = b.dataset.year; renderYear(); }));
    renderYear();
  }

  /* ---------- Three exams ---------- */
  const heldOut = {
    random: 'Random hours picked from all over the year',
    chronological: 'The last fifth of the year, from mid-September to the end of November',
    day: 'Whole days, spread across every season'
  };
  const exams = $('exams');
  if (exams) {
    exams.replaceChildren(...['random', 'chronological', 'day'].map(split => {
      const s = data.splits[split];
      const card = el('div', 'exam');
      const list = el('dl');
      list.append(el('dt', '', 'The question it asks'), el('dd', '', s.question),
        el('dt', '', 'What it holds out for testing'), el('dd', '', heldOut[split]),
        el('dt', '', 'Who wins on test RMSE'), el('dd', '', `${testWinner(split).model} (${testWinner(split).test.rmse.toFixed(1)} bikes)`));
      card.append(el('h4', '', s.title), list);
      return card;
    }));
  }
})();
