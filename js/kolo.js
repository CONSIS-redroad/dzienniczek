// Koło uczuć — zakładka dzienniczka (Bartek 12.10.2026: „logowanie dzienniczka załatwi temat, dolne menu jak w terapii”).
// 5 grup z karty pracy (bez odręcznego dopisku). Dotknięcie wycinka = pokaż grupę, dotknięcie słowa = zaznacz / odznacz.
// Zaznaczenia = AppState.kolo, zapisywane razem z wpisami konta (Storage.save) — gość: tylko na czas sesji.
const KOLO = [
  { id: "wstyd", label: "Wstyd", words: ["UPOKARZANIE", "LEKCEWAŻENIE", "PRZEPRASZANIE", "POCZUCIE NIŻSZOŚCI", "WYŚMIEWANIE", "OSZUKIWANIE",
    "POCZUCIE WINY", "WYRZUTY SUMIENIA", "UTRATA TWARZY", "ZAKŁOPOTANIE"] },
  { id: "gniew", label: "Gniew", words: ["ZŁOŚĆ", "FURIA", "SARKAZM", "FRUSTRACJA", "CYNIZM", "ZBUNTOWANIE", "ROZDRAŻNIENIE", "WŚCIEKŁOŚĆ",
    "ZŁOŚLIWOŚĆ", "ZNIEWAŻENIE", "OBRAZA", "URAŻENIE", "NIENAWIŚĆ", "WROGOŚĆ", "NIECHĘĆ", "LEKCEWAŻENIE"] },
  { id: "smutek", label: "Smutek", words: ["ZRANIENIE", "BÓL", "DEPRESJA", "PRZYGNĘBIENIE", "ŻALENIE SIĘ NAD SOBĄ", "PORAŻKA", "POCZUCIE POKONANIA",
    "ROZCZAROWANIE", "ODRZUCENIE", "SAMOTNOŚĆ", "NIEADEKWATNA BEZRADNOŚĆ", "TĘSKNOTA"] },
  { id: "radosc", label: "Radość", words: ["WESOŁOŚĆ", "UFNOŚĆ", "PEWNOŚĆ SIEBIE", "SPOKÓJ", "CIEPŁO", "LEKKOŚĆ", "MIŁOŚĆ", "LUBIENIE",
    "POGODA DUCHA", "NADZIEJA", "CHĘĆ", "SERDECZNOŚĆ", "ŻYCZLIWOŚĆ", "CZUŁOŚĆ", "SPOKOJNA DUMA"] },
  { id: "strach", label: "Strach", words: ["PANIKA", "PŁOSZENIE SIĘ", "NIEŚMIAŁOŚĆ", "OBAWA", "LĘK", "BOJAŹLIWOŚĆ", "ZDENERWOWANIE", "ZAZDROŚĆ",
    "NIEUFNOŚĆ", "ZAWIŚĆ", "OSTROŻNOŚĆ", "POWŚCIĄGLIWOŚĆ", "NIEPOKÓJ", "PRZERAŻENIE", "PRZESTRASZENIE", "DRĘCZENIE", "LITOŚĆ"] }
];

