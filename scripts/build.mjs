#!/usr/bin/env node
/**
 * Merges every userscript into ONE file for Hermit.
 *
 *   - local scripts:  src/*.user.js   (alphabetical order; prefix with 01-, 02- to control order)
 *                     files starting with "_" are skipped (handy for disabling one)
 *   - remote scripts: the "remote" list in sources.json (e.g. raw gist URLs)
 *
 * Each script is wrapped in its own function + try/catch, so:
 *   - `const css = ...` in five different files doesn't collide
 *   - one script throwing at runtime doesn't kill the others
 * Syntax errors are caught at build time and name the offending file.
 *
 * Per-script @match/@include/@exclude are preserved as runtime guards,
 * and the bundle header gets the union of @match/@grant/@require/etc.
 *
 * Also writes dist/hermit.min.user.js (esbuild: JS + CSS-in-template minification).
 * Requires Node 18+ (built-in fetch). The only dependency is esbuild (for the minified file).
 */
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(await readFile(path.join(ROOT, "sources.json"), "utf8"));

const OUTPUT = path.join(ROOT, config.output ?? "dist/hermit.user.js");
const LOCAL_DIR = path.join(ROOT, config.localDir ?? "src");
const BUNDLE_NAME = config.name ?? "Hermit bundle";

const RUN_AT_ORDER = ["document-start", "document-body", "document-end", "document-idle"];
const UNION_KEYS = ["match", "include", "exclude", "grant", "require", "connect", "resource"];

// ---------------------------------------------------------------- helpers

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

async function fetchText(url, attempts = 3) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
  fail(`Could not fetch ${url}: ${lastErr?.message}`);
}

/** Split a userscript into { meta: {key: [values]}, body } */
function parseUserscript(source) {
  const meta = {};
  let body = source;
  const m = source.match(/\/\/\s*==UserScript==([\s\S]*?)\/\/\s*==\/UserScript==/);
  if (m) {
    body = source.replace(m[0], "");
    for (const line of m[1].split(/\r?\n/)) {
      const lm = line.match(/^\s*\/\/\s*@(\S+)\s*(.*?)\s*$/);
      if (lm) (meta[lm[1]] ||= []).push(lm[2]);
    }
  }
  return { meta, body: body.trim() };
}

/** @match / @include pattern -> [regexSource, flags] */
function toRegexTuple(p) {
  const re = p.match(/^\/(.*)\/([a-z]*)$/s); // @include /regex/i
  if (re) return [re[1], re[2]];
  if (p === "<all_urls>") return [".*", ""];
  const escaped = p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return [`^${escaped}$`, ""];
}

function buildGuard(meta) {
  const inc = [...(meta.match ?? []), ...(meta.include ?? [])].map(toRegexTuple);
  const exc = (meta.exclude ?? []).map(toRegexTuple);
  if (!inc.length && !exc.length) return null;
  return `__bundleShouldRun(${JSON.stringify(inc)}, ${JSON.stringify(exc)})`;
}

// ---------------------------------------------------------------- collect sources

const sources = [];

let localFiles = [];
try {
  localFiles = (await readdir(LOCAL_DIR))
    .filter((f) => f.endsWith(".js") && !f.startsWith("_"))
    .sort();
} catch {
  /* no local dir – fine if there are remote sources */
}
for (const f of localFiles) {
  sources.push({
    id: path.posix.join(path.basename(LOCAL_DIR), f),
    text: await readFile(path.join(LOCAL_DIR, f), "utf8"),
  });
}

for (const entry of config.remote ?? []) {
  const url = typeof entry === "string" ? entry : entry.url;
  if (!url) continue;
  sources.push({ id: url, text: await fetchText(url) });
}

if (!sources.length) fail("No scripts found. Add files to src/ or URLs to sources.json → remote.");

// ---------------------------------------------------------------- parse + validate

const scripts = sources.map((s) => {
  const { meta, body } = parseUserscript(s.text);
  if (!body) fail(`${s.id} is empty.`);
  try {
    new vm.Script(`(function(){\n${body}\n})`, { filename: s.id });
  } catch (e) {
    fail(`Syntax error in ${s.id}: ${e.message}`);
  }
  return {
    ...s,
    meta,
    body,
    label: meta.name?.[0] ?? path.basename(s.id),
    runAt: meta["run-at"]?.[0] ?? "document-idle",
    declaredRunAt: Boolean(meta["run-at"]),
  };
});

// ---------------------------------------------------------------- header

const union = (key) => [...new Set(scripts.flatMap((s) => s.meta[key] ?? []))];

const header = [];
header.push(["name", BUNDLE_NAME]);
header.push(["description", `Auto-generated bundle of ${scripts.length} script(s). Do not edit by hand.`]);

for (const key of UNION_KEYS) {
  let values = union(key);
  if (key === "grant") {
    const real = values.filter((v) => v !== "none");
    values = real.length ? real : values.length ? ["none"] : [];
  }
  for (const v of values) header.push([key, v]);
}

