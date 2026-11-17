# ES335 — Data-Centric Machine Learning Project

**Beyond the Model** is our ES335 course project at IIT Gandhinagar. It asks a simple question that machine learning courses often skip past: when a prediction gets better, how much of that comes from the data, meaning how it is cleaned and which features we build, and how much comes from choosing a stronger model? We explore that question through three real tabular datasets, and in each one we change the data and the model separately so we can see which change actually moves the result. The project is inspired by *A Data-Centric Perspective on Evaluating Machine Learning Models for Tabular Data* (NeurIPS 2024), but it is our own investigation and not a reproduction of the paper.

**Live website: https://aarnav3107.github.io/ES335-Project/**

The website tells the full story of each case study with interactive evidence, and its home page ties the three together.

## Acknowledgements

We would like to thank Prof. Udit Bhatia, the instructor of ES335 at IIT Gandhinagar, for a course that gave us the tools to ask these questions in the first place, and for the freedom to follow them wherever they led. This project grew out of what we learned in his class, and we are grateful for his guidance and his understanding throughout the semester.

## The three case studies

| Case study | Question | What it showed us |
|---|---|---|
| **NYC Taxi** (January 2016) | How long will a taxi trip take, using only what is known at pickup? | Messy data was hiding the signal. A Haversine distance feature did almost nothing until the impossible trips and broken coordinates were cleaned out, and then it cut Linear Regression's RMSE by 27.6%. |
| **Seoul Bikes** (Dec 2017 – Nov 2018) | How many bikes will be rented in a given hour? | The evaluation decided the winner. With the same models and settings, XGBoost won on random rows and on season-stratified days, while Linear Regression won on a chronological split that left all of autumn for testing. |
| **Football xG** (StatsBomb 2015/16) | What is the probability that a shot becomes a goal? | Knowing the game closed the gap. Six football features took Logistic Regression from clearly behind XGBoost to level with it (test log loss 0.2453 against 0.2464), close to StatsBomb's own professional xG (0.2431). |

## Team

| Member | Roll No. | Contribution |
|---|---|---|
| Dhyey Buch | 25110106 | NYC Taxi case study; Football xG case study (with help from Aarnav) |
| Aarnav Shah | 25110288 | Seoul Bikes case study; helped with Football xG |

Ideation and brainstorming, and the project summary on the website's home page, were a joint effort.

## Repository map

```text
.
├── README.md
├── AI-Disclosure.md                       # how and where we used AI
├── requirements.txt
├── .gitignore
├── notebooks/
│   ├── es335-project-nyc-taxi.ipynb       # NYC Taxi, final Kaggle run with outputs
│   ├── seoul-bike-sharing-final.ipynb     # Seoul Bikes, final Kaggle run with outputs
│   └── es335-project-football-xg.ipynb    # Football xG, final Kaggle run with outputs
├── data/
│   ├── README.md                          # where to get each dataset, and its licence
│   └── build_statsbomb_shots.py           # builds the xG shots table from StatsBomb Open Data
├── results/
│   ├── nyc-results.json                   # scores and evidence taken from the notebook outputs
│   ├── seoul-results.json
│   └── xg-results.json
└── docs/                                  # the website, served by GitHub Pages
```

## Reproduce the notebooks

The final notebooks are also published on Kaggle, where they can be read with all their outputs: [NYC Taxi](https://www.kaggle.com/code/dhyeybuch/es335-project-nyc-taxi), [Seoul Bikes](https://www.kaggle.com/code/dhyeybuch/es335-project-seoul-bikesharing) and [Football xG](https://www.kaggle.com/code/dhyeybuch/es335-project-football-xg).

The simplest reproducible route is Kaggle, which supplies the original `/kaggle/input/` paths used in the notebooks. Create a Kaggle notebook from each file in `notebooks/`, attach the dataset named in `data/README.md`, select Python 3, and run the cells in order. The saved outputs are included so readers can compare their run with the submitted results.

For local execution, use Python 3.13 to match the saved notebook kernel, install `requirements.txt`, download each source dataset, and update the notebook’s data-loading path to your downloaded file. No model or feature-engineering code has been rewritten for local execution. Kaggle package versions can change; `requirements.txt` lists the direct libraries used, not a frozen Kaggle image.

The Football xG notebook reads a shots table built from StatsBomb Open Data. On Kaggle, a separate dataset-build notebook (run with Internet on) downloads the event files and writes `statsbomb_shots_2015_16.csv`, which is then attached to the xG notebook as an input. The same table can be built locally with `data/build_statsbomb_shots.py`. All splits in all three notebooks use `random_state=42`.

## The website

The site lives in `docs/` and is published with GitHub Pages from the `main` branch. It needs no build step: every page is plain HTML, CSS and JavaScript, and it also works when opened straight from disk. The numbers on the site are taken from the saved notebook outputs. Scripts in `docs/tools/` generate two of the site's data files: the Football xG data is read directly from the saved notebook outputs, and the Seoul year timeline is rebuilt from the source CSV with the notebook's split code, refusing to write anything unless it reproduces the published season coverage exactly. To update the live site, edit the files in `docs/`, then commit and push to `main`, and GitHub Pages redeploys within a minute or two.

To regenerate the two data files after a new notebook run, from inside `docs/`:

```bash
python tools/build_xg_data.py notebooks/football-xg.ipynb path/to/xg_lr_models.json
python tools/build_seoul_days.py path/to/SeoulBikeData.csv .
```

The first reads the saved outputs of the Football xG notebook (and the model file its last cell exports), and the second needs pandas and scikit-learn.


## References

**Research paper that inspired the project**
- Tschalzev, A., Marton, S., Lüdtke, S., Bartelt, C., & Stuckenschmidt, H. (2024). *A Data-Centric Perspective on Evaluating Machine Learning Models for Tabular Data.* Advances in Neural Information Processing Systems 37 (NeurIPS 2024), Datasets and Benchmarks Track. [Proceedings page](https://proceedings.neurips.cc/paper_files/paper/2024/hash/ae00e5ce7142d02e30a8235ede1ec6fc-Abstract-Datasets_and_Benchmarks_Track.html)

**Datasets**
- NYC Taxi: NYC Taxi & Limousine Commission, [TLC Trip Record Data](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page), Yellow Taxi trips for January 2016, used through the Kaggle copy [NYC Yellow Taxi Trip Data](https://www.kaggle.com/datasets/elemento/nyc-yellow-taxi-trip-data).
- Seoul Bikes: *Seoul Bike Sharing Demand* [Dataset]. (2020). UCI Machine Learning Repository. https://doi.org/10.24432/C5F62R, used through the Kaggle copy [Seoul Bike Sharing Demand](https://www.kaggle.com/datasets/waleedejaz/seoul-bike-sharing-demand).
- Football xG: StatsBomb, [StatsBomb Open Data](https://github.com/statsbomb/open-data), 2015/16 Premier League, La Liga, Serie A and Ligue 1. Data provided by StatsBomb and used under the StatsBomb public data user agreement.


## AI use

We used AI tools during this project: for shortlisting papers and datasets, for debugging and some of the trickier numpy and pandas code, for the Football xG experiments and EDA, and for most of the website code (the content, the story and the numbers are ours). The full details are in [`AI-Disclosure.md`](AI-Disclosure.md).