const Kolo = (() => {
  const NS = "http://www.w3.org/2000/svg", NOTE_MAX = 500;
  const CX = 250, CY = 250, R_OUT = 230, R_IN = 70, STEP = 360 / KOLO.length, START = -STEP / 2; // Wstyd na górze
  const MAIN = "*";                       // „samo uczucie” grupy, np. GNIEW ogólnie
  const $ = id => document.getElementById(id);
  let active = "wstyd", built = false, undoSel = null, undoTimer = 0;
  // klucz zaznaczenia = grupa|słowo (to samo słowo bywa w dwóch grupach, np. LEKCEWAŻENIE)
  const sel = () => AppState.kolo;
  const cat = id => KOLO.find(c => c.id === id);
  const nameOf = key => { const [c, w] = key.split("|"); return w === MAIN ? cat(c).label.toUpperCase() : w; };
  const valid = key => { const [c, w] = String(key).split("|"); const k = cat(c); return !!k && (w === MAIN || k.words.includes(w)); };
  const buzz = p => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* brak */ } };

  function polar(r, deg) { const a = (deg - 90) * Math.PI / 180; return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) }; }
  function arc(a0, a1) {
    const p1 = polar(R_OUT, a0), p2 = polar(R_OUT, a1), p3 = polar(R_IN, a1), p4 = polar(R_IN, a0), f = n => n.toFixed(2);
    return `M ${f(p1.x)} ${f(p1.y)} A ${R_OUT} ${R_OUT} 0 0 1 ${f(p2.x)} ${f(p2.y)} L ${f(p3.x)} ${f(p3.y)} A ${R_IN} ${R_IN} 0 0 0 ${f(p4.x)} ${f(p4.y)} Z`;
  }
  const svgEl = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };

  function buildWheel() {
    const box = $("kolo-slices");
    KOLO.forEach((c, i) => {
      const a0 = START + i * STEP, mid = a0 + STEP / 2, f = n => n.toFixed(1);
      const g = svgEl("g", { class: `kolo-slice k-${c.id}`, id: `kolo-slice-${c.id}`, role: "button", tabindex: "0", "aria-label": `${c.label} — ${c.words.length} uczuć` }, box);
      svgEl("path", { d: arc(a0, a0 + STEP) }, g);
      const rot = mid > 90 && mid < 270 ? mid + 180 : mid;          // napis zawsze „na nóżkach”
      const lp = polar(150, mid), sp = polar(196, mid), bp = polar(102, mid);
      const t = svgEl("text", { class: "kolo-label", x: f(lp.x), y: f(lp.y), "text-anchor": "middle", "dominant-baseline": "middle", transform: `rotate(${f(rot)} ${f(lp.x)} ${f(lp.y)})` }, g);
      t.textContent = c.label.toUpperCase();
      const s = svgEl("text", { class: "kolo-sub", x: f(sp.x), y: f(sp.y), "text-anchor": "middle", "dominant-baseline": "middle", transform: `rotate(${f(rot)} ${f(sp.x)} ${f(sp.y)})` }, g);
      s.textContent = `${c.words.length} uczuć`;
      const b = svgEl("g", { class: "kolo-badge", id: `kolo-badge-${c.id}`, "aria-hidden": "true" }, g);
      svgEl("circle", { cx: f(bp.x), cy: f(bp.y), r: 13 }, b);
      svgEl("text", { x: f(bp.x), y: f(bp.y + 0.5), "text-anchor": "middle", "dominant-baseline": "middle" }, b);
      g.addEventListener("click", () => { show(c.id); buzz(8); });
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(c.id); } });
    });
    $("kolo-btn-note").addEventListener("click", addToToday);
    $("kolo-btn-copy").addEventListener("click", copy);
    $("kolo-btn-reset").addEventListener("click", resetOrUndo);
  }

  function show(id) {
    active = id;
    const c = cat(id);
    KOLO.forEach(k => $(`kolo-slice-${k.id}`).classList.toggle("is-active", k.id === id));
    $("kolo-inspector").className = `card kolo-panel k-${id}`;
    $("kolo-inspector-title").textContent = c.label;
    $("kolo-inspector-count").textContent = `${c.words.length + 1} do wyboru`;
    renderWords();
  }

  // klucz przycisku z fokusem — po przebudowie listy fokus wraca na ten sam przycisk (klawiatura / czytnik ekranu)
  const focusedKey = () => document.activeElement?.dataset?.koloKey || null;
  function refocus(key) { if (key) document.querySelector(`[data-kolo-key="${CSS.escape(key)}"]`)?.focus(); }
  function renderWords() {
    const c = cat(active), box = $("kolo-words"), fk = focusedKey();
    box.replaceChildren();
    [MAIN, ...c.words].forEach(w => {
      const key = `${c.id}|${w}`, b = document.createElement("button");
      b.type = "button"; b.className = "kolo-word" + (w === MAIN ? " kolo-word--main" : "");
      b.textContent = w === MAIN ? `${c.label.toUpperCase()} — ogólnie` : w;
      b.setAttribute("aria-pressed", String(sel().includes(key)));
      b.dataset.koloKey = key;
      b.addEventListener("click", () => toggle(key));
      box.appendChild(b);
    });
    refocus(fk);
  }

  function persist() { Storage.save(); }
  function toggle(key) {
    if (sel().includes(key)) AppState.kolo = sel().filter(k => k !== key);
    else { AppState.kolo = [...sel(), key]; buzz([20, 30, 20]); }
    clearUndo(); persist(); renderWords(); renderSelected();
  }

  function renderSelected() {
    const box = $("kolo-selected"), n = sel().length, fk = focusedKey();
    box.replaceChildren();
    $("kolo-selected-count").textContent = String(n);
    $("kolo-btn-note").disabled = $("kolo-btn-copy").disabled = n === 0;
    if (!undoSel) $("kolo-btn-reset").disabled = n === 0;
    KOLO.forEach(c => {
      const k = sel().filter(x => x.startsWith(c.id + "|")).length, b = $(`kolo-badge-${c.id}`);
      b.style.display = k ? "" : "none"; b.querySelector("text").textContent = String(k);
    });
    if (!n) {
      const p = document.createElement("p"); p.className = "kolo-empty";
      p.textContent = "Nic jeszcze nie zaznaczono. Wybierz część koła i dotknij słowa.";
      box.appendChild(p); return;
    }
    sel().forEach(key => {
      const t = document.createElement("span"), dot = document.createElement("span"), name = document.createElement("span"), x = document.createElement("button");
      t.className = `kolo-tag k-${key.split("|")[0]}`; dot.className = "kolo-dot"; dot.setAttribute("aria-hidden", "true");
      name.textContent = nameOf(key);
      x.type = "button"; x.textContent = "×"; x.setAttribute("aria-label", `Odznacz: ${nameOf(key)}`);
      x.dataset.koloKey = "x|" + key;
      x.addEventListener("click", () => toggle(key));
      t.append(dot, name, x); box.appendChild(t);
    });
    if (fk && fk.startsWith("x|") && !sel().includes(fk.slice(2))) $("kolo-btn-reset").focus(); else refocus(fk);
  }

  // „ZŁOŚĆ, LEKCEWAŻENIE” → „złość, lekceważenie” (grupami, w kolejności koła)
  function line() {
    const parts = KOLO.map(c => sel().filter(k => k.startsWith(c.id + "|")).map(nameOf).join(", ").toLowerCase()).filter(Boolean);
    return `Uczucia: ${parts.join("; ")}`;
  }

  function addToToday() {
    const key = todayKey(), day = AppState.days[key] || blankDay(), add = line();
    if ((day.note || "").split("\n").includes(add)) { showToast("Ta lista jest już w dzisiejszym wpisie."); return; }
    const note = day.note?.trim() ? `${day.note.trimEnd()}\n${add}` : add;
    if (note.length > NOTE_MAX) { showToast(`Notatka dnia ma limit ${NOTE_MAX} znaków — skróć listę albo notatkę.`, "error"); return; }
    day.note = note; AppState.days[key] = day;
    App.persist();
    showToast("Dopisane do dzisiejszego wpisu ✓");
  }

  async function copy() {
    const text = `${displayDate(todayKey())} — ${line()}`;
    try { await navigator.clipboard.writeText(text); showToast("Skopiowano ✓"); return; } catch (e) { /* brak schowka */ }
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) { return; /* anulowane */ }
    showToast("Nie udało się skopiować.", "error");
  }

  // „Wyczyść” zmienia się na 6 s w „Cofnij” (bez okienek z pytaniem)
  function clearUndo() {
    if (!undoSel) return;
    undoSel = null; clearTimeout(undoTimer);
    const b = $("kolo-btn-reset"); b.textContent = "Wyczyść"; b.disabled = sel().length === 0;
  }
  function resetOrUndo() {
    const b = $("kolo-btn-reset");
    if (undoSel) { AppState.kolo = undoSel; clearUndo(); persist(); renderWords(); renderSelected(); return; }
    undoSel = sel(); AppState.kolo = []; persist(); renderWords(); renderSelected();
    b.textContent = "Cofnij"; b.disabled = false;
    undoTimer = setTimeout(clearUndo, 6000);
  }

  function load(list) { return Array.isArray(list) ? list.filter(valid) : []; }
  // wylogowanie / „Usuń dane”: nic z poprzedniego konta nie może wrócić przez „Cofnij”
  function reset() { undoSel = null; clearTimeout(undoTimer); AppState.kolo = []; if (built) { $("kolo-btn-reset").textContent = "Wyczyść"; show(active); renderSelected(); } }
  function open() {                       // wołane przy wejściu na zakładkę i po zalogowaniu
    if (!built) { buildWheel(); built = true; }
    show(active); renderSelected();
  }
  return { load, open, reset, line, get selected() { return [...sel()]; } };
})();

