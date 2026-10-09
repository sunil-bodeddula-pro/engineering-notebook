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
    function show(k) {
      i = Math.max(0, Math.min(frames.length - 1, k));
      const f = frames[i] || {};
      stage.innerHTML = f.view || "";
      note.innerHTML = f.note || "";
      vars.innerHTML = f.vars ? Object.entries(f.vars).map(([a, b]) => `<span>${esc(a)} = ${esc(typeof b === "object" ? JSON.stringify(b) : b)}</span>`).join("") : "";
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

  document.addEventListener("DOMContentLoaded", () => {
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

  window.Viz = { array, grid, stack, chips, list, tree, graph, intervals, stepper, esc };
})();

