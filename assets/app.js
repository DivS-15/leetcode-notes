// Each section is one Markdown file in content/. Every "## " heading in a
// file is one problem; everything until the next "## " is its solution.
// The first line of a problem may be "[Source](url)": that url links the title
// and keys the scraped statement in content/problems.json (see tools/scrape.py).
const SECTIONS = [
  { key: "contests", file: "contests.md", title: "Contests & Mock Tests", short: "Contests" },
  { key: "daily", file: "daily.md", title: "Daily LeetCode Problems", short: "Daily" },
  { key: "trees", file: "trees.md", title: "Binary Trees & BST", short: "Trees" },
  { key: "graphs", file: "graphs.md", title: "Graphs", short: "Graphs" },
  { key: "dp", file: "dp.md", title: "Dynamic Programming", short: "DP" },
  { key: "window", file: "sliding-window.md", title: "Sliding Window & Two Pointers", short: "Sliding Window" },
  { key: "bits", file: "bits.md", title: "Bit Manipulation", short: "Bits" },
  { key: "bsearch", file: "binary-search.md", title: "Binary Search", short: "Binary Search" },
  { key: "stacks", file: "stacks.md", title: "Stacks & Queues", short: "Stacks" },
  { key: "greedy", file: "greedy.md", title: "Greedy", short: "Greedy" },
  { key: "rippling", file: "rippling.md", title: "Rippling PYQs", short: "Rippling" },
  { key: "grind", file: "grind75.md", title: "Grind 75", short: "Grind 75" },
];

const state = { problems: [], byId: {}, meta: {}, current: null };

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parseSection(section, text) {
  return text.split(/^## /m).slice(1).map((chunk) => {
    const nl = chunk.indexOf("\n");
    const title = (nl === -1 ? chunk : chunk.slice(0, nl)).trim();
    let body = nl === -1 ? "" : chunk.slice(nl + 1);
    let url = null, source = null;
    const link = body.match(/^\s*\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)[ \t]*\n?/);
    if (link) {
      source = link[1];
      url = link[2];
      body = body.slice(link[0].length);
    }
    let gist = null;
    body = body.replace(/^\s*> \*\*Problem:\*\*\s*(.*)\n?/m, (_, g) => ((gist = g), ""));
    const subs = [...body.matchAll(/^### (.+)$/gm)].map((m) => m[1].trim());
    return { section, title, body: body.trim(), url, source, gist, subs, id: `${section.key}/${slugify(title)}` };
  });
}

function label(p) {
  const m = p.url && state.meta[p.url];
  return m && m.source === "LeetCode" && m.id ? `${m.id}. ${p.title}` : p.title;
}

// ---------- navigation ----------
function buildTabs() {
  const tabs = document.getElementById("tabs");
  tabs.innerHTML = `<a href="#" data-key="">Home</a>` + SECTIONS.map((s) => {
    const first = state.problems.find((p) => p.section === s);
    return first ? `<a href="#${first.id}" data-key="${s.key}">${esc(s.short)}</a>` : "";
  }).join("");
}

function buildNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = SECTIONS.map((s) => {
    const items = state.problems.filter((p) => p.section === s);
    const lis = items.map((p) =>
      `<li data-id="${esc(p.id)}" data-q="${esc((label(p) + " " + ((state.meta[p.url] || {}).tags || []).join(" ")).toLowerCase())}">` +
      `<a href="#${esc(p.id)}" data-id="${esc(p.id)}">${esc(label(p))}</a></li>`).join("");
    return `<details data-key="${s.key}"><summary><span>${esc(s.title)}</span><span class="n">${items.length}</span></summary><ul>${lis}</ul></details>`;
  }).join("");
}

function setActive(p) {
  document.querySelectorAll("#nav .sub").forEach((el) => el.remove());
  document.querySelectorAll("#nav a.active").forEach((a) => a.classList.remove("active"));
  document.querySelectorAll("#tabs a").forEach((a) =>
    a.classList.toggle("active", a.dataset.key === (p ? p.section.key : "")));
  if (!p) return;
  const li = document.querySelector(`#nav li[data-id="${CSS.escape(p.id)}"]`);
  if (!li) return;
  li.querySelector("a").classList.add("active");
  li.closest("details").open = true;
  const subs = p.subs.map((s, i) => `<li><a href="#" data-anchor="sol-${i + 1}">${esc(s)}</a></li>`).join("");
  li.insertAdjacentHTML("beforeend",
    `<ul class="sub"><li><a href="#" data-anchor="description">Description</a></li>` +
    `<li><a href="#" data-anchor="solutions">Solutions</a>${subs ? `<ul class="sub">${subs}</ul>` : ""}</li></ul>`);
  li.scrollIntoView({ block: "nearest" });
}

// ---------- rendering ----------
function sanitize(html) {
  return DOMPurify.sanitize(html, { ADD_ATTR: ["target"], FORBID_TAGS: ["style", "form", "input"] });
}

function statementHtml(p) {
  const m = p.url && state.meta[p.url];
  if (m && m.html) return sanitize(m.html);
  if (m && m.md) return sanitize(marked.parse(m.md));
  if (p.gist) return sanitize(marked.parse(p.gist)) +
    `<p class="muted"><em>Summary; the full statement couldn't be fetched.</em></p>`;
  return `<p class="muted">No problem statement available.</p>`;
}

