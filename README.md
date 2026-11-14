# ES335 — Data-Centric Machine Learning Project

** INTRODUCTION: TO BE ADDED **

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
