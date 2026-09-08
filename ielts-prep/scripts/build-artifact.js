// Builds a single self-contained HTML file from the `expo export --platform web`
// output in dist/, inlining the JS bundle and every referenced font/image as a
// data: URI, so the whole app can run from one static HTML file with no server.
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const entryMatch = fs.readdirSync(path.join(distDir, '_expo', 'static', 'js', 'web')).find((f) => f.startsWith('entry-'));
if (!entryMatch) throw new Error('No entry-*.js bundle found in dist/_expo/static/js/web');
const entryPath = path.join(distDir, '_expo', 'static', 'js', 'web', entryMatch);
let js = fs.readFileSync(entryPath, 'utf8');

const MIME = { '.ttf': 'font/ttf', '.png': 'image/png', '.ico': 'image/x-icon', '.jpg': 'image/jpeg' };

// Find every "/assets/..." literal referenced in the bundle and inline it.
const assetRefs = new Set();
const re = /"(\/assets\/[^"]+\.(?:ttf|png|jpg|ico))"/g;
let m;
while ((m = re.exec(js))) assetRefs.add(m[1]);

console.log(`Found ${assetRefs.size} unique asset references to inline.`);
let inlined = 0;
for (const ref of assetRefs) {
  const filePath = path.join(distDir, ref.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) {
    console.warn(`  MISSING on disk, skipping: ${ref}`);
    continue;
  }
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  const b64 = fs.readFileSync(filePath).toString('base64');
  const dataUri = `data:${mime};base64,${b64}`;
  const literal = `"${ref}"`;
  const count = js.split(literal).length - 1;
  js = js.split(literal).join(JSON.stringify(dataUri));
  inlined += count;
}
console.log(`Inlined ${inlined} occurrences across ${assetRefs.size} assets.`);

// Favicon -> data URI (used in the <link> tag we keep for polish).
const faviconPath = path.join(distDir, 'favicon.ico');
const faviconDataUri = fs.existsSync(faviconPath)
  ? `data:image/x-icon;base64,${fs.readFileSync(faviconPath).toString('base64')}`
  : '';

const html = `<title>IELTS Prep</title>
<style id="expo-reset">
  html, body { height: 100%; }
  body { overflow: hidden; }
  #root { display: flex; height: 100%; flex: 1; }
</style>
${faviconDataUri ? `<link rel="icon" href="${faviconDataUri}"/>` : ''}
<div id="root"></div>
<script>
// Expo Router resolves its initial route from window.location.pathname, but
// this page can be hosted at an arbitrary path (e.g. an Artifact URL) rather
// than the app's own server root. Normalize to "/" before the bundle runs so
// routing always starts from the app's actual home, regardless of host path.
try {
  if (window.location.pathname !== '/') {
    window.history.replaceState(null, '', '/' + window.location.search + window.location.hash);
  }
} catch (e) {}
</script>
<script>
${js}
</script>
`;

const outPath = path.join(__dirname, '..', 'dist-artifact.html');
fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
