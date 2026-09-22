# How to select rows with checkboxes and read the selection

Twelve support tickets sit in a grid with `selection: { mode: 'multiple', checkbox: true,
headerCheckbox: true }`: a pinned column of checkboxes down the left, and a tri-state select-all
box in its heading. Tick a few rows and a readout below the grid reads the count back from
`grid.selection.keys()`, kept live by the `selection:changed` event. Click Archive selected and
`grid.edit.deleteRows()`, which defaults to the current selection, removes the ticked rows.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-select-rows-with-checkboxes/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/select-rows-with-checkboxes/

## index.html

```html
<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>How to select rows with checkboxes and read the selection</title>
    <meta
      name="description"
      content="Twelve support tickets sit in a grid with a checkbox column and a select-all box in its heading. Tick a few rows and a live readout says how many are selected; click Archive selected and those rows are gone. Built with Lattice Grid loaded by script tag, no install and no build."
    />
    <link rel="icon" href="data:," />
    <!--
      The grid's stylesheet, from jsDelivr. The address names the exact
      release, 1.68.2, and carries the hash of the file it expects, so the
      page can never quietly pick up a different build than the one it was
      checked against.
    -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.css"
      integrity="sha384-mcpd7S8C5nz58bZDAXdYH6rzezEhfN7B4u2SlW426dSe20GnkxTu4TygyOILnCth"
      crossorigin="anonymous"
    />
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #f4f6f9; color: #131a24; }
      header { padding: 1.5rem 1.5rem 0.5rem; max-width: 960px; margin: 0 auto; }
      header p { color: #4a5568; }
      header a { color: #2d6bff; }
      main { max-width: 960px; margin: 0 auto; padding: 0 1.5rem 2.5rem; }
      #toolbar { margin: 0 0 0.75rem; display: flex; align-items: center; gap: 1rem; }
      #archive { font: inherit; padding: 0.4rem 0.75rem; border: 1px solid #ccd3dc; border-radius: 4px; background: #fff; cursor: pointer; }
      #grid { height: 420px; }
      #stat { font-size: 0.9rem; color: #4a5568; margin: 0; }
    </style>
  </head>
  <body>
    <header>
      <h1>How to select rows with checkboxes and read the selection</h1>
      <p>
        Twelve support tickets sit in the grid below with a checkbox column and a select-all box
        in its heading. Tick a row, or several, and the readout below the grid updates from the
        grid's own selection. Click Archive selected and the ticked rows are removed. Read the
        <a href="https://www.latticegrid.dev/docs/how-to/select-rows-with-checkboxes/">full how-to</a>
        on latticegrid.dev.
      </p>
    </header>
    <main>
      <div id="toolbar">
        <button id="archive" type="button">Archive selected</button>
        <p id="stat"></p>
      </div>
      <div id="grid"></div>
    </main>

    <!--
      The library, as a classic script tag. No npm install, no bundler, no
      type="module": the file runs as it arrives and leaves the LatticeGrid
      global behind.
    -->
    <script
      src="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.js"
      integrity="sha384-vCzLyFYn0T0lz/vkdH4x0JpJZkOazZgI2LiGui7lm5uerdZd0Z46G9hr3Aq1FFPS"
      crossorigin="anonymous"
    ></script>
    <script src="./demo.js"></script>
  </body>
</html>
```

## demo.js

