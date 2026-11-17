/* Home page summary: the three levers grid and the criterion lens.
   Every number here is one already reported on a case-study page. No network requests. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const studies = {
    nyc: { name: 'NYC Taxi', unit: 'Trip duration · RMSE in minutes', page: 'datasets/nyc-taxi.html' },
    seoul: { name: 'Seoul Bikes', unit: 'Hourly rentals · RMSE in bikes', page: 'datasets/dataset-2.html' },
    xg: { name: 'Football xG', unit: 'Goal probability · log loss', page: 'datasets/dataset-3.html' }
  };
  const levers = [
    ['features', 'Change the data or features', 'cleaning, transformations, engineered columns'],
    ['model', 'Change the model', 'a simple model against a stronger one'],
    ['evaluation', 'Change the evaluation', 'how the data is split and checked']
  ];
  const cells = {
    nyc: {
      features: { effect: '−27.6%', what: 'Linear Regression RMSE after adding Haversine distance', biggest: true,
        title: 'NYC Taxi: changing the data and features',
        detail: 'On the final cleaned sample, adding Haversine distance took Linear Regression from 8.9366 to 6.4735 minutes RMSE. Before the cleaning, the same feature did almost nothing (52.7959 without it and 52.7962 with it), so the data quality work is what let the feature help at all. The weekday and hour features added a smaller 3.5% on top.',
        link: 'datasets/nyc-taxi.html#features' },
      model: { effect: '−21.9%', what: 'Test RMSE from Linear Regression to boosting, with the final features',
        title: 'NYC Taxi: changing the model',
        detail: 'With all the features in place, and the tree depth and boosting rounds picked on a validation set, switching from Linear Regression (6.2253) to Histogram Gradient Boosting (4.8627) lowered the test RMSE by 21.9%. So the model clearly mattered here too, even though it only got the chance to matter once the data was cleaned and represented well.',
        link: 'datasets/nyc-taxi.html#models' },
      evaluation: { effect: 'Same ranking', what: 'Tuning on a validation set kept boosting ahead of the tree and Linear Regression',
        title: 'NYC Taxi: changing the evaluation',
        detail: 'We repeated the final comparison with a 60/20/20 split, picking the tree depth and the number of boosting rounds on the validation set and scoring the test set only once. The scores moved only slightly and the ranking stayed exactly the same (boosting 4.8627, tree 5.8109, Linear Regression 6.2253 minutes), so the NYC conclusions don’t depend on how we tuned. A time-based split is still untested.',
        link: 'datasets/nyc-taxi.html#models' }
    },
    seoul: {
      features: { effect: 'Not tested', what: 'Kept minimal on purpose', untested: true,
        title: 'Seoul Bikes: changing the data and features',
        detail: 'We deliberately kept the preparation minimal for Seoul (drop Date, one-hot encode four columns) so that the models and the evaluation were the only things changing. That was the design of this experiment, so there is no feature effect to report.',
        link: 'datasets/dataset-2.html#preparation' },
      model: { effect: '−35.1%', what: 'Test RMSE from Linear Regression to XGBoost on random rows',
        title: 'Seoul Bikes: changing the model',
        detail: 'On random rows XGBoost’s test RMSE was 244.4034 bikes against 376.5360 for Linear Regression, which is 35.1% lower, and the season-stratified day split gives almost the same gap (34.7%). On these two splits the stronger model wins comfortably.',
        link: 'datasets/dataset-2.html#models' },
      evaluation: { effect: 'Winner flips', what: 'On the chronological split XGBoost is 35.0% worse than Linear Regression', biggest: true,
        title: 'Seoul Bikes: changing the evaluation',
        detail: 'Hold out the last part of the year instead, and the ranking turns upside down: Linear Regression scores 369.8886 while XGBoost scores 499.4878. The same models with the same settings went from a 35% win to a 35% loss, which is a bigger swing than anything the model choice did on its own.',
        link: 'datasets/dataset-2.html#investigation' }
    },
    xg: {
      features: { effect: '−9.3%', what: 'Logistic Regression log loss with six football features (XGBoost: −3.3%)', biggest: true,
        title: 'Football xG: changing the data and features',
        detail: 'Six features any football fan would think of (distance, angle, defenders in the way, space, keeper position and headers from range) took Logistic Regression’s test log loss from 0.2705 to 0.2453. XGBoost improved too, but only from 0.2547 to 0.2464, because it could already find part of this in the raw coordinates.',
        link: 'datasets/dataset-3.html#features' },
      model: { effect: '5.8% → level', what: 'The gap between Logistic Regression and XGBoost, before and after the features',
        title: 'Football xG: changing the model',
        detail: 'On the raw columns, XGBoost’s log loss was 5.8% lower than Logistic Regression’s. With the football features, the two models are level (0.2453 against 0.2464 on test), so once the shot is described well, the choice of model barely matters.',
        link: 'datasets/dataset-3.html#rematch' },
      evaluation: { effect: '10 splits agree', what: 'The conclusion holds on ten different match splits',
        title: 'Football xG: changing the evaluation',
        detail: 'We repeated both rounds on ten match splits. With the raw columns Logistic Regression lost all ten, and with the football features it came out ahead on nine of the ten by tiny margins. Here the evaluation lever confirmed the result instead of changing it, which is exactly what you want to see.',
        link: 'datasets/dataset-3.html#rematch' }
    }
  };

  let selected = ['xg', 'features'];
  function renderLevers() {
    const grid = $('levers');
    grid.replaceChildren(el('div', 'corner', 'Click any cell'));
    for (const key of Object.keys(studies)) {
      const head = el('div', 'col-head', studies[key].name);
      head.append(el('small', '', studies[key].unit));
      grid.append(head);
    }
    for (const [lever, name, hint] of levers) {
      const head = el('div', 'row-head', name);
      head.append(el('small', '', hint));
      grid.append(head);
      for (const key of Object.keys(studies)) {
        const c = cells[key][lever];
        const on = selected[0] === key && selected[1] === lever;
        const button = el('button', `lever${c.untested ? ' untested' : ''}${c.biggest ? ' biggest' : ''}${on ? ' selected' : ''}`);
        button.type = 'button';
        button.dataset.study = studies[key].name;
        button.setAttribute('aria-pressed', String(on));
        button.append(el('span', 'effect', c.effect), el('span', 'what', c.what));
        button.addEventListener('click', () => { selected = [key, lever]; renderLevers(); });
        grid.append(button);
      }
    }
    const c = cells[selected[0]][selected[1]];
    const box = $('lever-detail');
    const link = el('a', '', 'See the evidence on the case-study page →');
    link.href = c.link;
    const p = el('p', '', c.detail);
    box.replaceChildren(el('h4', '', c.title), p, link);
  }
  if ($('levers')) renderLevers();

  const lens = {
    problem: {
      intro: 'A precise question, a target with a unit, and only the information that is available when the prediction is made.',
      nyc: 'Predict how many minutes a taxi trip will take, at the moment the passenger gets in, from the pickup and dropoff coordinates, the passenger count and the pickup time. The dropoff time, the metered distance and the average speed are kept out because they are only known after the trip.',
      seoul: 'Predict the number of bikes rented in an hour from the weather, the hour, the season, holidays and whether the service was running. The weather inputs are the recorded values, so the claim doesn’t cover predicting from weather forecasts.',
      xg: 'Predict the probability that a shot becomes a goal, using only what is known at the moment the ball is struck. Anything that happens afterwards, and StatsBomb’s own xG, is kept out of the model.'
    },
    data: {
      intro: 'Where the data comes from, what one row means, the important variables, and the checks we ran on it.',
      nyc: 'NYC Yellow Taxi trips from January 2016 on Kaggle, one row per trip, 10.9 million rows. The quality checks found negative durations, an 83-day trip, meters left running for almost 24 hours, impossible speeds and pickups at coordinates (0, 0).',
      seoul: 'Seoul Bike Sharing demand on Kaggle, one row per hour for a full year (8,760 rows over 365 days). There are no missing targets, and the 12 days with zero rentals are days the service wasn’t running. We kept the data minimal on purpose, because the evaluation was the thing under study.',
      xg: 'StatsBomb Open Data for the 2015/16 Premier League, La Liga, Serie A and Ligue 1, one row per shot (37,888 shots from 1,517 matches), each with a freeze frame of where the players stood. It is free for research, and StatsBomb is credited as the source.'
    },
    preprocessing: {
      intro: 'Why each transformation is there, and how we kept the test data from leaking into training.',
      nyc: 'Cleaning rules for duration, distance, speed and location, each chosen by looking at the evidence, then Haversine distance and one-hot weekday and hour. Because the rules filter on the trip duration, they also change which trips are evaluated, and the page says so.',
      seoul: 'Date is dropped and Hour, Seasons, Holiday and Functioning Day are one-hot encoded. The encoding is done before splitting; it learns nothing from the data, but we note that a proper pipeline would fit it on the training set.',
      xg: 'Distance, shooting angle, three freeze-frame features and header distance, all built from the shot itself. The StandardScaler for Logistic Regression is fitted on the training matches only. We note that the features were designed after an EDA on the whole dataset.'
    },
    baseline: {
      intro: 'A meaningful starting point that every richer model or feature set is measured against.',
      nyc: 'Linear Regression on the original coordinates and passenger count is the baseline, at 8.9366 minutes RMSE on the final cleaned data. Features are then added one stage at a time, and a Decision Tree and Histogram Gradient Boosting are compared at each stage.',
      seoul: 'Linear Regression on the basic features is the baseline on every split, and the Decision Tree and XGBoost get exactly the same inputs, so the comparison is always against it.',
      xg: 'Logistic Regression on the raw columns is the baseline, at a test log loss of 0.2705. A Decision Tree and XGBoost are compared against it before and after the football features, with StatsBomb’s professional xG as an outside reference.'
    },
    evaluation: {
      intro: 'A split that fits the question, tuning kept separate from the final test, and metrics that suit the task.',
      nyc: 'A random 75/25 train/test split on a 500,000-trip sample for the feature stages, scored with RMSE and MAE in minutes, and a 60/20/20 rerun of the final comparison where the tree depth and the boosting rounds are picked on validation and the test set is used once. A time-based split is still untested.',

      seoul: 'Three 60/20/20 designs, random rows, chronological and season-stratified whole days, each answering a different question. The validation set controls XGBoost’s early stopping, and the test set is only used for the final scores.',
      xg: 'Matches are split 60/20/20, stratified by league, so a match never sits in two sets. Validation picks the tree depth and controls early stopping. Log loss and AUC replace accuracy because only about 1 in 10 shots is a goal, the success rule was written down before the rematch, and the result was repeated on ten match splits.'
    },
    results: {
      intro: 'Results read in context, with the uncertainty and the limits stated rather than hidden.',
      nyc: 'Haversine cut Linear Regression’s RMSE by 27.6%, and with the depth and rounds picked on validation, boosting reached 4.8627 minutes on the test set. The limits are one month of data and random splits instead of a time-based one, and boosting was still improving at its 2,000-round cap.',

      seoul: 'The best model changes with the split, and Linear Regression wins only on the chronological test set. The limits are one year of data and one seed per split, and the season shift is shown but its causal role isn’t isolated.',
      xg: 'The gap between Logistic Regression and XGBoost closed to level, and the engineered model landed close to StatsBomb’s xG (0.2453 against 0.2431). The limits are one season of four leagues and an XGBoost that wasn’t tuned.'
    },
    reproducibility: {
      intro: 'Whether someone else could follow the data, the split, the preprocessing and the models.',
      nyc: 'The final Kaggle notebook with its saved outputs, every code block on the page copied verbatim, and the Kaggle dataset link.',
      seoul: 'The final notebook with its outputs, the downloadable scores, and a build script that recreates the year timeline from the CSV and refuses to run unless it reproduces the published season coverage.',
      xg: 'A dataset-build notebook and script for the shots table, page numbers generated directly from the notebook outputs, and the fitted models exported and checked against sklearn.'
    }
  };
  let criterion = 'problem';
  function renderLens() {
    document.querySelectorAll('[data-lens]').forEach(b => {
      const on = b.dataset.lens === criterion;
      b.className = on ? 'active' : '';
      b.setAttribute('aria-pressed', String(on));
    });
    $('lens-intro').textContent = lens[criterion].intro;
    $('lens-cards').replaceChildren(...Object.keys(studies).map(key => {
      const card = el('div', 'lens-card');
      const link = el('a', '', `Open ${studies[key].name} →`); link.href = studies[key].page;
      card.append(el('h4', '', studies[key].name), el('p', '', lens[criterion][key]), link);
      return card;
    }));
  }
  if ($('lens-cards')) {
    document.querySelectorAll('[data-lens]').forEach(b => b.addEventListener('click', () => { criterion = b.dataset.lens; renderLens(); }));
    renderLens();
  }
})();
