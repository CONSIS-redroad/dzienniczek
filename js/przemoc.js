// Kwestionariusz przemocy emocjonalnej — 4. zakładka dzienniczka (Bartek 07.11.2026: kod od Gemini „przerobić, żeby wpiąć i stylowo pasował”).
// 9 obszarów, 65 pytań, odpowiedź Często / Rzadko / Nigdy. Odpowiedzi zapisują się same pod OSOBNYM kluczem (<klucz użytkownika>_przemoc),
// „Zapisz wynik z dziś” dokłada migawkę do historii (porównanie w czasie). To NIE test diagnostyczny — bez progów „niski/wysoki”.
// Etykieta w dolnym menu celowo neutralna („Pytania”), żeby ekran telefonu nie zdradzał treści osobie obok.
const PRZEMOC = [
  { id: "izolacja", short: "Izolacja", title: "Izolacja", desc: "Ograniczanie Twoich kontaktów z ludźmi i to, jak się do tego przystosowujesz.", parts: [
    { sub: "A. Próby izolacji ze strony partnera/ki", q: [
      "Czy Twój partner/ka ośmiesza lub znieważa osoby, które lubisz?",
      "Czy Twój partner/ka jest zazdrosny/a o Twoich przyjaciół, rodzinę, a nawet psa czy kota?",
      "Czy Twój partner/ka podsłuchuje Twoje rozmowy telefoniczne lub czyta Twoją korespondencję?",
      "Czy Twój partner/ka okazuje zniecierpliwienie lub złość przed spotkaniem rodzinnym czy towarzyskim albo w jego trakcie, odbierając Ci radość z niego?"] },
    { sub: "B. Przystosowanie się do izolacji", q: [
      "Czy zniechęcasz ludzi do dzwonienia do Ciebie, gdy jesteś w domu, bo partner/ka okazuje niezadowolenie, gdy przy nim/niej poświęcasz czas komuś innemu?",
      "Czy o wiele mniej kontaktujesz się z rodziną i znajomymi, odkąd jesteś w tym związku?",
      "Czy czujesz się niezręcznie, będąc jednocześnie z partnerem/ką i ze znajomymi?",
      "Czy czujesz zdenerwowanie lub obawę, co partner/ka powie lub zrobi, jeśli spóźnisz się kilka minut z pracy, zakupów albo od znajomych?"] }] },
  { id: "uwaga", short: "Skupienie na partnerze", title: "Koncentracja uwagi na partnerze", desc: "Ciągłe skupienie na jego/jej potrzebach i nastrojach kosztem własnych.", parts: [
    { q: [
      "Czy musisz mieć akceptację partnera/ki dla swoich ubrań, opinii, decyzji?",
      "Czy czujesz się przytłoczona/y przez partnera/kę, nawet gdy nie ma go/jej obok?",
      "Czy uważasz na to, co mówisz, albo w ogóle unikasz mówienia, żeby nie denerwować partnera/ki?",
      "Czy planujesz swoje zajęcia tak, żeby partner/ka nie zorientował/a się, co robisz?",
      "Czy masz poczucie, że musisz uważać na każdy swój ruch?"] }] },
  { id: "wyzszosc", short: "Wyższość", title: "Okazywanie wyższości", desc: "Przedstawianie siebie jako nieomylnego, wszechwiedzącego, mającego kontrolę.", parts: [
    { q: [
      "Czy Twój partner/ka twierdzi, że jest wyjątkowo bystry/a, ma nieprzeciętną wiedzę lub niezwykłe zdolności?",
      "Czy Twój partner/ka twierdzi, że wie więcej o życiu niż Ty?",
      "Czy Twój partner/ka twierdzi, że ma przyjaciół albo sposób, by dowiedzieć się, co robisz poza domem?",
      "Czy Twój partner/ka twierdzi, że on/ona wie, jak należy postępować, a Ty tego nie wiesz?"] }] },
  { id: "wymagania", short: "Wymagania", title: "Narzucanie wymagań i kontrola", desc: "Sztywne zasady, kontrola czasu i ubrań, przerywanie odpoczynku.", parts: [
    { q: [
      "Czy Twój partner/ka nalega, żeby różne czynności przebiegały w określony sposób albo dokładnie o określonej porze?",
      "Czy Twój partner/ka przerywa Twoją pracę, sen lub inne ważne dla Ciebie zajęcia, żeby zaspokoić swoje potrzeby?",
      "Czy Twój partner/ka domaga się, żebyś nosił/a tylko ubrania, biżuterię itp., które on/ona kupuje?",
      "Czy Twój partner/ka wymaga, żebyś wykonywał/a niewdzięczne prace albo mu/jej usługiwał/a?",
      "Czy Twój partner/ka kontroluje Twoją pracę, robiąc przy tym przesadnie krytyczne uwagi?",
      "Czy Twój partner/ka domaga się, żebyś szczegółowo opowiadał/a, jak spędzasz czas?"] }] },
  { id: "wyczerpanie", short: "Wyczerpanie", title: "Wyczerpanie i osłabienie", desc: "Przewlekłe zmęczenie, lęk, utrata wiary w siebie, zależność od partnera.", parts: [
    { q: [
      "Czy sprawiają Ci trudność sprawy, z którymi dotąd radziłaś/eś sobie z łatwością?",
      "Czy masz mniej lub bardziej poważne kłopoty ze zdrowiem?",
      "Czy bywasz przerażona/y?",
      "Czy masz poczucie, że nie poradziłabyś/poradziłbyś sobie bez partnera/ki?"] }] },
  { id: "ponizanie", short: "Poniżanie", title: "Poniżanie", desc: "Krytykowanie, obrażanie, zawstydzanie, wyzwiska, uderzanie w godność.", parts: [
    { q: [
      "Czy Twój partner/ka zmusza Cię do robienia rzeczy niezgodnych z Twoją wiarą lub wartościami?",
      "Czy Twój partner/ka ośmiesza cechy, które najbardziej w sobie cenisz?",
      "Czy Twój partner/ka mówi Ci, że nikt inny by Cię nie chciał?",
      "Czy Twój partner/ka namówił/a Cię do czegoś, a potem wypominał/a Ci to tak, że czułaś/eś winę lub wstyd?",
      "Czy Twój partner/ka trzyma Cię długo w nocy, wypytując o prawdziwe lub wymyślone romanse, w których jego/jej zdaniem brałaś/eś udział?",
      "Czy Twój partner/ka zmusza Cię do przepraszania za rzeczy, których nie zrobiłaś/eś?",
      "Czy Twój partner/ka każe Ci prosić o pozwolenie na wydanie pieniędzy na dom lub Twoje rzeczy — także z Twoich zarobków?",
      "Czy Twój partner/ka używa wobec Ciebie poniżających wyzwisk?",
      "Czy Twój partner/ka chwali się swoimi podbojami lub flirtuje z innymi przy Tobie?"] }] },
  { id: "grozby", short: "Groźby", title: "Groźby i zastraszanie", desc: "Groźby odejścia, szantaż emocjonalny, groźby finansowe, zastraszanie siłą.", parts: [
    { q: [
      "Czy partner/ka grozi, że opowie komuś, co robiłaś/eś lub mówiłaś/eś, gdy byliście sami?",
      "Czy w czasie kłótni grozi, że Cię zostawi lub się rozwiedzie?",
      "Czy mówi, że zachoruje psychicznie lub odbierze sobie życie, jeśli odejdziesz lub przestaniesz go/ją kochać?",
      "Jeśli jest uzależniony/a, czy daje do zrozumienia, że znowu zacznie pić lub brać, jeśli nie spełnisz jego/jej oczekiwań?",
      "Czy grozi, że „da Ci nauczkę” albo Cię ukarze, jeśli będziesz „niegrzeczna/y”?",
      "Czy grozi, że odbierze Ci pieniądze, karty, kluczyki do samochodu albo zablokuje Ci konto w banku?",
      "Czy głosem, miną lub postawą ciała straszy Cię, pokazując, że traci panowanie nad złością?",
      "Jeśli zostałaś/eś uderzona/y lub pobita/y — czy boisz się, że to się powtórzy, jeśli się sprzeciwisz?",
      "Czy Twój partner/ka trzyma „pod ręką” broń, nóż lub inne niebezpieczne narzędzia?"] }] },
  { id: "nagrody", short: "Przerwy i nagrody", title: "Przerwy i nagrody („miodowy miesiąc”)", desc: "Prezenty i czułość po krzywdzie — mechanizm, który wiąże i każe czekać na „dobre chwile”.", parts: [
    { q: [
      "Czy kupuje Ci drogie prezenty, gdy właśnie myślałaś/eś o rozstaniu albo gdy bez powodu Cię skrzywdził/a?",
      "Czy niespodziewanie robi coś, o co długo i bezskutecznie prosiłaś/eś?",
      "Czy niespodziewanie staje się wyrozumiały/a dla czegoś, co zwykle wywołuje wybuch złości?",
      "Czy zaskakuje Cię jego/jej niezwykła wrażliwość na Twoje przeżycia i pragnienia?",
      "Czy po tym, jak szczególnie dotkliwie Cię zrani, okazuje Ci specjalne względy i otacza troską?"] }] },
  { id: "rzeczywistosc", short: "Podważanie rzeczywistości", title: "Podważanie Twojego poczucia rzeczywistości", desc: "Podważanie Twojej pamięci, ocen i zaufania do siebie (tzw. gaslighting).", parts: [
    { sub: "A. Zachowania partnera/ki", q: [
      "Czy, gdy się z nim/nią nie zgadzasz, partner/ka mówi, że jesteś „głupia/i” albo „zwariowałaś/eś”?",
      "Czy przepraszając, mówi, że krzywdzące zachowanie świadczy o sile miłości i o lęku, że Cię straci?",
      "Czy mówi Ci, że żyjecie we wrogim świecie i możecie liczyć tylko na siebie?",
      "Czy po krzywdzie okazuje tak wielki żal i poczucie winy, że to Ty zaczynasz go/ją pocieszać?",
      "Czy zwierzył/a Ci się w tajemnicy z czegoś obciążającego, co budzi Twój sprzeciw lub wstyd?",
      "Czy okłamuje Cię w drobnych, mało ważnych sprawach?",
      "Czy stawia Ci sprzeczne wymagania?",
      "Czy zaprzecza dobrym opiniom innych ludzi o Tobie?",
      "Czy wyraża się źle o cesze, którą w sobie cenisz?",
      "Czy wyświadcza Ci przysługę, a potem złości się, jeśli nie odwdzięczysz się w zamian?"] },
    { sub: "B. Jak to na Ciebie działa", q: [
      "Czy nie ufasz swoim odczuciom wobec siebie, partnera/ki, innych ludzi?",
      "Czy wstydzisz się dziś rzeczy, z których kiedyś byłaś/eś dumna/y?",
      "Czy boisz się, że nikt by Cię nie lubił, gdyby wiedział, jaka/i naprawdę jesteś?",
      "Czy partner/ka sprawia, że zaczynasz wątpić w wartość swoich długoletnich przyjaźni?",
      "Czy uważasz, że tylko Ty możesz uratować partnera/kę przed „staczaniem się” lub depresją, choć to Ty jesteś stroną zależną?"] }] },
];
const PRZEMOC_ODP = [["c", "Często", 2], ["r", "Rzadko", 1], ["n", "Nigdy", 0]];

