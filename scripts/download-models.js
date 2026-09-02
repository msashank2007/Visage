// Download face-api models — uses the exact same package version as the npm install
// to guarantee tensor shape compatibility.
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '..', 'public', 'models');
fs.mkdirSync(modelsDir, { recursive: true });

// Read the exact installed @vladmandic/face-api version
let pkgVersion = 'latest';
try {
  const pkg = require(path.join(__dirname, '..', 'node_modules', '@vladmandic', 'face-api', 'package.json'));
  pkgVersion = pkg.version;
  console.log(`Detected @vladmandic/face-api version: ${pkgVersion}`);
} catch (e) {
  console.warn('Could not detect version, using latest');
}

// CDN base URL pinned to installed version
const baseUrl = `https://cdn.jsdelivr.net/npm/@vladmandic/face-api@${pkgVersion}/model/`;

const files = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
  'age_gender_model-weights_manifest.json',
  'age_gender_model-shard1',
];

async function downloadFile(file) {
  const dest = path.join(modelsDir, file);
  const url = baseUrl + file;
  console.log(`Fetching: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buf));
  console.log(`  ✓ ${file} (${buf.byteLength.toLocaleString()} bytes)`);
}

async function main() {
  console.log(`\nDownloading face-api models → public/models/\n${'─'.repeat(60)}`);
  for (const f of files) {
    try { await downloadFile(f); }
    catch (e) { console.error(`  ✗ Failed: ${f}:`, e.message); }
  }
  console.log(`\n${'─'.repeat(60)}\nDone.`);
}

main();
