"""
Builds js/xg-data.js and data/xg-results.json from the saved outputs of the final
football xG notebook, so every number on datasets/dataset-3.html comes from a notebook output.
If the notebook's model-export cell has been run, also builds js/xg-models.js from xg_lr_models.json.

Usage (from the beyond-the-model folder):
    python tools/build_xg_data.py notebooks/football-xg.ipynb [path/to/xg_lr_models.json]
"""
import json
import re
import sys

nb = json.load(open(sys.argv[1], encoding='utf-8'))
cells = nb['cells']


def src(c):
    return c['source'] if isinstance(c['source'], str) else ''.join(c['source'])


def out(c):
    parts = []
    for o in c.get('outputs', []):
        t = o.get('text') or o.get('data', {}).get('text/plain')
        if t:
            parts.append(t if isinstance(t, str) else ''.join(t))
    return '\n'.join(parts)


def find(snippet, nth=0):
    hits = [c for c in cells if c['cell_type'] == 'code' and snippet in src(c)]
    return hits[nth]


def series(text):
    """Parse a printed pandas Series: 'label    value' lines."""
    rows = []
    for line in text.splitlines():
        m = re.match(r'^\s*(.+?)\s+(-?\d+(?:\.\d+)?)\s*$', line)
        if m and not line.startswith('Name:') and not line.startswith('dtype'):
            rows.append([m.group(1).strip(), float(m.group(2))])
    return rows


def model_blocks(text):
    res = {}
    for name, block in re.findall(r'(LOGISTIC REGRESSION|DECISION TREE CLASSIFIER|XGBOOST CLASSIFIER):\s*\n(.*?)(?=\n[A-Z ]+:\n|\Z)', text, re.S):
        nums = [float(v) for v in re.findall(r'(?:Log Loss|AUC): ([\d.]+)', block)]
        key = {'LOGISTIC REGRESSION': 'Logistic Regression', 'DECISION TREE CLASSIFIER': 'Decision Tree', 'XGBOOST CLASSIFIER': 'XGBoost'}[name]
        res[key] = {'validation': {'logloss': nums[0], 'auc': nums[1]}, 'test': {'logloss': nums[2], 'auc': nums[3]}}
    return res


def depth_from_code(c):
    return int(re.search(r'DecisionTreeClassifier\(max_depth=(\d+)', src(c)).group(1))


D = {}
# dataset + target
o = out(find("print(df.shape)"))
D['raw_shape'] = [int(v) for v in re.search(r'\((\d+), (\d+)\)', o).groups()]
D['competitions'] = [[k, int(v)] for k, v in series(o.split('competition')[1].split('Index')[0])]
D['outcomes'] = [[k, int(v)] for k, v in series(out(find("df['outcome'].value_counts()")).replace('outcome', ''))]
D['goal_rate_all'] = float(re.search(r'Goal rate: ([\d.]+)', out(find("df['is_goal'] = (df['outcome']"))).group(1))
o = out(find("print(df['shot_type'].value_counts())"))
counts, rates = o.split('shot_type')[1], o.split('shot_type')[2]
cnt = dict(series(counts))
D['shot_types'] = [[k, int(cnt[k]), v] for k, v in series(rates)]
# EDA
D['y_bins'] = series(out(find("y_bins = pd.cut")).split('location_y')[1])
D['x_bins'] = series(out(find("x_bins = pd.cut")).split('location_x')[1])
o = out(find("print(df.groupby('body_part')['is_goal'].mean())"))
rates, xs = series(o.split('body_part')[1]), dict(series(o.split('body_part')[2]))
D['body_part'] = [[k, v, xs[k]] for k, v in rates]
# cleaning
o = out(find("df = df[df['shot_type'].isin"))
D['clean_penalties'] = [int(v) for v in re.findall(r'\d+', o)[:2]]
o = out(find("df['keeper_in_frame'] ="))
D['clean_keeper'] = [int(v) for v in re.findall(r'\d+', o)[:2]]
D['split_shots'] = [int(v) for v in out(find("print(train_mask.sum(), val_mask.sum(), test_mask.sum())")).split()]
# engineered feature EDA
o = out(find("print(df.groupby(pd.cut(df['distance_to_goal']"))
D['distance_bins'] = series(o.split('distance_to_goal')[1].split('shot_angle')[0])
D['angle_bins'] = series(o.split('shot_angle')[1])
o = out(find("print(df.groupby('defenders_in_the_way')"))
D['defenders_in_the_way'] = [[int(float(m[0])), int(m[1]), float(m[2])] for m in re.findall(r'^\s*(\d+\.?\d*)\s+(\d+)\s+([\d.]+)\s*$', o, re.M)]
# depth loops + models
loops = [c for c in cells if c['cell_type'] == 'code' and 'for depth in range(2, 11)' in src(c)]
D['depth_search'] = {'raw': [[int(a), float(b)] for a, b in re.findall(r'^(\d+) ([\d.]+)$', out(loops[0]), re.M)],
                     'engineered': [[int(a), float(b)] for a, b in re.findall(r'^(\d+) ([\d.]+)$', out(loops[1]), re.M)]}
