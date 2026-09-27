/*!
 * Dzienniczek samoobserwacji v2
 * Google Auth stub — gotowe na podłączenie Firebase Auth + Firestore/Drive
 * Strona nie przechowuje żadnych danych lokalnie.
 */

/* =============================================================
   KONFIGURACJA — uzupełnij przed wdrożeniem
   ============================================================= */
const GOOGLE_CLIENT_ID = "TWOJ_CLIENT_ID.apps.googleusercontent.com";

/* =============================================================
   STAN APLIKACJI
   Dane żyją tylko w pamięci RAM sesji przeglądarki.
   Po wylogowaniu / odświeżeniu — czysto.
   ============================================================= */
const AppState = (() => {
  let _user   = null;   // { name, email, avatar }
  let _data   = {};     // { "YYYY-MM-DD": { symptoms: bool[], note: string } }
  let _quotes = {};     // { timestamp: string }  — cytaty użytkownika

  return {
    getUser:   ()      => _user,
    setUser:   (u)     => { _user = u; },
    getData:   ()      => _data,
    setData:   (d)     => { _data = d; },
    getQuotes: ()      => _quotes,
    setQuotes: (q)     => { _quotes = q; },
    clear:     ()      => { _user = null; _data = {}; _quotes = {}; },
  };
})();

/* =============================================================
   LISTA OBJAWÓW
   ============================================================= */
const SYMPTOMS = [
  "Zaburzenia snu",
  "Zachowania kompulsywne",
  "Ból fizyczny bez powodu",
  "Zaburzenia łaknienia",
  "Stałe zmęczenie",
  "Koncentracja na partnerze",
  "Organizowanie czasu partnerowi",
  "Kontrola trzeźwości",
  "Zamartwianie się",
  "Oczekiwanie podporządkowania",
  "Pouczanie / wyzywanie",
  "Działania za partnera",
  "Planowanie \u201egdyby nie pi\u0142\u201d",
  "Poczucie pustki",
  "Napięcie i rozdrażnienie",
  "Nie mówienie wprost",
  "Pielęgnowanie złości",
  "Skupienie na krzywdzie",
  "Zwiększone konflikty",
  "Powątpiewanie w terapię",
  "Skupienie na innych",
  "Oczekiwanie instrukcji",
  "Usprawiedliwianie",
  "Wymówki",
  "Obwinianie",
  "Agresja",
  "Autoagresja",
];

/* =============================================================
   NARZĘDZIA
   ============================================================= */
const fmt      = d  => d.toISOString().slice(0, 10);
const today    = () => fmt(new Date());
const Polish = {
  months: ["styczeń","luty","marzec","kwiecień","maj","czerwiec",
           "lipiec","sierpień","wrzesień","październik","listopad","grudzień"],
  monthsGen: ["stycznia","lutego","marca","kwietnia","maja","czerwca",
              "lipca","sierpnia","września","października","listopada","grudnia"],
};

/* =============================================================
   GOOGLE AUTH STUB
   Gotowe do zastąpienia prawdziwym Google Identity Services.
   ============================================================= */
