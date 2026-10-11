/* Coding Patterns Mastery — tiny, dependency-free visualizer engine.
 * Works from file:// (no server, no modules, no fetch).
 *
 * Usage in a page:
 *   const frames = [];                       // build frames by running the algorithm in JS
 *   frames.push({ view: Viz.array([1,2,3], {hl:{0:'active'}, ptrs:{0:'L'}}), note: 'text', vars: {sum: 3} });
 *   Viz.stepper('#my-viz', { title: 'Demo', sub: 'what you are watching', frames });
 */
(function () {
  "use strict";

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /** One row of boxes. opts: {hl:{i:cls}, ptrs:{i:'label'}, label, small, showIdx(default true), dimOutside:[lo,hi]} */
  function array(values, opts = {}) {
    const hl = opts.hl || {}, ptrs = opts.ptrs || {};
    const showIdx = opts.showIdx !== false;
    let html = `<div class="row">`;
    if (opts.label) html += `<div class="row-label">${esc(opts.label)}</div>`;
    values.forEach((v, i) => {
      let cls = hl[i] || "";
      if (opts.dimOutside && (i < opts.dimOutside[0] || i > opts.dimOutside[1])) cls += " dim";
      if (v === null || v === undefined || v === "") cls += " empty";
      html += `<div class="cell-wrap"><div class="ptr">${ptrs[i] ? esc(ptrs[i]) : "&nbsp;"}</div>` +
        `<div class="cell ${opts.small ? "sm" : ""} ${cls}">${v === null || v === undefined ? "·" : esc(v)}</div>` +
        (showIdx ? `<div class="idx">${i}</div>` : "") + `</div>`;
    });
    return html + `</div>`;
  }

  /** 2-D grid. opts: {hl:{"r,c":cls}, small, label} */
  function grid(matrix, opts = {}) {
    const hl = opts.hl || {};
    const cols = matrix[0] ? matrix[0].length : 0;
    let html = opts.label ? `<div class="row-label" style="width:auto">${esc(opts.label)}</div>` : "";
    html += `<div class="grid-viz" style="grid-template-columns:repeat(${cols}, auto)">`;
    matrix.forEach((row, r) => row.forEach((v, c) => {
      html += `<div class="cell ${opts.small ? "sm" : ""} ${hl[r + "," + c] || ""}">${v === null ? "·" : esc(v)}</div>`;
    }));
    return html + `</div>`;
  }

  /** Vertical stack (bottom = first pushed). opts: {hl:{i:cls}, label} */
  function stack(items, opts = {}) {
    const hl = opts.hl || {};
    let html = `<div style="display:flex;flex-direction:column;align-items:center;gap:4px">`;
    html += `<div class="stack-viz">`;
    items.forEach((v, i) => { html += `<div class="cell sm ${hl[i] || ""}">${esc(v)}</div>`; });
    html += `</div><div class="idx">${esc(opts.label || "stack")}</div></div>`;
    return html;
  }

  /** Pill list, e.g. a queue, heap, result set. */
  function chips(items, label, cls = "") {
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:6px">` +
      (label ? `<div class="row-label" style="width:auto;margin:0">${esc(label)}</div>` : "") +
      `<div class="chips">${items.length ? items.map((x) => `<span class="chip ${cls}">${esc(x)}</span>`).join("") : `<span class="chip" style="opacity:.5">empty</span>`}</div></div>`;
  }

  /** Linked list: values with arrows. opts: {hl:{i:cls}, ptrs:{i:label}, arrows: array of 'next'|'prev'|'none' per node} */
  function list(values, opts = {}) {
    const hl = opts.hl || {}, ptrs = opts.ptrs || {}, arrows = opts.arrows || [];
    let html = `<div class="row" style="align-items:center">`;
    if (opts.label) html += `<div class="row-label">${esc(opts.label)}</div>`;
    values.forEach((v, i) => {
      html += `<div class="cell-wrap"><div class="ptr">${ptrs[i] ? esc(ptrs[i]) : "&nbsp;"}</div><div class="cell ${hl[i] || ""}">${esc(v)}</div><div class="idx">&nbsp;</div></div>`;
      if (i < values.length - 1) {
        const a = arrows[i] || "next";
        const sym = a === "prev" ? "←" : a === "none" ? "&nbsp;&nbsp;" : "→";
        html += `<div style="font:700 1.2rem var(--mono);color:${a === "prev" ? "var(--warm)" : "var(--ink-3)"};padding:0 2px">${sym}</div>`;
      }
    });
    return html + `</div>`;
  }

  /** Binary tree from level-order array (null = missing). opts: {hl:{index:cls}, edgeHl:{childIndex:cls}, labels:{index:text}} */
  function tree(levelOrder, opts = {}) {
    const hl = opts.hl || {}, labels = opts.labels || {}, edgeHl = opts.edgeHl || {};
    const n = levelOrder.length;
    const depth = Math.max(1, Math.ceil(Math.log2(n + 1)));
    const W = Math.max(320, Math.pow(2, depth - 1) * 56), levelH = 64, R = 18;
    const H = depth * levelH + 10;
    const pos = (i) => {
      const d = Math.floor(Math.log2(i + 1));
      const first = Math.pow(2, d) - 1, count = Math.pow(2, d);
      return { x: ((i - first) + 0.5) * (W / count), y: d * levelH + 28 };
    };
    let edges = "", nodes = "";
    for (let i = 0; i < n; i++) {
      if (levelOrder[i] === null || levelOrder[i] === undefined) continue;
      const p = pos(i);
      if (i > 0) {
        const q = pos(Math.floor((i - 1) / 2));
        edges += `<line class="${edgeHl[i] || ""}" x1="${q.x}" y1="${q.y}" x2="${p.x}" y2="${p.y}"/>`;
      }
      nodes += `<g><circle class="${hl[i] || ""}" cx="${p.x}" cy="${p.y}" r="${R}"/><text x="${p.x}" y="${p.y + 4.5}" text-anchor="middle">${esc(levelOrder[i])}</text>` +
        (labels[i] ? `<text x="${p.x}" y="${p.y + R + 14}" text-anchor="middle" style="font-size:10px;fill:var(--blue)">${esc(labels[i])}</text>` : "") + `</g>`;
    }
    return `<svg class="tree" viewBox="0 0 ${W} ${H + 12}" width="${Math.min(W, 640)}" role="img" aria-label="binary tree">${edges}${nodes}</svg>`;
  }

  /** Generic graph: nodes [{id,x,y,label}], edges [[a,b]] ; opts {hl:{id:cls}, edgeHl:{"a-b":cls}, directed} */
  function graph(nodes, edges, opts = {}) {
    const hl = opts.hl || {}, edgeHl = opts.edgeHl || {};
    const W = opts.width || 420, H = opts.height || 240, R = 18;
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    let defs = opts.directed ? `<defs><marker id="arr" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>` : "";
    let e = "";
    edges.forEach(([a, b]) => {
      const p = byId[a], q = byId[b];
      const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1;
      const x2 = q.x - (dx / L) * (R + 2), y2 = q.y - (dy / L) * (R + 2);
      const cls = edgeHl[a + "-" + b] || edgeHl[b + "-" + a] || "";
      e += `<line class="${cls}" x1="${p.x}" y1="${p.y}" x2="${x2}" y2="${y2}" ${opts.directed ? 'marker-end="url(#arr)" style="color:var(--ink-3)"' : ""}/>`;
    });
    let ns = nodes.map((n) => `<g><circle class="${hl[n.id] || ""}" cx="${n.x}" cy="${n.y}" r="${R}"/><text x="${n.x}" y="${n.y + 4.5}" text-anchor="middle">${esc(n.label ?? n.id)}</text></g>`).join("");
    return `<svg class="tree" viewBox="0 0 ${W} ${H}" width="${Math.min(W, 560)}" role="img" aria-label="graph">${defs}${e}${ns}</svg>`;
  }

  /** Horizontal interval bars. items [{s,e,label,cls}], range [lo,hi] */
  function intervals(items, range, opts = {}) {
    const [lo, hi] = range, W = 520, rowH = 26;
    const x = (v) => 20 + ((v - lo) / (hi - lo || 1)) * (W - 40);
    let svg = `<svg class="tree" viewBox="0 0 ${W} ${items.length * rowH + 34}" width="${W}">`;
    for (let t = lo; t <= hi; t += Math.max(1, Math.round((hi - lo) / 10))) {
      svg += `<line x1="${x(t)}" y1="0" x2="${x(t)}" y2="${items.length * rowH + 6}" style="stroke:var(--line);stroke-width:1"/><text x="${x(t)}" y="${items.length * rowH + 24}" text-anchor="middle" style="font-size:10px;fill:var(--ink-3)">${t}</text>`;
    }
    const colors = { active: "var(--blue)", found: "var(--green)", window: "var(--accent)", warm: "var(--warm)", bad: "var(--red)", dim: "var(--line)" };
    items.forEach((it, i) => {
      const c = colors[it.cls] || "var(--ink-3)";
      svg += `<rect x="${x(it.s)}" y="${i * rowH + 4}" width="${Math.max(4, x(it.e) - x(it.s))}" height="16" rx="5" style="fill:${c};opacity:${it.cls === "dim" ? .5 : .85}"/>` +
        `<text x="${x(it.e) + 6}" y="${i * rowH + 16}" style="font-size:11px;fill:var(--ink-2)">${esc(it.label ?? `[${it.s},${it.e}]`)}</text>`;
    });
    return svg + `</svg>`;
  }

  /** Step-through player. */
  function stepper(target, cfg) {
    const root = typeof target === "string" ? document.querySelector(target) : target;
    if (!root) return;
    const frames = cfg.frames || [];
    let i = 0, timer = null;
    const id = root.id || "viz" + Math.random().toString(36).slice(2, 7);
    root.classList.add("viz");
    if (cfg.className) root.classList.add(cfg.className);
    root.innerHTML =
      (cfg.title ? `<div class="viz-title">${esc(cfg.title)}</div>` : "") +
      (cfg.sub ? `<div class="viz-sub">${cfg.sub}</div>` : "") +
      `<div class="stage" aria-live="polite"></div><div class="note"></div><div class="vars"></div>` +
      `<div class="controls">
         <button id="${id}-reset" title="Reset">⟲ Reset</button>
         <button id="${id}-prev" title="Previous (←)">◀ Prev</button>
         <button id="${id}-play" class="primary" title="Play / pause (space)">▶ Play</button>
         <button id="${id}-next" title="Next (→)">Next ▶</button>
         <input id="${id}-range" type="range" min="0" max="${Math.max(0, frames.length - 1)}" value="0" aria-label="step">
         <span class="counter"></span>
       </div>`;
    const stage = root.querySelector(".stage"), note = root.querySelector(".note"), vars = root.querySelector(".vars");
    const range = root.querySelector(`#${id}-range`), counter = root.querySelector(".counter");
    const playBtn = root.querySelector(`#${id}-play`);
    const varsHtml = (f) => f.vars ? Object.entries(f.vars).map(([a, b]) => `<span>${esc(a)} = ${esc(typeof b === "object" ? JSON.stringify(b) : b)}</span>`).join("") : "";
    function show(k) {
      i = Math.max(0, Math.min(frames.length - 1, k));
      const f = frames[i] || {};
      stage.innerHTML = f.view || "";
      note.innerHTML = f.note || "";
      vars.innerHTML = varsHtml(f);
      range.value = i;
      counter.textContent = `${i + 1} / ${frames.length}`;
    }
    function stop() { clearInterval(timer); timer = null; playBtn.textContent = "▶ Play"; }
    function play() {
      if (timer) return stop();
      if (i >= frames.length - 1) show(0);
      playBtn.textContent = "❚❚ Pause";
      timer = setInterval(() => { if (i >= frames.length - 1) stop(); else show(i + 1); }, cfg.speed || 1100);
    }
    root.querySelector(`#${id}-prev`).onclick = () => { stop(); show(i - 1); };
    root.querySelector(`#${id}-next`).onclick = () => { stop(); show(i + 1); };
    root.querySelector(`#${id}-reset`).onclick = () => { stop(); show(0); };
    playBtn.onclick = play;
    range.oninput = () => { stop(); show(+range.value); };
    // Reserve room for the tallest frame so nothing below the visualizer jumps while it plays.
    // Measured once it is visible (a hidden element has no size), and again when its width changes.
    let lockedWidth = 0;
    function lockHeights() {
      const w = root.clientWidth;
      if (!w || w === lockedWidth || frames.length < 2) return;
      lockedWidth = w;
      const parts = [[stage, "view"], [note, "note"], [vars, "vars"]];
      parts.forEach(([el]) => { el.style.minHeight = ""; });
      const tallest = parts.map(() => 0);
      for (const f of frames) {
        stage.innerHTML = f.view || "";
        note.innerHTML = f.note || "";
        vars.innerHTML = varsHtml(f);
        parts.forEach(([el], n) => { tallest[n] = Math.max(tallest[n], Math.ceil(el.getBoundingClientRect().height)); });
      }
      parts.forEach(([el], n) => { el.style.minHeight = tallest[n] + "px"; });
      show(i);
    }
    if (typeof IntersectionObserver !== "undefined") {
      const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) lockHeights(); });
      io.observe(root);
    }
    if (typeof ResizeObserver !== "undefined") {
      let pending = null;
      new ResizeObserver(() => { clearTimeout(pending); pending = setTimeout(lockHeights, 150); }).observe(root);
    }
    root.tabIndex = 0;
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { stop(); show(i + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { stop(); show(i - 1); e.preventDefault(); }
      if (e.key === " ") { play(); e.preventDefault(); }
    });
    show(0);
  }

  /* ---------- page helpers: python highlighting, copy buttons, TOC, quiz ---------- */
  function highlightPython(code) {
    const KW = /\b(def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|class|import|from|as|with|lambda|yield|break|continue|pass|try|except|finally|raise|global|nonlocal|self)\b/g;
    const tokens = [];
    // Placeholders use Private-Use-Area characters (no digits/letters), so later
    // regexes (numbers, identifiers) can never match inside an already-highlighted token.
    const stash = (cls, s) => { tokens.push(`<span class="${cls}">${s}</span>`); return "\uE000" + String.fromCharCode(0xE100 + tokens.length - 1) + "\uE001"; };
    let s = esc(code);
    s = s.replace(/(#[^\n]*)/g, (m) => stash("com", m));
    s = s.replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\n]*"|'[^'\n]*')/g, (m) => stash("str", m));
    s = s.replace(KW, (m) => stash("kw", m));
    s = s.replace(/\b([A-Za-z_]\w*)(?=\()/g, (m) => stash("fn", m));
    s = s.replace(/\b(\d+)\b/g, (m) => stash("num", m));
    return s.replace(/\uE000([\s\S])\uE001/g, (_, ch) => tokens[ch.charCodeAt(0) - 0xE100]);
  }

  /* ---------- traced step-through: replays a recorded run of a problem's solution ---------- */
  // data: {src:[lines], notes:{line:text}, input, output, values:[...], steps:[[line, depth, fn, {var: valueIdx}, retIdx?]], truncated}
  const PTR = /^(i|j|k|l|r|lo|hi|mid|left|right|start|end|read|write|slow|fast|low|high|pos|i1|i2|j1|j2)$|idx|index|ptr|^(left|right|start|end)_|_(i|j)$/;
  const isScalar = (v) => v === null || typeof v !== "object" || v["~"] === "num";
  const fmt = (v) => {
    if (v === null) return "None";
    if (typeof v === "boolean") return v ? "True" : "False";
    if (typeof v === "string") return JSON.stringify(v);
    if (typeof v !== "object") return String(v);
    const t = v["~"], items = v.v;
    if (t === "num" || t === "obj") return String(items);
    if (t === "node") return `Node(${fmt(items)})`;
    if (t === "ll") return items.map(fmt).join(" → ") + (v.cycle ? " → …(cycle)" : " → None");
    if (t === "dict") return "{" + items.map(([k, x]) => `${fmt(k)}: ${fmt(x)}`).join(", ") + "}";
    const inner = items.map(fmt).join(", ") + (v.more ? `, …+${v.more}` : "");
    return t === "set" ? (items.length ? "{" + inner + "}" : "set()") : t === "tuple" ? "(" + inner + ")" : t === "deque" ? "deque([" + inner + "])" : "[" + inner + "]";
  };
  function traceView(data, k) {
    const step = data.steps[k], prev = k > 0 ? data.steps[k - 1] : null;
    const [line, depth, fn, locals, stackIdx, ret] = step;
    const val = (name) => data.values[locals[name]];
    const changed = (name) => !prev || prev[1] !== depth || prev[3][name] !== locals[name];
    // code window: always 7 lines (slid inside the source near its ends), so its height never changes
    const WIN = 7, lo = Math.max(1, Math.min(line - 3, data.src.length - WIN + 1));
    let code = `<div class="trace-code">`;
    for (let n = lo; n < lo + WIN; n++) {
      code += n <= data.src.length
        ? `<div class="tl${n === line ? " cur" : ""}"><span class="ln">${n}</span>${highlightPython(data.src[n - 1] || " ")}</div>`
        : `<div class="tl"><span class="ln"></span> </div>`;
    }
    code += `</div>`;
    // pointer variables (small ints with index-like names)
    const ints = Object.keys(locals).filter((nm) => PTR.test(nm) && Number.isInteger(val(nm)));
    // pictures for containers
    let pics = "";
    const names = Object.keys(locals).sort((a, b) => (changed(b) ? 1 : 0) - (changed(a) ? 1 : 0));
    let count = 0;
    for (const nm of names) {
      if (count >= 4) break;
      const v = val(nm);
      if (isScalar(v) && typeof v !== "string") continue;
      let pic = "";
      if (typeof v === "string") {
        const ptrs = {};
        ints.forEach((p) => { const x = val(p); if (x >= 0 && x < v.length) ptrs[x] = ptrs[x] ? ptrs[x] + "," + p : p; });
        if (!Object.keys(ptrs).length || v.length > 40 || v.length < 2) continue;
        pic = array(v.split(""), { label: nm, ptrs, small: v.length > 14, hl: Object.fromEntries(Object.keys(ptrs).map((x) => [x, "active"])) });
      } else if ((v["~"] === "list" || v["~"] === "tuple" || v["~"] === "deque") && v.v.every(isScalar)) {
        const ptrs = {}, hl = {};
        if (v["~"] !== "deque") ints.forEach((p) => { const x = val(p); if (x >= 0 && x < v.v.length) { ptrs[x] = ptrs[x] ? ptrs[x] + "," + p : p; hl[x] = "active"; } });
        pic = array(v.v.map(fmt), { label: nm, ptrs, hl, small: v.v.length > 12 });
      } else if (v["~"] === "list" && v.v.length && v.v.every((row) => row && row["~"] === "list" && row.v.every(isScalar))) {
        const m = v.v.map((row) => row.v.map(fmt)), hl = {};
        const rn = ["r", "row", "i", "nr", "rr"].find((p) => p in locals && Number.isInteger(val(p))), cn = ["c", "col", "j", "nc", "cc"].find((p) => p in locals && Number.isInteger(val(p)));
        if (rn && cn) hl[val(rn) + "," + val(cn)] = "active";
        pic = `<div class="row-label" style="width:auto">${esc(nm)}</div>` + grid(m, { hl, small: true });
      } else if (v["~"] === "ll") {
        pic = list(v.v.map(fmt), { label: nm });
      } else if (["dict", "set", "list", "deque", "tuple"].includes(v["~"])) {
        const items = v["~"] === "dict" ? v.v.map(([a, b]) => `${fmt(a)}: ${fmt(b)}`) : v.v.map(fmt);
        pic = chips(items.slice(0, 24), nm + (v["~"] === "set" ? " (set)" : v["~"] === "dict" ? " (dict)" : ""), changed(nm) ? "warm" : "");
      } else continue;
      pics += `<div class="trace-pic${changed(nm) ? " changed" : ""}">${pic}</div>`;
      count++;
    }
    // variable table
    const rows = Object.keys(locals).map((nm) => `<span class="tv${changed(nm) ? " changed" : ""}"><b>${esc(nm)}</b> = ${esc(fmt(val(nm)))}</span>`).join("");
    const where = depth > 1 && stackIdx !== null && stackIdx !== undefined
      ? `<span class="idx">call stack: <code>${esc(data.values[stackIdx])}</code></span>`
      : `<span class="idx">in <code>${esc(fn)}()</code></span>`;
    const view = code + (pics ? `<div class="trace-pics">${pics}</div>` : "") + `<div class="trace-vars">${where}${rows}</div>`;
    let note = ret !== undefined ? `<b>${esc(fn)}()</b> returns <b>${esc(fmt(data.values[ret]))}</b>` : `<b>Line ${line}:</b> <code>${esc((data.src[line - 1] || "").trim())}</code>`;
    if (ret === undefined && data.notes[line]) note += ` — ${esc(data.notes[line])}`;
    if (k === data.steps.length - 1 && data.truncated) note += ` <span class="idx">(trace stops here: the full run is longer)</span>`;
    return { view, note };
  }
  function trace(target, data) {
    const frames = data.steps.map((_, k) => traceView(data, k));
    stepper(target, { title: "Step through the solution", sub: `Running on <code>${esc(data.input)}</code> → expected <code>${esc(data.output)}</code>. Each step is about to run the highlighted line; changed values are highlighted.`, frames, speed: 900, className: "trace" });
  }
  function bootTraces() {
    document.querySelectorAll(".trace-viz").forEach((el) => {
      const src = document.getElementById(el.id + "-data");
      if (!src) return;
      let built = false;
      const build = () => { if (built) return; built = true; trace(el, JSON.parse(src.textContent)); };
      const det = el.closest("details");
      if (!det || det.open) build();
      else det.addEventListener("toggle", () => { if (det.open) build(); });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bootTraces();
    // Open a collapsed <details> solution when its #p-NNN link is followed or the page loads with that hash.
    const openTarget = () => {
      if (typeof location === "undefined" || !location.hash) return;
      const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t && t.tagName === "DETAILS") { t.open = true; t.scrollIntoView(); }
    };
    if (typeof window.addEventListener === "function") window.addEventListener("hashchange", openTarget);
    openTarget();
    document.querySelectorAll("pre > code.python, pre > code.language-python").forEach((el) => {
      el.innerHTML = highlightPython(el.textContent);
    });
    document.querySelectorAll("pre").forEach((pre) => {
      const b = document.createElement("button");
      b.className = "copy"; b.textContent = "Copy";
      b.onclick = () => {
        const text = pre.querySelector("code") ? pre.querySelector("code").textContent : pre.textContent;
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(
          () => { b.textContent = "Copied"; setTimeout(() => (b.textContent = "Copy"), 1200); },
          () => { b.textContent = "Select & ⌘C"; });
      };
      pre.appendChild(b);
    });
    // TOC scroll-spy
    const links = [...document.querySelectorAll(".toc a[href^='#']")];
    if (links.length && "IntersectionObserver" in window) {
      const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
      const io = new IntersectionObserver((ents) => ents.forEach((en) => {
        if (en.isIntersecting) { links.forEach((l) => l.classList.remove("active")); const a = map.get(en.target.id); if (a) a.classList.add("active"); }
      }), { rootMargin: "-20% 0px -70% 0px" });
      map.forEach((_, k) => { const t = document.getElementById(k); if (t) io.observe(t); });
    }
    // Quizzes: <div class="quiz-q" data-answer="Sliding Window"><p>..</p><div class="opts"><button>..</button></div><div class="why">..</div></div>
    document.querySelectorAll(".quiz-q").forEach((q) => {
      q.querySelectorAll(".opts button").forEach((b) => b.addEventListener("click", () => {
        if (q.classList.contains("answered")) return;
        q.classList.add("answered");
        const ok = b.textContent.trim() === q.dataset.answer;
        b.classList.add(ok ? "right" : "wrong");
        if (!ok) q.querySelectorAll(".opts button").forEach((x) => { if (x.textContent.trim() === q.dataset.answer) x.classList.add("right"); });
      }));
    });
  });

  window.Viz = { array, grid, stack, chips, list, tree, graph, intervals, stepper, trace, esc };
})();

// Company-lists menu in the top bar: close it on an outside click or Escape.
document.addEventListener("click", (e) => {
  document.querySelectorAll("details.navmenu[open]").forEach((d) => { if (!d.contains(e.target)) d.open = false; });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.querySelectorAll("details.navmenu[open]").forEach((d) => { d.open = false; d.querySelector("summary").focus(); });
});
