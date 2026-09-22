# Publish step (batch mode)

This repo was built and verified locally under the owner's 2026-09-22 batch-mode
instruction (GitHub Actions minutes low). It has not been pushed. When the
how-to series is published in one batch, create and push it with:

```
gh repo create toclocoinc/lattice-grid-howto-select-rows-with-checkboxes \
  --public \
  --description "How to select rows with checkboxes and read the selection with Lattice Grid" \
  --homepage https://toclocoinc.github.io/lattice-grid-howto-select-rows-with-checkboxes/
```

Then push this local repo's `main` to it, and enable Pages from the `main`
branch root (the checked-in `.github/workflows/pages.yml` publishes on every
push to `main`, so pushing is the only remaining step).

- **Description:** How to select rows with checkboxes and read the selection with Lattice Grid
- **Homepage:** https://toclocoinc.github.io/lattice-grid-howto-select-rows-with-checkboxes/
- **Topics:** `lattice-grid`, `data-grid`, `javascript`, `how-to`

Site page this repo's README links back to (also not yet pushed, committed
locally on branch `howto/select-rows-with-checkboxes` of the site repo):
https://www.latticegrid.dev/docs/how-to/select-rows-with-checkboxes/
