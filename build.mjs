/**
 * Tiny static-site builder.
 *
 * Reads HTML files from ./pages, expands {{> partial-name}} includes from
 * ./partials, then writes the result to the project root (where GitHub
 * Pages serves from).
 *
 * Supports a per-page {{title}} placeholder set with a leading directive line
 * in the page source: <!-- title: ... | description: ... | active: home -->
 *
 * Run once:    node build.mjs
 * Watch mode:  node build.mjs --watch
 */
import { readFile, writeFile, readdir, mkdir, stat } from "node:fs/promises";
import { existsSync, watch } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PAGES_DIR = join(__dirname, "pages");
const PARTIALS_DIR = join(__dirname, "partials");
const OUT_DIR = __dirname; // emit at project root for GitHub Pages

const SITE = {
  name: "Bella App",
  defaultTitle: "Bella App - Beauty with friends",
  defaultDescription:
    "Your ultimate beauty app. Find salons you can trust. See where your friends are visiting and loving, so you can book your next appointment with confidence.",
  url: "https://bellaapp.au",
  ogImage: "/assets/og-image.jpg",
};

async function loadPartials() {
  const entries = await readdir(PARTIALS_DIR, { withFileTypes: true });
  const partials = {};
  for (const e of entries) {
    if (e.isFile() && e.name.endsWith(".html")) {
      const name = e.name.replace(/\.html$/, "");
      partials[name] = await readFile(join(PARTIALS_DIR, e.name), "utf8");
    }
  }
  return partials;
}

function parseDirective(src) {
  // Optional leading HTML comment with key: value | key: value pairs.
  const match = src.match(/^\s*<!--\s*meta\s*([\s\S]*?)-->\s*/);
  const meta = {};
  let body = src;
  if (match) {
    body = src.slice(match[0].length);
    for (const part of match[1].split("|")) {
      const idx = part.indexOf(":");
      if (idx === -1) continue;
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      if (k) meta[k] = v;
    }
  }
  return { meta, body };
}

function applyVars(html, vars) {
  // Replace {{key}} with vars[key]. Any unknown key becomes empty so we
  // don't ship literal placeholders to production.
  return html.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) =>
    vars[key] != null ? vars[key] : "",
  );
}

function expandIncludes(html, partials) {
  // {{> partial-name}} → partials[partial-name]. Recursive in case partials
  // include other partials.
  let prev;
  let out = html;
  do {
    prev = out;
    out = out.replace(/\{\{>\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (_, name) => {
      if (!(name in partials)) {
        throw new Error(`Unknown partial: ${name}`);
      }
      return partials[name];
    });
  } while (out !== prev);
  return out;
}

async function buildPage(relPath, partials) {
  const src = await readFile(join(PAGES_DIR, relPath), "utf8");
  const { meta, body } = parseDirective(src);

  const title = meta.title
    ? `${meta.title} · Bella App`
    : SITE.defaultTitle;
  const description = meta.description ?? SITE.defaultDescription;
  const canonical = meta.path
    ? `${SITE.url}${meta.path}`
    : `${SITE.url}/${relPath.replace(/index\.html$/, "").replace(/\.html$/, "")}`;
  const active = meta.active ?? "";
  const audience = meta.audience ?? "consumer"; // "consumer" | "business"

  const vars = {
    title,
    description,
    canonical,
    active,
    audience,
    siteUrl: SITE.url,
    ogImage: SITE.ogImage,
    year: String(new Date().getFullYear()),
  };

  // Expand partials first so their {{vars}} also get filled.
  let out = expandIncludes(body, partials);
  out = applyVars(out, vars);

  const outPath = join(OUT_DIR, relPath);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, out, "utf8");
  return outPath;
}

async function listPages() {
  const out = [];
  async function walk(dir, base = "") {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      const rel = base ? join(base, e.name) : e.name;
      if (e.isDirectory()) await walk(full, rel);
      else if (e.isFile() && e.name.endsWith(".html")) out.push(rel);
    }
  }
  await walk(PAGES_DIR);
  return out;
}

async function buildAll() {
  const partials = await loadPartials();
  const pages = await listPages();
  const built = [];
  for (const rel of pages) {
    const out = await buildPage(rel, partials);
    built.push(relative(__dirname, out));
  }
  return built;
}

async function main() {
  const watchMode = process.argv.includes("--watch");
  const start = Date.now();
  const built = await buildAll();
  console.log(
    `[build] wrote ${built.length} page(s) in ${Date.now() - start}ms`,
  );

  if (!watchMode) return;

  console.log("[build] watching pages/ and partials/ for changes...");
  let pending = false;
  const trigger = () => {
    if (pending) return;
    pending = true;
    setTimeout(async () => {
      pending = false;
      try {
        const t0 = Date.now();
        const built = await buildAll();
        console.log(
          `[build] rebuilt ${built.length} page(s) in ${Date.now() - t0}ms`,
        );
      } catch (err) {
        console.error("[build] error:", err.message);
      }
    }, 50);
  };
  watch(PAGES_DIR, { recursive: true }, trigger);
  watch(PARTIALS_DIR, { recursive: true }, trigger);
}

main().catch((err) => {
  console.error("[build] fatal:", err);
  process.exit(1);
});
