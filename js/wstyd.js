// Dzienniczek wstydu — zakładka dzienniczka (Bartek 12.10.2026: praca domowa z zajęć 06.10 „Wstyd” → „kolejna zakładka w dzienniczku”).
// Zadanie: (1) zaobserwuj i zapisz fizjologiczne objawy wstydu, (2) przez tydzień zapisuj sytuacje, kiedy czułaś/czułeś wstyd,
// i w jaki sposób go wyrażałaś/wyrażałeś. Wpisy = AppState.wstyd, zapis razem z kontem (Storage.save) — gość: tylko na czas sesji.
const WSTYD_CIALO = ["Gorąco / rumieniec na twarzy", "Spuszczony wzrok", "Chęć schowania się, ucieczki", "Kulenie się, garbienie",
  "Ścisk w gardle", "Ucisk w żołądku", "Ucisk w klatce", "Szybkie bicie serca", "Pocenie się", "Drżenie", "Napięte mięśnie",
  "Ściszony głos, zamilknięcie", "Pustka w głowie"];
// „Odmiany wstydu” z karty pracy „Wstyd”
const WSTYD_ODMIANY = ["Zażenowanie", "Zawstydzenie", "Upokorzenie", "Zakłopotanie", "Zamieszanie", "Poczucie niższości (gorszości)",
  "Poczucie bycia zlekceważonym", "Poczucie obnażenia", "Poczucie zdemaskowania"];

