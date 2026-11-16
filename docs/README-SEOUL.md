# Current site repair

The current version shares NYC’s report layout, sticky contents menu, and compact linked split lab. Both case studies work directly from disk; localhost is optional. See VERIFICATION.md for the actual checks and limitations.

# Seoul Bikes — Beyond the Model

This is a complete copy of the existing `beyond-the-model-site (5)` site with Dataset 2 replaced by the Seoul Bike Sharing case study. It is ready for GitHub Pages. No build, install, API key or framework is needed.

## Open it

Open `datasets/dataset-2.html` in a browser. The interactive explorer works directly from disk. To preview the complete site over HTTP, run `python -m http.server 8000` from this folder and visit `http://localhost:8000/datasets/dataset-2.html`.

The page uses the existing site's shared forest-green and paper palette, typefaces and navigation. Fonts load from Google Fonts, as in the original site; system fallbacks work offline. Charts, code and interactions have no external dependencies.

## Integrate into your existing GitHub Pages project

1. Unzip the download. Use the contents of `beyond-the-model/`, not the ZIP itself.
2. Copy these files into the same paths under your existing Pages publishing folder:
   - `datasets/dataset-2.html` — replaces the Dataset 2 placeholder; keeps its existing URL.
   - `css/seoul.css` — new chapter styles, scoped to this page.
   - `js/seoul.js` — interactions and code disclosures.
   - `js/seoul-data.js` — editable scores, coverage, descriptions and excerpts.
   - `data/seoul-results.json`, `data/seoul-metrics.csv`, `data/seoul-day-results.png`.
   - `notebooks/seoul-source.md`, `notebooks/seoul-bike-sharing.ipynb`, `notebooks/seoul-early-draft.ipynb`.
   - `README-SEOUL.md`.
3. This package also updates `index.html` (Seoul case-study card and developed-study count), changes navigation text to Seoul Bikes across existing pages, and updates the pending note in `synthesis.html`. Copy those pages too if your live site still matches this local snapshot. If your live site has newer changes, merge those small edits instead of overwriting them.
4. Keep `css/style.css` and the existing NYC assets. They are included unchanged in this complete-site package. All case-study paths are relative, so they work under a repository subpath such as `/Beyond-the-Model/`.
5. Commit/upload the files to the folder and branch already configured under GitHub → Settings → Pages. Use your existing deployment workflow. No hosting settings need to change.
6. Visit your existing site URL followed by `/datasets/dataset-2.html`. Confirm all three split buttons and both dropdowns work. A hard refresh may be needed after an update.

No repository was pushed and no live website was changed. The existing site was inspected from `Documents/ES335-Project/beyond-the-model-site (5)`; this package is a separate editable copy.

## Edit it

| Change | File |
| --- | --- |
| Story, headings, reflection, limitations | `datasets/dataset-2.html` |
| Chapter colours, spacing, mobile layouts | `css/seoul.css` |
| Metrics, split explanations, target summaries, code excerpts | `js/seoul-data.js` |
| Interaction behaviour, sorting, chart scale | `js/seoul.js` |
| Downloadable evidence | `data/seoul-results.json` and `data/seoul-metrics.csv` |

The browser reads `js/seoul-data.js`, not the JSON mirror, so opening the page from disk works. If you change scores, update the JSON/CSV downloads and any narrative claims to match. Scores must be numeric values, not strings. The chart ranks the selected metric and evaluation set and keeps a fixed bar scale across splits. It never runs models or generates predictions.

## Evidence and provenance

- The latest shared conversation message supplies the cleaning, three split definitions, fixed model settings, investigation and first-person comments. `notebooks/seoul-source.md` preserves that message. Direct quotations are from the user's own comments; surrounding narrative is an editorial adaptation in first person.
- Random and chronological metrics were supplied by the user in this chat on 23 October 2026. In each model block the first RMSE/MAE pair is validation and the second is test, matching the shared print statements. All 36 reported metric values are included to four decimals.
- Season-stratified day metrics were transcribed from the attached output screenshot, included at `data/seoul-day-results.png`.
- Coverage and target mean/standard deviation were independently recomputed from the local `SeoulBikeData.csv`, using the shared split code and seed 42. These are explicitly labelled as recomputed in the page. The data file's SHA-256 and date range are recorded in `data/seoul-results.json`. Model results were not rerun or substituted.
- The local CSV has 8,760 rows, 365 days and no missing targets. Date/hour order was checked before chronological slicing. Whole-day split allocation is 219/73/73 days.
- Important correction to the initial notebook hypothesis: chronological training is not almost exclusively winter. It includes winter, spring and part of summer, with no autumn. Test is entirely autumn. Coverage does not establish a causal explanation for model performance.
- The downloaded early notebook contains a different, older 75/25 tree experiment and an unfinished metric line. It is archived for transparency, not used as the ground truth for the latest runs. `notebooks/seoul-bike-sharing.ipynb` is now the final Kaggle notebook with its saved outputs, replacing the earlier reconstructed source archive.

## V1 scope

The site reports the supplied experiments, acknowledges post-result protocol changes and distinguishes future-period evaluation from unseen-day evaluation. It does not claim a universal model winner, causal season effects, superiority of random splits or results for experiments that were not run.

See `VERIFICATION.md` for the checks performed on this package.
