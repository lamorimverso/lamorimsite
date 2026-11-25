import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, lstatSync } from 'node:fs';
import { basename, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const prefix = 'tanahoraflavio/';
const media = /\.(?:png|webp|mp3|jpe?g|gif|ogg|wav|svg|ico|avif)$/i;
const auditPaths = new Set([
  prefix + 'tests/file-reference-audit.test.mjs',
  prefix + 'docs/file-dependency-inventory-20261124.md',
]);
function category(path) {
  if (/^(?:tools\/|tests\/|\.github\/|tanahoraflavio\/tests\/)/.test(path)) return 'build/test';
  if (/\.md$|\.txt$|\/docs\//i.test(path)) return 'documentation';
  if (path.startsWith(prefix)) return 'game';
  return 'other';
}
function references(path, texts) {
  const name = basename(path);
  const stem = name.replace(/(?:\.source)?\.[^.]+$/, '');
  const hits = [];
  for (const [source, content] of texts) {
    if (source === path) continue;
    if (content.includes(name)) hits.push({ source, kind: 'name', category: category(source) });
    else if (stem.length >= 6 && content.includes(stem)) hits.push({ source, kind: 'stem', category: category(source) });
  }
  return hits;
}
function literalImports(path, content) {
  const regex = /(?:\bfrom\s*|\bimport\s*\(?\s*)['"](\.{1,2}\/[^'"\r\n]+)['"]/g;
  return [...new Set([...content.matchAll(regex)].map(match => posix.normalize(posix.join(posix.dirname(path), match[1].split(/[?#]/)[0]))))];
}

test('audit helpers distinguish file names, generator stems and relative imports', () => {
  const fixture = new Map([
    ['tools/build.mjs', 'const source = "old-sprite";'],
    ['tanahoraflavio/runner.mjs', 'new URL("./assets/live.webp", import.meta.url);'],
    ['tanahoraflavio/docs/history.md', 'old-sprite.png'],
  ]);
  assert.deepEqual(references('tanahoraflavio/assets/old-sprite.png', fixture).map(h => [h.kind, h.category]), [['stem', 'build/test'], ['name', 'documentation']]);
  assert.equal(references('tanahoraflavio/assets/live.webp', fixture)[0].category, 'game');
  assert.deepEqual(references('tanahoraflavio/assets/unknown.webp', fixture), []);
  assert.deepEqual(literalImports('tanahoraflavio/battle/battle.mjs', 'import x from "../runner.mjs?v=123"; import("./arena.mjs");'), ['tanahoraflavio/runner.mjs', 'tanahoraflavio/battle/arena.mjs']);
});

test('report tracked game files and literal references without deleting anything', () => {
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, maxBuffer: 16 * 1024 * 1024 }).toString('utf8').split('\0').filter(Boolean);
  const tracked = new Set(files);
  const texts = new Map();
  const skipped = [];
  for (const path of files) {
    if (auditPaths.has(path) || media.test(path) && !/\.svg$/i.test(path)) continue;
    const absolute = new URL('../../' + path.split('/').map(encodeURIComponent).join('/'), import.meta.url);
    if (!lstatSync(absolute).isFile()) { skipped.push(path); continue; }
    const bytes = readFileSync(absolute);
    if (bytes.includes(0)) { skipped.push(path); continue; }
    try { texts.set(path, new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
    catch { skipped.push(path); }
  }
  const modules = [...texts.keys()].filter(path => path.startsWith(prefix) && /\.(?:mjs|js)$/.test(path) && !/\/(?:tests|docs|third-party)\//.test(path));
  const edges = new Map(modules.map(path => [path, literalImports(path, texts.get(path))]));
  const entries = ['runner.mjs', 'runner-bootstrap.js', 'page-layout.js', 'battle/battle.mjs'].map(path => prefix + path).filter(path => tracked.has(path));
  const reachable = new Set();
  function visit(path) {
    if (reachable.has(path) || !edges.has(path)) return;
    reachable.add(path);
    for (const dependency of edges.get(path)) visit(dependency);
  }
  entries.forEach(visit);
  const assets = files.filter(path => path.startsWith(prefix) && (media.test(path) || /\.source\.json$/.test(path)));
  const matches = assets.map(path => ({ path, hits: references(path, texts) }));
  const unresolved = [...edges].flatMap(([from, targets]) => targets.filter(to => !tracked.has(to)).map(to => ({ from, to })));
  const candidates = /(?:^|\/)(?:foto\.webp|joice-toc-toc-v1\.mp3|flavio-acoes-v3\.webp|flavio-slide-v3\.source\.(?:png|json)|combat-original-[de]-v1\.(?:png|webp))$/;
  const report = {
    trackedFiles: files.length, gameFiles: files.filter(path => path.startsWith(prefix)).length,
    textFilesRead: texts.size, skippedNonTextOrNonRegular: skipped,
    modules: modules.length, reachableModules: reachable.size,
    modulesOutsideLiteralGraph: modules.filter(path => !reachable.has(path)), unresolvedLiteralImports: unresolved,
    assets: assets.length, assetsWithLiteralEvidence: matches.filter(item => item.hits.length).length,
    assetsWithoutLiteralEvidence: matches.filter(item => !item.hits.length).map(item => item.path),
    candidateEvidence: matches.filter(item => candidates.test(item.path)),
  };
  console.log('FILE_REFERENCE_AUDIT ' + JSON.stringify(report));
  assert.ok(texts.size > 0 && entries.length > 0, 'Audit requires a tracked game checkout');
  // Literal/stem matches are clues, not proof of actual use. Computed paths and external URLs require review.
});