const Auth = {
  /** Inicjalizuj Google Identity Services (GIS) */
  init() {
    // Gdy CLIENT_ID jest ustawiony, ładujemy GSI
    if (GOOGLE_CLIENT_ID !== "TWOJ_CLIENT_ID.apps.googleusercontent.com") {
      const s = document.createElement("script");
      s.src   = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = () => this._initGSI();
      document.head.appendChild(s);
    }
    this._renderUI();
  },

  _initGSI() {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  (r) => this._onCredential(r),
    });
    window.google.accounts.id.renderButton(
      document.getElementById("gsi-button"),
      { type: "standard", shape: "pill", theme: "outline", text: "signin_with", locale: "pl" }
    );
    window.google.accounts.id.prompt();
  },

  _onCredential(response) {
    // Dekoduj JWT payload (bez walidacji — walidacja powinna być po stronie serwera)
    try {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      AppState.setUser({
        name:   payload.name,
        email:  payload.email,
        avatar: payload.picture,
        sub:    payload.sub,
      });
      this._renderUI();
      App.onLogin();
    } catch (e) {
      console.error("Błąd dekodowania tokenu:", e);
    }
  },

  /** Demo login — usuń w produkcji */
  demoLogin() {
    AppState.setUser({
      name:   "Użytkownik demo",
      email:  "demo@example.com",
      avatar: null,
      sub:    "demo",
    });
    this._renderUI();
    App.onLogin();
  },

  logout() {
    AppState.clear();
    this._renderUI();
    App.onLogout();
  },

  _renderUI() {
    const user = AppState.getUser();
    document.getElementById("auth-login-view").style.display  = user ? "none"  : "flex";
    document.getElementById("auth-user-view").style.display   = user ? "flex"  : "none";
    document.getElementById("main-app").style.display         = user ? "block" : "none";
    document.getElementById("landing").style.display          = user ? "none"  : "flex";

    if (user) {
      document.getElementById("user-name").textContent = user.name;
      const av = document.getElementById("user-avatar");
      if (user.avatar) {
        av.src   = user.avatar;
        av.style.display = "inline-block";
        document.getElementById("user-avatar-placeholder").style.display = "none";
      } else {
        av.style.display = "none";
        const ph = document.getElementById("user-avatar-placeholder");
        ph.textContent = user.name?.[0]?.toUpperCase() ?? "U";
        ph.style.display = "flex";
      }
    }
  },
};

/* =============================================================
   PAMIĘĆ — STUB GOOGLE DRIVE / FIRESTORE
   W produkcji: zastąp fetch() wywołaniami Firestore SDK lub Drive API.
   ============================================================= */
const Storage = {
  async load() {
    // TODO: pobierz dane z Google Drive / Firestore dla zalogowanego usera
    // Przykład Firestore:
    // const doc = await db.collection("journals").doc(AppState.getUser().sub).get();
    // return doc.data() || { days: {}, quotes: {} };
    return { days: {}, quotes: {} };
  },

  async save(days, quotes) {
    // TODO: zapisz dane do Google Drive / Firestore
    // W tej chwili nic nie robimy — strona niczego nie przechowuje.
    console.info("[Storage] Zapis do chmury Google — do wdrożenia.");
  },
};

/* =============================================================
   APLIKACJA
   ============================================================= */
const App = {
  calRef: new Date(),

  async onLogin() {
    const { days, quotes } = await Storage.load();
    AppState.setData(days);
    AppState.setQuotes(quotes);
    UI.init();
  },

  onLogout() {
    UI.reset();
  },

  async persistDay(key) {
    const d = AppState.getData();
    await Storage.save(d, AppState.getQuotes());
    UI.drawCal();
    UI.updateStats();
  },
};

/* =============================================================
   UI
   ============================================================= */
