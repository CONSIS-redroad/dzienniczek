// Wygląd jak w TERAPII: tryb kolorów (system → jasny → ciemny), tapety (sakura, deszcz, świt) i okno „Wygląd”.
// TYLKO wygląd — nie dotyka danych dzienniczka. Ustawienia w localStorage pod kluczami dzienniczek_ui_* (każdy dostęp w try/catch).
// Sceny i silnik cząsteczek przepisane z TERAPII (frontend/src/themes/*.tsx, components/Wallpaper.tsx) na czysty JS/SVG.
const Theme = (() => {
  const MODE_KEY = "dzienniczek_ui_theme_v1";
  const WALL_KEY = "dzienniczek_ui_wallpaper_v1";
  const NS = "http://www.w3.org/2000/svg";
  const media = q => { try { return window.matchMedia(q); } catch (e) { return null; } };
  const reduced = () => !!(media("(prefers-reduced-motion: reduce)") || {}).matches;
  const read = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const write = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* tryb prywatny — trudno */ } };

  /* ---------- sceny SVG (viewBox 1200×800, jak w TERAPII) ---------- */
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  function seeded(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  function sceneSakura(svg, dark) {
    const snow1 = dark ? "#1e293b" : "#ffffff", snow2 = dark ? "#273449" : "#eef2f7", snow3 = dark ? "#334155" : "#e2e8f0";
    el("path", { d: "M0 560 C 200 500, 380 530, 560 505 C 760 478, 960 520, 1200 490 L1200 800 L0 800 Z", fill: snow3, opacity: "0.9" }, svg);
    el("path", { d: "M0 620 C 220 580, 420 610, 640 590 C 860 570, 1020 610, 1200 585 L1200 800 L0 800 Z", fill: snow2 }, svg);
    el("path", { d: "M0 690 C 260 650, 520 700, 760 675 C 960 655, 1080 690, 1200 670 L1200 800 L0 800 Z", fill: snow1 }, svg);
    const branches = [
      "M1250 120 C 1120 170, 1010 150, 900 210 C 820 255, 760 250, 690 300", "M1050 160 C 1000 230, 950 260, 880 330",
      "M900 210 C 870 150, 830 120, 770 110", "M1250 300 C 1150 320, 1080 370, 1000 380 C 950 386, 900 420, 860 460",
      "M1080 370 C 1060 430, 1020 470, 980 520", "M-20 80 C 90 110, 170 100, 250 150 C 300 180, 340 175, 400 200",
      "M170 103 C 190 160, 180 200, 150 240"];
    const g = el("g", { fill: "none", stroke: dark ? "#3b2a33" : "#5b4048", "stroke-linecap": "round", opacity: dark ? "0.9" : "0.75" }, svg);
    branches.forEach((d, i) => el("path", { d, "stroke-width": (i === 0 || i === 3 || i === 5) ? 9 : 4.5 }, g));
    const petal = dark ? ["#f9a8d4", "#fbcfe8", "#f472b6"] : ["#f9a8d4", "#fbcfe8", "#fda4af"];
    const rnd = seeded(7), bg = el("g", { opacity: dark ? "0.85" : "0.95" }, svg);
    const anchors = [[700, 300], [770, 110], [880, 330], [860, 460], [980, 520], [1000, 380], [900, 210], [1050, 160], [400, 200], [150, 240], [250, 150], [1150, 140], [1180, 320]];
    anchors.forEach(([ax, ay]) => {
      for (let i = 0; i < 14; i++) {
        const x = ax + (rnd() - 0.5) * 120, y = ay + (rnd() - 0.5) * 80, r = 5 + rnd() * 9, c = Math.floor(rnd() * 3);
        const fl = el("g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, bg);
        [0, 72, 144, 216, 288].forEach(a => el("ellipse", { cx: 0, cy: (-r * 0.55).toFixed(2), rx: (r * 0.42).toFixed(2), ry: (r * 0.6).toFixed(2), fill: petal[c], transform: `rotate(${a})` }, fl));
        el("circle", { r: (r * 0.18).toFixed(2), fill: dark ? "#fde68a" : "#fbbf24", opacity: "0.8" }, fl);
      }
    });
  }

  function sceneDeszcz(svg, dark) {
    const far = dark ? "#1f2a37" : "#cbd5e1", mid = dark ? "#18222e" : "#94a3b8", near = dark ? "#111a24" : "#64748b";
    const mist = dark ? "rgba(148,163,184,0.10)" : "rgba(255,255,255,0.55)";
    const trees = (y, color, scale, count, seed) => {
      const g = el("g", { fill: color }, svg);
      for (let i = 0; i < count; i++) {
        const x = ((i * 97 + seed * 31) % 1200) + ((i * 13) % 20), h = (40 + ((i * 53 + seed) % 40)) * scale;
        el("path", { d: `M${x} ${y} L${x - h * 0.28} ${y} L${x} ${y - h} L${x + h * 0.28} ${y} Z` }, g);
      }
    };
    el("path", { d: "M0 520 C 180 460, 360 500, 540 470 C 740 438, 940 490, 1200 455 L1200 800 L0 800 Z", fill: far, opacity: "0.7" }, svg);
    trees(530, far, 0.7, 40, 3);
    el("rect", { x: 0, y: 470, width: 1200, height: 120, fill: mist }, svg);
    el("path", { d: "M0 610 C 240 570, 480 615, 720 590 C 940 568, 1060 600, 1200 585 L1200 800 L0 800 Z", fill: mid, opacity: "0.85" }, svg);
    trees(625, mid, 1, 30, 11);
    el("rect", { x: 0, y: 600, width: 1200, height: 90, fill: mist }, svg);
    el("path", { d: "M0 720 C 300 690, 600 735, 900 705 C 1030 692, 1120 712, 1200 700 L1200 800 L0 800 Z", fill: near }, svg);
    el("ellipse", { cx: 760, cy: 760, rx: 220, ry: 16, fill: dark ? "rgba(148,163,184,0.12)" : "rgba(255,255,255,0.35)" }, svg);
  }

  function sceneSwit(svg, dark) {
    el("circle", { cx: 820, cy: 470, r: 90, fill: dark ? "#334155" : "#fde68a", opacity: dark ? "0.5" : "0.75" }, svg);
    el("path", { d: "M0 500 C 200 455, 420 490, 620 465 C 820 440, 1000 480, 1200 455 L1200 560 L0 560 Z", fill: dark ? "#1e293b" : "#a7b4c8", opacity: "0.8" }, svg);
    el("rect", { x: 0, y: 540, width: 1200, height: 260, fill: dark ? "#0f172a" : "#cfe0ee" }, svg);
    for (let i = 0; i < 6; i++) el("rect", { x: 700 - i * 18, y: 565 + i * 22, width: 240 + i * 36, height: 3, rx: 1.5, fill: dark ? "#475569" : "#fef3c7", opacity: (0.5 - i * 0.07).toFixed(2) }, svg);
  }

  // REJESTR MOTYWÓW (te same id i nazwy co w TERAPII) + „gładkie tło” dla osób, którym obraz przeszkadza.
  const THEMES = [
    { id: "sakura", name: "Wiśnia na śniegu", description: "Kwitnąca wiśnia nad zaśnieżonymi wzgórzami, płatki opadają powoli.",
      sky: { light: "linear-gradient(180deg,#fdf2f8 0%,#f1f5f9 55%,#ffffff 100%)", dark: "linear-gradient(180deg,#120f1a 0%,#111827 55%,#0b1220 100%)" },
      scene: sceneSakura, particles: "petals", colors: { light: ["#f9a8d4", "#fbcfe8", "#fda4af"], dark: ["#f9a8d4", "#f472b6", "#fbcfe8"] },
      preview: "linear-gradient(180deg,#fdf2f8 0%,#fbcfe8 45%,#ffffff 100%)" },
    { id: "deszcz", name: "Deszcz", description: "Mgliste wzgórza i las w oddali, spokojny deszcz.",
      sky: { light: "linear-gradient(180deg,#e2e8f0 0%,#cbd5e1 60%,#94a3b8 100%)", dark: "linear-gradient(180deg,#0b1220 0%,#111827 60%,#0f172a 100%)" },
      scene: sceneDeszcz, particles: "rain", colors: { light: ["rgba(71,85,105,0.45)"], dark: ["rgba(148,163,184,0.35)"] },
      preview: "linear-gradient(180deg,#e2e8f0 0%,#94a3b8 100%)" },
    { id: "swit", name: "Świt nad jeziorem", description: "Ciche jezioro o świcie, bez ruchu w tle.",
      sky: { light: "linear-gradient(180deg,#e0e7ff 0%,#fde2e4 55%,#fef3c7 100%)", dark: "linear-gradient(180deg,#0b1020 0%,#1e1b2e 60%,#1f2937 100%)" },
      scene: sceneSwit, particles: "none", colors: { light: [], dark: [] },
      preview: "linear-gradient(180deg,#e0e7ff 0%,#fde2e4 55%,#fef3c7 100%)" },
    { id: "brak", name: "Gładkie tło", description: "Bez obrazka i bez ruchu.",
      sky: { light: "var(--t-bg)", dark: "var(--t-bg)" }, scene: null, particles: "none", colors: { light: [], dark: [] },
      preview: "linear-gradient(180deg,#f4f6f8 0%,#e2e8f0 100%)" }
  ];
  const themeById = id => THEMES.find(t => t.id === id) || THEMES[0];

  /* ---------- ustawienia ---------- */
  const DEFAULTS = { themeId: "sakura", particles: true, density: 1, motion: true, veil: 0.15 };
  function loadWall() {
    const base = Object.assign({}, DEFAULTS, { motion: !reduced(), particles: !reduced() });
    try { const raw = read(WALL_KEY); if (raw) { const p = JSON.parse(raw); if (p && typeof p === "object") Object.assign(base, p); } } catch (e) { /* uszkodzony wpis — domyślne */ }
    base.veil = Math.min(0.6, Math.max(0, Number(base.veil) || 0));
    if (![0.5, 1, 1.6].includes(base.density)) base.density = 1;
    return base;
  }
  let wall = loadWall();
  let mode = (m => (m === "light" || m === "dark") ? m : "system")(read(MODE_KEY));
  const isDark = () => document.documentElement.dataset.theme === "dark";

  function applyMode() {
    const dq = media("(prefers-color-scheme: dark)");
    const dark = mode === "dark" || (mode === "system" && !!(dq && dq.matches));
    const before = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#070b10" : "#f4f6f8");
    if (before !== document.documentElement.dataset.theme) renderWallpaper();
  }
  function setMode(m) { mode = m; write(MODE_KEY, m === "system" ? null : m); applyMode(); syncDialog(); }
  function setWall(patch) {
    wall = Object.assign({}, wall, patch); write(WALL_KEY, JSON.stringify(wall));
    if (Object.keys(patch).length === 1 && "veil" in patch) paintVeil(); else renderWallpaper();
    syncDialog();
  }
  function paintVeil() {
    const v = document.getElementById("wallpaper-veil");
    if (v) v.style.background = isDark() ? `rgba(7,11,16,${wall.veil})` : `rgba(255,255,255,${wall.veil})`;
  }

  /* ---------- tło: niebo + scena + cząsteczki + zasłona ---------- */
  let stopParticles = null, stopMotion = null;
  function renderWallpaper() {
    const root = document.getElementById("wallpaper");
    if (!root) return;
    const t = themeById(wall.themeId), dark = isDark();
    root.style.background = dark ? t.sky.dark : t.sky.light;
    const layer = document.getElementById("wallpaper-scene");
    layer.replaceChildren();
    if (t.scene) {
      const svg = el("svg", { viewBox: "0 0 1200 800", preserveAspectRatio: "xMidYMid slice", "aria-hidden": "true", focusable: "false" });
      t.scene(svg, dark); layer.appendChild(svg);
    }
    paintVeil();
    if (stopParticles) { stopParticles(); stopParticles = null; }
    const colors = dark ? t.colors.dark : t.colors.light;
    const cvs = document.getElementById("wallpaper-particles");
    cvs.hidden = !(wall.particles && t.particles !== "none" && colors.length && !reduced());
    if (!cvs.hidden) stopParticles = particles(cvs, t.particles, colors, wall.density);
    if (stopMotion) { stopMotion(); stopMotion = null; }
    layer.style.transform = "";
    if (wall.motion && !reduced()) stopMotion = motion(layer);
  }

  function particles(cvs, kind, colors, density) {
    const ctx = cvs.getContext && cvs.getContext("2d");
    if (!ctx) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    const resize = () => { w = window.innerWidth; h = window.innerHeight; cvs.width = w * dpr; cvs.height = h * dpr; cvs.style.width = w + "px"; cvs.style.height = h + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener("resize", resize);
    const base = kind === "rain" ? 110 : kind === "snow" ? 60 : 26;
    const area = Math.min(1.6, (window.innerWidth * window.innerHeight) / (1280 * 800));
    const n = Math.max(6, Math.round(base * density * Math.max(0.45, area)));
    const ps = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      s: kind === "rain" ? 6 + Math.random() * 6 : 0.35 + Math.random() * 0.55,
      r: kind === "rain" ? 10 + Math.random() * 14 : 4 + Math.random() * 5,
      a: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.02, sway: 0.4 + Math.random() * 0.8,
      c: colors[Math.floor(Math.random() * colors.length)], o: 0.55 + Math.random() * 0.4 }));
    let raf = 0, t = 0;
    const frame = () => {
      t += 1; ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        if (kind === "rain") {
          p.y += p.s; p.x += p.s * 0.18; if (p.y > h) { p.y = -p.r; p.x = Math.random() * w; }
          ctx.strokeStyle = p.c; ctx.lineWidth = 1; ctx.globalAlpha = p.o;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.r * 0.18, p.y - p.r); ctx.stroke();
        } else {
          // płatek: wolne opadanie, kołysanie i obrót
          p.y += p.s; p.x += Math.sin((t + p.a * 80) / 90) * p.sway + 0.15; p.a += p.spin;
          if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; } if (p.x > w + 10) p.x = -10;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.globalAlpha = p.o;
          ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
      }
      ctx.globalAlpha = 1; raf = requestAnimationFrame(frame);
    };
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(frame); };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVis); ctx.clearRect(0, 0, w, h); };
  }

  // Ruch jak w TERAPII (bez obracania przeciąganiem — dzienniczek ma kalendarz pod palcem): paralaksa myszą + lekkie unoszenie przy przewijaniu.
  function motion(layer) {
    let mx = 0, my = 0, raf = 0;
    const paint = () => { raf = 0; const lift = Math.min(60, window.scrollY * 0.06); layer.style.transform = `translate3d(${mx}px,${my - lift}px,0) scale(1.06)`; };
    const queue = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const onMove = e => { mx = (e.clientX / window.innerWidth - 0.5) * 14; my = (e.clientY / window.innerHeight - 0.5) * 14; queue(); };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", queue, { passive: true });
    paint();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); window.removeEventListener("scroll", queue); };
  }

  /* ---------- okno „Wygląd” ---------- */
  let lastFocus = null;
  function buildTiles() {
    const box = document.getElementById("look-themes");
    if (!box || box.childElementCount) return;
    THEMES.forEach(t => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "look-tile"; b.dataset.theme = t.id; b.title = t.description;
      const sw = document.createElement("span"); sw.className = "look-swatch"; sw.style.background = t.preview; sw.setAttribute("aria-hidden", "true");
      const nm = document.createElement("span"); nm.className = "look-tile-name"; nm.textContent = t.name;
      b.append(sw, nm);
      b.addEventListener("click", () => setWall({ themeId: t.id }));
      box.appendChild(b);
    });
  }
  function syncDialog() {
    const dlg = document.getElementById("look-overlay");
    if (!dlg) return;
    const press = (sel, on) => dlg.querySelectorAll(sel).forEach(b => b.setAttribute("aria-pressed", String(on(b))));
    press("[data-mode]", b => b.dataset.mode === mode);
    press("[data-theme]", b => b.dataset.theme === themeById(wall.themeId).id);
    press("[data-density]", b => b.dataset.density === "off" ? !wall.particles : (wall.particles && Number(b.dataset.density) === wall.density));
    press("[data-motion]", b => (b.dataset.motion === "on") === !!wall.motion);
    const veil = document.getElementById("look-veil");
    if (veil) veil.value = String(wall.veil);
    const note = document.getElementById("look-reduced-note");
    if (note) note.hidden = !reduced();
  }
  function openDialog() {
    const o = document.getElementById("look-overlay");
    lastFocus = document.activeElement; buildTiles(); syncDialog();
    o.classList.add("open"); o.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open");
    document.getElementById("btn-close-look").focus();
  }
  function closeDialog() {
    const o = document.getElementById("look-overlay");
    if (!o.classList.contains("open")) return;
    o.classList.remove("open"); o.setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function init() {
    applyMode();
    renderWallpaper();
    const dq = media("(prefers-color-scheme: dark)");
    if (dq && dq.addEventListener) dq.addEventListener("change", () => { if (mode === "system") applyMode(); });
    const rq = media("(prefers-reduced-motion: reduce)");
    if (rq && rq.addEventListener) rq.addEventListener("change", () => { renderWallpaper(); syncDialog(); });
    document.getElementById("btn-look")?.addEventListener("click", openDialog);
    document.getElementById("btn-close-look")?.addEventListener("click", closeDialog);
    document.getElementById("btn-close-look-2")?.addEventListener("click", closeDialog);
    document.getElementById("btn-look-reset")?.addEventListener("click", () => { wall = Object.assign({}, DEFAULTS, { motion: !reduced(), particles: !reduced() }); write(WALL_KEY, null); setMode("system"); renderWallpaper(); syncDialog(); });
    const o = document.getElementById("look-overlay");
    o?.addEventListener("click", e => {
      if (e.target === e.currentTarget) { closeDialog(); return; }
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.mode) setMode(b.dataset.mode);
      else if (b.dataset.density) setWall(b.dataset.density === "off" ? { particles: false } : { particles: true, density: Number(b.dataset.density) });
      else if (b.dataset.motion) setWall({ motion: b.dataset.motion === "on" });
    });
    document.getElementById("look-veil")?.addEventListener("input", e => setWall({ veil: Number(e.target.value) }));
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeDialog(); });
  }

  return { init, setMode, themes: THEMES, get mode() { return mode; }, get wallpaper() { return Object.assign({}, wall); } };
})();
document.addEventListener("DOMContentLoaded", () => Theme.init());
