# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

JMeter performance-test assets for a **PrestaShop** instance (default target `http://172.22.4.19:80`). There is no application code here — the deliverables are `.jmx` test plans, the shell/batch wrappers that run them headlessly, and the `.jtl`/`.csv` result artifacts checked in under `scripts/results/`.

Active work lives in `scripts/`. The files at the repo root (`tema1.jmx`, `final_script.jmx`, `PrestShop_Horatiu_Backup*.jmx`, `PrestaShop_Gabi*.jmx`, empty `run_script.bat`/`.sh`) are earlier iterations and backups — do not edit them unless asked.

JMeter itself lives outside the repo at `../apache-jmeter-5.6.3` (i.e. `C:\Users\Hori\Desktop\performance\apache-jmeter-5.6.3`), version 5.6.3.

## Commands

All commands run from `scripts/`.

```bat
run_test.bat                                REM full headless run; edit the SET block at the top to configure
generate_report.bat results\<run>\x.jtl     REM HTML dashboard -> results\<run>\x_html\
generate_html_report.bat <path-to-jtl>      REM HTML dashboard -> .\report\
```

All scripts invoke bare `jmeter` and rely on `apache-jmeter-5.6.3\bin` being on `PATH` (it is, in the user-level `PATH` on this machine). In a `.bat`, `jmeter` resolves to `jmeter.bat`, so it must be invoked as `call jmeter` — without `call`, control never returns and every line after it is skipped.

`run_test.sh` and `generate_html_report.sh` are the POSIX equivalents. Note `run_test.sh` is stale — it still targets `script.jmx` at 1 thread while `run_test.bat` runs `load_test_run.jmx` at 10. Prefer the `.bat` scripts on this machine.