const UI = {
  init() {
    this.drawHeader();
    this.drawCal();
    this.updateStats();
    Quotes.render();
  },

  reset() {
    document.getElementById("calendar").innerHTML = "";
  },

  /* ---- Nagłówek ---- */
  drawHeader() {
    const d = new Date();
    document.getElementById("today-label").textContent =
      `${d.getDate()} ${Polish.monthsGen[d.getMonth()]} ${d.getFullYear()} r.`;
  },

  /* ---- Kalendarz ---- */
  drawCal() {
    const data = AppState.getData();
    const ref  = App.calRef;
    const y    = ref.getFullYear();
    const m    = ref.getMonth();

    document.getElementById("month-label").textContent =
      `${Polish.months[m]} ${y}`;

    const cal   = document.getElementById("calendar");
    cal.innerHTML = "";

    const first = new Date(y, m, 1);
    const start = (first.getDay() + 6) % 7;
    const days  = new Date(y, m + 1, 0).getDate();

    let day = 1;
    for (let r = 0; r < 6; r++) {
      const tr = document.createElement("tr");
      for (let c = 0; c < 7; c++) {
        const td = document.createElement("td");
        if ((r === 0 && c < start) || day > days) {
          td.className = "cal-empty";
        } else {
          const d   = new Date(y, m, day);
          const key = fmt(d);
          td.textContent = day++;
          td.dataset.key = key;

          const isToday  = key === today();
          const hasEntry = data[key] &&
            (data[key].symptoms.some(Boolean) || data[key].note?.trim());

          if (isToday)  td.classList.add("cal-today");
          if (hasEntry) td.classList.add("cal-has-entry");

          td.addEventListener("click", () => Modal.open(key));
        }
        tr.appendChild(td);
      }
      cal.appendChild(tr);
    }
  },

  /* ---- Statystyki ---- */
  updateStats() {
    const data = AppState.getData();
    const keys = Object.keys(data);

    document.getElementById("stat-days").textContent = keys.length;

    if (!keys.length) {
      document.getElementById("stat-avg").textContent  = "–";
      document.getElementById("stat-last").textContent = "–";
      return;
    }

    const total = keys.reduce((s, k) => s + data[k].symptoms.filter(Boolean).length, 0);
    document.getElementById("stat-avg").textContent =
      (total / keys.length).toFixed(1);
    document.getElementById("stat-last").textContent =
      keys.sort().at(-1).split("-").reverse().join(".");
  },
};

/* =============================================================
   CYTATY
   ============================================================= */
const Quotes = {
  current: null,

  render() {
    this.random();
  },

  random() {
    const userQ  = Object.values(AppState.getQuotes());
    const pool   = [...defaultQuotes.map(q => q), ...userQ.map(t => ({ text: t, author: null }))];
    this.current = pool[Math.floor(Math.random() * pool.length)];
    document.getElementById("quote-text").textContent   = `„${this.current.text}"`;
    document.getElementById("quote-author").textContent = this.current.author
      ? `— ${this.current.author}` : "";
  },

  async save(text) {
    if (!text.trim()) return;
    const q = AppState.getQuotes();
    q[Date.now()] = text.trim();
    AppState.setQuotes(q);
    await Storage.save(AppState.getData(), q);
    this.random();
  },
};

/* =============================================================
   MODAL DNIA
   ============================================================= */
const Modal = {
  currentKey: null,

  open(key) {
    this.currentKey = key;
    const data  = AppState.getData();
    const el    = document.getElementById("day-modal");
    const overlay = document.getElementById("modal-overlay");

    if (!data[key]) {
      data[key] = { symptoms: Array(SYMPTOMS.length).fill(false), note: "" };
    }

    // Tytuł
    document.getElementById("modal-date").textContent =
      key.split("-").reverse().join(".");

    // Objawy
    const box = document.getElementById("symptoms-box");
    box.innerHTML = "";
    data[key].symptoms.forEach((checked, i) => {
      const label = document.createElement("label");
      label.className = "symptom-row";

      const chk = document.createElement("input");
      chk.type    = "checkbox";
      chk.checked = checked;
      chk.addEventListener("change", async () => {
        data[key].symptoms[i] = chk.checked;
        this._cleanIfEmpty(key);
        await App.persistDay(key);
      });

      const num  = document.createElement("span");
      num.className   = "symptom-num";
      num.textContent = `${i + 1}.`;

      const name = document.createElement("span");
      name.textContent = SYMPTOMS[i];

      label.append(chk, num, name);
      box.appendChild(label);
    });

    // Notatka
    const note = document.getElementById("note-box");
    note.value = data[key].note ?? "";
    this._updateNoteCount();

    overlay.classList.add("open");
    el.classList.add("open");

    // Zapobiegaj scroll body
    document.body.style.overflow = "hidden";
  },

  close() {
    document.getElementById("modal-overlay").classList.remove("open");
    document.getElementById("day-modal").classList.remove("open");
    document.body.style.overflow = "";
    this.currentKey = null;
  },

  async noteChanged(val) {
    const key  = this.currentKey;
    if (!key) return;
    const data = AppState.getData();
    if (!data[key]) return;
    data[key].note = val;
    this._updateNoteCount();
    this._cleanIfEmpty(key);
    await App.persistDay(key);
  },

  _updateNoteCount() {
    const note = document.getElementById("note-box");
    document.getElementById("note-count").textContent =
      `${note.value.length} / 500`;
  },

  _cleanIfEmpty(key) {
    const data = AppState.getData();
    if (!data[key]) return;
    if (!data[key].symptoms.some(Boolean) && !data[key].note?.trim())
      delete data[key];
  },
};

