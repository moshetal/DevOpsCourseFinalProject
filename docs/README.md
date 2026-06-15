# MeTA DevOps Final Project — Compliment-o-Roast

A single CI/CD story that takes the `index.jsp` "Compliment-o-Roast" web app from
development to production: store in Git/GitHub, deploy to Tomcat via Jenkins, test with
Playwright, monitor availability, and performance-test with Gatling. Optionally published
to the internet for free via Render.

- **GitHub:** https://github.com/moshetal/DevOpsCourseFinalProject (branch `devops-final-project`)
- **Group:** Moshe Tal, Shoham Fellner, Amit Reich, Omri Kadmon, Dor Kokotek
- **Local URL:** http://localhost:8081/compliment-tal-fellner-reich-kadmon-kokotek/

## The app (assignment #1)

`index.jsp` is a self-contained JSP that satisfies the "one link, one button, one input"
requirement (and more):

- One **input** text box for a name.
- Two **buttons** — *Compliment* (green) and *Roast* (red).
- One **link** — "View on GitHub" in the footer.

Server-side it picks a random compliment/roast, HTML-escapes the name, and — if a button is
clicked **without** a name — shows a yellow error: *"Please enter a name first."* (This error
path is what the negative Playwright test asserts.)

## Prerequisites (detected on the build machine)

| Tool   | Version        | Notes |
|--------|----------------|-------|
| Tomcat | 10.1.34        | `C:\apache-tomcat-10.1.34`; HTTP connector moved to **8081** (8080 is used by another app) |
| Java   | 21.0.8 (JDK 21)| `JAVA_HOME=C:\Program Files\Java\jdk-21` |
| Node   | 20.19.0        | for Playwright |
| npm    | 10.8.2         | |
| Jenkins| installed      | orchestrates everything |
| Maven  | not installed  | provided per-project via the **Maven Wrapper** (`gatling/mvnw`) |
| Gatling| not installed  | provided via the `gatling-maven-plugin` |

> **Port note:** Tomcat's HTTP connector in `conf/server.xml` was changed from `8080` to
> `8081` because port 8080 was already in use. All URLs below use 8081. If you free 8080,
> change `server.xml` and the `BASE_URL`/`APP_URL` values in the Jenkinsfiles and configs.

## 1. Deploy to Tomcat locally (assignment #3, #4)

The production "folder under webapps whose name includes our names" is
`compliment-tal-fellner-reich-kadmon-kokotek`.

```powershell
# Start Tomcat (if not already running)
Start-Process "C:\apache-tomcat-10.1.34\bin\startup.bat"

# Copy the app into the named webapps folder
$dst = "C:\apache-tomcat-10.1.34\webapps\compliment-tal-fellner-reich-kadmon-kokotek"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item -Force "index.jsp" "$dst\index.jsp"

# Verify
Invoke-WebRequest -UseBasicParsing "http://localhost:8081/compliment-tal-fellner-reich-kadmon-kokotek/"
```

Open http://localhost:8081/compliment-tal-fellner-reich-kadmon-kokotek/ in a browser.

In Jenkins this is automated by **`jenkins/Jenkinsfile.deploy`**: checkout from GitHub →
copy `index.jsp` into the webapps folder → smoke-test the URL returns HTTP 200. This is the
job the examiner triggers after a live code change (defense step D).

## 2. Playwright tests (assignment #7) — replaces Selenium IDE

```powershell
cd tests
npm install
npx playwright install chromium
$env:BASE_URL = "http://localhost:8081/compliment-tal-fellner-reich-kadmon-kokotek/"
npx playwright test
```

Outputs:
- `tests/results.xml` — JUnit report (consumed by Jenkins).
- `tests/playwright-report/index.html` — HTML report (`npx playwright show-report`).

`BASE_URL` lets the same suite run against localhost **or** the live Render URL.
The spec file `tests/e2e/compliment-roast.spec.ts` is the modern equivalent of a Selenium
`.side` file.

### The 5 validations and why (deliverable g)

| # | Type | Mechanism | What it checks |
|---|------|-----------|----------------|
| 1 | Positive | assert (hard) | Page loads: title, input, and both buttons are present. |
| 2 | Positive | assert (hard) | Type a name → *Compliment* → green result box contains the name. |
| 3 | Positive | assert (hard) | Type a name → *Roast* → red result box contains the name. |
| 4 | **Negative** | assert (hard) | Click *Compliment* with an empty name → error message *"Please enter a name first."* appears and no result box is rendered. |
| 5 | Positive | **verify (soft)** | The GitHub link's `href` and the footer badge text are present. |

**Why this mix:** Positive tests (1–3) prove the core feature works. The negative test (4)
proves invalid input is correctly rejected and the guard message shows — guarding against
regressions in the validation logic. **Hard asserts** (`expect`) are used for must-pass
behavior that should stop the run immediately; **soft verifies** (`expect.soft`) are used for
secondary UI (link/badge) so a minor cosmetic miss still lets the rest of the test complete
and report the full picture.

## 3. Gatling performance tests (assignment #8, #9, #10)

