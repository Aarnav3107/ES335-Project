# ES335 — Data-Centric Machine Learning Project

This repository preserves the two final Kaggle notebooks and their saved outputs. The work studies NYC Yellow Taxi trip-duration regression and Seoul Bike Sharing demand regression through data preparation, feature engineering, model comparisons, and evaluation design. Dataset 3 is still in progress.

## Repository map

```text
.
├── README.md
├── requirements.txt
├── .gitignore
├── notebooks/
│   ├── nyc-taxi-final.ipynb
│   └── seoul-bike-sharing-final.ipynb
├── data/
│   └── README.md
├── results/
│   ├── nyc-results.json
│   └── seoul-results.json
├── research/
│   └── experiments.md
└── website/               # reserved for the website files later
```

## Reproduce the notebooks

The simplest reproducible route is Kaggle, which supplies the original `/kaggle/input/` paths used in the notebooks. Create a Kaggle notebook from each file in `notebooks/`, attach the dataset named in `data/README.md`, select Python 3, and run the cells in order. The saved outputs are included so readers can compare their run with the submitted results.

For local execution, use Python 3.13 to match the saved notebook kernel, install `requirements.txt`, download each source dataset, and update the notebook’s data-loading path to your downloaded file. No model or feature-engineering code has been rewritten for local execution. Kaggle package versions can change; `requirements.txt` lists the direct libraries used, not a frozen Kaggle image.

## What the saved results mean

- NYC results are transcribed/reconciled from the final notebook’s saved cell outputs. The notebook is the source of truth. The previous website results file differed on three final-model rows: weekday Decision Tree, hourly Decision Tree, and hourly Histogram Gradient Boosting. `results/nyc-results.json` uses the final notebook values for those rows. No notebook source was edited.
- Seoul includes random-row, chronological, and season-stratified whole-day runs. Its recorded scores match the final notebook outputs. The accompanying coverage and target summaries are recomputed descriptive statistics, identified as such in the JSON.
- The old research log is included as a project journal. Where it differs from final notebook outputs, cite the final notebook outputs and treat the log entries as earlier experiments.

The notebook source files are copied byte-for-byte from the final files supplied for this repository. They retain the original student-authored code and comments.

## Push to GitHub

The local Git repository is initialized on `main`, and the files are ready to commit. First create an empty repository on GitHub without adding a README or license. Then, from this `repo/` folder, run:

```powershell
git add .
git commit -m "Add ES335 reproducible research"
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPOSITORY>.git
git push -u origin main
```

Replace the URL placeholders with the new repository URL. No remote is configured yet.

## Website

`website/` is intentionally reserved for the site files to be added later.