/* =============================================================
   MODAL PODGLĄDU MIESIĄCA
   ============================================================= */
const MonthView = {
  open() {
    const data = AppState.getData();
    const ref  = App.calRef;
    const y    = ref.getFullYear();
    const m    = ref.getMonth();
    const days = new Date(y, m + 1, 0).getDate();

    document.getElementById("month-modal-title").textContent =
      `${Polish.months[m]} ${y}`;

    const table = document.createElement("table");
    table.className = "month-table";

    // Nagłówek
    const thead  = table.createTHead();
    const headTr = thead.insertRow();
    const thName = document.createElement("th");
    thName.textContent = "Objaw";
    headTr.appendChild(thName);
    for (let d = 1; d <= days; d++) {
      const th = document.createElement("th");
      th.textContent = d;
      headTr.appendChild(th);
    }

    // Wiersze
    const tbody = table.createTBody();
    SYMPTOMS.forEach((sym, i) => {
      const tr = tbody.insertRow();
      const tdName = tr.insertCell();
      tdName.textContent = `${i + 1}. ${sym}`;

      for (let d = 1; d <= days; d++) {
        const td  = tr.insertCell();
        const key = fmt(new Date(y, m, d));
        if (data[key]?.symptoms[i]) {
          td.innerHTML  = '<span class="check-mark">✓</span>';
          td.className  = "has-sym";
        }
      }
    });

    // Wiersz sumy
    const sumTr = tbody.insertRow();
    sumTr.className = "sum-row";
    const sumLabel = sumTr.insertCell();
    sumLabel.textContent = "SUMA";
    for (let d = 1; d <= days; d++) {
      const td  = sumTr.insertCell();
      const key = fmt(new Date(y, m, d));
      const cnt = data[key]?.symptoms.filter(Boolean).length ?? 0;
      td.textContent = cnt || "";
    }

    document.getElementById("month-table-wrap").innerHTML = "";
    document.getElementById("month-table-wrap").appendChild(table);
    document.getElementById("month-overlay").classList.add("open");
    document.body.style.overflow = "hidden";
  },

  close() {
    document.getElementById("month-overlay").classList.remove("open");
    document.body.style.overflow = "";
  },

  print() {
    window.print();
  },
};

/* =============================================================
   EXPORT / IMPORT (lokalny plik jako backup)
   ============================================================= */
