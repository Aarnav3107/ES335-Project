"""
Builds statsbomb_shots_2015_16.csv from StatsBomb Open Data event files.

Source: https://github.com/statsbomb/open-data (data provided by StatsBomb)
Competitions: Premier League, La Liga, Serie A, Ligue 1 - season 2015/2016
(the 1. Bundesliga 2015/16 folder only has 34 matches so it is left out)

This only flattens the JSON, one row per shot. No filtering, no features.
The freeze frame is kept as a JSON string so the notebook can parse it later.

Usage:
    python build_statsbomb_shots.py <open-data/data folder> <output csv>
The folder needs matches/<comp>/27.json and events/<match_id>.json
"""
import json
import os
import sys

import pandas as pd

COMPETITIONS = {2: "Premier League", 11: "La Liga", 12: "Serie A", 7: "Ligue 1"}
SEASON_ID = 27  # 2015/2016

data_dir, out_path = sys.argv[1], sys.argv[2]

rows = []
for comp_id, comp_name in COMPETITIONS.items():
    matches = json.load(open(os.path.join(data_dir, "matches", str(comp_id), f"{SEASON_ID}.json"), encoding="utf-8"))
    for m in matches:
        ev_path = os.path.join(data_dir, "events", f"{m['match_id']}.json")
        try:
            events = json.load(open(ev_path, encoding="utf-8"))
        except (FileNotFoundError, ValueError):
            print("skipping missing/incomplete file:", ev_path)
            continue
        for e in events:
            if e["type"]["name"] != "Shot":
                continue
            s = e["shot"]
            ff = [
                {"x": p["location"][0], "y": p["location"][1], "teammate": p["teammate"], "position": p["position"]["name"]}
                for p in s.get("freeze_frame", [])
            ]
            end = s.get("end_location", [None, None, None])
            rows.append({
                "match_id": m["match_id"],
                "competition": comp_name,
                "match_date": m["match_date"],
                "home_team": m["home_team"]["home_team_name"],
                "away_team": m["away_team"]["away_team_name"],
                "shot_id": e["id"],
                "team": e["team"]["name"],
                "player": e["player"]["name"],
                "position": e.get("position", {}).get("name"),
                "period": e["period"],
                "minute": e["minute"],
                "second": e["second"],
                "play_pattern": e["play_pattern"]["name"],
                "location_x": e["location"][0],
                "location_y": e["location"][1],
                "under_pressure": e.get("under_pressure", False),
                "shot_type": s["type"]["name"],
                "body_part": s["body_part"]["name"],
                "technique": s["technique"]["name"],
                "first_time": s.get("first_time", False),
                "one_on_one": s.get("one_on_one", False),
                "open_goal": s.get("open_goal", False),
                "follows_dribble": s.get("follows_dribble", False),
                "aerial_won": s.get("aerial_won", False),
                "redirect": s.get("redirect", False),
                "deflected": s.get("deflected", False),
                "end_location_x": end[0],
                "end_location_y": end[1] if len(end) > 1 else None,
                "end_location_z": end[2] if len(end) > 2 else None,
                "statsbomb_xg": s.get("statsbomb_xg"),
                "outcome": s["outcome"]["name"],
                "freeze_frame": json.dumps(ff, separators=(",", ":")),
            })

df = pd.DataFrame(rows)
df.to_csv(out_path, index=False)
print(df.shape)
print(df["competition"].value_counts())