raw_cell = find("scores.append(['Raw', 'Logistic Regression'")
eng_cell = find("scores.append(['Engineered', 'Logistic Regression'")
D['tree_depth'] = {'raw': depth_from_code(raw_cell), 'engineered': depth_from_code(eng_cell)}
D['scores'] = {'raw': model_blocks(out(raw_cell)), 'engineered': model_blocks(out(eng_cell))}
o = out(find("df.loc[test_mask, 'statsbomb_xg']):.4f}"))
D['statsbomb'] = {'logloss': float(re.search(r'Log Loss: ([\d.]+)', o).group(1)), 'auc': float(re.search(r'AUC: ([\d.]+)', o).group(1))}
o = out(find("print(f'Real goals: {y_test.sum()}')"))
g = re.search(r'train: ([\d.]+), test: ([\d.]+)', o)
D['goal_rate_split'] = {'train': float(g.group(1)), 'test': float(g.group(2))}
D['xg_totals'] = {'real': int(re.search(r'Real goals: (\d+)', o).group(1)),
                  'Logistic Regression': float(re.search(r'LR xG: ([\d.]+)', o).group(1)),
                  'XGBoost': float(re.search(r'XGBoost xG: ([\d.]+)', o).group(1)),
                  'StatsBomb': float(re.search(r'StatsBomb xG: ([\d.]+)', o).group(1))}
o = out(find("repeat_df = pd.DataFrame(repeat_scores"))
D['repeats'] = [[int(s), f, float(a), float(b)] for s, f, a, b in re.findall(r'^\s*(\d+)\s+(Raw|Engineered)\s+([\d.]+)\s+([\d.]+)\s*$', o, re.M)]
o = out(find("print(repeat_df.groupby('Features')"))
D['repeat_wins'] = {k: int(v) for k, v in re.findall(r'^(Engineered|Raw)\s+(\d+)\s*$', o.split('\n\n')[-1], re.M)}
D['coefficients'] = [[k, v] for k, v in series(out(find("coefs = pd.Series(lr_model.coef_[0]")))]
# verbatim code excerpts
D['code'] = {
    'split': src(find("matches = df[['match_id', 'competition']].drop_duplicates()")),
    'distance_angle': src(find("df['distance_to_goal'] = np.sqrt")),
    'freeze_frame': src(find("def freeze_frame_features(row):")),
    'header': src(find("df['header_distance'] =")),
    'leakage': src(find("df = df.drop(columns=['end_location_x'")),
    'repeats': src(find("for seed in range(10):")),
    'xgboost': "model = XGBClassifier(\n    n_estimators=2000,\n    learning_rate=0.1,\n    early_stopping_rounds=50,\n    n_jobs=4,\n    seed=42\n)\n\nmodel.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)",
}
crit = [src(c) for c in cells if c['cell_type'] == 'markdown' and 'competitive' in src(c)]
D['criterion'] = crit[0].split('\n', 1)[1].strip()

assert len(D['repeats']) == 20 and len(D['coefficients']) > 20 and len(D['y_bins']) == 9, 'parse failed'
open('js/xg-data.js', 'w', encoding='utf-8').write(
    '/* Generated by tools/build_xg_data.py from the saved notebook outputs. Do not edit by hand. */\nwindow.XG_DATA = '
    + json.dumps(D, indent=1, ensure_ascii=False) + ';\n')
json.dump(D, open('data/xg-results.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print('xg-data.js written', D['repeat_wins'], D['tree_depth'])

if len(sys.argv) > 2:
    models = json.load(open(sys.argv[2], encoding='utf-8'))
    open('js/xg-models.js', 'w', encoding='utf-8').write(
        '/* The two fitted Logistic Regression models, exported by the notebook (xg_lr_models.json). */\nwindow.XG_MODELS = '
        + json.dumps(models, ensure_ascii=False) + ';\n')
    print('xg-models.js written')