const Przemoc = (() => {
  const $ = id => document.getElementById(id), HIST = 50;
  // klucz odpowiedzi = „obszar.numer” (numer w obszarze od 1) — zmiana kolejności obszarów nie miesza odpowiedzi
  const KEYS = PRZEMOC.map(s => s.parts.flatMap(p => p.q).map((_, i) => `${s.id}.${i + 1}`));
  const ALL = KEYS.flat(), TOTAL = ALL.length, MAXPTS = TOTAL * 2, VAL = Object.fromEntries(PRZEMOC_ODP.map(o => [o[0], o[2]]));
  let built = false, armedClear = false, armTimer = 0;
  let st = { answers: {}, history: [] };
  // dane z pamięci przeglądarki traktujemy jak obce: liczba całkowita w zakresie, data prawdziwa
  const int = (v, max) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0; };
  const realDate = d => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof d === "string" ? d : ""); return !!m && dateKey(new Date(+m[1], +m[2] - 1, +m[3])) === d; };

  function load(raw) {
    const a = {}, src = raw && typeof raw === "object" && raw.answers && typeof raw.answers === "object" ? raw.answers : {};
    ALL.forEach(k => { if (typeof src[k] === "string" && Object.hasOwn(VAL, src[k])) a[k] = src[k]; });
    const h = Array.isArray(raw?.history) ? raw.history.filter(x => x && typeof x === "object" && realDate(x.date) && x.scores && typeof x.scores === "object").slice(0, HIST)
      .map(x => { const scores = Object.fromEntries(PRZEMOC.map((s, i) => [s.id, int(x.scores[s.id], KEYS[i].length * 2)]));
        return { date: x.date, at: String(x.at || "").slice(0, 40), answered: int(x.answered, TOTAL), total: Object.values(scores).reduce((a, b) => a + b, 0), scores }; }) : [];   // suma liczona z obszarów, nie brana z pamięci
    return { answers: a, history: h };
  }
  const key = () => { const k = Storage.key(); return k ? k + "_przemoc" : null; };
  function read() { try { return JSON.parse(Storage.box().getItem(key()) || "null"); } catch (e) { return null; } }
  function save() { try { Storage.box().setItem(key(), JSON.stringify(st)); return true; } catch (e) { showToast("Nie udało się zapisać danych.", "error"); return false; } }

  function score() {
    const per = {}; let total = 0, answered = 0;
    PRZEMOC.forEach((s, i) => {
      let p = 0, n = 0, c = 0, r = 0;
      KEYS[i].forEach(k => { const v = st.answers[k]; if (!v) return; n++; p += VAL[v]; if (v === "c") c++; if (v === "r") r++; });
      per[s.id] = { pts: p, max: KEYS[i].length * 2, answered: n, count: KEYS[i].length, c, r }; total += p; answered += n;
    });
    return { per, total, answered };
  }

  function build() {
    const box = $("przemoc-sekcje"); box.replaceChildren();
    let nr = 0;
    PRZEMOC.forEach((s, si) => {
      const d = document.createElement("details"); d.className = "card prz-sec"; d.id = `prz-sec-${s.id}`; if (si === 0) d.open = true;
      const sum = document.createElement("summary"), t = document.createElement("span"), c = document.createElement("span");
      t.className = "prz-sec-title"; t.textContent = `${si + 1}. ${s.title}`; c.className = "kolo-chip prz-sec-count"; c.dataset.sec = s.id;
      sum.append(t, c); d.appendChild(sum);
      const desc = document.createElement("p"); desc.className = "prz-sec-desc"; desc.textContent = s.desc; d.appendChild(desc);
      let qi = 0;
      s.parts.forEach(p => {
        if (p.sub) { const h = document.createElement("h3"); h.className = "prz-sub"; h.textContent = p.sub; d.appendChild(h); }
        p.q.forEach(text => {
          nr++; const k = KEYS[si][qi++];
          const q = document.createElement("div"); q.className = "prz-q"; q.setAttribute("role", "radiogroup");
          const lab = document.createElement("p"); lab.className = "prz-q-text"; lab.id = `prz-q-${k.replace(".", "-")}`;
          const num = document.createElement("span"); num.className = "prz-q-nr"; num.textContent = `${nr}.`;
          lab.append(num, document.createTextNode(" " + text)); q.setAttribute("aria-labelledby", lab.id);
          const opts = document.createElement("div"); opts.className = "prz-opts";
          PRZEMOC_ODP.forEach(([v, label]) => {
            const l = document.createElement("label"), inp = document.createElement("input");
            l.className = `prz-opt prz-opt--${v}`; inp.type = "radio"; inp.name = `prz-${k}`; inp.value = v; inp.dataset.k = k;
            inp.addEventListener("change", () => { st.answers[k] = v; if (save()) refresh(); });
            l.append(inp, document.createTextNode(label)); opts.appendChild(l);
          });
          q.append(lab, opts); d.appendChild(q);
        });
      });
      box.appendChild(d);
    });
    $("przemoc-btn-save").addEventListener("click", snapshot);
    $("przemoc-btn-copy").addEventListener("click", copy);
    $("przemoc-btn-clear").addEventListener("click", clearAnswers);
  }

  function syncInputs() { $("przemoc-sekcje").querySelectorAll("input[type=radio]").forEach(i => { i.checked = st.answers[i.dataset.k] === i.value; }); }

  function bar(label, pts, max, extra) {
    const row = document.createElement("div"); row.className = "prz-bar";
    const top = document.createElement("div"); top.className = "prz-bar-top";
    const l = document.createElement("span"); l.textContent = label;
    const v = document.createElement("span"); v.className = "prz-bar-val"; v.textContent = `${pts} / ${max}`;
    top.append(l, v);
    const track = document.createElement("div"); track.className = "prz-track";
    const fill = document.createElement("div"); fill.className = "prz-fill"; fill.style.width = `${max ? Math.round(pts / max * 100) : 0}%`;
    track.appendChild(fill); track.setAttribute("role", "img"); track.setAttribute("aria-label", `${label}: ${pts} z ${max} punktów`);
    row.append(top, track);
    if (extra) { const e = document.createElement("p"); e.className = "prz-bar-extra"; e.textContent = extra; row.appendChild(e); }
    return row;
  }

  function refresh() {
    const sc = score(), pct = Math.round(sc.answered / TOTAL * 100);
    $("przemoc-progress-text").textContent = `${sc.answered} / ${TOTAL} pytań`;
    $("przemoc-progress-fill").style.width = `${pct}%`;
    $("przemoc-progress").setAttribute("aria-valuenow", String(sc.answered));
    document.querySelectorAll(".prz-sec-count").forEach(c => { const p = sc.per[c.dataset.sec]; c.textContent = `${p.answered}/${p.count}`; c.classList.toggle("is-done", p.answered === p.count); });
    $("przemoc-total").textContent = String(sc.total);
    $("przemoc-total-max").textContent = `/ ${MAXPTS} pkt`;
    const bars = $("przemoc-bars"); bars.replaceChildren();
    PRZEMOC.forEach((s, i) => {
      const p = sc.per[s.id];
      const extra = p.answered ? `często: ${p.c} · rzadko: ${p.r}${p.answered < p.count ? ` · bez odpowiedzi: ${p.count - p.answered}` : ""}` : "jeszcze bez odpowiedzi";
      bars.appendChild(bar(`${i + 1}. ${s.short}`, p.pts, p.max, extra));
    });
    $("przemoc-btn-save").disabled = sc.answered === 0;
    $("przemoc-btn-copy").disabled = sc.answered === 0;
    $("przemoc-btn-clear").disabled = sc.answered === 0;
    renderHistory();
  }

  function renderHistory() {
    const card = $("przemoc-hist-card"), box = $("przemoc-hist"); box.replaceChildren();
    card.hidden = !st.history.length; if (!st.history.length) return;
    st.history.forEach((h, idx) => {
      const prev = st.history[idx + 1];
      const row = document.createElement("div"); row.className = "prz-hist-row";
      const d = document.createElement("strong"); d.textContent = displayDate(h.date);
      const v = document.createElement("span"); v.textContent = `${h.total} pkt · odpowiedzi ${h.answered}/${TOTAL}`;
      row.append(d, v);
      if (prev) { const df = h.total - prev.total, s = document.createElement("span"); s.className = "kolo-chip"; s.textContent = df === 0 ? "bez zmian" : `${df > 0 ? "+" : "−"}${Math.abs(df)} od poprzedniego`; row.appendChild(s); }
      box.appendChild(row);
    });
  }

  function snapshot() {
    const sc = score(); if (!sc.answered) return;
    const entry = { date: todayKey(), at: new Date().toISOString(), answered: sc.answered, total: sc.total, scores: Object.fromEntries(PRZEMOC.map(s => [s.id, sc.per[s.id].pts])) };
    const before = st.history;
    st.history = [entry, ...before.filter(h => h.date !== entry.date)].slice(0, HIST);   // jeden wynik na dzień — nowszy zastępuje
    if (!save()) { st.history = before; return; }
    showToast("Wynik zapisany ✓"); renderHistory();
  }

  // „Wyczyść odpowiedzi” — drugie dotknięcie w 4 s potwierdza (jak „Usuń” we Wstydzie); historia wyników zostaje
  function clearAnswers() {
    const b = $("przemoc-btn-clear");
    if (!armedClear) { armedClear = true; b.textContent = "Na pewno wyczyścić?"; b.classList.add("is-armed"); clearTimeout(armTimer); armTimer = setTimeout(disarm, 4000); return; }
    disarm(); const before = st.answers; st.answers = {};
    if (!save()) { st.answers = before; return; }
    syncInputs(); refresh(); showToast("Odpowiedzi wyczyszczone");
  }
  function disarm() { armedClear = false; clearTimeout(armTimer); const b = $("przemoc-btn-clear"); if (b) { b.textContent = "Wyczyść odpowiedzi"; b.classList.remove("is-armed"); } }

  function text() {
    const sc = score(), odp = Object.fromEntries(PRZEMOC_ODP.map(o => [o[0], o[1].toLowerCase()]));
    const lines = [`Kwestionariusz przemocy emocjonalnej — ${displayDate(todayKey())}`, `Odpowiedzi: ${sc.answered}/${TOTAL}, punkty: ${sc.total}/${MAXPTS}`, ""];
    PRZEMOC.forEach((s, i) => {
      const p = sc.per[s.id]; lines.push(`${i + 1}. ${s.title}: ${p.pts}/${p.max} pkt (często ${p.c}, rzadko ${p.r})`);
      let qi = 0; s.parts.forEach(pt => pt.q.forEach(q => { const v = st.answers[KEYS[i][qi++]]; if (v && v !== "n") lines.push(`   – ${odp[v]}: ${q}`); }));
    });
    return lines.join("\n");
  }
  async function copy() {
    const t = text();
    try { await navigator.clipboard.writeText(t); showToast("Skopiowano ✓"); return; } catch (e) { /* brak schowka */ }
    try { if (navigator.share) { await navigator.share({ text: t }); return; } } catch (e) { return; }
    showToast("Nie udało się skopiować.", "error");
  }

  function open() {
    if (!built) { build(); built = true; }
    disarm(); st = load(read()); syncInputs(); refresh();
  }
  // wylogowanie / „Wyczyść wpisy”: nic z poprzedniego konta na ekranie
  function reset() { st = { answers: {}, history: [] }; disarm(); if (built) { syncInputs(); refresh(); } }
  window.addEventListener("storage", e => { if (!AppState.user || !built || e.key !== key()) return; st = load(read()); syncInputs(); refresh(); });
  return { open, reset, load, text, score: () => score(), set: v => { st = load(v); }, get total() { return TOTAL; }, get max() { return MAXPTS; } };
})();