const DataIO = {
  export() {
    const payload = {
      exported_at: new Date().toISOString(),
      days:        AppState.getData(),
      quotes:      AppState.getQuotes(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), {
      href:     url,
      download: `dzienniczek-${today()}.json`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  import(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const obj = JSON.parse(e.target.result);
        AppState.setData(obj.days   ?? {});
        AppState.setQuotes(obj.quotes ?? {});
        await Storage.save(AppState.getData(), AppState.getQuotes());
        UI.drawCal();
        UI.updateStats();
        Toast.show("Dane zaimportowane ✓");
      } catch {
        Toast.show("Błąd pliku JSON", "error");
      }
    };
    reader.readAsText(file);
  },
};

/* =============================================================
   TOAST
   ============================================================= */
const Toast = {
  show(msg, type = "ok") {
    const t = document.getElementById("toast");
    t.textContent  = msg;
    t.className    = `toast toast--${type} toast--visible`;
    clearTimeout(this._tid);
    this._tid = setTimeout(() => t.className = "toast", 2800);
  },
};

/* =============================================================
   BINDOWANIE ZDARZEŃ — po załadowaniu DOM
   ============================================================= */
document.addEventListener("DOMContentLoaded", () => {
  /* Auth */
  Auth.init();
  document.getElementById("btn-demo-login").addEventListener("click", () => Auth.demoLogin());
  document.getElementById("btn-logout").addEventListener("click",    () => Auth.logout());

  /* Cytaty */
  document.getElementById("btn-refresh-quote").addEventListener("click", () => Quotes.random());

  const quotePanel   = document.getElementById("add-quote-panel");
  const quoteToggle  = document.getElementById("btn-add-quote-toggle");
  const quoteInput   = document.getElementById("quote-input");
  const quoteCount   = document.getElementById("quote-char-count");
  const quoteSave    = document.getElementById("btn-save-quote");

  quoteToggle.addEventListener("click", () => {
    quotePanel.hidden = !quotePanel.hidden;
    if (!quotePanel.hidden) quoteInput.focus();
  });
  quoteInput.addEventListener("input", () => {
    quoteCount.textContent = `${quoteInput.value.length} / 200`;
  });
  quoteSave.addEventListener("click", async () => {
    await Quotes.save(quoteInput.value);
    quoteInput.value  = "";
    quoteCount.textContent = "0 / 200";
    quotePanel.hidden = true;
    Toast.show("Cytat dodany ✓");
  });

  /* Kalendarz — nawigacja */
  document.getElementById("btn-prev-month").addEventListener("click", () => {
    App.calRef.setMonth(App.calRef.getMonth() - 1);
    UI.drawCal();
  });
  document.getElementById("btn-next-month").addEventListener("click", () => {
    App.calRef.setMonth(App.calRef.getMonth() + 1);
    UI.drawCal();
  });

  /* Podgląd miesiąca */
  document.getElementById("btn-month-view").addEventListener("click",       () => MonthView.open());
  document.getElementById("btn-close-month").addEventListener("click",      () => MonthView.close());
  document.getElementById("btn-print-month").addEventListener("click",      () => MonthView.print());
  document.getElementById("month-overlay").addEventListener("click", e => {
    if (e.target === e.currentTarget) MonthView.close();
  });

  /* Modal dnia */
  document.getElementById("modal-overlay").addEventListener("click", e => {
    if (e.target === e.currentTarget) Modal.close();
  });
  document.getElementById("btn-close-modal").addEventListener("click",  () => Modal.close());
  document.getElementById("note-box").addEventListener("input",  e => Modal.noteChanged(e.target.value));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      Modal.close();
      MonthView.close();
    }
  });

  /* Export / Import */
  document.getElementById("btn-export").addEventListener("click", () => DataIO.export());
  document.getElementById("btn-import").addEventListener("click", () => {
    document.getElementById("file-input").click();
  });
  document.getElementById("file-input").addEventListener("change", e => {
    DataIO.import(e.target.files[0]);
    e.target.value = "";
  });

  /* Drag & drop na całą kartę eksportu */
  const dropCard = document.getElementById("export-card");
  dropCard.addEventListener("dragover",  e => { e.preventDefault(); dropCard.classList.add("drag-over"); });
  dropCard.addEventListener("dragleave", e => {
    const r = dropCard.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right ||
        e.clientY < r.top  || e.clientY > r.bottom)
      dropCard.classList.remove("drag-over");
  });
  dropCard.addEventListener("drop", e => {
    e.preventDefault();
    dropCard.classList.remove("drag-over");
    DataIO.import(e.dataTransfer.files[0]);
  });

  /* Mobile: toggle panelu bocznego */
  document.getElementById("btn-toggle-side").addEventListener("click", () => {
    document.getElementById("side-panels").classList.toggle("open");
  });
});
