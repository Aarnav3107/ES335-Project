/* Edit scores and descriptions here; JSON mirror: data/seoul-results.json. */
window.SEOUL_DATA = {
  "models": [
    "Linear Regression",
    "Decision Tree",
    "XGBoost"
  ],
  "splits": {
    "random": {
      "title": "Random rows",
      "question": "How well can we predict held-out hours from the same year?",
      "method": "We split twice with shuffling: 20% of the rows for test, then 25% of the remaining 80% for validation, both with random_state=42. That leaves 60% for training, 20% for validation and 20% for test.",
      "caveat": "Hours from the same date can land in different sets, and nearby hours share very similar conditions, so this is not a true forecast of the future.",
      "finding": "GREAT START! XGBoost leads on validation and on test, for both error metrics. The question we should have asked straight away is what exactly the split let it see.",
      "scores": [
        {
          "model": "Linear Regression",
          "validation": {
            "rmse": 374.4176,
            "mae": 281.8237
          },
          "test": {
            "rmse": 376.536,
            "mae": 285.8975
          }
        },
        {
          "model": "Decision Tree",
          "validation": {
            "rmse": 288.5615,
            "mae": 181.2777
          },
          "test": {
            "rmse": 295.6182,
            "mae": 183.0501
          }
        },
        {
          "model": "XGBoost",
          "validation": {
            "rmse": 232.9298,
            "mae": 149.5629
          },
          "test": {
            "rmse": 244.4034,
            "mae": 155.7212
          }
        }
      ],
      "coverage": [
        {
          "set": "Train",
          "rows": 5256,
          "days": 365,
          "seasons": {
            "Winter": 1268,
            "Spring": 1350,
            "Summer": 1305,
            "Autumn": 1333
          },
          "mean": 704.2450532724505,
          "std": 647.1741345954129
        },
        {
          "set": "Validation",
          "rows": 1752,
          "days": 364,
          "seasons": {
            "Winter": 443,
            "Spring": 440,
            "Summer": 449,
            "Autumn": 420
          },
          "mean": 706.3361872146119,
          "std": 638.1140477768444
        },
        {
          "set": "Test",
          "rows": 1752,
          "days": 364,
          "seasons": {
            "Winter": 449,
            "Spring": 418,
            "Summer": 454,
            "Autumn": 431
          },
          "mean": 703.9389269406392,
          "std": 645.6656915949527
        }
      ]
    },
    "chronological": {
      "title": "Chronological",
      "question": "How well can we predict later hours using only earlier ones?",
      "method": "The first 60% of the rows, in time order, train the models, the next 20% validate them and the last 20% test them. We checked by hand that the rows are sorted by date and then by hour.",
      "caveat": "With only one year of data, time and season move together, so a change in the ranking cannot tell us which of the two caused it.",
      "finding": "This was the surprise, because Linear Regression has the lowest test RMSE and MAE, while on validation the tree is best on both, so the winner depends on which part of the year we ask about.",
      "scores": [
        {
          "model": "Linear Regression",
          "validation": {
            "rmse": 607.0256,
            "mae": 513.4486
          },
          "test": {
            "rmse": 369.8886,
            "mae": 277.0216
          }
        },
        {
          "model": "Decision Tree",
          "validation": {
            "rmse": 472.4594,
            "mae": 342.2714
          },
          "test": {
            "rmse": 517.6507,
            "mae": 348.0296
          }
        },
        {
          "model": "XGBoost",
          "validation": {
            "rmse": 483.4648,
            "mae": 395.9133
          },
          "test": {
            "rmse": 499.4878,
            "mae": 377.6833
          }
        }
      ],
      "coverage": [
        {
          "set": "Train",
          "rows": 5256,
          "days": 219,
          "seasons": {
            "Winter": 2160,
            "Spring": 2208,
            "Summer": 888,
            "Autumn": 0
          },
          "mean": 600.9216133942161,
          "std": 631.7566576930018
        },
        {
          "set": "Validation",
          "rows": 1752,
          "days": 73,
          "seasons": {
            "Winter": 0,
            "Spring": 0,
            "Summer": 1320,
            "Autumn": 432
          },
          "mean": 963.2482876712329,
          "std": 636.3270618457711
        },
        {
          "set": "Test",
          "rows": 1752,
          "days": 73,
          "seasons": {
            "Winter": 0,
            "Spring": 0,
            "Summer": 0,
            "Autumn": 1752
          },
          "mean": 756.9971461187215,
          "std": 613.5074513892908
        }
      ]
    },
    "day": {
      "title": "Season-stratified days",
      "question": "How well can we predict whole days we have never seen, while still covering every season?",
      "method": "We took every unique date with its season, split the days 60/20/20 stratified by season with random_state=42, and then put each hour into the set its date belongs to.",
      "caveat": "Whole days stay together, but training can still contain dates that come after the test dates. So this measures performance on unseen days within the same year, not on a future year.",
      "finding": "XGBoost leads again, with a test RMSE of 250.4534 bikes against 383.6370 for Linear Regression, which is 34.7% lower on this split.",
      "scores": [
        {
          "model": "Linear Regression",
          "validation": {
            "rmse": 362.9971,
            "mae": 269.6009
          },
          "test": {
            "rmse": 383.637,
            "mae": 293.1267
          }
        },
        {
          "model": "Decision Tree",
          "validation": {
            "rmse": 311.2711,
            "mae": 203.6951
          },
          "test": {
            "rmse": 290.6824,
            "mae": 186.1559
          }
        },
        {
          "model": "XGBoost",
          "validation": {
            "rmse": 258.5067,
            "mae": 164.8088
          },
          "test": {
            "rmse": 250.4534,
            "mae": 166.0807
          }
        }
      ],
      "coverage": [
        {
          "set": "Train",
          "rows": 5256,
          "days": 219,
          "seasons": {
            "Winter": 1296,
            "Spring": 1320,
            "Summer": 1320,
            "Autumn": 1320
          },
          "mean": 699.154299847793,
          "std": 655.844113063408
        },
        {
          "set": "Validation",
          "rows": 1752,
          "days": 73,
          "seasons": {
            "Winter": 432,
            "Spring": 432,
            "Summer": 456,
            "Autumn": 432
          },
          "mean": 718.5970319634703,
          "std": 614.5045027014975
        },
        {
          "set": "Test",
          "rows": 1752,
          "days": 73,
          "seasons": {
            "Winter": 432,
            "Spring": 456,
            "Summer": 432,
            "Autumn": 432
          },
          "mean": 706.9503424657535,
          "std": 642.0801141854772
        }
      ]
    }
  },
  "provenance": {
    "metrics": "Random and chronological: user-supplied results, 23 October 2026. Day split: attached output screenshot; validation first, test second, per shared print code.",
    "coverage": "Recomputed from local SeoulBikeData.csv using the shared split code; models were not rerun."
  },
  "dataset": {
    "rows": 8760,
    "days": 365,
    "sha256": "373339b71a8935d69e9af0abf26a70744632119862eeb3919efb389a7b749c60",
    "start": "2017-12-01",
    "end": "2018-11-30"
  }
};