// Bundle runs as early as its earliest script; later-wanting scripts get deferred below.
let bundleRunAt = null;
if (scripts.some((s) => s.declaredRunAt)) {
  bundleRunAt = scripts
    .map((s) => s.runAt)
    .sort((a, b) => RUN_AT_ORDER.indexOf(a) - RUN_AT_ORDER.indexOf(b))[0];
  header.push(["run-at", bundleRunAt]);
}

const headerText =
  "// ==UserScript==\n" +
  header.map(([k, v]) => `// @${k.padEnd(12)} ${v}`).join("\n") +
  "\n// ==/UserScript==\n";

// ---------------------------------------------------------------- body

const runtime = `
const __bundleShouldRun = (inc, exc) => {
  const hit = ([src, flags]) => new RegExp(src, flags).test(location.href);
  return (!inc.length || inc.some(hit)) && !exc.some(hit);
};
const __bundleReady = (fn) =>
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", fn, { once: true })
    : fn();
`.trim();

/**
 * Render the wrapped scripts. `bodyOf(script)` lets the minified build
 * swap in a CSS-minified body without touching the readable build.
 */
function renderCore(bodyOf) {
  const parts = scripts.map((s) => {
    const guard = buildGuard(s.meta);
    const defer = bundleRunAt === "document-start" && s.runAt !== "document-start";
    const label = JSON.stringify(s.label);

    // NOTE: the script body is deliberately NOT re-indented, so multi-line
    // template literals (like the CSS in styles.user.js) stay byte-identical.
    return [
      `// ===== ${s.label}  (${s.id}) =====`,
      `;(function () {`,
      guard ? `  if (!${guard}) return;` : null,
      `  const __main = function () {`,
      `    try {`,
      bodyOf(s),
      `    } catch (e) { console.error("[bundle] " + ${label} + " failed:", e); }`,
      `  };`,
      defer ? `  __bundleReady(__main);` : `  __main();`,
      `})();`,
    ]
      .filter((l) => l !== null)
      .join("\n");
  });
  return `${runtime}\n\n${parts.join("\n\n")}\n`;
}

const wrap = (core) => `;(function () {\n${core}})();\n`;
const check = (code, name) => {
  try {
    new vm.Script(code, { filename: name });
  } catch (e) {
    fail(`Generated ${name} is invalid: ${e.message}`);
  }
};

// ---------------------------------------------------------------- readable bundle

const core = renderCore((s) => s.body);
const hash = createHash("sha256").update(core).digest("hex").slice(0, 10);

const banner =
  headerText +
  `// Content hash: ${hash}\n` +
  `// Sources:\n${scripts.map((s) => `//   - ${s.id}`).join("\n")}\n\n`;

const output = banner + wrap(core);
check(output, path.basename(OUTPUT));

await mkdir(path.dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, output);

console.log(`✔ ${path.relative(ROOT, OUTPUT)}  (${(output.length / 1024).toFixed(1)} KB, hash ${hash})`);
for (const s of scripts) console.log(`   • ${s.label}  ←  ${s.id}`);

// ---------------------------------------------------------------- minified bundle

if (config.minify !== false) {
  let esbuild;
  try {
    esbuild = await import("esbuild");
  } catch {
    console.warn("⚠ esbuild not installed – skipping minified bundle (run `npm install`).");
  }

  if (esbuild) {
    // Most of a styling script's weight is CSS inside a template literal, which a
    // JS minifier leaves alone. Minify `const css = `...`` strings with esbuild's CSS
    // minifier. Skipped (with a note) if the string uses ${} or backslashes.
    const minifyCssString = (s) =>
      s.body.replace(/(\bconst\s+css\s*=\s*`)([^`]*)(`)/g, (all, pre, css, post) => {
        if (css.includes("${") || css.includes("\\")) {
          console.warn(`⚠ ${s.id}: CSS string uses \${} or backslashes – left as-is in minified bundle.`);
          return all;
        }
        try {
          const out = esbuild.transformSync(css, {
            loader: "css",
            minify: true,
            target: config.minifyCssTarget ?? "chrome80",
          }).code.trim();
          return pre + out + post;
        } catch (e) {
          console.warn(`⚠ ${s.id}: CSS minify failed (${e.message.split("\n")[0]}) – left as-is.`);
          return all;
        }
      });

    const minCore = esbuild.transformSync(wrap(renderCore(minifyCssString)), {
      minify: true,
      legalComments: "none",
    }).code;

    const MIN_OUTPUT = config.minOutput
      ? path.join(ROOT, config.minOutput)
      : OUTPUT.replace(/\.user\.js$/, ".min.user.js");
    const minOut = banner + minCore;
    check(minOut, path.basename(MIN_OUTPUT));

    await writeFile(MIN_OUTPUT, minOut);
    console.log(
      `✔ ${path.relative(ROOT, MIN_OUTPUT)}  (${(minOut.length / 1024).toFixed(1)} KB, ` +
        `${Math.round((1 - minOut.length / output.length) * 100)}% smaller)`,
    );
  }
}
