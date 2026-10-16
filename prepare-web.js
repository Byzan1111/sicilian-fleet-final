// Builds the www/ folder that Capacitor packs into the APK.
// - copies index.html (and audio/ if you added music files)
// - bundles the two fonts from npm so the game looks right offline
// - wires the Android Back button (android.js)
const fs = require('fs');
const ANDROID_JS = "// Wires the Android hardware Back button to the game (window.sfBack is defined in index.html).\n(function () {\n  try {\n    var cap = window.Capacitor;\n    if (!cap || !cap.Plugins || !cap.Plugins.App) return;\n    var App = cap.Plugins.App;\n    App.addListener('backButton', function () {\n      var r = 'exit';\n      try { r = window.sfBack ? window.sfBack() : 'exit'; } catch (e) {}\n      if (r === 'exit') App.exitApp();\n    });\n  } catch (e) {}\n})();\n";
const path = require('path');

const root = __dirname;
const www = path.join(root, 'www');
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(path.join(www, 'fonts'), { recursive: true });

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// ---- fonts ----
const FONTS = [
  // [npm package, file prefix, css family, weight, style, subset, unicode-range]
  ['cardo', 'cardo', 'Cardo', 400, 'normal', 'latin', 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'],
  ['cardo', 'cardo', 'Cardo', 700, 'normal', 'latin', 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'],
  ['cardo', 'cardo', 'Cardo', 400, 'italic', 'latin', 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'],
  ['cardo', 'cardo', 'Cardo', 400, 'normal', 'greek', 'U+0370-03FF'],
  ['cardo', 'cardo', 'Cardo', 700, 'normal', 'greek', 'U+0370-03FF'],
  ['cardo', 'cardo', 'Cardo', 400, 'italic', 'greek', 'U+0370-03FF'],
  ['marcellus-sc', 'marcellus-sc', 'Marcellus SC', 400, 'normal', 'latin', 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'],
];
let css = '';
let latinOk = 0;
for (const [pkg, prefix, family, weight, style, subset, range] of FONTS) {
  const file = `${prefix}-${subset}-${weight}-${style}.woff2`;
  const src = path.join(root, 'node_modules', '@fontsource', pkg, 'files', file);
  if (!fs.existsSync(src)) { console.log('font missing (skipped):', file); continue; }
  fs.copyFileSync(src, path.join(www, 'fonts', file));
  if (subset === 'latin' && weight === 400 && style === 'normal') latinOk++;
  css += `@font-face{font-family:'${family}';font-style:${style};font-weight:${weight};font-display:swap;src:url(fonts/${file}) format('woff2');unicode-range:${range}}\n`;
}
if (latinOk === 2) {
  html = html.replace(/<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>\s*/g, '');
  html = html.replace('</head>', `<style>${css}</style></head>`);
  console.log('Fonts bundled offline.');
} else {
  console.log('Fonts NOT bundled - the game will use the Google Fonts link (needs internet) and fall back to a serif font.');
}

// ---- Android back button ----
fs.writeFileSync(path.join(www, 'android.js'), ANDROID_JS);
html = html.includes('</body>')
  ? html.replace('</body>', '<script src="android.js"></script></body>')
  : html + '\n<script src="android.js"></script>\n';

fs.writeFileSync(path.join(www, 'index.html'), html);

// ---- audio (optional) ----
const audio = path.join(root, 'audio');
if (fs.existsSync(audio)) {
  fs.cpSync(audio, path.join(www, 'audio'), { recursive: true });
  const n = fs.readdirSync(path.join(www, 'audio')).filter(f => /\.(mp3|ogg|m4a|wav)$/i.test(f)).length;
  console.log(`Audio files bundled: ${n}`);
}
console.log('www/ ready.');