Make sure the app is running first. Run from the `gatling/` folder (the Maven Wrapper
downloads Maven 3.9.9 and Gatling on first use — no global install needed):

```powershell
cd gatling

# #8 Max limit — ramp 1→200 req/s over 2 min; find where it degrades
.\mvnw.cmd gatling:test -Dgatling.simulationClass=simulations.MaxLimitSimulation

# #9 Load — steady 20 req/s for 5 minutes
.\mvnw.cmd gatling:test -Dgatling.simulationClass=simulations.LoadSimulation

# #10 Stress — ramp 10→150 req/s for 5 minutes
.\mvnw.cmd gatling:test -Dgatling.simulationClass=simulations.StressSimulation
```

Point a run at a different URL (e.g. the live Render site) with
`-DbaseUrl=https://<your-app>.onrender.com`.

Each run prints a CMD summary (deliverable k) and writes a report to
`gatling/target/gatling/<simulation>-<timestamp>/index.html`. Open it in a browser, then
**Print → Save as PDF** for deliverable l.

**Finding the max limit (deliverable j):** open the MaxLimit report and find the arrival rate
at which the **95th/99th percentile response time** rises sharply and/or **errors** begin —
that inflection point is the app's max limit. Report that number and explain that beyond it
Tomcat's worker threads / the JSP request handling can no longer keep up, so latency climbs and
requests start failing.

## 4. Jenkins setup (the CI/CD orchestrator)

Install these plugins (**Manage Jenkins → Plugins**): *Git*, *Pipeline*, *JUnit*,
*HTML Publisher*.

Create four **Pipeline** jobs. For each: *Definition* = "Pipeline script from SCM", *SCM* =
Git, *Repository URL* = `https://github.com/moshetal/DevOpsCourseFinalProject`,
*Branch* = `*/devops-final-project` (or `*/main` after merge), and set **Script Path**:

| Job name      | Script Path                  | Purpose | Assignment |
|---------------|------------------------------|---------|------------|
| Deploy        | `jenkins/Jenkinsfile.deploy` | Git → Tomcat | #4 |
| Playwright    | `jenkins/Jenkinsfile.tests`  | 5 functional validations | #7 |
| Monitor       | `jenkins/Jenkinsfile.monitor`| 5-minute availability heartbeat | #6 |
| Gatling       | `jenkins/Jenkinsfile.gatling`| MAX / LOAD / STRESS (choice param) | #8–10 |

Notes:
- The **Monitor** job carries its own cron trigger `H/5 * * * *` (every 5 minutes).
- The **Gatling** job has a `TEST_TYPE` choice parameter (MAX/LOAD/STRESS) and archives the
  HTML report as a build artifact.
- The Jenkins service account must have **write access** to
  `C:\apache-tomcat-10.1.34\webapps` for the Deploy job to copy files.

## 5. Free public hosting on Render (bonus #5)

The repo includes a `Dockerfile` (`FROM tomcat:10.1-jdk21-temurin`) that serves `index.jsp`
as the ROOT app.

1. Sign in at https://render.com with GitHub.
2. **New → Web Service** → connect the `DevOpsCourseFinalProject` repo.
3. Render auto-detects the `Dockerfile` (Runtime: Docker). Instance type: **Free**.
4. Add environment variable **`PORT=8080`** (Tomcat listens on 8080 inside the container).
5. **Create Web Service.** Render builds the image and gives a public URL like
   `https://compliment-o-roast.onrender.com`.

The free tier spins down after ~15 minutes idle; the UptimeRobot 5-minute ping keeps it warm.
Push to the connected branch and Render auto-redeploys.

## 6. Availability monitoring with UptimeRobot (assignment #6, deliverable e)

1. Create a free account at https://uptimerobot.com.
2. **Add New Monitor** → Type: *HTTP(s)* → URL: the Render public URL (or the local URL during
   the demo) → **Monitoring Interval: 5 minutes**.
3. After a few checks, screenshot the green **"Up"** status (deliverable e).

The Jenkins **Monitor** job is the in-pipeline 5-minute heartbeat that complements UptimeRobot
(and can be extended to call UptimeRobot's API).

## 7. HAR capture (deliverables h, i)

In Chrome: open the app → **F12 → Network** tab → check *Preserve log* → reload, then:

> **Scenario:** load the page → **type** a name into the input → **click** *Compliment* →
> read the green result → **type** another name → **click** *Roast* → read the red result.

Right-click in the Network panel → **Save all as HAR with content** → attach that `.har` file.

## Repository layout

```
index.jsp                 # the app (#1)
Dockerfile / .dockerignore# free hosting (#5)
tests/                    # Playwright (#7) — package.json, playwright.config.ts, e2e/
gatling/                  # Gatling Maven + wrapper (#8–10) — pom.xml, mvnw, src/test/java/simulations/
jenkins/                  # Jenkinsfile.deploy/.tests/.monitor/.gatling
docs/                     # README.md (this file), DELIVERABLES.md, superpowers/ (spec + plan)
```