window.SEOUL_EXCERPTS = [
  {
    "title": "01 / Bare minimum cleaning",
    "code": "df.dropna(axis=0, subset=['Rented Bike Count'], inplace=True)\ndf.drop(['Date'], axis=1, inplace=True)\nX = pd.get_dummies(X, columns=['Hour', 'Seasons', 'Holiday', 'Functioning Day'], drop_first=True, dtype=int)\n"
  },
  {
    "title": "02 / Random split with the 60/20/20 allocation",
    "code": "X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\nX_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.25, random_state=42)"
  },
  {
    "title": "03 / Chronological split that keeps the original order",
    "code": "n = len(X)\n\n# NOTE: I am splitting using plain slicing since I have manually verified the dataframe is sorted day wise and for same day hour wise\n# NOTE: Not using train test split since this is time based data and hence training on 8 am and 10 am and predicting for 9 am is unfair and hence using \n# a chronological split as I have also highlighted in the course proposal. \n\ntrain_end = int(0.6 * n)\nval_end = int(0.8 * n)\n\nX_train = X.iloc[:train_end]\nX_val   = X.iloc[train_end:val_end]\nX_test  = X.iloc[val_end:]\n\ny_train = y.iloc[:train_end]\ny_val   = y.iloc[train_end:val_end]\ny_test  = y.iloc[val_end:]\n\n"
  },
  {
    "title": "04 / Investigating the target distributions",
    "code": "# So, I thought about this for a while, I think on chronological split it is happening\n# that the training is happening almost exclusively in Winter months, \n# validation on summer months and testing on Autumn months. This could be the main problem I feel\n# but how this helps linear regression generalise and not the other complex models, I have NO IDEA. \n# Have to investigate\n\n# This is incredible man, wow, completely caught me off guards but now time to investigate. \n\nfor name, target in [\n    (\"Train\", y_train),\n    (\"Validation\", y_val),\n    (\"Test\", y_test)\n]:\n    print(f\"\\n{name}\")\n    print(target.describe())\n\n# NOTE: yeah so this shows the distribution changes (mean and std vary across the splits)\n"
  },
  {
    "title": "05 / Our reaction, before we worked out the evaluation question",
    "code": "'''\nThis result just doesn't sit right with me man, because to be honest this goes against what I would\nhave thought would happen based on theory.\nI am not saying this just because the numbers align with my expectations, I swear no. But what is \nhappening on the chronological split is a model is shown one end of a distribution and is judged on a \ncompletely unseen distribution. In fact that was the exact reason we had a random train test split and \nnot a slicing. \nI know the reasoning for a chronological split - the prediction we are making is of future using past \ndata so the model should be judged on that action... that is the reasoning for time based datasets. \nBUT come to think of it, seasons, temperature, humidity all play A MUCH LARGER role in bike demand and \nwhether it is 2017 or 2019 really doesn't impact much for this particular problem if you think \ncarefully. For general temporal data sure, but for this particular problem, I don't see why a random \nsplit is not the better option\n'''\n"
  },
  {
    "title": "06 / New split that stratifies whole days by season",
    "code": "import pandas as pd\nfrom sklearn.model_selection import train_test_split\n\ndf = pd.read_csv('/kaggle/input/datasets/waleedejaz/seoul-bike-sharing-demand/SeoulBikeData.csv', encoding='unicode-escape')\n\ndf[\"Date\"] = pd.to_datetime(df[\"Date\"], dayfirst=True)\n\ndays = df[[\"Date\", \"Seasons\"]].drop_duplicates().reset_index(drop=True)\n\nprint(days.shape)\nprint(days[\"Seasons\"].value_counts())\n\ntrain_days, remaining_days = train_test_split(\n    days,\n    test_size=0.4,\n    random_state=42,\n    stratify=days[\"Seasons\"]\n)\n\nval_days, test_days = train_test_split(\n    remaining_days,\n    test_size=0.5,\n    random_state=42,\n    stratify=remaining_days[\"Seasons\"]\n)\n\ntrain_mask = df[\"Date\"].isin(train_days[\"Date\"])\nval_mask = df[\"Date\"].isin(val_days[\"Date\"])\ntest_mask = df[\"Date\"].isin(test_days[\"Date\"])\n\nX = df.drop(columns=[\"Date\", \"Rented Bike Count\"])\n\nX = pd.get_dummies(\n    X,\n    columns=[\"Hour\", \"Seasons\", \"Holiday\", \"Functioning Day\"],\n    drop_first=True,\n    dtype=int\n)\n\ny = df[\"Rented Bike Count\"]\n\nX_train, y_train = X.loc[train_mask], y.loc[train_mask]\nX_val, y_val = X.loc[val_mask], y.loc[val_mask]\nX_test, y_test = X.loc[test_mask], y.loc[test_mask]\n\n"
  },
  {
    "title": "07 / XGBoost, with validation controlling early stopping",
    "code": "model = XGBRegressor(\n    n_estimators=2000,\n    learning_rate=0.1,\n    early_stopping_rounds=50,\n    n_jobs=4,\n    seed=42\n)\n\nmodel.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)\n"
  }
];