function decorateCode(root) {
  root.querySelectorAll(".solutions pre > code").forEach((el) => {
    if (!/language-/.test(el.className)) el.classList.add("language-cpp");
    hljs.highlightElement(el);
    const pre = el.parentElement;
    const wrap = document.createElement("div");
    wrap.className = "code-wrap";
    pre.replaceWith(wrap);
    wrap.appendChild(pre);
    const lang = (el.className.match(/language-(\w+)/) || [])[1] || "";
    wrap.insertAdjacentHTML("afterbegin",
      `<span class="lang">${esc(lang === "cpp" ? "C++" : lang)}</span><button class="copy" type="button">Copy</button>`);
    wrap.querySelector(".copy").addEventListener("click", async (e) => {
      try {
        await navigator.clipboard.writeText(el.innerText);
        e.target.textContent = "Copied";
      } catch {
        e.target.textContent = "Failed";
      }
      setTimeout(() => (e.target.textContent = "Copy"), 1500);
    });
  });
}

function renderProblem(p) {
  const main = document.getElementById("content");
  const m = (p.url && state.meta[p.url]) || {};
  const idx = state.problems.indexOf(p);
  const prev = state.problems[idx - 1], next = state.problems[idx + 1];
  const diff = m.difficulty ? String(m.difficulty) : null;
  const titleHtml = p.url
    ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(label(p))}</a>`
    : esc(label(p));

  let sol = p.body ? marked.parse(p.body) : `<p class="muted">No solution recorded in the notes.</p>`;
  let n = 0;
  sol = sol.replace(/<h3>/g, () => `<h3 id="sol-${++n}">`);

  main.innerHTML = `
    <div class="tags">${(m.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
    <h1 class="title">${titleHtml}</h1>
    <div class="badges">
      ${diff ? `<span class="badge ${esc(diff.toLowerCase())}"><span class="k">Difficulty</span><span class="v">${esc(diff)}</span></span>` : ""}
      ${p.source || m.source ? `<span class="badge"><span class="k">Source</span><span class="v">${esc(m.source || p.source)}</span></span>` : ""}
      <span class="badge"><span class="k">Topic</span><span class="v">${esc(p.section.short)}</span></span>
    </div>
    <article class="doc">
      <h2 id="description">Description</h2>
      <div class="statement">${statementHtml(p)}</div>
      <h2 id="solutions">Solutions</h2>
      <div class="solutions">${sanitize(sol)}</div>
    </article>
    <div class="pager">
      ${prev ? `<a class="prev" href="#${esc(prev.id)}"><small>Previous</small>${esc(label(prev))}</a>` : ""}
      ${next ? `<a class="next" href="#${esc(next.id)}"><small>Next</small>${esc(label(next))}</a>` : ""}
    </div>`;

  main.querySelectorAll(".doc a[href^='http']").forEach((a) => {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });
  decorateCode(main);
  if (window.renderMathInElement) {
    renderMathInElement(main.querySelector(".statement"), {
      delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
      throwOnError: false,
    });
  }
  setActive(p);
  window.scrollTo(0, 0);
  document.title = `${label(p)} · LeetCode Notes`;
}

function renderHome() {
  const main = document.getElementById("content");
  const cards = SECTIONS.map((s) => {
    const items = state.problems.filter((p) => p.section === s);
    return items.length ? `<a href="#${esc(items[0].id)}"><b>${esc(s.title)}</b>${items.length} problems</a>` : "";
  }).join("");
  main.innerHTML = `<div class="home">
    <h1>LeetCode Notes</h1>
    <p class="muted">${state.problems.length} problems with C++ solutions, grouped by topic.
    Pick a problem from the left, or start with a topic below.</p>
    <div class="home-grid">${cards}</div></div>`;
  setActive(null);
  document.title = "LeetCode Notes";
}

function route() {
  const p = state.byId[decodeURIComponent(location.hash.slice(1))];
  document.body.classList.remove("nav-open");
  state.current = p || null;
  p ? renderProblem(p) : renderHome();
}

// ---------- search ----------
function setupSearch() {
  const input = document.getElementById("search");
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll("#nav details").forEach((d) => {
      let visible = 0;
      d.querySelectorAll(":scope > ul > li").forEach((li) => {
        const match = !q || li.dataset.q.includes(q);
        li.style.display = match ? "" : "none";
        if (match) visible++;
      });
      d.style.display = visible ? "" : "none";
      if (q) d.open = visible > 0;
    });
    if (q) document.body.classList.add("nav-open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
    } else if (e.key === "Escape" && document.activeElement === input) {
      input.value = "";
      input.dispatchEvent(new Event("input"));
      input.blur();
    }
  });
}

async function init() {
  try {
    const [meta, ...texts] = await Promise.all([
      fetch("content/problems.json").then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
      ...SECTIONS.map((s) =>
        fetch(`content/${s.file}`).then((r) => {
          if (!r.ok) throw new Error(`${s.file}: HTTP ${r.status}`);
          return r.text();
        })),
    ]);
    state.meta = meta;
    SECTIONS.forEach((s, i) => state.problems.push(...parseSection(s, texts[i])));
  } catch (err) {
    document.getElementById("content").innerHTML =
      `<p>Could not load content (${esc(err.message)}). If you opened index.html directly,
      serve the folder over HTTP instead, e.g. <code>python3 -m http.server</code>.</p>`;
    return;
  }
  state.problems.forEach((p) => (state.byId[p.id] = p));
  document.getElementById("count").textContent = `${state.problems.length} problems`;
  buildTabs();
  buildNav();
  setupSearch();
  document.getElementById("menu-toggle").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  document.getElementById("nav").addEventListener("click", (e) => {
    const a = e.target.closest("a[data-anchor]");
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.dataset.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.body.classList.remove("nav-open");
  });
  window.addEventListener("hashchange", route);
  route();
}

init();