const Wstyd = (() => {
  const $ = id => document.getElementById(id), TXT = 1000, MAX = 500;
  let built = false, editId = null, armedDelete = null, armTimer = 0;
  const list = () => AppState.wstyd;
  const uid = () => `w${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  const clean = (v, n = TXT) => String(v ?? "").slice(0, n);
  const pick = (arr, allowed) => Array.isArray(arr) ? arr.filter(x => allowed.includes(x)) : [];

  function valid(e) { return e && typeof e === "object" && /^\d{4}-\d{2}-\d{2}$/.test(e.date || "") && typeof e.id === "string"; }
  function load(arr) {
    return Array.isArray(arr) ? arr.filter(valid).slice(0, MAX).map(e => ({
      id: e.id, date: e.date, sytuacja: clean(e.sytuacja), cialo: pick(e.cialo, WSTYD_CIALO), cialoInne: clean(e.cialoInne, 200),
      odmiany: pick(e.odmiany, WSTYD_ODMIANY), wyrazenie: clean(e.wyrazenie), at: e.at || "",
    })) : [];
  }

  function chips(boxId, words, selected) {
    const box = $(boxId); box.replaceChildren();
    words.forEach(w => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "kolo-word"; b.textContent = w;
      b.setAttribute("aria-pressed", String(selected.includes(w)));
      b.addEventListener("click", () => b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")));
      box.appendChild(b);
    });
  }
  const chosen = boxId => [...$(boxId).querySelectorAll('[aria-pressed="true"]')].map(b => b.textContent);

  function fillForm(e) {
    $("wstyd-date").value = e?.date || todayKey();
    $("wstyd-sytuacja").value = e?.sytuacja || "";
    $("wstyd-cialo-inne").value = e?.cialoInne || "";
    $("wstyd-wyrazenie").value = e?.wyrazenie || "";
    chips("wstyd-cialo", WSTYD_CIALO, e?.cialo || []);
    chips("wstyd-odmiany", WSTYD_ODMIANY, e?.odmiany || []);
    $("wstyd-form-title").textContent = e ? `Edytujesz wpis z ${displayDate(e.date)}` : "Nowy wpis";
    $("wstyd-btn-cancel").hidden = !e;
    $("wstyd-btn-save").textContent = e ? "Zapisz zmiany" : "Zapisz wpis";
  }

  function save() {
    const date = $("wstyd-date").value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { showToast("Wybierz datę.", "error"); return; }
    const e = { date, sytuacja: clean($("wstyd-sytuacja").value.trim()), cialo: chosen("wstyd-cialo"), cialoInne: clean($("wstyd-cialo-inne").value.trim(), 200),
      odmiany: chosen("wstyd-odmiany"), wyrazenie: clean($("wstyd-wyrazenie").value.trim()) };
    if (!e.sytuacja && !e.wyrazenie && !e.cialo.length && !e.cialoInne) { showToast("Wpisz choć jedno: sytuację, objawy w ciele albo jak to wyraziłeś.", "error"); return; }
    const before = list();
    if (editId && before.some(x => x.id === editId)) AppState.wstyd = before.map(x => x.id === editId ? { ...x, ...e } : x);
    else {
      if (before.length >= MAX) { showToast(`Limit ${MAX} wpisów — usuń starsze.`, "error"); return; }
      AppState.wstyd = [{ id: uid(), at: new Date().toISOString(), ...e }, ...before];
    }
    if (!Storage.save()) { AppState.wstyd = before; return; }   // nieudany zapis — nic nie udajemy
    showToast(editId ? "Wpis poprawiony ✓" : "Zapisane ✓");
    editId = null; fillForm(null); render();
  }

  function startEdit(id) {
    const e = list().find(x => x.id === id); if (!e) return;
    editId = id; fillForm(e);
    $("wstyd-form").scrollIntoView({ behavior: "smooth", block: "start" });
    $("wstyd-sytuacja").focus({ preventScroll: true });
  }

  // „Usuń” — drugie dotknięcie w 4 s potwierdza (bez okienek)
  function askDelete(id, btn) {
    if (armedDelete !== id) {
      armedDelete = id; clearTimeout(armTimer); btn.textContent = "Na pewno usunąć?"; btn.classList.add("is-armed");
      armTimer = setTimeout(() => { armedDelete = null; render(); }, 4000); return;
    }
    clearTimeout(armTimer); armedDelete = null;
    const before = list(); AppState.wstyd = before.filter(x => x.id !== id);
    if (!Storage.save()) { AppState.wstyd = before; return; }
    if (editId === id) { editId = null; fillForm(null); }
    showToast("Wpis usunięty"); render();
  }

  const sorted = () => [...list()].sort((a, b) => (b.date + b.at).localeCompare(a.date + a.at));
  function para(label, text) {
    const p = document.createElement("p"), b = document.createElement("strong");
    p.className = "wstyd-line"; b.textContent = label + " "; p.append(b, document.createTextNode(text)); return p;
  }
  function tags(words) {
    const box = document.createElement("div"); box.className = "wstyd-tags";
    words.forEach(w => { const t = document.createElement("span"); t.className = "kolo-chip"; t.textContent = w; box.appendChild(t); });
    return box;
  }

  function render() {
    const box = $("wstyd-list"), all = sorted();
    box.replaceChildren();
    $("wstyd-count").textContent = String(all.length);
    $("wstyd-btn-copy").disabled = all.length === 0;
    if (!all.length) { const p = document.createElement("p"); p.className = "kolo-empty"; p.textContent = "Jeszcze nic nie zapisano. Pierwszy wpis zrób wyżej."; box.appendChild(p); }
    all.forEach(e => {
      const c = document.createElement("article"); c.className = "wstyd-entry";
      const h = document.createElement("h3"); h.textContent = displayDate(e.date); c.appendChild(h);
      if (e.sytuacja) c.appendChild(para("Sytuacja:", e.sytuacja));
      if (e.odmiany.length) { c.appendChild(para("Jaki wstyd:", "")); c.appendChild(tags(e.odmiany)); }
      const body = [...e.cialo, ...(e.cialoInne ? [e.cialoInne] : [])];
      if (body.length) { c.appendChild(para("W ciele:", "")); c.appendChild(tags(body)); }
      if (e.wyrazenie) c.appendChild(para("Jak to wyraziłem/am:", e.wyrazenie));
      const act = document.createElement("div"); act.className = "wstyd-entry-actions";
      const ed = document.createElement("button"); ed.type = "button"; ed.className = "btn btn-ghost"; ed.textContent = "Edytuj";
      ed.addEventListener("click", () => startEdit(e.id));
      const del = document.createElement("button"); del.type = "button"; del.className = "btn btn-ghost wstyd-del"; del.textContent = armedDelete === e.id ? "Na pewno usunąć?" : "Usuń";
      del.addEventListener("click", () => askDelete(e.id, del));
      act.append(ed, del); c.appendChild(act); box.appendChild(c);
    });
    renderSummary(all);
  }

  // Ćwiczenie 1 z karty: „pełny obraz objawów” — co najczęściej czujesz w ciele
  function renderSummary(all) {
    const n = {}; all.forEach(e => [...e.cialo, ...(e.cialoInne ? [e.cialoInne] : [])].forEach(w => { n[w] = (n[w] || 0) + 1; }));
    const top = Object.entries(n).sort((a, b) => b[1] - a[1]).slice(0, 6), box = $("wstyd-summary");
    box.replaceChildren();
    if (!top.length) { $("wstyd-summary-card").hidden = true; return; }
    $("wstyd-summary-card").hidden = false;
    top.forEach(([w, k]) => { const t = document.createElement("span"); t.className = "kolo-chip"; t.textContent = `${w} · ${k}×`; box.appendChild(t); });
  }

  function text() {
    return sorted().map(e => [
      displayDate(e.date),
      e.sytuacja && `Sytuacja: ${e.sytuacja}`,
      e.odmiany.length && `Jaki wstyd: ${e.odmiany.join(", ").toLowerCase()}`,
      (e.cialo.length || e.cialoInne) && `W ciele: ${[...e.cialo, ...(e.cialoInne ? [e.cialoInne] : [])].join(", ").toLowerCase()}`,
      e.wyrazenie && `Jak to wyraziłem/am: ${e.wyrazenie}`,
    ].filter(Boolean).join("\n")).join("\n\n");
  }
  async function copy() {
    const t = `Dzienniczek wstydu\n\n${text()}`;
    try { await navigator.clipboard.writeText(t); showToast("Skopiowano ✓"); return; } catch (e) { /* brak schowka */ }
    try { if (navigator.share) { await navigator.share({ text: t }); return; } } catch (e) { return; }
    showToast("Nie udało się skopiować.", "error");
  }

  function build() {
    $("wstyd-btn-save").addEventListener("click", save);
    $("wstyd-btn-cancel").addEventListener("click", () => { editId = null; fillForm(null); });
    $("wstyd-btn-copy").addEventListener("click", copy);
    fillForm(null);
  }
  function open() { if (!built) { build(); built = true; } if (!editId) $("wstyd-date").value ||= todayKey(); render(); }
  // wylogowanie / „Usuń dane”: formularz i lista czyste, nic z poprzedniego konta
  function reset() { AppState.wstyd = []; editId = null; armedDelete = null; clearTimeout(armTimer); if (built) { fillForm(null); render(); } }
  return { load, open, reset, text };
})();
