### Bare Minimum Cleaning:
```
df.dropna(axis=0, subset=['Rented Bike Count'], inplace=True)
df.drop(['Date'], axis=1, inplace=True)
X = pd.get_dummies(X, columns=['Hour', 'Seasons', 'Holiday', 'Functioning Day'], drop_first=True, dtype=int)
```

RANDOM SPLIT:
```
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.25, random_state=42)

print("LINEAR REGRESSION:\n")

model = LinearRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
y_pred_val = model.predict(X_val)

print(f'RMSE: {root_mean_squared_error(y_pred_val, y_val):.4f}')
print(f'MAE: {mean_absolute_error(y_pred_val, y_val):.4f}')
print()
print(f'RMSE: {root_mean_squared_error(y_pred, y_test):.4f}')
print(f'MAE: {mean_absolute_error(y_pred, y_test):.4f}')

print("\nDECISION TREE REGRESSOR:\n")

model = DecisionTreeRegressor(max_depth=18, min_samples_leaf=10, random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
y_pred_val = model.predict(X_val)

print(f'RMSE: {root_mean_squared_error(y_pred_val, y_val):.4f}')
print(f'MAE: {mean_absolute_error(y_pred_val, y_val):.4f}')
print()
print(f'RMSE: {root_mean_squared_error(y_pred, y_test):.4f}')
print(f'MAE: {mean_absolute_error(y_pred, y_test):.4f}')

print("\nXGBOOST REGRESSOR:\n")
model = XGBRegressor(
    n_estimators=2000,
    learning_rate=0.1,
    early_stopping_rounds=50,
    n_jobs=4,
    seed=42
)

model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
y_pred = model.predict(X_test)
y_pred_val = model.predict(X_val)

print(f'RMSE: {root_mean_squared_error(y_pred_val, y_val):.4f}')
print(f'MAE: {mean_absolute_error(y_pred_val, y_val):.4f}')
print()
print(f'RMSE: {root_mean_squared_error(y_pred, y_test):.4f}')
print(f'MAE: {mean_absolute_error(y_pred, y_test):.4f}')

# NOTE: Results are clearly demonstrating the effect of model complexity which I wanted to see XGBoost miles better than Linear Regression
# and surprisingly much much better than a DTRegressor
# GREAT START!
```

CHRONOLOGICAL SPLIT:
```
n = len(X)

# NOTE: I am splitting using plain slicing since I have manually verified the dataframe is sorted day wise and for same day hour wise
# NOTE: Not using train test split since this is time based data and hence training on 8 am and 10 am and predicting for 9 am is unfair and hence using 
# a chronological split as I have also highlighted in the course proposal. 

train_end = int(0.6 * n)
val_end = int(0.8 * n)

X_train = X.iloc[:train_end]
X_val   = X.iloc[train_end:val_end]
X_test  = X.iloc[val_end:]

y_train = y.iloc[:train_end]
y_val   = y.iloc[train_end:val_end]
y_test  = y.iloc[val_end:]

model = LinearRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
y_pred_val = model.predict(X_val)

print(f'RMSE: {root_mean_squared_error(y_pred_val, y_val):.4f}')
print(f'MAE: {mean_absolute_error(y_pred_val, y_val):.4f}')
print()
print(f'RMSE: {root_mean_squared_error(y_pred, y_test):.4f}')
print(f'MAE: {mean_absolute_error(y_pred, y_test):.4f}')

model = DecisionTreeRegressor(max_depth=18, min_samples_leaf=10, random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
y_pred_val = model.predict(X_val)

print(f'RMSE: {root_mean_squared_error(y_pred_val, y_val):.4f}')
print(f'MAE: {mean_absolute_error(y_pred_val, y_val):.4f}')
print()
print(f'RMSE: {root_mean_squared_error(y_pred, y_test):.4f}')
print(f'MAE: {mean_absolute_error(y_pred, y_test):.4f}')

from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, r2_score 

model = XGBRegressor(
    n_estimators=2000,
    learning_rate=0.1,
    early_stopping_rounds=50,
    n_jobs=4,
    seed=42
)

model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
y_pred = model.predict(X_test)
y_pred_val = model.predict(X_val)

print(f'RMSE: {root_mean_squared_error(y_pred_val, y_val):.4f}')
print(f'MAE: {mean_absolute_error(y_pred_val, y_val):.4f}')
print()
print(f'RMSE: {root_mean_squared_error(y_pred, y_test):.4f}')
print(f'MAE: {mean_absolute_error(y_pred, y_test):.4f}')
```



