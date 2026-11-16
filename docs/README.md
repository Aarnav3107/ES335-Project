# Seoul Bike Sharing update

Dataset 2 now contains the developed Seoul Bikes case study. Start with [README-SEOUL.md](README-SEOUL.md) for editing, evidence and GitHub Pages integration. The complete original site is included.

---

# Beyond the Model — ES335 data-centric ML website

Static, editorial-style, multi-page research website with inline interactions, designed for **GitHub Pages**. Current implemented research case study: **NYC Yellow Taxi, January 2016**.

## What's included

- `index.html`: research question and navigation
- `datasets/nyc-taxi.html`: five-chapter NYC Taxi research story, **original notebook code excerpts**, interactive correlation comparison and feature/model explorer
- `datasets/dataset-2.html`, `datasets/dataset-3.html`: honest placeholders, no invented conclusions
- `index.html`: the home page, including the project summary that ties the three case studies together (the old `synthesis.html` page was folded into it)
- `data/nyc-results.json`: measured notebook output used by browser widgets
- `notebooks/nyc-taxi.ipynb` and `research/experiments.md`: original source materials
- `css/style.css`, `js/*.js`: reusable site code

## Preview locally

Open a terminal in this folder and run:

```sh
python3 -m http.server 8000
```

Then visit **http://localhost:8000/**. Loading the site directly as `file://` may prevent `fetch` of JSON experiment results.

## Publish on GitHub Pages

1. Put these files at the root of a GitHub repository.
2. Commit/push to the default branch.
3. Repository **Settings → Pages → Build and deployment → Deploy from a branch**, choose your branch and `/ (root)`.
4. Visit the GitHub Pages URL once publishing completes.

No Node, bundler, backend or API keys are needed. Plotly is loaded from a CDN and Google fonts are optional. Without network access, pages and tables remain readable but interactive charts may not load.

## Scientific accuracy notes — resolve before final submission

1. The uploaded notebook uses **random splits**, not the chronological evaluation planned in the experiment log. Do not claim future-time generalization yet.
2. Fixed: notebook cell 51 now uses `range(1, 24)` so `hour_23` is included. The saved outputs of cells 51–53 are from the run before this fix; rerun them on Kaggle and update the pickup-hour scores.
3. Notebook final Decision Tree result is **5.8409 RMSE / 3.7339 MAE** (`max_depth=14`, cell 52), while conversation/log cite a better **5.4765 / 3.5443** (`max_depth=10`). Document the verified tuned run before replacing notebook results.
4. The log records one earlier boosting score, while notebook cell 53 shows **4.8957 / 3.1181**. Verify configuration and validation procedure; the site currently shows notebook cell 53.
5. Original raw vs cleaned results use different evaluation populations. They are not evidence of the isolated causal effect of training-data cleaning.
6. Filtering on duration, distance and speed defines a restricted target population and can distort relationships; call these modelling exclusions, not proof every row is corrupt.
7. Notebook does not show the validation-based depth selection described in conversation. Add that experiment record if available.
8. The notebook's first raw/partial-cleaning cells are exploratory; cite the *final* cleaning code (cell 40) for the V1 policy.

## Updating results

Edit `data/nyc-results.json` with **actually measured** experiments. Each row in `scores` must have `features` (`coords`, `distance`, `weekday`, `hour`), `model` (`linear`, `tree`, `boost`), `rmse`, `mae`, and `source`. The model lab displays missing experiment combinations as unavailable instead of interpolating or inventing scores.

**Academic foundation:** [A Data-Centric Perspective on Evaluating Machine Learning Models for Tabular Data (NeurIPS 2024)](https://proceedings.neurips.cc/paper_files/paper/2024/hash/ae00e5ce7142d02e30a8235ede1ec6fc-Abstract-Datasets_and_Benchmarks_Track.html).

---

# Football xG (Dataset 3)

`datasets/dataset-3.html` is the Football xG case study. Its styles are in `css/xg.css` and its interactions in `js/xg.js`; it reuses the shared layout from `css/style.css` and `js/common.js`.

- `js/xg-data.js` and `data/xg-results.json` are **generated** from the saved outputs of `notebooks/football-xg.ipynb`. Don't edit them by hand. After a new Kaggle run, download the notebook to `notebooks/football-xg.ipynb` and run `python tools/build_xg_data.py notebooks/football-xg.ipynb`.
- `js/xg-models.js` holds the two fitted Logistic Regression models used by the "Take the shot" demo. It is generated from `xg_lr_models.json`, which the notebook's export cell writes to `/kaggle/working`. Pass it as a second argument: `python tools/build_xg_data.py notebooks/football-xg.ipynb xg_lr_models.json`. Until it exists, that lab shows a "model file not loaded" message and everything else works.
- Data: StatsBomb Open Data (https://github.com/statsbomb/open-data). Credit StatsBomb when publishing; their README also asks for their logo from the StatsBomb media pack, which is not included here.

# NYC Taxi and Seoul Bikes interactives

- NYC: the case file, cutoff explorer, funnel, stage chart and overfitting cards read from the `evidence` block in `js/nyc-data.js` (mirrored in `data/nyc-results.json`). Each entry records the notebook cell it was printed in. Styles are in `css/nyc.css`.
- Seoul: the year timeline uses `js/seoul-days.js`, generated by `python tools/build_seoul_days.py ../SeoulBikeData.csv .` from the local CSV with the notebook's own split code. The script refuses to write the file unless the recomputed season coverage matches `js/seoul-data.js` exactly. The scoreboard, timeline and three-exams cards live in `js/seoul-year.js`; `js/seoul.js` still drives the original split lab.
