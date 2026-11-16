# Site repair verification

Checked against the actual beyond-the-model folder snapshot, 23 October 2026.

- NYC before/after controls passed repeated transitions, including values, correlation bars and selected state.
- All 12 NYC feature/model combinations passed: 8 measured results and 4 explicit missing-result states.
- All 12 Seoul split/set/metric combinations passed, including ranks, coverage and linked labels.
- All 5 HTML pages passed local asset, link and fragment checks; no duplicate IDs were found.
- Both case studies have six valid chapter links and the same report layout with a sticky menu.
- Both removed NYC chart containers, their fixed-height styles and Plotly dependency are removed. Measured tables remain.
- NYC results now load from a local script before its interaction script. Neither case study needs a fetch or external chart library.
- Notebook files and numerical results JSON files are unchanged.
- CSS keeps the menu on the left above 700px and uses a labelled sticky strip on narrower screens. Header height is measured to prevent overlap.
- Source syntax checks passed. Fresh visual browser QA is not claimed: the browser security policy blocked localhost observation in this session.

The repair was prepared in the permitted workspace. apply-site-repairs.py verifies the original files, backs up every replaced file, and applies the checked changes to the exact requested folder when the user runs it. Direct writing there was blocked by the app's filesystem permissions.