`run_test.bat` has no CLI arguments. To change a run, edit the `SET` variables near the top: `SCRIPT`, `TEST_TYPE`, `THREADS`, `RAMP_UP`, `DURATION`, `RUN_NAME`, host settings. It auto-creates `results\%RUN_NAME%\` and names the JTL `TESTTYPE_N_users_R_RampUp_D_Duration_YYYYMMDD_HHMMSS.jtl`.

To run a single scenario in isolation (the baseline workflow), disable all thread groups except the one under test in the `.jmx` (`enabled="false"` on the `<ThreadGroup>`) and run against the same JTL file so baselines accumulate.

## Parameterization contract

Every tunable in the `.jmx` files is a Test Plan **User Defined Variable** bound to a JMeter property with a default: `${__P(NAME,default)}`. The runner passes `-JNAME=value` on the command line; the `.jmx` defaults apply when opening in the GUI. When adding a new tunable, add it in all three places (Test Plan UDV, `run_test.bat`, `run_test.sh`) or it will silently fall back to the default.

| Property | Purpose |
| --- | --- |
| `HOST`, `PORT`, `PROTOCOL` | Target, consumed by the per-thread-group **HTTP Request Defaults** |
| `LANG` | PrestaShop URL language segment (`/en/...`) |
| `USERNAME`, `PASS` | Login credentials — hardcoded as defaults in the JMX; override with `-JUSERNAME`/`-JPASS` |
| `THREADS`, `RAMP_UP`, `DURATION` | Load shape |
| `WAIT_TIME_SHORT/MID/LONG` | Feed the `range` of Uniform Random Timers named `Pause` |

## Test plan architecture

Two thread groups model two user populations, and both run concurrently:

- **Thread Group - Guest** — browse / search / add-to-cart, no login.
- **Thread Group - Login** — logs in first, then the same activities plus cart updates.

In `load_test_run.jmx` the split is computed from a single `THREADS` value inside the thread-group count field:
`${__groovy(Math.max(1, (Integer.parseInt('${THREADS}') * 0.60) as Integer))}` for Guest and `* 0.40` for Login. Change the ratio in both places or the totals stop adding up.

### Two script styles — this is the key structural difference

- **Fragment-based** (`load_test_run.jmx`, `script.jmx`, and the root `tema1.jmx`/`final_script.jmx`): the business flows live once, in disabled `TestFragmentController`s at the bottom of the plan (`Test Fragment - Browse `, `- Search`, `- Add to cart`, `- Login`), each wrapping a `Transaction Controller - <flow>`. Thread groups reference them via `ModuleController`s. **Renaming a fragment or its transaction controller breaks every Module Controller**, because `ModuleController.node_path` stores literal element names. Note `Test Fragment - Browse ` has a trailing space in its name.
- **Inlined** (`simple_script.jmx`, `baseline_simple_script.jmx`): the same flows copy-pasted directly into each thread group, no fragments, no module controllers. Roughly 4000 lines vs 2260. Edits here must be applied to every copy — Browse/Search/Add-to-cart appear in both thread groups, and Add-to-cart is repeated inside Update cart.

When fixing a sampler, first determine which style the file uses; a one-place fix in a fragment file becomes a four-place fix in an inlined file.

### Flow mix

`ThroughputController`s (percent-execution style) sit above each flow and decide what fraction of iterations run it: Browse 50%, Search 30%, Add to cart 20%, plus Update cart 7% in the Login group.

### Correlation chain

Nothing is hardcoded to a specific product or category — every step scrapes the next step's URL out of the previous response:

1. `[GET] Homepage` → CSS Selector Extractors `categoryHref` / `subCategoryHref` (multi-match, `_matchNr` set) → Regular Expression Extractors reduce them to `${category}` / `${subCategory}`.
2. `[GET] Select Sub-Category` → `productHref` → `${product}`.
3. `[GET] Product details` → `id_product`, `id_customization`, `token` — these feed the add-to-cart POSTs.
4. Search terms come from a per-thread-group `JSR223 Sampler - Search terms script` (Groovy) that picks a random word and publishes `search3`, `search4`, `searchFull` to simulate autocomplete typing (three progressively longer `[POST] Search product - Autocomplete` calls before the real `[GET] Search`).

There is also a `JSR223 PreProcessor` that random-picks among the extracted `categoryHref_N` values into `selectedCategory` — it is currently `enabled="false"` in most places; the regex extractors' own random-match mode is doing the work instead.

HTTP Request Defaults enable embedded-resource download (`image_parser`) with a 6-thread concurrent pool, so a single sampler's timing includes its static assets.

## Results and reporting

- Raw output: `scripts/results/<run-name>/*.jtl` (CSV format, header row `timeStamp,elapsed,label,responseCode,...`).
- Exported tables: `aggregate_*.csv` (Label, # Samples, Average, Median, 90/95/99% Line, Min, Max, Error %, Throughput, KB/sec) and `summary_*.csv` (adds Std. Dev. and Avg. Bytes). These are hand-exported from the GUI listeners, not produced by the batch scripts.
- Each run directory should carry a `*_metadata_*.txt` noting wall-clock start/end times, so JMeter numbers can be lined up against server-side CPU/memory/disk monitoring.
- GUI listeners (`View Results Tree`, `Aggregate Report`, `Summary Report`, `View Results in Table`) are present in the plans. They are fine for GUI debugging but consume memory in headless runs; the `-l` JTL file is the authoritative output.

## Test methodology (from gotchas.txt)

`gotchas.txt` (root and `scripts/`, identical, in Romanian) is the team's methodology reference. The operative rules:

- **Baseline** — one thread group at a time, 1 thread, 1s ramp-up, 20 iterations. **Do not delete results between thread-group runs** — baselines are meant to aggregate into the same result file. If baseline response times already miss the client's targets, stop and talk to the client rather than scaling up.
- **Load** — ~1 hour, then grow user count progressively from the baseline.
- **Stress** — all thread groups on, infinite loops, ramp-up spanning most of the run, starting from a thread count expected to break the app. Stop when errors exceed the acceptable threshold. When trimming the JTL, cut the trailing rows where the thread count starts dropping.
- **Spike** — very short ramp-up (3–5 min), above the limit found by stress testing; run normal-load thread groups in parallel and longer, to observe recovery.
- **Endurance** — normal load for ~8h, 5 min ramp-up; compare first-hour vs last-hour response times.
- **Scalability** — ramp-up longer than 1h so servers can be added progressively; expect sawtooth response times.
- Clients care most about **response time vs. thread count**.

`tema1_scenarii.txt` defines the two functional scenarios the plans implement (guest "explore shop", logged-in "buy product").

## Editing .jmx files

These are XML, but JMeter is the source of truth for their structure. Prefer targeted edits over rewrites, and keep in mind:

- Element names are load-bearing (Module Controller paths, and `Transaction Controller` names become JTL labels that reports group by). Renaming changes the report's row keys and breaks comparison with earlier runs.
- `enabled="false"` is how thread groups, fragments and preprocessors are parked; the files contain many intentionally disabled elements. Don't "clean them up".
- Groovy inside `<stringProp name="script">` is XML-escaped (`&quot;`, `&apos;`, and `\,` inside `__groovy()` to escape the function-argument separator).