```js
/**
 * Tick rows with checkboxes, read the selection, act on it.
 *
 * `selection: { mode: 'multiple', checkbox: true, headerCheckbox: true }`
 * adds a pinned column of checkboxes and a tri-state select-all box in its
 * heading. `grid.selection.keys()` reads back the selected row keys at any
 * time; the `selection:changed` event fires whenever a checkbox (or the
 * header box) changes what is selected, which is what drives the readout
 * below. `rowDelete: true` opts the grid into `grid.edit.deleteRows()`,
 * which defaults to the current selection when called with no arguments.
 */

// Tied to toclocoinc.github.io only; has no effect anywhere else and needs
// no key at all to run this page from a local copy.
LatticeGrid.setLicence(
  'LG1.eyJ2IjoxLCJwIjoibGF0dGljZS1ncmlkIiwidCI6IlRPQ0xPQ08gSW5jIC0gcHVibGljIGRlbW9zIiwiZSI6IjIwMzAtMDEtMDEiLCJkIjpbInRvY2xvY29pbmMuZ2l0aHViLmlvIl19.9De42ua3aCGpiMB6EVRP7Tv-upUlDI-0T07rlSPzvCrsqg8t4YJi7SRnStEpAg48uzmcG7il1fR_TfwkUE7iCA'
);

const TICKETS = [
  { id: 'T-1', subject: 'Password reset email never arrives', priority: 'High' },
  { id: 'T-2', subject: 'Export button disabled for viewers', priority: 'Low' },
  { id: 'T-3', subject: 'Dashboard chart cut off on mobile', priority: 'Medium' },
  { id: 'T-4', subject: 'Duplicate invoice sent twice', priority: 'High' },
  { id: 'T-5', subject: 'Typo in the welcome email', priority: 'Low' },
  { id: 'T-6', subject: 'API key rotation has no confirmation', priority: 'Medium' },
  { id: 'T-7', subject: 'Slow load on the reports page', priority: 'High' },
  { id: 'T-8', subject: 'Cannot remove a teammate', priority: 'Medium' },
  { id: 'T-9', subject: 'Search ignores accented characters', priority: 'Low' },
  { id: 'T-10', subject: 'Billing address missing a field', priority: 'Medium' },
  { id: 'T-11', subject: 'Timezone shown wrong in the audit log', priority: 'Low' },
  { id: 'T-12', subject: 'Webhook retried after it already succeeded', priority: 'High' },
];

const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
  rowKey: 'id',
  selection: { mode: 'multiple', checkbox: true, headerCheckbox: true },
  rowDelete: true, // opts in to grid.edit.deleteRows()
  columns: [
    { field: 'id', title: 'Ticket', layout: { width: 90 } },
    { field: 'subject', title: 'Subject', layout: { flex: 1, min: 260 } },
    { field: 'priority', title: 'Priority', filter: { type: 'set' }, layout: { width: 110 } },
  ],
  rows: TICKETS,
});
window.__demoGrid = grid; // read by tools/verify.mjs

const stat = document.getElementById('stat');
function updateCount() {
  const n = grid.selection.keys().length;
  stat.textContent = `Selected: ${n} of ${grid.rows.count()}`;
}
grid.on('selection:changed', updateCount);
updateCount();

document.getElementById('archive').addEventListener('click', () => {
  grid.edit.deleteRows(); // defaults to the current selection
  grid.selection.clear(); // deleting a row does not itself clear its selection
  updateCount();
});
```

## Two things to know

- **Select-all selects what the filter shows, not every row loaded.** The header checkbox's
  tri-state and `grid.selection.all()` both cover the rows currently on display, so with a filter
  narrowing the grid, "select all" only ever reaches the filtered set, never rows hidden by it.
- **`mode: 'single'` keeps one selection at a time.** Ticking a row's checkbox there replaces
  whichever row was selected before, rather than adding to it, and `grid.selection.set(keys)`
  itself keeps only the first key of whatever array it is given when the mode is `'single'`.

## Running it yourself

Open `index.html` in a browser, or serve the folder with any static file server. The grid loads
from jsDelivr by script tag, so there is no install and no build step. It runs keyless on
`localhost`; the licence key in `demo.js` is bound to `toclocoinc.github.io` and has no effect
anywhere else.

## Licence

MIT, see [LICENSE](./LICENSE). Lattice Grid itself is licensed separately per domain:
https://www.latticegrid.dev/pricing/
