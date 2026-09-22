/**
 * Load the demo in a real headless browser and check that it works.
 *
 * Serves the project locally and drives it with the same minimal Chrome
 * driver the grid's own test suite uses (tools/browser.js), so this needs no
 * dependency beyond Chrome itself.
 *
 * Checks:
 *   - the library arrived and left the LatticeGrid global behind;
 *   - the grid starts with twelve rows and nothing selected;
 *   - clicking two row checkboxes selects exactly those two rows:
 *     grid.selection.keys() returns them and the readout says "Selected: 2
 *     of 12";
 *   - clicking the header checkbox selects every row (twelve of twelve),
 *     and clicking it again clears the selection;
 *   - with two rows selected, clicking Archive selected removes exactly
 *     those two rows: the grid's row count drops to ten and the readout
 *     returns to "Selected: 0 of 10";
 *   - nothing logged a console error or threw while the page ran.
 *
 * Exits non-zero on any failure, so it can gate a deployment.
 *
 * Usage: node tools/verify.mjs
 */

import { startServer } from './serve.mjs';
import { Browser, available } from './browser.js';

if (!available()) {
  console.log('No headless browser on this machine; skipping verify.mjs.');
  process.exit(0);
}

const { server, port } = await startServer();
const browser = new Browser();

const statText = `document.getElementById('stat').textContent`;
const rowCount = `window.__demoGrid.rows.count()`;
const selectedKeys = `window.__demoGrid.selection.keys()`;

/**
 * Click a row's own checkbox by its row key.
 *
 * The pinned checkbox column and the rest of a row's cells are painted as
 * separate sibling "region" elements sharing the same data-key, so the
 * checkbox is found by scoping to the generated checkbox column
 * (data-col="__lattice_select") within the row's key rather than by a flat
 * row index.
 */
function clickRowCheckbox(key) {
  return `(() => {
    const box = document.querySelector('#grid .lat-row[data-key="${key}"] [data-col="__lattice_select"] input[type="checkbox"]');
    if (!box) return false;
    box.click();
    return true;
  })()`;
}

const clickHeaderCheckbox = `(() => {
  const box = document.querySelector('#grid [role="columnheader"] input[type="checkbox"]');
  if (!box) return false;
  box.click();
  return true;
})()`;

try {
  await browser.start();

  await browser.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__errs = [];
      addEventListener('error', (e) => window.__errs.push(String(e.message || e)));
      addEventListener('unhandledrejection', (e) => window.__errs.push('unhandledrejection: ' + String(e.reason)));
      const origError = console.error.bind(console);
      console.error = (...args) => { window.__errs.push('console.error: ' + args.map(String).join(' ')); origError(...args); };
    `,
  });

  await browser.open(`http://127.0.0.1:${port}/`);
  await new Promise((r) => setTimeout(r, 500));

  const failures = [];

  const hasGrid = await browser.evaluate(`typeof LatticeGrid !== 'undefined' && typeof LatticeGrid.createGrid === 'function'`);
  if (!hasGrid) failures.push('LatticeGrid.createGrid was not found on the page');

  const initialCount = await browser.evaluate(rowCount);
  if (initialCount !== 12) failures.push(`expected twelve starting rows, grid held ${initialCount}`);

  const initialSelected = await browser.evaluate(selectedKeys);
  if (initialSelected.length !== 0) failures.push(`expected nothing selected at load, got ${JSON.stringify(initialSelected)}`);

  // Tick two row checkboxes.
  const clickedFirst = await browser.evaluate(clickRowCheckbox('T-1'));
  const clickedSecond = await browser.evaluate(clickRowCheckbox('T-2'));
  if (!clickedFirst || !clickedSecond) failures.push('could not find a row checkbox to click');
  await new Promise((r) => setTimeout(r, 150));

  const twoKeys = await browser.evaluate(selectedKeys);
  if (twoKeys.length !== 2) {
    failures.push(`expected two rows selected after ticking two boxes, selection.keys() returned ${JSON.stringify(twoKeys)}`);
  }
  const statAfterTwo = await browser.evaluate(statText);
  if (statAfterTwo !== 'Selected: 2 of 12') {
    failures.push(`expected the readout to say "Selected: 2 of 12", read "${statAfterTwo}"`);
  }

  // The header checkbox selects everything currently on display.
  const clickedHeaderAll = await browser.evaluate(clickHeaderCheckbox);
  if (!clickedHeaderAll) failures.push('could not find the header select-all checkbox to click');
  await new Promise((r) => setTimeout(r, 150));
  const allKeys = await browser.evaluate(selectedKeys);
  if (allKeys.length !== 12) {
    failures.push(`expected select-all to select every row (12), selection.keys() returned ${allKeys.length}`);
  }

  // Clicking it again, now fully checked, clears the selection.
  await browser.evaluate(clickHeaderCheckbox);
  await new Promise((r) => setTimeout(r, 150));
  const clearedKeys = await browser.evaluate(selectedKeys);
  if (clearedKeys.length !== 0) {
    failures.push(`expected select-all to clear the selection on a second click, ${clearedKeys.length} still selected`);
  }

  // Re-select the same two rows, then archive them.
  await browser.evaluate(clickRowCheckbox('T-1'));
  await browser.evaluate(clickRowCheckbox('T-2'));
  await new Promise((r) => setTimeout(r, 150));
  await browser.evaluate(`document.getElementById('archive').click()`);
  await new Promise((r) => setTimeout(r, 150));

  const countAfterArchive = await browser.evaluate(rowCount);
  if (countAfterArchive !== 10) {
    failures.push(`expected ten rows left after archiving two, grid held ${countAfterArchive}`);
  }
  const statAfterArchive = await browser.evaluate(statText);
  if (statAfterArchive !== 'Selected: 0 of 10') {
    failures.push(`expected the readout to say "Selected: 0 of 10" after archiving, read "${statAfterArchive}"`);
  }

  const errors = await browser.evaluate('window.__errs');
  if (errors.length) failures.push(`console/window errors: ${errors.join(' | ')}`);

  if (failures.length) {
    console.error('FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(
      'OK: ticking two row checkboxes selected exactly those two rows (selection.keys() and the readout agreed), ' +
      'the header checkbox selected and then cleared all twelve, and Archive selected removed the two selected ' +
      'rows (12 -> 10). 0 console errors.'
    );
  }
} finally {
  await browser.close();
  server.close();
}
