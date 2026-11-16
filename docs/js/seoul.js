/* Buildless and file:// friendly. All content is local; no remote requests. */
(() => {
  'use strict';
  const data = window.SEOUL_DATA;
  let split = 'random';
  const $ = id => document.getElementById(id);
  const format = value => value.toFixed(4);
  function render() {
    const selected = data.splits[split];
    const evaluation = $('evaluation').value;
    const metric = $('metric').value;
    const ranked = [...selected.scores].sort((a, b) => a[evaluation][metric] - b[evaluation][metric]);
    const maximum = Math.max(...Object.values(data.splits).flatMap(s => s.scores.flatMap(r => [r.test[metric], r.validation[metric]]))) * 1.08;
    $('active-split').textContent = `${selected.title} · ${evaluation === 'test' ? 'Test' : 'Validation'} ${metric.toUpperCase()}`;
    const winner = ranked[0];
    const baseline = selected.scores.find(row => row.model === 'Linear Regression');
    const improvement = ((baseline[evaluation][metric] - winner[evaluation][metric]) / baseline[evaluation][metric] * 100).toFixed(1);
    const result = winner.model === 'Linear Regression'
      ? 'Linear Regression comes out on top here, which flips the ranking we saw with the random split.'
      : `${winner.model} has ${improvement}% lower ${evaluation} ${metric.toUpperCase()} than Linear Regression.`;
    const significance = split === 'random'
      ? 'Every season is represented, but hours from the same day end up in different sets, so this compares hours within the same year rather than forecasting the future.'
      : split === 'day'
        ? 'Every season is represented and whole days stay together, so this tells us about unseen days within this year rather than about a future year.'
        : evaluation === 'test'
          ? 'The test set is entirely autumn, and training has no autumn at all. The change in seasons comes together with the reversal, but that alone does not prove it caused it.'
          : 'Validation is a mix of summer and autumn while training has no autumn, so time and season change together here and we cannot separate them.';
    $('comparison-summary').textContent = `${result} ${significance}`;
    $('bars').replaceChildren();
    ranked.forEach((row, index) => {
      const wrapper = document.createElement('div'); wrapper.className = 'bar-row';
      const label = document.createElement('div'); label.className = 'bar-label';
      const name = document.createElement('span'); name.textContent = `${index + 1}. ${row.model}`;
      const value = document.createElement('strong'); value.textContent = format(row[evaluation][metric]);
      label.append(name, value);
      const track = document.createElement('div'); track.className = 'bar-track'; track.setAttribute('aria-hidden', 'true');
      const fill = document.createElement('div'); fill.className = 'bar-fill'; fill.style.width = `${row[evaluation][metric] / maximum * 100}%`;
      track.append(fill); wrapper.append(label, track); $('bars').append(wrapper);
    });
    $('scores').replaceChildren();
    selected.scores.forEach(row => addRow($('scores'), [row.model, format(row.validation.rmse), format(row.validation.mae), format(row.test.rmse), format(row.test.mae)]));
    $('scores-caption').textContent = `${selected.title}: all reported scores, in bikes per hour`;
    for (const [id, key] of [['split-question','question'], ['split-method','method'], ['split-caveat','caveat'], ['split-finding','finding']]) $(id).textContent = selected[key];
    $('coverage').replaceChildren(); $('distribution').replaceChildren();
    selected.coverage.forEach(set => {
      const row = document.createElement('div'); row.className = 'coverage-row' + (set.set.toLowerCase() === evaluation ? ' selected-set' : '');
      const label = document.createElement('strong'); label.textContent = set.set;
      const track = document.createElement('div'); track.className = 'coverage-track';
      Object.entries(set.seasons).forEach(([season, count]) => {
        if (!count) return;
        const segment = document.createElement('span'); segment.className = `season-segment ${season.toLowerCase()}`;
        segment.style.width = `${count / set.rows * 100}%`; segment.tabIndex = 0;
        segment.title = `${set.set}: ${season}, ${count.toLocaleString()} rows (${(count / set.rows * 100).toFixed(1)}%)`;
        segment.setAttribute('aria-label', segment.title); segment.textContent = count.toLocaleString(); track.append(segment);
      });
      row.append(label, track); $('coverage').append(row);
      addRow($('distribution'), [set.set, set.rows.toLocaleString(), set.days.toLocaleString(), set.mean.toFixed(2), set.std.toFixed(2)]);
    });
    document.querySelectorAll('[data-split]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.split === split));
      button.className = button.dataset.split === split ? 'active' : '';
    });
  }
  function addRow(parent, values) {
    const tr = document.createElement('tr');
    values.forEach((value, index) => { const cell = document.createElement(index ? 'td' : 'th'); if (!index) cell.scope = 'row'; cell.textContent = value; tr.append(cell); });
    parent.append(tr);
  }
  document.querySelectorAll('[data-split]').forEach(button => button.addEventListener('click', () => { split = button.dataset.split; render(); }));
  $('evaluation').addEventListener('change', render); $('metric').addEventListener('change', render);
  (window.SEOUL_EXCERPTS || []).forEach(excerpt => {
    const details = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = excerpt.title;
    const block = document.createElement('div'); block.className = 'code-block';
    const toolbar = document.createElement('div'); toolbar.className = 'code-top';
    const label = document.createElement('span'); label.textContent = 'PYTHON / SHARED NOTEBOOK EXCERPT';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'copy'; button.textContent = 'Copy';
    button.addEventListener('click', async () => { try { await navigator.clipboard.writeText(excerpt.code); button.textContent = 'Copied'; setTimeout(() => button.textContent = 'Copy', 1500); } catch { button.textContent = 'Select code to copy'; } });
    toolbar.append(label, button);
    const pre = document.createElement('pre'); pre.className = 'code'; const code = document.createElement('code'); code.textContent = excerpt.code; pre.append(code);
    block.append(toolbar, pre); details.append(summary, block); $('code-excerpts').append(details);
  });
  render();
})();
