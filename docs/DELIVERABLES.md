# Final Project — Email Deliverables Checklist

**Send to:** mosh.mta2@gmail.com
**Subject:** `Final Exercise from: Moshe Tal, Shoham Fellner, Amit Reich, Omri Kadmon, Dor Kokotek`

The 12 items the lecturer asks for, where each one comes from in this repo, and what (if any)
manual capture is still needed. Items marked **manual** are screenshots/exports you produce
while demonstrating the running system.

| # | Deliverable | Source / how to produce |
|---|-------------|-------------------------|
| a | The JSP file used | `index.jsp` (repo root) — attach it. |
| b | Screenshot of GitHub with the app in it | **manual** — screenshot the repo file list showing `index.jsp` at https://github.com/moshetal/DevOpsCourseFinalProject |
| c | Screenshot of the app in Tomcat (show the URL) | **manual** — browser at `http://localhost:8081/compliment-tal-fellner-reich-kadmon-kokotek/` with the address bar visible |
| d | Link to the public GitHub repo | https://github.com/moshetal/DevOpsCourseFinalProject |
| e | Monitor tool name + what was monitored + "passed" screenshot | **UptimeRobot**, HTTP(s) monitor at 5-min interval on the app URL. **manual** — screenshot the green "Up" status. (Setup in `docs/README.md` §6.) |
| f | Selenium IDE `.side` file | Replaced by **Playwright**: attach `tests/e2e/compliment-roast.spec.ts` (the spec is the equivalent test artifact). |
| g | Test pass screenshot + validation explanation (positive/negative, verify/assert) | **manual** — screenshot the `npx playwright test` "5 passed" output and/or the HTML report. Validation rationale is in `docs/README.md` §2. |
| h | HAR scenario described in words | load page → type a name → click *Compliment* → type a name → click *Roast*. (Full text in `docs/README.md` §7.) |
| i | The HAR file | **manual** — record in Chrome DevTools → Network → "Save all as HAR with content". |
| j | App max limit + why + how found | Run the Gatling **MaxLimit** simulation; read the arrival rate where p95/p99 latency spikes / errors start. Explanation in `docs/README.md` §3. Write the number + reasoning in the email. |
| k | 3 screenshots of the Gatling CMD run summaries (max, load, stress) | **manual** — screenshot the terminal summary after each `mvnw gatling:test` run. |
| l | 3 PDFs (max, load, stress) of the Gatling result graphs | **manual** — open each `gatling/target/gatling/<run>/index.html` → Print → Save as PDF. Explain in the email why the graphs look the way they do (e.g. latency climbs as arrival rate exceeds capacity; errors appear once threads saturate). |

## Quick command reference

```powershell
# Deploy locally
Copy-Item -Force index.jsp "C:\apache-tomcat-10.1.34\webapps\compliment-tal-fellner-reich-kadmon-kokotek\index.jsp"

# Playwright (item f, g)
cd tests; $env:BASE_URL="http://localhost:8081/compliment-tal-fellner-reich-kadmon-kokotek/"; npx playwright test

# Gatling (items j, k, l)
cd gatling
.\mvnw.cmd gatling:test -Dgatling.simulationClass=simulations.MaxLimitSimulation
.\mvnw.cmd gatling:test -Dgatling.simulationClass=simulations.LoadSimulation
.\mvnw.cmd gatling:test -Dgatling.simulationClass=simulations.StressSimulation
```

## Status summary

- **Built in this repo:** a (jsp), d (repo link), f (Playwright spec), h (HAR scenario text),
  plus the runbook/automation for b, c, e, g, i, j, k, l.
- **Still requires manual capture during the demo:** b, c, e, g, i, k, l screenshots/exports,
  and writing the item-j max-limit number into the email after running the MaxLimit simulation.
- **Bonus #5 (public IP):** deploy to Render per `docs/README.md` §5, then point items c/e/j at
  the public URL for the +10 bonus.
