# guraleapilates.com

The studio website of לאה גורא - פילאטיס מכשירים. Separate from guralea.com.

- Content: `src/content/` (site details, FAQ, articles). Phase 2 moves this to Firestore with an admin panel.
- Build: `node scripts/build.mjs` writes real HTML pages to `dist/`.
- Deploy: every push to `main` builds and publishes to GitHub Pages (`.github/workflows/deploy.yml`).
- The contact form saves to Firestore `pilates_leads` (project hagil-lo-hasipor), the same collection the daily 08:08 report reads.