INVESTIGATION:
```
# So, I thought about this for a while, I think on chronological split it is happening
# that the training is happening almost exclusively in Winter months, 
# validation on summer months and testing on Autumn months. This could be the main problem I feel
# but how this helps linear regression generalise and not the other complex models, I have NO IDEA. 
# Have to investigate

# This is incredible man, wow, completely caught me off guards but now time to investigate. 

for name, target in [
    ("Train", y_train),
    ("Validation", y_val),
    ("Test", y_test)
]:
    print(f"\n{name}")
    print(target.describe())

# NOTE: yeah so this shows the distribution changes (mean and std vary across the splits)
```

OPINION:
```
'''
This result just doesn't sit right with me man, because to be honest this goes against what I would
have thought would happen based on theory.
I am not saying this just because the numbers align with my expectations, I swear no. But what is 
happening on the chronological split is a model is shown one end of a distribution and is judged on a 
completely unseen distribution. In fact that was the exact reason we had a random train test split and 
not a slicing. 
I know the reasoning for a chronological split - the prediction we are making is of future using past 
data so the model should be judged on that action... that is the reasoning for time based datasets. 
BUT come to think of it, seasons, temperature, humidity all play A MUCH LARGER role in bike demand and 
whether it is 2017 or 2019 really doesn't impact much for this particular problem if you think 
carefully. For general temporal data sure, but for this particular problem, I don't see why a random 
split is not the better option
'''
```

NEW SPLIT:
```
import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv('/kaggle/input/datasets/waleedejaz/seoul-bike-sharing-demand/SeoulBikeData.csv', encoding='unicode-escape')

df["Date"] = pd.to_datetime(df["Date"], dayfirst=True)

days = df[["Date", "Seasons"]].drop_duplicates().reset_index(drop=True)

print(days.shape)
print(days["Seasons"].value_counts())

train_days, remaining_days = train_test_split(
    days,
    test_size=0.4,
    random_state=42,
    stratify=days["Seasons"]
)

val_days, test_days = train_test_split(
    remaining_days,
    test_size=0.5,
    random_state=42,
    stratify=remaining_days["Seasons"]
)

train_mask = df["Date"].isin(train_days["Date"])
val_mask = df["Date"].isin(val_days["Date"])
test_mask = df["Date"].isin(test_days["Date"])

X = df.drop(columns=["Date", "Rented Bike Count"])

X = pd.get_dummies(
    X,
    columns=["Hour", "Seasons", "Holiday", "Functioning Day"],
    drop_first=True,
    dtype=int
)

y = df["Rented Bike Count"]

X_train, y_train = X.loc[train_mask], y.loc[train_mask]
X_val, y_val = X.loc[val_mask], y.loc[val_mask]
X_test, y_test = X.loc[test_mask], y.loc[test_mask]

print("LINEAR REGRESSION:\n")

model = LinearRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
y_pred_val = model.predict(X_val)

print(f'RMSE: {root_mean_squared_error(y_pred_val, y_val):.4f}')
print(f'MAE: {mean_absolute_error(y_pred_val, y_val):.4f}')
print()
print(f'RMSE: {root_mean_squared_error(y_pred, y_test):.4f}')
print(f'MAE: {mean_absolute_error(y_pred, y_test):.4f}')

print("\nDECISION TREE REGRESSOR:\n")

model = DecisionTreeRegressor(max_depth=18, min_samples_leaf=10, random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
y_pred_val = model.predict(X_val)

print(f'RMSE: {root_mean_squared_error(y_pred_val, y_val):.4f}')
print(f'MAE: {mean_absolute_error(y_pred_val, y_val):.4f}')
print()
print(f'RMSE: {root_mean_squared_error(y_pred, y_test):.4f}')
print(f'MAE: {mean_absolute_error(y_pred, y_test):.4f}')

print("\nXGBOOST REGRESSOR:\n")
model = XGBRegressor(
    n_estimators=2000,
    learning_rate=0.1,
    early_stopping_rounds=50,
    n_jobs=4,
    seed=42
)

model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
y_pred = model.predict(X_test)
y_pred_val = model.predict(X_val)

print(f'RMSE: {root_mean_squared_error(y_pred_val, y_val):.4f}')
print(f'MAE: {mean_absolute_error(y_pred_val, y_val):.4f}')
print()
print(f'RMSE: {root_mean_squared_error(y_pred, y_test):.4f}')
print(f'MAE: {mean_absolute_error(y_pred, y_test):.4f}')
```

GO