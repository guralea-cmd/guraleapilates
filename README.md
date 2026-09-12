# guraleapilates.com

The studio website of לאה גורא - פילאטיס מכשירים. Separate from guralea.com.

- Content: `src/content/` (site details, FAQ, articles). Phase 2 moves this to Firestore with an admin panel.
- Build: `node scripts/build.mjs` writes real HTML pages to `dist/`.
- Publish: commit the contents of `dist/` to the `gh-pages` branch and push it; GitHub Pages serves that branch. (No GitHub Actions: the local `gh` token has no `workflow` scope.)
- Temporary address until the domain is connected: https://guralea-cmd.github.io/guraleapilates/
- The contact form saves to Firestore `pilates_leads` (project hagil-lo-hasipor), the same collection the daily 08:08 report reads.
