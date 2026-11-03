# NEET AI Planner — Personal Edition

A local-first NEET preparation workspace seeded from the supplied `NEET_2027_Tracker_03Nov.xlsx` planning workbook.

## Included in this build
- **655 lecture records** across Physics, Physical Chemistry, Inorganic Chemistry, Organic Chemistry, Botany and Zoology.
- **181 date-wise planner rows**, covering 3 November 2026 to 2 May 2027.
- **26 weekly plans**, **7 monthly milestone plans** and **26 planned tests**.
- Day / Week / Month calendar views, with weekly subject focus and monthly milestones.
- Lecture search, subject filter and per-lecture status tracking.
- R+1, R+7 and R+21 revision cues with revision completion tracked separately from lecture completion.
- Custom study blocks with date, time, duration, subject, block type and notes.
- Test-result entry for attempted, correct, incorrect, score, accuracy and weak-topic notes.
- CSV export for the lecture inventory and JSON backup / restore for local progress.
- Responsive layout for desktop, tablet (including Xiaomi Pad 6 landscape) and phone.
- Service-worker cache for basic offline app-shell use after the first successful load.

## Data file required
The planner loads its seeded catalogue from `seed-data.json.gz.b64`, a gzip-compressed JSON file encoded as Base64 text. The app uses the browser's built-in `DecompressionStream('gzip')` API; use a current version of Chrome on Xiaomi Pad 6.

## Run locally
Serve this folder from a local static server rather than opening `index.html` directly as a `file://` URL. Example: `python -m http.server 8000`, then open `http://localhost:8000`.

## Deploy with GitHub Pages
Open **Settings → Pages**. Choose **Deploy from a branch**, select `main` and `/(root)`, then Save.

## Data and privacy
- No server, login, analytics or third-party scripts are used.
- Study progress is stored in this browser's local storage; it does not automatically sync to another device.
- Use **Settings → Download full backup** regularly. Import the JSON backup on another device to transfer progress.
- The repository is public. The compressed study plan is included in the repository; do not add passwords, API keys or private personal data.

## Important limitations
- 2 May 2027 is a provisional planning endpoint, not an official NEET UG 2027 exam date.
- The schedule is a planning model derived from the supplied workbook, not a substitute for checking the final official NEET UG 2027 syllabus and bulletin when published.
- Seed lecture rows do not contain a complete clock-time timetable. Custom blocks can be assigned start times and durations.
- Backlog rescheduling is not yet a fully automated algorithm. The local command helper can add pending lecture blocks to the next day, but does not rebalance subject load or protect revision/test windows.
- The command assistant is rule-based local logic, not a connected ChatGPT model.
- Offline caching starts after the first successful online load. Browser storage can still be cleared by the operating system/browser.
- ChatGPT API integration is not included. Never place an API key in public browser code; a future API integration needs a secure server-side component and separate API billing.

## Change log
- Integrated the supplied 655-lecture seed catalogue and date-wise timetable.
- Fixed custom task completion and separated revision completion from lecture completion.
- Added persistent test-result entry and included it in JSON backups.
- Added weekly subject-focus and monthly milestone panels.
- Added app-shell service-worker caching for offline reopening after first load.


## Smart Upgrade V2 (preview)

A separate V2 workspace is available at `/v2/` after GitHub Pages deploys this branch to the default branch. It does not overwrite the original planner.

V2 adds:
- A separate local data store, leaving the original planner's browser data untouched.
- Daily, weekly and monthly calendar navigation.
- Lecture status updates with R+1, R+7 and R+21 revision cues generated on completion.
- A conservative backlog action that proposes moving only one overdue entry at a time and protects planned test dates.
- Test-result entry, subject progress, CSV export and JSON backup/restore.

Important: V2 is an isolated first implementation. Import your downloaded JSON backup through **Backup & Settings → Import backup** and review the imported counts before relying on it. Because the original backup format may differ, the importer merges recognizable lecture records and known progress arrays; it cannot guarantee every legacy field will transfer. Keep the original planner and its backup unchanged until V2 has been checked on your device. The weekly/monthly summaries use seed-data fields when present; verify that all 655 lecture rows load before use.
