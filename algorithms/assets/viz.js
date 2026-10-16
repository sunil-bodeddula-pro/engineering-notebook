/* InterviewKata — tiny, dependency-free visualizer engine.
 * Works from file:// (no server, no modules, no fetch).
 *
 * Usage in a page:
 *   const frames = [];                       // build frames by running the algorithm in JS
 *   frames.push({ view: Viz.array([1,2,3], {hl:{0:'active'}, ptrs:{0:'L'}}), note: 'text', vars: {sum: 3} });
 *   Viz.stepper('#my-viz', { title: 'Demo', sub: 'what you are watching', frames });
 */
(function () {
  "use strict";
  // Lets the CSS know JavaScript is running (set while <head> is parsed, so there's no flash on load).
  document.documentElement.classList.add("js");

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

  /** Flow diagram: boxes and arrows.
   *  nodes [{id, x, y, w, h, label, sub}] (x, y = centre), edges [[from, to, label, {bend, level, levelFrom}]]
   *  opts {hl: {id: cls}, edgeHl: {"from>to": cls}, width, height, title}
   *  cls: active | found | warm | bad | dim. An "active" edge is drawn as a moving dashed line. */
  let flowSeq = 0;
  function flow(nodes, edges, opts = {}) {
    const hl = opts.hl || {}, edgeHl = opts.edgeHl || {};
    const W = opts.width || 560, H = opts.height || 260, uid = "f" + (++flowSeq);
    const by = Object.fromEntries(nodes.map((n) => [n.id, { w: 128, h: n.sub ? 52 : 40, ...n }]));
    // Where the line from a box's centre towards (tx, ty) leaves the box.
    const exit = (n, tx, ty) => {
      const dx = tx - n.x, dy = ty - n.y;
      if (!dx && !dy) return [n.x, n.y];
      const s = Math.min(Math.abs((n.w / 2 + 3) / (dx || 1e-9)), Math.abs((n.h / 2 + 3) / (dy || 1e-9)));
      return [n.x + dx * s, n.y + dy * s];
    };
    let e = "";
    edges.forEach(([a, b, label, o = {}]) => {
      // o.level: enter the target at the source's height (straight across into a tall box)
      // o.levelFrom: leave the source at the target's height (straight out of a tall box)
      const p = o.levelFrom ? { ...by[a], y: by[b].y } : by[a], q = o.level ? { ...by[b], y: by[a].y } : by[b], cls = edgeHl[a + ">" + b] || "";
      const bend = o.bend || 0;
      const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, L = Math.hypot(q.x - p.x, q.y - p.y) || 1;
      const cx = mx - ((q.y - p.y) / L) * bend, cy = my + ((q.x - p.x) / L) * bend;
      const [x1, y1] = exit(p, cx, cy), [x2, y2] = exit(q, cx, cy);
      const mk = cls === "active" ? "a" : cls === "bad" ? "b" : "n";
      const d = `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
      e += `<path class="fe ${cls}" d="${d}" marker-end="url(#${uid}-${mk})"/>`;
      // A "packet" travels along every active edge, so the eye follows the request (hidden for reduced motion).
      if (cls === "active") e += `<circle class="pk" r="4.5"><animateMotion dur="${Math.min(2.2, Math.max(0.8, L / 140)).toFixed(2)}s" repeatCount="indefinite" path="${d}"/></circle>`;
      if (label) {
        const lx = 0.25 * x1 + 0.5 * cx + 0.25 * x2, ly = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
        e += `<text class="fl ${cls}" x="${lx.toFixed(1)}" y="${(ly - 5).toFixed(1)}" text-anchor="middle">${esc(label)}</text>`;
      }
    });
    const ns = nodes.map((n0) => {
      const n = by[n0.id], cls = hl[n.id] || "";
      return `<g class="fn ${cls}"><rect x="${n.x - n.w / 2}" y="${n.y - n.h / 2}" width="${n.w}" height="${n.h}" rx="10"/>` +
        `<text x="${n.x}" y="${n.y + (n.sub ? -3 : 5)}" text-anchor="middle" class="fn-l">${esc(n.label ?? n.id)}</text>` +
        (n.sub ? `<text x="${n.x}" y="${n.y + 14}" text-anchor="middle" class="fn-s">${esc(n.sub)}</text>` : "") + `</g>`;
    }).join("");
    const marker = (k) => `<marker id="${uid}-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="fm-${k}" d="M0,0 L10,5 L0,10 z"/></marker>`;
    // Wrapped so that on narrow screens only the diagram scrolls sideways, not the text around it.
    return `<div class="flow-wrap"><svg class="flow" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="${esc(opts.title || "flow diagram")}"><defs>${marker("n")}${marker("a")}${marker("b")}</defs>${e}${ns}</svg></div>`;
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

  const reduceMotion = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  /** Update `el` to match `html` in place: unchanged nodes stay, changed attributes and text are patched.
   *  Because boxes and arrows keep their identity between frames, CSS transitions animate the change
   *  (a box fading from blue to green) instead of the whole picture jumping. Falls back to replacing
   *  a subtree whenever its shape differs. */
  function morph(el, html) {
    const t = document.createElement(el.tagName === "svg" ? "svg" : "div");
    t.innerHTML = html;
    patchKids(el, t);
  }
  function patchKids(a, b) {
    const ac = a.childNodes, bc = [...b.childNodes];
    if (ac.length !== bc.length) { a.replaceChildren(...bc); return; }
    for (let k = 0; k < bc.length; k++) patchNode(ac[k], bc[k]);
  }
  function patchNode(x, y) {
    if (x.nodeType !== y.nodeType || x.nodeName !== y.nodeName) { x.replaceWith(y); return; }
    if (x.nodeType === 3) { if (x.nodeValue !== y.nodeValue) x.nodeValue = y.nodeValue; return; }
    if (x.nodeType !== 1) return;
    if (x.nodeName === "animateMotion" || x.nodeName === "circle" && x.classList.contains("pk")) {
      // restart a packet only if its route changed
      if (x.outerHTML !== y.outerHTML) x.replaceWith(y);
      return;
    }
    for (const at of [...x.attributes]) if (!y.hasAttribute(at.name)) x.removeAttribute(at.name);
    for (const at of [...y.attributes]) if (x.getAttribute(at.name) !== at.value) x.setAttribute(at.name, at.value);
    patchKids(x, y);
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
      const prev = i;
      i = Math.max(0, Math.min(frames.length - 1, k));
      const f = frames[i] || {};
      morph(stage, f.view || "");
      if (note.innerHTML !== (f.note || "")) {
        note.innerHTML = f.note || "";
        if (prev !== i && note.animate && !reduceMotion()) note.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 260, easing: "ease-out" });
      }
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

  /* ---------- page helpers: code highlighting (Python, TypeScript, Java), copy buttons, TOC, quiz ---------- */
  const SYNTAX = {
    py: {
      kw: /\b(def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|class|import|from|as|with|lambda|yield|break|continue|pass|try|except|finally|raise|global|nonlocal|self)\b/g,
      com: /(#[^\n]*)/g,
      str: /("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\n]*"|'[^'\n]*')/g,
    },
    ts: {
      kw: /\b(function|return|if|else|for|while|do|of|in|const|let|var|new|class|constructor|this|null|undefined|true|false|break|continue|private|public|readonly|static|typeof|instanceof|switch|case|default|throw|try|catch|finally|extends|implements|interface|type|as)\b/g,
      com: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
      str: /("[^"\n]*"|'[^'\n]*'|`[^`]*`)/g,
    },
    java: {
      kw: /\b(class|public|private|protected|static|final|void|int|long|double|float|boolean|char|byte|short|return|if|else|for|while|do|new|this|null|true|false|break|continue|switch|case|default|throw|throws|try|catch|finally|extends|implements|interface|var|import|instanceof|record)\b/g,
      com: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
      str: /("[^"\n]*"|'(?:\\.|[^'\\\n])')/g,
    },
  };
  function highlight(code, lang) {
    const S = SYNTAX[lang] || SYNTAX.py;
    const tokens = [];
    // Placeholders use Private-Use-Area characters (no digits/letters), so later
    // regexes (numbers, identifiers) can never match inside an already-highlighted token.
    const stash = (cls, s) => { tokens.push(`<span class="${cls}">${s}</span>`); return "\uE000" + String.fromCharCode(0xE100 + tokens.length - 1) + "\uE001"; };
    let s = esc(code);
    s = s.replace(S.com, (m) => stash("com", m));
    s = s.replace(S.str, (m) => stash("str", m));
    s = s.replace(S.kw, (m) => stash("kw", m));
    s = s.replace(/\b([A-Za-z_]\w*)(?=\()/g, (m) => stash("fn", m));
    s = s.replace(/\b(\d[\d_]*n?L?)\b/g, (m) => stash("num", m));
    return s.replace(/\uE000([\s\S])\uE001/g, (_, ch) => tokens[ch.charCodeAt(0) - 0xE100]);
  }
  const highlightPython = (code) => highlight(code, "py");

  /* ---------- traced step-through: replays a recorded run of a problem's solution ---------- */
  // data: {lang?, src:[lines], notes:{line:text}, input, output, values:[...], steps:[[line, depth, fn, {var: valueIdx}, retIdx?]], truncated}
  // lang is "py" (the default), "ts" or "java"; values are shown in that language's notation.
  const PTR = /^(i|j|k|l|r|lo|hi|mid|left|right|start|end|read|write|slow|fast|low|high|pos|i1|i2|j1|j2)$|idx|index|ptr|Idx$|Index$|Ptr$|^(left|right|start|end)_|^(left|right|start|end)[A-Z]|_(i|j)$/;
  const isScalar = (v) => v === null || typeof v !== "object" || v["~"] === "num" || v["~"] === "char";
  const fmtIn = (v, L) => {
    const py = L === "py";
    if (v === null) return py ? "None" : "null";
    if (typeof v === "boolean") return py ? (v ? "True" : "False") : String(v);
    if (typeof v === "string") return JSON.stringify(v);
    if (typeof v !== "object") return String(v);
    const t = v["~"], items = v.v, f = (x) => fmtIn(x, L);
    if (t === "num" || t === "obj") return String(items);
    if (t === "char") return `'${items}'`;
    if (t === "node") return `Node(${f(items)})`;
    if (t === "ll") return items.map(f).join(" → ") + (v.cycle ? " → …(cycle)" : py ? " → None" : " → null");
    if (t === "dict") {
      const arrow = L === "java" ? "=" : L === "ts" && v.t === "Map" ? " => " : ": ";
      const body = items.map(([k, x]) => `${f(k)}${arrow}${f(x)}`).join(", ");
      return (L === "ts" && v.t === "Map" ? "Map " : "") + "{" + body + "}";
    }
    const inner = items.map(f).join(", ") + (v.more ? `, …+${v.more}` : "");
    if (t === "set") return py ? (items.length ? "{" + inner + "}" : "set()") : L === "ts" ? "Set {" + inner + "}" : "[" + inner + "]";
    if (t === "tuple") return "(" + inner + ")";
    if (t === "deque") return py ? "deque([" + inner + "])" : "[" + inner + "]";
    return "[" + inner + "]";
  };
  function traceView(data, k) {
    const L = data.lang || "py";
    const fmt = (v) => fmtIn(v, L);
    const step = data.steps[k], prev = k > 0 ? data.steps[k - 1] : null;
    const [line, depth, fn, locals, stackIdx, ret] = step;
    const val = (name) => data.values[locals[name]];
    const changed = (name) => !prev || prev[1] !== depth || prev[3][name] !== locals[name];
    // code window: always 7 lines (slid inside the source near its ends), so its height never changes
    const WIN = 7, lo = Math.max(1, Math.min(line - 3, data.src.length - WIN + 1));
    let code = `<div class="trace-code">`;
    for (let n = lo; n < lo + WIN; n++) {
      code += n <= data.src.length
        ? `<div class="tl${n === line ? " cur" : ""}"><span class="ln">${n}</span>${highlight(data.src[n - 1] || " ", L)}</div>`
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
        const arrow = L === "java" ? "=" : L === "ts" && v.t === "Map" ? " => " : ": ";
        const items = v["~"] === "dict" ? v.v.map(([a, b]) => `${fmt(a)}${arrow}${fmt(b)}`) : v.v.map(fmt);
        const kind = v.t ? ` (${v.t})` : v["~"] === "set" ? " (set)" : v["~"] === "dict" ? " (dict)" : "";
        pic = chips(items.slice(0, 24), nm + kind, changed(nm) ? "warm" : "");
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
    const rv = ret !== undefined ? data.values[ret] : undefined;
    const isVoid = rv && rv["~"] === "obj" && rv.v === "void";
    let note = ret !== undefined ? (isVoid ? `<b>${esc(fn)}()</b> finishes` : `<b>${esc(fn)}()</b> returns <b>${esc(fmt(rv))}</b>`) : `<b>Line ${line}:</b> <code>${esc((data.src[line - 1] || "").trim())}</code>`;
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
      // Built only once it can be seen: its problem is open and its language tab is selected.
      const det = el.closest("details");
      const build = () => {
        if (built || el.closest(".code-pane[hidden]") || (det && !det.open)) return;
        built = true;
        trace(el, JSON.parse(src.textContent));
      };
      el._build = build;
      if (det) det.addEventListener("toggle", build);
      build();
    });
  }

  /* ---------- solution language tabs: Python / TypeScript / Java ---------- */
  // Pages carry the other languages in a hidden <div class="lang-alts"> right after the Python solution
  // (and its player). The tabs are built here; the choice applies to every problem and is remembered.
  const LANG_NAME = { py: "Python", ts: "TypeScript", java: "Java" };
  function bootCodeTabs() {
    const groups = [];
    document.querySelectorAll(".lang-alts").forEach((alts) => {
      let el = alts.previousElementSibling, pyPre = null;
      const pyParts = [];
      while (el) {   // walk back over the Python player to the Python <pre>
        if (el.matches("pre") && el.querySelector("code.python")) { pyPre = el; break; }
        if (!el.matches(".trace-viz, script[type='application/json']")) break;
        pyParts.unshift(el);
        el = el.previousElementSibling;
      }
      if (!pyPre) return;
      const wrap = document.createElement("div");
      wrap.className = "code-tabs";
      const bar = document.createElement("div");
      bar.className = "code-tabbar";
      bar.setAttribute("role", "tablist");
      bar.setAttribute("aria-label", "Solution language");
      wrap.appendChild(bar);
      pyPre.parentNode.insertBefore(wrap, pyPre);
      const py = document.createElement("div");
      py.className = "code-pane";
      py.dataset.lang = "py";
      [pyPre, ...pyParts].forEach((n) => py.appendChild(n));
      const panes = { py };
      wrap.appendChild(py);
      alts.querySelectorAll(":scope > .lang-alt").forEach((a) => { a.classList.add("code-pane"); panes[a.dataset.lang] = a; wrap.appendChild(a); });
      alts.remove();
      Object.keys(panes).forEach((l) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.dataset.lang = l;
        b.textContent = LANG_NAME[l] || l;
        bar.appendChild(b);
      });
      groups.push({ bar, panes });
    });
    if (!groups.length) return;
    const apply = (lang) => groups.forEach((g) => {
      const l = g.panes[lang] ? lang : "py";
      Object.entries(g.panes).forEach(([k, p]) => { p.hidden = k !== l; });
      g.bar.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.lang === l)));
      const tv = g.panes[l].querySelector(".trace-viz");
      if (tv && tv._build) tv._build();
    });
    let saved = "py";
    try { saved = localStorage.getItem("ik-code-lang") || "py"; } catch (e) { /* storage unavailable */ }
    groups.forEach((g) => g.bar.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      try { localStorage.setItem("ik-code-lang", b.dataset.lang); } catch (err) { /* storage unavailable */ }
      // other problems change height too: keep the clicked tab bar still on screen
      const before = g.bar.getBoundingClientRect().top;
      apply(b.dataset.lang);
      window.scrollBy(0, g.bar.getBoundingClientRect().top - before);
    }));
    apply(saved);
  }

  /* ---------- glossary: jargon gets a dotted underline and a short definition on hover / tap ---------- */
  // [term, other spellings, definition, track]. The first spelling is the glossary heading.
  // track: omitted = the coding pages; "ai" = the AI engineering pages (<body data-track="ai">);
  // "system-design" = the System design pages (<body data-track="system-design">).
  const GLOSSARY = [
    ["Adjacency list", ["adjacency lists"], "A graph stored as a dict or list of lists: graph[u] holds u's neighbours."],
    ["Amortised", ["amortized"], "Averaged over many operations. One call can be slow, but the total over n calls is still small: list.append is amortised O(1)."],
    ["Anagram", [], "The same letters in a different order, like \"listen\" and \"silent\"."],
    ["Backtracking", [], "Build an answer one choice at a time; when a choice leads nowhere, undo it and try the next one."],
    ["Base case", [], "The smallest input a recursive function answers directly, without calling itself. It is what stops the recursion."],
    ["BFS", ["breadth-first search"], "Breadth-first search: explore a graph level by level with a queue. Finds shortest paths when every step costs the same."],
    ["Big-O", ["time complexity"], "How the running time grows with the input size n. O(n): double n, double the time. O(n²): double n, four times the time."],
    ["Binary search", [], "Find a target in sorted data by checking the middle and throwing away half each step: O(log n)."],
    ["Binary search tree", ["BST"], "A binary tree where everything left of a node is smaller and everything right is larger, so an in-order walk is sorted."],
    ["Binary tree", [], "A tree where every node has at most two children, left and right. The top node is the root."],
    ["Bitmask", [], "An integer whose bits record which items are chosen: 0b101 means items 0 and 2."],
    ["Brute force", ["brute-force"], "The obvious solution that tries every possibility. Usually too slow, but the right place to start and then improve."],
    ["Call stack", [], "The stack of function calls still waiting to finish. Each recursive call adds a frame on top."],
    ["Combination", [], "A selection where order doesn't matter: {1, 2} and {2, 1} are the same combination."],
    ["Connected component", ["component"], "A group of nodes that can all reach each other. A graph with no edges has one component per node."],
    ["Contiguous", [], "Next to each other, with no gaps."],
    ["Cycle", [], "A path in a graph or linked list that comes back to where it started."],
    ["DAG", ["directed acyclic graph"], "Directed acyclic graph: one-way edges and no cycles, like course prerequisites."],
    ["Deque", [], "Double-ended queue: O(1) adding and removing at both ends. collections.deque in Python."],
    ["DFS", ["depth-first search"], "Depth-first search: follow one path as deep as it goes before backing up. Written with recursion or a stack."],
    ["Dijkstra's algorithm", ["Dijkstra"], "Shortest paths when edge weights are never negative: always expand the closest unvisited node next, using a heap."],
    ["Dummy node", ["dummy head", "sentinel"], "A fake extra node or value placed at the edge (like a dummy head before a list) so the first and last items need no special case."],
    ["Edge", [], "A connection between two nodes. Directed edges go one way; weighted edges have a cost."],
    ["Edge case", [], "An unusual input that often breaks code: empty input, one element, all values equal, negatives, huge numbers."],
    ["Greedy", [], "Take the locally best choice at every step and never undo it. Only correct when you can argue it never hurts."],
    ["Hash map", ["hash table"], "Stores key → value pairs with O(1) average lookup, insert and delete. Python's dict."],
    ["Hash set", [], "Stores unique values with O(1) average membership tests. Python's set."],
    ["Heap", ["min-heap", "max-heap", "priority queue"], "Gives the smallest item in O(1) and adds or removes in O(log n). Python's heapq is a min-heap; store negatives for a max-heap."],
    ["Immutable", [], "Can't be changed after it's created. Python strings and tuples are immutable, so s += c builds a whole new string."],
    ["In-degree", ["indegree"], "How many edges point into a node, e.g. how many prerequisites a course still has."],
    ["In-place", [], "Changing the input itself instead of building a copy, so the extra memory is O(1)."],
    ["Interval", [], "A range with a start and an end, like [2, 5]."],
    ["Invariant", [], "A fact your loop keeps true at every step, e.g. \"everything left of i is already processed\". It's how you know the code is right."],
    ["Leaf", ["leaf node"], "A tree node with no children."],
    ["Lexicographic", ["lexicographically", "lexicographical"], "Dictionary order: compare character by character, the way words are sorted in a dictionary."],
    ["Linked list", [], "Nodes that each hold a value and a pointer to the next node. Cheap to insert or remove, but no jumping straight to index i."],
    ["Memoization", ["memoisation", "memoize", "memoise", "memoized", "memoised"], "Caching a function's answer for each input so repeated calls are instant (@cache in Python). Top-down dynamic programming."],
    ["Minimum spanning tree", ["MST"], "The cheapest set of edges that connects every node without making a cycle."],
    ["Modulo", [], "The remainder after division: 17 % 5 = 2. \"Return it modulo 10⁹+7\" just keeps huge answers small."],
    ["Monotonic", [], "Only ever moving one way: always increasing, or always decreasing."],
    ["Node", [], "One element of a linked list, tree or graph."],
    ["Off-by-one", [], "A bug where a loop or index goes one step too far or stops one step short."],
    ["Overlapping subproblems", ["subproblem"], "Smaller versions of the same problem that get solved again and again. That repetition is what dynamic programming removes."],
    ["Palindrome", [], "Reads the same forwards and backwards, like \"racecar\"."],
    ["Permutation", [], "An ordering of all the items. [1, 2, 3] has 6 permutations."],
    ["Pointer", [], "A variable that marks a position, like an index i or a reference to a node. Moving pointers avoids restarting loops."],
    ["Prefix sum", [], "A running total: prefix[i] is the sum of the first i values, so any range sum is prefix[r] − prefix[l]."],
    ["Pruning", [], "Skipping parts of a search that can't lead to a valid or better answer."],
    ["Queue", [], "First in, first out, like a line at a shop. Use collections.deque: append to join, popleft to leave."],
    ["Recursion", ["recursive", "recursively"], "A function that calls itself on a smaller version of the same problem until it reaches a base case."],
    ["Segment tree", ["Fenwick tree", "binary indexed tree"], "A tree built over an array that answers range questions (like range sums) and handles updates, both in O(log n)."],
    ["Sliding window", [], "A range [left, right] that moves along an array: grow on the right, shrink on the left, never start over."],
    ["Space complexity", [], "How much extra memory the solution needs as n grows, not counting the input itself."],
    ["Stack", [], "Last in, first out, like a pile of plates. A Python list with append and pop."],
    ["Subarray", ["substring"], "A contiguous slice: [2, 3] is a subarray of [1, 2, 3, 4], but [1, 3] is not."],
    ["Subsequence", [], "Items kept in their original order, with gaps allowed: [1, 3] is a subsequence of [1, 2, 3, 4]."],
    ["Subtree", [], "A node together with everything below it."],
    ["Topological sort", ["topological order"], "An order of a directed graph's nodes in which every edge points forward, like taking courses after their prerequisites."],
    ["Trie", ["prefix tree"], "A tree of characters where each path from the root spells a prefix. Fast for \"does any word start with…\" questions."],
    ["Union-find", ["disjoint set", "DSU"], "Tracks groups that only ever merge: find(x) names x's group, union(a, b) merges two groups. Nearly O(1) each."],
    ["XOR", [], "Bitwise \"exclusive or\": a bit is 1 when the two bits differ. x ^ x = 0 and x ^ 0 = x, so equal values cancel."],
    // ----- AI engineering track -----
    ["Token", ["tokens"], "A chunk of text a model reads or writes: a word, part of a word, or punctuation. Prices, speed and limits are all counted in tokens.", "ai"],
    ["Tokenizer", [], "The fixed lookup that splits text into tokens and back. Each model family has its own, so the same text can be a different number of tokens.", "ai"],
    ["Large language model", ["LLM"], "A neural network trained on huge amounts of text to predict the next token. ChatGPT, Claude and Gemini are built on them.", "ai"],
    ["Next-token prediction", [], "What an LLM does at every step: score every possible next token, pick one, append it, and repeat.", "ai"],
    ["Temperature", [], "A setting that controls randomness when picking the next token: low = predictable, high = more varied.", "ai"],
    ["Sampling", [], "Choosing the next token from the model's probabilities instead of always taking the top one. It's why answers vary between runs.", "ai"],
    ["Context window", ["context windows"], "The maximum amount of text (in tokens) a model can see at once: instructions, conversation, files and tool results together.", "ai"],
    ["Context rot", [], "The measured drop in a model's accuracy as its input gets longer, well before the context window is full.", "ai"],
    ["Compaction", [], "Replacing a long conversation with a short summary so the work can continue with free context space.", "ai"],
    ["Context engineering", [], "Deciding exactly what goes into the context window (instructions, files, tools, history) so the model has what it needs and nothing else.", "ai"],
    ["System prompt", [], "Instructions placed before the conversation that set the model's role and rules for the whole session.", "ai"],
    ["Prompt", ["prompts"], "The text you send to a model: your request plus any instructions and data that go with it.", "ai"],
    ["Pretraining", ["pre-training"], "The first, biggest training stage: the model learns language and facts by predicting the next token across a huge text collection.", "ai"],
    ["Post-training", ["fine-tuning"], "Training after pretraining that turns a text predictor into a helpful assistant: worked examples, human feedback and reinforcement learning.", "ai"],
    ["RLHF", ["reinforcement learning from human feedback"], "Reinforcement learning from human feedback: people rank answers and the model is trained to prefer the higher-ranked ones.", "ai"],
    ["Weights", ["parameters"], "The billions of numbers inside a model, set during training. They are its long-term 'memory'; your chat doesn't change them.", "ai"],
    ["Knowledge cutoff", ["training cutoff"], "The date the model's training data ends. It knows nothing after it unless you give it that information.", "ai"],
    ["Hallucination", ["hallucinate"], "A fluent, confident answer that is wrong or made up. It happens because the model produces what is plausible, not what is checked.", "ai"],
    ["Grounding", ["grounded"], "Giving the model real sources (documents, search results, tool output) and asking it to answer from them, so answers can be checked.", "ai"],
    ["Inference", [], "Running a trained model to get an answer. Every API call is inference; training is the expensive part done beforehand.", "ai"],
    ["Reasoning tokens", ["thinking tokens"], "Tokens a model writes while 'thinking' before its final answer. You usually pay for them at the output price, even when you don't see them.", "ai"],
    ["Effort", ["reasoning effort", "thinking level"], "A setting for how much a model may think before answering: more effort is slower and costs more, but helps on hard problems.", "ai"],
    ["Model tier", ["model tiers"], "The size class of a model in a family: small and fast, balanced, or frontier. Picking the tier is mostly a cost and speed decision.", "ai"],
    ["Frontier model", ["frontier models"], "A vendor's most capable (and most expensive) model at the time.", "ai"],
    ["Latency", [], "How long you wait for a response. Longer prompts, longer answers and more thinking all add latency.", "ai"],
    ["Prompt caching", ["cache read", "cached input"], "Reusing the processed start of a prompt that hasn't changed, billed at a fraction of the normal input price.", "ai"],
    ["Batch API", ["batch mode"], "Sending many requests to be processed within hours instead of seconds, usually at half price.", "ai"],
    ["Multimodal", [], "Able to take more than text as input, such as images, audio or PDFs.", "ai"],
    ["Embedding", ["embeddings"], "A list of numbers that represents the meaning of a piece of text, so similar meanings end up close together.", "ai"],
    ["RAG", ["retrieval-augmented generation"], "Retrieval-augmented generation: search your documents first, then give the best matches to the model to answer from.", "ai"],
    ["Tool call", ["tool calls", "function calling", "tool use"], "The model asking the program around it to run something (read a file, search, call an API) and send back the result.", "ai"],
    ["Agent", ["agents", "agentic"], "A model in a loop: plan, call a tool, read the result, decide the next step, until the task is done.", "ai"],
    ["MCP", ["Model Context Protocol"], "Model Context Protocol: an open standard for plugging tools and data sources into any AI app or agent.", "ai"],
    ["AGENTS.md", [], "An open-standard Markdown file in a repo that tells coding agents its commands, layout and rules.", "ai"],
    ["Agent Skills", ["SKILL.md"], "An open standard for packaging task know-how as a folder with a SKILL.md file, loaded only when a task needs it.", "ai"],
    ["Subagent", ["subagents"], "A helper agent with its own fresh context, given one sub-task, that reports back only a summary.", "ai"],
    ["Eval", ["evals"], "A repeatable test set for an AI feature: inputs plus a way to judge the outputs, run whenever the prompt or model changes.", "ai"],
    ["Benchmark", ["benchmarks"], "A public test set used to compare models. Useful for shortlisting, but your own evals decide.", "ai"],
    ["Prompt injection", [], "Instructions hidden in content the model reads (a web page, file or email) that hijack it into doing something you didn't ask.", "ai"],
    ["API", ["APIs"], "Application programming interface: how a program calls a service. Model APIs take your prompt and return the model's reply.", "ai"],
    ["LLM-as-judge", ["LLM judge", "model-based grader"], "Using a model, with a precise pass/fail rubric, to grade another model's outputs. It must be checked against human labels first.", "ai"],
    ["Error analysis", [], "Reading real outputs one by one, noting what went wrong, and grouping the notes into failure types. The first step of any eval.", "ai"],
    ["Lethal trifecta", [], "Private data + untrusted content + a way to send data out. An agent with all three can be tricked into leaking; remove one.", "ai"],
    ["Sandbox", ["sandboxed", "sandboxing"], "An operating-system boundary around the commands an agent runs, limiting which files and network hosts they can reach.", "ai"],
    ["Trace", ["traces", "tracing"], "The recorded steps of one request or agent run: each model call and tool call, with inputs, outputs, tokens, cost and time.", "ai"],
    ["OpenTelemetry", ["OTel"], "The open standard for traces, metrics and logs. Its GenAI conventions name fields such as the model and token counts.", "ai"],
    ["Model routing", ["router"], "Sending each request to the cheapest model that handles it well, and only the hard ones to a stronger model.", "ai"],
    ["Time to first token", ["TTFT"], "How long until the first words of a reply arrive. With streaming, it's the delay a user actually feels.", "ai"],
    ["Client", ["clients"], "The program that starts a request: a browser, a phone app, or another service calling yours.", "system-design"],
    ["Server", ["servers"], "A program (and the machine it runs on) that waits for requests and answers them.", "system-design"],
    ["DNS", ["domain name system"], "The internet's phone book: turns a name like example.com into the IP address of a server.", "system-design"],
    ["IP address", ["IP addresses"], "The number that identifies a machine on a network, like a postal address for packets.", "system-design"],
    ["TCP", [], "The transport protocol that gives a reliable, ordered stream of bytes between two machines. Most web traffic runs on it.", "system-design"],
    ["TLS", ["HTTPS"], "The encryption layer that keeps traffic private and proves the server's identity. HTTPS is HTTP over TLS.", "system-design"],
    ["HTTP", [], "The request/response protocol of the web: a method (GET, POST…), a path, headers and an optional body; the server replies with a status code.", "system-design"],
    ["Round-trip time", ["RTT", "round trip"], "The time for a message to reach the other side and a reply to come back. Every handshake costs at least one.", "system-design"],
    ["Latency", ["latencies"], "How long one request takes, from sending it to getting the answer. Measured in milliseconds.", "system-design"],
    ["Throughput", [], "How much work a system finishes per second: requests per second, messages per second, megabytes per second.", "system-design"],
    ["Bandwidth", [], "The maximum data a link can carry per second, like the width of a pipe. Different from latency, which is how long the pipe is.", "system-design"],
    ["Percentile", ["percentiles", "p50", "p95", "p99", "p999"], "p99 = 99% of requests are faster than this value. Percentiles show the slow tail that an average hides.", "system-design"],
    ["Tail latency", [], "The latency of the slowest requests (p99 and beyond). It's what your unluckiest users feel, and fan-out makes it common.", "system-design"],
    ["QPS", ["RPS", "requests per second", "queries per second"], "Requests (or queries) per second: the standard unit of load on a service.", "system-design"],
    ["Load balancer", ["load balancers"], "A component that spreads incoming requests across several servers and stops sending to ones that fail health checks.", "system-design"],
    ["CDN", ["content delivery network"], "A network of servers close to users that keeps copies of content (images, video, pages), so requests don't travel to your origin.", "system-design"],
    ["Cache", ["caches", "caching"], "A fast store holding copies of data that is expensive to fetch or compute, so repeat reads are quick.", "system-design"],
    ["Database", ["databases"], "The system that stores your data durably and answers queries about it. Usually the source of truth.", "system-design"],
    ["Message queue", ["message queues"], "A buffer where producers drop work and consumers pick it up later, so the two don't have to run at the same speed.", "system-design"],
    ["Stateless", [], "A server that keeps no per-user data between requests, so any copy can answer any request. The key to scaling out.", "system-design"],
    ["Horizontal scaling", ["scale out", "scaling out"], "Adding more machines and spreading the load. Opposite of vertical scaling, which means a bigger machine.", "system-design"],
    ["Vertical scaling", ["scale up", "scaling up"], "Moving to a bigger machine (more CPU, memory, disk). Simple, but there is a ceiling and one box is one failure.", "system-design"],
    ["Replica", ["replicas", "replication"], "A copy of data kept on another machine, for surviving failures and for serving more reads.", "system-design"],
    ["Shard", ["shards", "sharding"], "One piece of a dataset that has been split across machines, each holding part of the rows.", "system-design"],
    ["Availability", [], "The fraction of time a system answers correctly, often written in nines: 99.9% allows about 8.8 hours of downtime a year.", "system-design"],
    ["Durability", [], "The promise that data you were told is saved won't be lost, even when disks or machines fail.", "system-design"],
    ["Single point of failure", ["SPOF"], "One component whose failure takes the whole system down, because nothing else can do its job.", "system-design"],
    ["Redundancy", ["redundant"], "Running spare copies of a component so that one can fail without an outage.", "system-design"],
    ["Failover", [], "Switching traffic from a failed component to its standby, automatically or by hand.", "system-design"],
    ["SLI", ["service level indicator"], "A measured number that describes service health, such as the share of requests answered in under 300 ms.", "system-design"],
    ["SLO", ["SLOs", "service level objective"], "Your target for an SLI over a period, such as 99.9% of requests succeed each 30 days.", "system-design"],
    ["SLA", ["service level agreement"], "A contract with customers that promises a level of service and says what happens (usually credits) if you miss it.", "system-design"],
    ["Error budget", ["error budgets"], "The failures your SLO still allows. A 99.9% SLO leaves a 0.1% budget to spend on deploys, experiments and bad luck.", "system-design"],
    ["Availability zone", ["availability zones", "AZ", "AZs"], "One or more data centres in a cloud region with separate power and networking, so they rarely fail together.", "system-design"],
    ["Daily active users", ["DAU", "monthly active users", "MAU"], "How many distinct people use a product in a day (DAU) or a month (MAU): the usual starting number for an estimate.", "system-design"],
    ["Back-of-the-envelope estimate", ["back-of-the-envelope"], "A quick calculation with rounded numbers to see whether a design is in the right ballpark.", "system-design"],
    ["Little's Law", [], "Items in a system = arrival rate × time each spends inside. Ties together concurrency, throughput and latency.", "system-design"],
    ["Utilization", [], "The fraction of time a resource is busy. As it nears 100%, queues and waiting time grow very fast.", "system-design"],
    ["Functional requirement", ["functional requirements"], "What the system must do for users, such as “users can shorten a link”.", "system-design"],
    ["Non-functional requirement", ["non-functional requirements", "NFR", "NFRs"], "How well it must do it: latency, availability, scale, consistency, durability, security.", "system-design"],
    ["API", ["APIs"], "The contract a service offers: which requests it accepts and what it returns.", "system-design"],
    ["Idempotent", ["idempotency"], "An operation you can safely repeat: doing it twice has the same effect as once. Essential for retries.", "system-design"],
    ["Strong consistency", ["eventual consistency", "eventually consistent", "strongly consistent"], "Strong: every read sees the latest write. Eventual: replicas may lag briefly, but they converge.", "system-design"],
    ["Trade-off", ["trade-offs"], "Gaining one property by giving up another, such as speed for freshness. Every design decision is one.", "system-design"],
    ["Timeout", ["timeouts"], "The longest a caller will wait for a response before giving up and freeing its resources.", "system-design"],
    ["Exponential backoff", ["backoff"], "Waiting longer after each failed attempt (100 ms, 200, 400…) so retries thin out.", "system-design"],
    ["Jitter", [], "Randomness added to retry delays so many clients don't retry at the same moments.", "system-design"],
    ["Retry budget", [], "A cap on retries as a share of normal traffic, so retries can't multiply load during an outage.", "system-design"],
    ["Circuit breaker", ["circuit breakers"], "A guard that stops calling a failing dependency for a while, failing fast instead, then tests recovery.", "system-design"],
    ["Bulkhead", ["bulkheads"], "Separate resource pools per dependency, so one slow dependency can't exhaust everything.", "system-design"],
    ["Rate limiting", ["rate limit", "rate limits", "rate limiter"], "Capping how many requests a client may make in a period, usually answering 429 beyond it.", "system-design"],
    ["Token bucket", [], "A rate limiter that allows bursts up to a bucket size and refills at a steady rate.", "system-design"],
    ["Load shedding", [], "Rejecting some work early when overloaded so the rest still succeeds.", "system-design"],
    ["Graceful degradation", ["degrade gracefully"], "Serving a reduced but useful response when part of the system is unavailable.", "system-design"],
    ["Cascading failure", ["cascading failures"], "One failing component overloading the next, and so on, until much of the system is down.", "system-design"],
    ["Metastable failure", [], "A system stuck in overload after the original cause is gone, kept there by retries and wasted work.", "system-design"],
    ["Chaos engineering", [], "Deliberately injecting failures, carefully, to prove the system copes.", "system-design"],
    ["Span", ["spans"], "One timed step in a trace, such as a service handling a request or a database query.", "system-design"],
    ["Burn rate", ["burn rates"], "How fast the error budget is being used, relative to spending it exactly over the SLO period.", "system-design"],
    ["Cardinality", [], "The number of distinct label combinations a metric has; each is a separate time series.", "system-design"],
    ["RED method", ["RED"], "Per-service metrics: rate, errors and duration.", "system-design"],
    ["USE method", [], "Per-resource metrics: utilization, saturation and errors.", "system-design"],
    ["Authentication", ["AuthN"], "Proving who a user or service is.", "system-design"],
    ["Authorization", ["AuthZ"], "Deciding what an authenticated user or service may do with a specific resource.", "system-design"],
    ["JWT", ["JWTs", "JSON Web Token"], "A signed token carrying claims (user, roles, expiry) that services can verify without a database lookup.", "system-design"],
    ["OAuth 2.0", ["OAuth"], "A standard for granting an app limited access on a user's behalf without sharing their password.", "system-design"],
    ["OpenID Connect", ["OIDC"], "An identity layer on top of OAuth 2.0, behind “Sign in with…” and single sign-on.", "system-design"],
    ["PKCE", [], "Proof Key for Code Exchange: ties an OAuth authorization code to the app that requested it.", "system-design"],
    ["RBAC", ["role-based access control"], "Permissions granted to roles, and roles granted to users.", "system-design"],
    ["Mutual TLS", ["mTLS"], "TLS where both sides present certificates, so services authenticate each other.", "system-design"],
    ["Secrets manager", ["secrets management"], "A service that stores, rotates and hands out credentials at run time, such as Vault.", "system-design"],
    ["KMS", ["key management service", "envelope encryption"], "A service that holds encryption keys and performs operations with them, so keys never leave it.", "system-design"],
    ["Row-level security", ["RLS"], "Database policies that limit which rows each user or tenant can see, enforced by the database itself.", "system-design"],
    ["Multi-tenancy", ["multi-tenant", "tenant", "tenants"], "Serving many customers (tenants) from shared infrastructure while keeping their data separate.", "system-design"],
    ["Prompt injection", [], "Instructions hidden in content an AI model reads, which can make it act against the user or system.", "system-design"],
    ["Container", ["containers"], "A packaged app with its dependencies that runs the same way everywhere.", "system-design"],
    ["Kubernetes", [], "The common platform for running, scaling and updating containers across a cluster of machines.", "system-design"],
    ["Infrastructure as code", ["IaC"], "Defining servers, networks and permissions in versioned files instead of by hand.", "system-design"],
    ["Canary release", ["canary", "canaries"], "Releasing a new version to a small share of traffic first, and rolling back automatically if metrics degrade.", "system-design"],
    ["Blue-green deployment", ["blue-green"], "Running the new version beside the old and switching traffic in one step, with instant switch-back.", "system-design"],
    ["Feature flag", ["feature flags", "feature toggle"], "A runtime switch that turns code paths on or off without a deploy.", "system-design"],
    ["RPO", ["recovery point objective"], "How much data (measured in time) you can afford to lose in a disaster.", "system-design"],
    ["RTO", ["recovery time objective"], "How long you can afford to be down before service is restored.", "system-design"],
    ["Active-active", [], "Several regions serving traffic at the same time, each able to take over for the others.", "system-design"],
    ["Monolith", ["monoliths", "modular monolith"], "An application deployed as one unit; a modular monolith keeps strict internal boundaries.", "system-design"],
    ["Microservices", ["microservice"], "Many small, independently deployed services, each owning its data.", "system-design"],
    ["Distributed monolith", [], "Services so tightly coupled they must be deployed and run together: the costs of both styles.", "system-design"],
    ["Strangler fig", [], "Migrating a system piece by piece by routing parts of it to new code until the old can be removed.", "system-design"],
    ["Cell-based architecture", ["cell-based"], "Many independent copies of the full stack, each serving some customers, so failures stay contained.", "system-design"],
    ["Architecture decision record", ["ADR", "ADRs"], "A short, numbered document recording one important decision, its context and its consequences.", "system-design"],
    ["Retrieval-augmented generation", ["RAG"], "Answering with a language model after retrieving relevant documents and adding them to the prompt.", "system-design"],
    ["Embedding", ["embeddings"], "A list of numbers representing the meaning of text, so similar meanings are close together.", "system-design"],
    ["KV cache", [], "Memory a language model keeps for the tokens it has processed, which grows with context and concurrent requests.", "system-design"],
    ["Continuous batching", [], "Adding new requests to a GPU's running batch as others finish, to keep the GPU busy.", "system-design"],
    ["Prompt caching", [], "Reusing the processed form of a repeated prompt prefix to cut cost and time to first token.", "system-design"],
    ["Time to first token", ["TTFT"], "How long until the first words of a model's answer arrive.", "system-design"],
    ["Model routing", [], "Sending each request to the cheapest model that handles it well.", "system-design"],
    ["Agent", ["agents", "AI agent"], "A language model in a loop that calls tools, sees the results and decides the next step.", "system-design"],
    ["MCP", ["Model Context Protocol"], "An open standard for connecting AI applications to tools and data sources.", "system-design"],
    ["Producer", ["producers"], "A service that sends messages or events to a queue or log.", "system-design"],
    ["Consumer", ["consumers"], "A service that receives and processes messages from a queue or log.", "system-design"],
    ["Consumer group", ["consumer groups"], "A set of consumers sharing a topic's partitions, so each message is processed by one member of the group.", "system-design"],
    ["At-least-once", ["at-least-once delivery"], "Messages are never lost but may be delivered more than once, so processing must be idempotent.", "system-design"],
    ["At-most-once", [], "Messages are delivered zero or one time: fast, but a crash can lose them.", "system-design"],
    ["Exactly-once", ["effectively once"], "Each message's effect happens once, achieved with at-least-once delivery plus idempotent processing or transactions.", "system-design"],
    ["Visibility timeout", [], "How long a received queue message stays hidden from other consumers before reappearing if not deleted.", "system-design"],
    ["Dead-letter queue", ["DLQ", "dead-letter topic"], "Where messages go after failing too many times, to be inspected and replayed.", "system-design"],
    ["Back-pressure", ["backpressure"], "Slowing or rejecting producers when consumers can't keep up, instead of letting backlogs grow without limit.", "system-design"],
    ["Pub/sub", ["publish/subscribe", "pub-sub"], "Messaging where a published message is delivered to every current subscriber of a topic.", "system-design"],
    ["Polling", ["long polling"], "The client asking the server for updates on a schedule (long polling holds each request open until news arrives).", "system-design"],
    ["Server-sent events", ["SSE", "EventSource"], "A long-lived HTTP response the server writes events into; the browser reconnects automatically.", "system-design"],
    ["WebSocket", ["WebSockets"], "A persistent, two-way connection between browser and server, upgraded from an HTTP request.", "system-design"],
    ["WebRTC", [], "Browser technology for peer-to-peer audio, video and data, using STUN and TURN servers to get through NAT.", "system-design"],
    ["Heartbeat", ["heartbeats"], "A regular \"I'm alive\" message used to detect dead connections or failed nodes.", "system-design"],
    ["Presence", [], "Showing who is online or typing, usually as short-lived state refreshed by heartbeats.", "system-design"],
    ["Fan-out", ["fan out"], "Sending one message or request to many recipients or servers.", "system-design"],
    ["Clock skew", [], "The difference between two machines' clocks. Comparing timestamps across machines must assume it.", "system-design"],
    ["NTP", [], "Network Time Protocol: how machines correct their clocks from time servers.", "system-design"],
    ["Monotonic clock", [], "A clock that only moves forwards, for measuring durations on one machine.", "system-design"],
    ["Lamport clock", ["Lamport clocks", "Lamport timestamp"], "A counter carried with messages so that if A happened before B, A's number is smaller.", "system-design"],
    ["Vector clock", ["vector clocks"], "One counter per node, letting you tell whether two events are ordered or concurrent.", "system-design"],
    ["Hybrid logical clock", ["HLC", "hybrid logical clocks"], "A timestamp combining physical time with a logical counter, so it stays near real time but respects causality.", "system-design"],
    ["UUID", ["UUIDs", "UUIDv4", "UUIDv7"], "A 128-bit identifier. v4 is random; v7 starts with a millisecond timestamp, so it sorts by creation time.", "system-design"],
    ["ULID", [], "A 128-bit, time-sortable identifier written as 26 characters.", "system-design"],
    ["Snowflake ID", ["Snowflake", "Snowflake IDs"], "A 64-bit ID made of a timestamp, a worker number and a sequence: unique without coordination and sortable.", "system-design"],
    ["Consensus", [], "Getting a group of machines to agree on a value or sequence, even if some fail.", "system-design"],
    ["Raft", [], "A consensus algorithm built around one elected leader per term replicating a log to a majority.", "system-design"],
    ["Paxos", [], "The classic family of consensus algorithms.", "system-design"],
        ["Lease", ["leases"], "A lock or role granted for a limited time, renewed while the holder is alive.", "system-design"],
    ["Fencing token", ["fencing tokens"], "An ever-increasing number given with each lock grant; storage rejects writes carrying an old one.", "system-design"],
    ["Leader election", [], "Choosing one node to act as leader, and replacing it when it fails.", "system-design"],
    ["etcd", [], "A Raft-based key-value store for small, critical data: configuration, leases, and Kubernetes' cluster state.", "system-design"],
    ["ZooKeeper", [], "A coordination service (using the ZAB protocol) for configuration, locks and leader election.", "system-design"],
    ["Saga", ["sagas"], "A multi-step process where each step has a compensating action, run in reverse if a later step fails.", "system-design"],
    ["Compensating action", ["compensation", "compensations"], "A step that undoes an earlier step in business terms, such as a refund for a charge.", "system-design"],
    ["Choreography", [], "Coordinating a process by services reacting to each other's events, with no central controller.", "system-design"],
    ["Orchestration", ["orchestrator"], "Coordinating a process from one controller that calls each step and records progress.", "system-design"],
    ["Two-phase commit", ["2PC"], "A protocol where a coordinator asks all participants to prepare, then to commit: atomic, but blocking and slow.", "system-design"],
    ["Transactional outbox", ["outbox"], "Writing an event to an outbox table in the same transaction as the change, then publishing it from there.", "system-design"],
    ["Dual write", ["dual writes", "dual-write"], "Updating two systems with separate writes; a crash between them leaves them inconsistent.", "system-design"],
    ["Durable execution", ["workflow engine", "workflow engines"], "Running a workflow as code whose progress is recorded, so it resumes exactly where it stopped after a crash.", "system-design"],
    ["Batch processing", [], "Processing a bounded dataset in one run, usually on a schedule.", "system-design"],
    ["Stream processing", ["stream processor", "stream processors"], "Processing an unbounded flow of events continuously as they arrive.", "system-design"],
    ["MapReduce", [], "Processing big data by mapping over chunks in parallel, shuffling by key, and reducing each group.", "system-design"],
    ["Event time", [], "When an event actually happened, as opposed to when it was processed.", "system-design"],
    ["Window", ["windows", "tumbling window", "sliding window", "session window"], "A finite slice of a stream (by time or activity) that results are computed over.", "system-design"],
    ["Watermark", ["watermarks"], "A stream processor's estimate that all events up to a time have arrived, used to close windows.", "system-design"],
    ["Checkpoint", ["checkpoints", "checkpointing"], "A saved snapshot of a processor's state and input positions, to resume from after a crash.", "system-design"],
    ["Data lake", [], "Files in object storage, often Parquet with a table format such as Iceberg, read by many engines.", "system-design"],
    ["Primary key", ["primary keys"], "The column (or columns) that uniquely identifies each row in a table.", "system-design"],
    ["Foreign key", ["foreign keys"], "A column that points at another table's primary key, linking related rows.", "system-design"],
    ["Join", ["joins", "JOIN"], "A query that combines rows from related tables, matching them on keys.", "system-design"],
    ["Normalisation", ["normalised", "normalized", "normalization"], "Storing each fact exactly once, so an update changes one place and data can't contradict itself.", "system-design"],
    ["Denormalisation", ["denormalised", "denormalized", "denormalization"], "Deliberately copying data to make reads faster, at the cost of keeping the copies in step.", "system-design"],
    ["ACID", [], "Atomicity, consistency, isolation, durability: the guarantees a database transaction gives.", "system-design"],
    ["Transaction", ["transactions"], "A group of reads and writes that commit together or not at all.", "system-design"],
    ["Schema migration", ["migration", "migrations"], "A change to a database's structure, such as adding a column. Done safely with expand and contract.", "system-design"],
    ["Connection pooler", ["connection pool", "connection pooling", "PgBouncer"], "A layer that shares a few real database connections among many app requests.", "system-design"],
    ["B-tree", ["B-trees"], "A shallow, sorted tree of disk pages: the default database index for equality, ranges and sorting.", "system-design"],
    ["LSM tree", ["LSM", "LSM trees", "log-structured merge tree"], "A write-optimised storage structure: writes go to memory and a log, then to sorted immutable files merged in the background.", "system-design"],
    ["SSTable", ["SSTables"], "A sorted, immutable file of key-value pairs written by an LSM tree.", "system-design"],
    ["Compaction", [], "Merging an LSM tree's files in the background, keeping only the newest version of each key.", "system-design"],
    ["Bloom filter", ["Bloom filters"], "A tiny structure that answers “definitely not present” or “maybe present”, used to skip unnecessary lookups.", "system-design"],
    ["Composite index", ["composite indexes"], "An index on several columns in order; it helps queries that use the leftmost columns.", "system-design"],
    ["Covering index", [], "An index that contains every column a query needs, so the table itself isn't read.", "system-design"],
    ["Inverted index", [], "A map from each word (or value) to the rows that contain it: the basis of full-text search.", "system-design"],
    ["OLTP", [], "Online transaction processing: many small, fast reads and writes, the workload of an application database.", "system-design"],
    ["OLAP", ["data warehouse"], "Online analytical processing: few large queries that scan and aggregate many rows.", "system-design"],
    ["Change data capture", ["CDC"], "Streaming every committed change from a database's own log to other systems.", "system-design"],
    ["Polyglot persistence", [], "Using several kinds of database in one system, each for the job it does best.", "system-design"],
    ["Leader", ["leaders"], "The replica that accepts writes and streams its changes to the others.", "system-design"],
    ["Follower", ["followers", "read replica", "read replicas", "standby"], "A replica that applies the leader's changes; it can serve reads and take over on failure.", "system-design"],
    ["Replication lag", ["lag"], "How far a follower is behind the leader, in time or in changes.", "system-design"],
    ["Read-your-writes", ["read-your-own-writes"], "The guarantee that after you change something, your own reads show the change.", "system-design"],
    ["Quorum", ["quorums"], "The number of replicas that must agree for a read or write to count, usually a majority.", "system-design"],
    ["Split brain", [], "Two nodes both acting as leader and accepting conflicting writes, usually after a failover goes wrong.", "system-design"],
    ["Shard key", ["partition key", "shard keys"], "The value that decides which shard a record lives on.", "system-design"],
    ["Consistent hashing", ["hash ring"], "Placing nodes and keys on a ring so adding or removing a node moves only a small share of keys.", "system-design"],
    ["Virtual node", ["virtual nodes", "vnodes"], "One of many points a single machine owns on a hash ring, to even out load.", "system-design"],
    ["Hot spot", ["hot spots", "hot partition", "hot shard"], "A shard or partition receiving far more traffic than the others.", "system-design"],
    ["Network partition", ["network partitions"], "Part of a system can't reach another part, though both may still be running.", "system-design"],
    ["CAP theorem", ["CAP"], "During a network partition, a distributed system must choose between consistency and availability.", "system-design"],
    ["PACELC", [], "If partitioned, choose availability or consistency; else, choose latency or consistency.", "system-design"],
    ["Linearizable", ["linearizability"], "The strongest consistency: the system behaves as if there were one copy, and every read sees the latest completed write.", "system-design"],
    ["Causal consistency", ["causal"], "Writes that depend on each other are seen in the same order by everyone.", "system-design"],
    ["Last write wins", ["LWW"], "Resolving conflicting versions by keeping the one with the latest timestamp and discarding the others.", "system-design"],
    ["CRDT", ["CRDTs"], "A data type whose concurrent updates always merge to the same result without coordination.", "system-design"],
    ["Isolation level", ["isolation levels", "isolation"], "How much concurrent transactions are shielded from each other's effects.", "system-design"],
    ["Race condition", ["race", "races"], "A bug where the result depends on the timing of concurrent operations.", "system-design"],
    ["Lost update", ["lost updates"], "Two transactions read the same value and both write, so one change silently overwrites the other.", "system-design"],
    ["Write skew", [], "Two transactions read the same data and update different rows, together breaking a rule neither broke alone.", "system-design"],
    ["Optimistic concurrency", ["OCC", "optimistic locking"], "Writing only if a version is unchanged since you read it, and retrying otherwise.", "system-design"],
    ["Pessimistic lock", ["row lock", "FOR UPDATE", "pessimistic locking"], "Locking rows when you read them so others must wait until you commit.", "system-design"],
    ["Deadlock", ["deadlocks"], "Two transactions each waiting for a lock the other holds, so neither can proceed.", "system-design"],
    ["Serializable", ["serializability"], "The strictest isolation: transactions behave as if they ran one at a time.", "system-design"],
    ["UDP", [], "A bare transport protocol: sends independent packets with no handshake, ordering or retries. Fast; lost packets are simply gone.", "system-design"],
    ["QUIC", [], "A transport built on UDP with TCP-like reliability, built-in TLS and independent streams. HTTP/3 runs on it.", "system-design"],
    ["Head-of-line blocking", [], "When one delayed item holds up everything queued behind it, such as a lost TCP packet stalling all HTTP/2 streams.", "system-design"],
    ["Multiplexing", ["multiplexed", "multiplexes"], "Sending many requests or streams over one connection at the same time, interleaved.", "system-design"],
    ["Anycast", [], "Many servers share one IP address and the network routes each user to the nearest one. Used by CDNs and DNS resolvers.", "system-design"],
    ["REST", ["RESTful"], "An API style built on HTTP: resources named by URLs, acted on with standard methods (GET, POST, PUT, PATCH, DELETE).", "system-design"],
    ["gRPC", [], "A framework for calling functions on other services, using Protocol Buffers over HTTP/2, with generated typed clients.", "system-design"],
    ["GraphQL", [], "An API query language where the client asks for exactly the fields it needs from one endpoint.", "system-design"],
    ["Pagination", ["paginate", "paginated"], "Returning a long list in pages. Cursor pagination remembers where you stopped; offset pagination counts from the top.", "system-design"],
    ["Webhook", ["webhooks"], "An HTTP request a service sends to your URL when something happens, instead of you polling for it.", "system-design"],
    ["Round robin", [], "A load-balancing rule that sends each new request to the next server in turn.", "system-design"],
    ["Least connections", ["least outstanding requests"], "A load-balancing rule that sends each request to the server with the fewest requests in progress.", "system-design"],
    ["Health check", ["health checks"], "A regular probe (such as GET /healthz) a load balancer uses to decide whether a server should receive traffic.", "system-design"],
    ["API gateway", ["API gateways"], "A proxy at the front of your services that handles cross-cutting work: authentication, rate limits, routing, logging.", "system-design"],
    ["Autoscaling", ["autoscaler", "autoscale"], "Automatically adding or removing servers as a metric (CPU, queue depth, requests) rises or falls.", "system-design"],
    ["Sticky session", ["sticky sessions"], "A load balancer keeping one user on the same server, usually by cookie. Convenient, but fragile when that server dies.", "system-design"],
    ["Hit ratio", ["hit rate", "cache hit"], "The share of requests a cache answers itself. At 95%, the source sees only 5% of reads.", "system-design"],
    ["TTL", ["time to live"], "How long a cached copy (or DNS answer) may be used before it must be fetched again.", "system-design"],
    ["LRU", ["least recently used"], "An eviction rule that throws out whatever hasn't been used for the longest time.", "system-design"],
    ["LFU", ["least frequently used"], "An eviction rule that throws out whatever has been used least often.", "system-design"],
    ["Cache stampede", ["thundering herd"], "Many requests missing the cache at once (often when a hot key expires) and all hitting the database together.", "system-design"],
    ["Hot key", ["hot keys"], "One key getting so much traffic that the single node holding it is overloaded.", "system-design"],
    ["Cache invalidation", ["invalidation", "invalidate"], "Removing or updating cached copies when the source data changes, so readers don't see stale values.", "system-design"],
    ["Object storage", ["blob storage", "object store"], "Storage for whole files (objects) under keys in buckets, such as Amazon S3: cheap, durable, effectively unlimited.", "system-design"],
    ["Presigned URL", ["presigned URLs", "signed URL", "signed URLs"], "A short-lived URL that grants one specific action on one object, so clients can upload or download directly.", "system-design"],
    ["Multipart upload", ["multipart"], "Uploading a big file in independent parts that can be sent in parallel and retried individually.", "system-design"],
    ["Origin", ["origin server"], "The source a CDN fetches from on a miss: your storage bucket or servers.", "system-design"],
    ["Origin shield", [], "An extra cache layer between CDN edges and the origin, so each object is fetched from the origin about once.", "system-design"],
  ];
  const SKIP = "a, code, pre, kbd, button, summary, strong, b, th, h1, h2, h3, h4, script, style, svg, .viz, .gl, .gl-demo, .tag, .ds, .toc, .eyebrow, .opts, .glossary-list, .topbar, .sidenav, footer, label, .widget .ctl, .ctxlegend, .no-gl";

  const pageTrack = () => (document.body && document.body.dataset.track) || "coding";
  const inTrack = (g) => (g[3] || "coding") === pageTrack();

  function bootGlossary() {
    const root = document.querySelector("main") || document.querySelector(".wrap");
    if (!root) return;
    const lookup = new Map();
    GLOSSARY.forEach((g, id) => { if (inTrack(g)) [g[0], ...g[1]].forEach((w) => lookup.set(w.toLowerCase(), id)); });
    if (!lookup.size) return;
    const words = [...lookup.keys()].sort((a, b) => b.length - a.length).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const re = new RegExp(`(?<![\\w-])(${words.join("|")})(?:s|es)?(?![\\w-])`, "gi");
    // Each problem is its own scope (people jump straight to one), and so is the rest of the page.
    // Inside problems, skip the page's own topic ("DFS" on the DFS page): it's underlined once in the page text.
    const scopes = [...root.querySelectorAll("details.problem")];
    const h1 = (root.querySelector("h1") || {}).textContent || "";
    const own = new Set();
    h1.replace(re, (m, w) => { own.add(lookup.get(w.toLowerCase())); return m; });
    const scan = (scope, isPage) => {
      const seen = new Set(isPage ? [] : own);
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
        acceptNode: (t) => {
          const p = t.parentElement;
          if (!p || p.closest(SKIP) || !t.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (isPage && p.closest("details.problem")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const texts = [];
      while (walker.nextNode()) texts.push(walker.currentNode);
      texts.forEach((t) => {
        let node = t;
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(node.nodeValue))) {
          const id = lookup.get(m[1].toLowerCase());
          if (seen.has(id)) continue;
          seen.add(id);
          const hit = node.splitText(m.index);
          node = hit.splitText(m[0].length);
          const span = document.createElement("span");
          span.className = "gl"; span.tabIndex = 0; span.dataset.gl = id;
          span.textContent = hit.nodeValue;
          hit.replaceWith(span);
          re.lastIndex = 0;
        }
      });
    };
    scan(root, true);
    scopes.forEach((s) => scan(s, false));

    const tip = document.createElement("div");
    tip.className = "gl-tip"; tip.id = "gl-tip"; tip.setAttribute("role", "tooltip");
    document.body.appendChild(tip);
    let current = null;
    const hide = () => { tip.classList.remove("show"); current = null; };
    const show = (el) => {
      const [term, , def] = GLOSSARY[+el.dataset.gl];
      tip.innerHTML = `<b>${esc(term)}</b>${esc(def)}`;
      tip.classList.add("show");
      current = el;
      place();
    };
    // Keep the tip next to its term; hide it once the term scrolls out of view.
    const place = () => {
      if (!current) return;
      const r = current.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
      if (r.bottom < 0 || r.top > window.innerHeight) return hide();
      const left = Math.max(16, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 16));
      const top = r.bottom + 8 + h < window.innerHeight ? r.bottom + 8 : Math.max(8, r.top - h - 8);
      tip.style.left = left + "px"; tip.style.top = top + "px";
    };
    document.addEventListener("mouseover", (e) => { const g = e.target.closest && e.target.closest(".gl"); if (g) show(g); });
    document.addEventListener("mouseout", (e) => { const g = e.target.closest && e.target.closest(".gl"); if (g && !g.contains(e.relatedTarget)) hide(); });
    document.addEventListener("focusin", (e) => { if (e.target.classList && e.target.classList.contains("gl")) show(e.target); });
    document.addEventListener("focusout", (e) => { if (e.target.classList && e.target.classList.contains("gl")) hide(); });
    document.addEventListener("click", (e) => { const g = e.target.closest && e.target.closest(".gl"); if (g) { if (current === g) hide(); else show(g); } else if (current) hide(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
  }

  /** Fill <dl class="glossary-list"> with every term (used by start-here.html). */
  function glossaryList(target) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    el.innerHTML = GLOSSARY.filter(inTrack).sort((a, b) => a[0].localeCompare(b[0])).map(([term, alts, def]) =>
      `<div id="g-${term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}"><dt>${esc(term)}${alts.length ? ` <span class="idx">(${alts.map(esc).join(", ")})</span>` : ""}</dt><dd>${esc(def)}</dd></div>`).join("");
  }

  /* ---------- sketch mode: redraw diagram boxes in a hand-drawn whiteboard style ----------
   * Optional and online-only: Rough.js (pinned, integrity-checked) and a handwriting font load from CDNs the
   * first time it's switched on. If they can't load, diagrams simply stay as they are. */
  const SKETCH_KEY = "ik-sketch-v1";
  const ROUGH_SRC = "https://cdn.jsdelivr.net/npm/roughjs@4.6.6/bundled/rough.js";
  const ROUGH_SRI = "sha384-1NLkwxMO2sOqcq7rQkFBhIAUJtbt8ziLxhVKVgKfFGMEU8pF+GEq5LVogviveup6";
  let roughP = null, sketchObs = null, sketchQueued = false;
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } } };
  function loadRough() {
    if (window.rough) return Promise.resolve(window.rough);
    if (roughP) return roughP;
    roughP = new Promise((res, rej) => {
      const sc = document.createElement("script");
      sc.src = ROUGH_SRC; sc.integrity = ROUGH_SRI; sc.crossOrigin = "anonymous";
      sc.onload = () => (window.rough ? res(window.rough) : rej()); sc.onerror = rej;
      document.head.appendChild(sc);
      if (!document.getElementById("ik-sketch-font")) {
        const l = document.createElement("link");
        l.id = "ik-sketch-font"; l.rel = "stylesheet";
        l.href = "https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap";
        document.head.appendChild(l);
      }
    });
    return roughP;
  }
  function roughenAll() {
    sketchQueued = false;
    if (!window.rough || !document.documentElement.classList.contains("sketch")) return;
    if (sketchObs) sketchObs.disconnect();
    document.querySelectorAll("svg.flow").forEach((svg) => {
      const rc = window.rough.svg(svg);
      svg.querySelectorAll("g.fn").forEach((g, n) => {
        const r = g.querySelector("rect");
        if (!r) return;
        const cs = getComputedStyle(r), key = [r.getAttribute("x"), r.getAttribute("y"), r.getAttribute("width"), cs.fill, cs.stroke].join("|");
        const old = g.querySelector(":scope > .rough");
        if (old && old.dataset.key === key) return;
        if (old) old.remove();
        const x = +r.getAttribute("x"), y = +r.getAttribute("y"), w = +r.getAttribute("width"), h = +r.getAttribute("height");
        const node = rc.rectangle(x + 1, y + 1, w - 2, h - 2, { seed: n + 7, roughness: 1.3, bowing: 1.5, stroke: cs.stroke, strokeWidth: Math.max(1.4, parseFloat(cs.strokeWidth) || 1.5), fill: cs.fill, fillStyle: "solid" });
        node.classList.add("rough"); node.dataset.key = key;
        g.insertBefore(node, g.firstChild);
      });
    });
    if (sketchObs) sketchObs.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
  }
  function queueRoughen() { if (!sketchQueued) { sketchQueued = true; requestAnimationFrame(roughenAll); } }
  function setSketch(on, btn) {
    document.documentElement.classList.toggle("sketch", on);
    document.querySelectorAll(".sketch-toggle").forEach((b) => b.setAttribute("aria-pressed", String(on)));
    store.set(SKETCH_KEY, on ? "1" : "0");
    if (!on) { document.querySelectorAll("svg.flow .rough").forEach((n) => n.remove()); if (sketchObs) sketchObs.disconnect(); return; }
    loadRough().then(() => {
      if (!sketchObs) sketchObs = new MutationObserver((ms) => { if (ms.some((m) => !(m.target.closest && m.target.closest(".rough")))) queueRoughen(); });
      roughenAll();
    }, () => {
      document.documentElement.classList.remove("sketch");
      document.querySelectorAll(".sketch-toggle").forEach((b) => { b.setAttribute("aria-pressed", "false"); b.title = "Sketch mode needs an internet connection"; });
    });
  }
  function bootSketch() {
    const bar = document.querySelector(".topbar");
    if (!bar || !document.querySelector("svg.flow")) return;   // only on pages with diagrams
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "sketch-toggle"; btn.setAttribute("aria-pressed", "false");
    btn.title = "Draw diagrams in a hand-sketched whiteboard style";
    btn.innerHTML = '<span aria-hidden="true">✎</span><span class="sketch-label">Sketch</span>';
    bar.insertBefore(btn, bar.querySelector(".nav-toggle"));
    // On phones the top bar has no room: the same toggle lives in the menu drawer instead.
    const nav = document.getElementById("sidenav"), inNav = btn.cloneNode(true);
    if (nav) { inNav.classList.add("in-nav"); nav.insertBefore(inNav, nav.querySelector(".sn-title")); }
    [btn, inNav].forEach((b) => b.addEventListener("click", () => setSketch(b.getAttribute("aria-pressed") !== "true", b)));
    if (store.get(SKETCH_KEY) === "1") setSketch(true, btn);
  }

  // Phones and tablets: the left sidebar (the track's menu) is a drawer opened by the top bar's Menu button.
  function bootSideNav() {
    const btn = document.querySelector(".topbar .nav-toggle"), nav = document.getElementById("sidenav");
    if (!btn || !nav) return;
    const root = document.documentElement, label = btn.querySelector(".nav-toggle-label");
    const set = (open) => {
      root.classList.toggle("nav-open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (label) label.textContent = open ? "Close" : "Menu";
    };
    btn.addEventListener("click", () => set(!root.classList.contains("nav-open")));
    const scrim = document.querySelector(".sn-scrim");
    if (scrim) scrim.addEventListener("click", () => set(false));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && root.classList.contains("nav-open")) { set(false); btn.focus(); }
    });
    if (window.matchMedia) window.matchMedia("(min-width: 1000px)").addEventListener("change", (m) => { if (m.matches) set(false); });
    // Keep the current page in view in a long sidebar.
    const cur = nav.querySelector('[aria-current="page"]');
    if (cur && cur.offsetTop > nav.clientHeight * 0.7) nav.scrollTop = cur.offsetTop - nav.clientHeight / 3;
  }

  // Wide tables scroll sideways inside their own box instead of widening the page.
  function wrapTables() {
    document.querySelectorAll("main table, .wrap table").forEach((t) => {
      if (t.parentElement.classList.contains("table-scroll") || t.closest(".viz, .trace-viz")) return;  // players redraw themselves
      const box = document.createElement("div");
      box.className = "table-scroll";
      t.parentNode.insertBefore(box, t);
      box.appendChild(t);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bootSideNav();
    bootSketch();
    wrapTables();
    bootCodeTabs();
    bootTraces();
    bootGlossary();
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
    document.querySelectorAll("pre > code.typescript, pre > code.java").forEach((el) => {
      el.innerHTML = highlight(el.textContent, el.classList.contains("java") ? "java" : "ts");
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
    // Under the last quiz on a page, link to this track's review deck, filtered to this page's cards.
    const quizzes = document.querySelectorAll(".quiz-q"), home = document.querySelector(".sidenav .sn-title");
    if (quizzes.length && home && !/review\.html$/.test(location.pathname)) {
      const rv = new URL(home.getAttribute("href").replace(/index\.html$/, "") + "review.html", location.href);
      const topic = location.href.split(/[?#]/)[0].replace(rv.href.replace(/review\.html$/, ""), "");
      const p = document.createElement("p");
      p.className = "review-link";
      p.innerHTML = `<a href="${rv.href}?topic=${encodeURIComponent(topic)}#review">Add these to your review deck →</a> Spaced repetition brings each question back just before you'd forget it.`;
      const last = quizzes[quizzes.length - 1], box = last.closest(".card") || last;
      box.insertAdjacentElement("afterend", p);
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

  window.Viz = { array, grid, stack, chips, list, tree, graph, flow, intervals, stepper, trace, esc, glossaryList };
})();
