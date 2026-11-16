# Data access

The raw datasets are not redistributed in this repository. Retrieve them from their original Kaggle pages and follow each page’s current license and attribution requirements.

- **NYC Yellow Taxi:** https://www.kaggle.com/datasets/elemento/nyc-yellow-taxi-trip-data. The notebook’s saved output lists the attached Kaggle folder and analyzes January 2016. Attach this dataset to the notebook in Kaggle before running it.
- **Seoul Bike Sharing Demand:** https://www.kaggle.com/datasets/waleedejaz/seoul-bike-sharing-demand. Attach this dataset to the notebook in Kaggle before running it.

The notebooks use Kaggle’s `/kaggle/input/...` paths as originally written. For local execution, download the datasets and update only the input path cells to point at your local copies; the experiments and modeling code can remain as written. Keep downloaded raw data out of Git unless you have confirmed redistribution is allowed.

- **StatsBomb Open Data (Dataset 3, football xG):** https://github.com/statsbomb/open-data. Free for research; credit StatsBomb as the data source when publishing. We use the 2015/16 Premier League, La Liga, Serie A and Ligue 1 seasons. The shots table `statsbomb_shots_2015_16.csv` (one row per shot, freeze frame kept as a JSON string) is built on Kaggle by the `football-xg-dataset-build` notebook (Internet ON), or locally with `data/build_statsbomb_shots.py <open-data/data folder> <output csv>`. Attach the CSV (as a Kaggle dataset or as the build notebook's output) to `notebooks/es335-project-football-xg.ipynb`; it reads `/kaggle/input/notebooks/dhyeybuch/football-xg-dataset-build/statsbomb_shots_2015_16.csv`.
