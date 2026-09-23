// Standalone validation of the real puzzle-generation logic for all categories.
// Transpiles the TS sources (their only imports are type-only) and asserts every
// target word is placed on a straight 8-direction line and grids are square.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');

function transpile(srcPath, outPath) {
  const src = readFileSync(srcPath, 'utf8');
  const out = ts.transpileModule(src, {
    compilerOptions: { module: 'ESNext', target: 'ES2020' },
  }).outputText;
  writeFileSync(outPath, out);
}

mkdirSync('/tmp/wh-validate', { recursive: true });
transpile('lib/puzzle.ts', '/tmp/wh-validate/puzzle.mjs');
transpile('data/categories.ts', '/tmp/wh-validate/categories.mjs');

const { generatePuzzle, chooseGridSize } = await import(
  pathToFileURL('/tmp/wh-validate/puzzle.mjs').href
);
const { CATEGORIES } = await import(pathToFileURL('/tmp/wh-validate/categories.mjs').href);

const DIRS = [
  [0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1],
];

function existsOnGrid(grid, word, size) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      for (const [dr, dc] of DIRS) {
        let ok = true;
        for (let i = 0; i < word.length; i++) {
          const rr = r + dr * i, cc = c + dc * i;
          if (rr < 0 || cc < 0 || rr >= size || cc >= size || grid[rr][cc] !== word[i]) {
            ok = false;
            break;
          }
        }
        if (ok) return true;
      }
    }
  }
  return false;
}

let failures = 0;
const modes = ['classic', 'time'];
for (const cat of CATEGORIES) {
  for (const mode of modes) {
    for (let run = 0; run < 5; run++) {
      const p = generatePuzzle(cat, mode);
      // square grid
      if (p.grid.length !== p.size || p.grid.some((row) => row.length !== p.size)) {
        console.error(`FAIL ${cat.id}/${mode}: non-square grid ${p.grid.length}x?`);
        failures++;
      }
      // grid-size rule
      const expected = chooseGridSize(cat.words.map((w) => w.toUpperCase()));
      if (p.size < expected) {
        console.error(`FAIL ${cat.id}: size ${p.size} < expected ${expected}`);
        failures++;
      }
      // every word present
      for (const w of p.words) {
        if (!existsOnGrid(p.grid, w, p.size)) {
          console.error(`FAIL ${cat.id}/${mode}: word ${w} not found on grid`);
          failures++;
        }
      }
    }
  }
}

if (failures === 0) {
  console.log(`OK: all ${CATEGORIES.length} categories × 2 modes × 5 runs — every word placed on a square grid.`);
} else {
  console.error(`${failures} failures`);
  process.exit(1);
}
