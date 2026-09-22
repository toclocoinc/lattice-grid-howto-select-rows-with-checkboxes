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