// Dolne menu: Dzienniczek | Koło | Wstyd. Zakładka pamiętana w przeglądarce (wygoda), adres #kolo / #wstyd otwiera ją od razu.
const Views = (() => {
  const KEY = "dzienniczek_ui_tab_v1", $ = id => document.getElementById(id);
  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const write = v => { try { localStorage.setItem(KEY, v); } catch (e) { /* tryb prywatny */ } };
  const TABS = ["dziennik", "kolo", "wstyd"];
  const fromHash = () => (location.hash === "#kolo" ? "kolo" : location.hash === "#wstyd" ? "wstyd" : null);
  function go(tab, remember = true) {
    if (!TABS.includes(tab)) tab = "dziennik";
    TABS.forEach(t => { $(`view-${t}`).hidden = t !== tab; });
    document.querySelectorAll("#bottom-nav [data-tab]").forEach(b => b.setAttribute("aria-current", b.dataset.tab === tab ? "page" : "false"));
    if (tab === "kolo") Kolo.open();
    if (tab === "wstyd") Wstyd.open();
    if (remember) write(tab);
    const hash = tab === "dziennik" ? "" : `#${tab}`;
    if (location.hash !== hash) history.replaceState(null, "", location.pathname + location.search + hash);
    window.scrollTo({ top: 0 });
  }
  function onLogin() { $("bottom-nav").hidden = false; go(fromHash() || read() || "dziennik", false); }
  function onLogout() { Kolo.reset(); Wstyd.reset(); $("bottom-nav").hidden = true; $("view-dziennik").hidden = false; $("view-kolo").hidden = true; $("view-wstyd").hidden = true; }
  document.addEventListener("DOMContentLoaded", () => document.querySelectorAll("#bottom-nav [data-tab]").forEach(b => b.addEventListener("click", () => go(b.dataset.tab))));
  window.addEventListener("hashchange", () => { if (!$("bottom-nav").hidden) go(fromHash() || "dziennik"); });
  return { go, onLogin, onLogout };
})();
