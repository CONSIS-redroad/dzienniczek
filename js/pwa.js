// Rejestracja Service Workera, wykrywanie nowej wersji i komunikat „Nowa wersja – odśwież”.
const Pwa = {
  reg: null,
  hadController: false,
  reloading: false,
  init() {
    document.querySelectorAll("[data-app-version]").forEach(el => { el.textContent = APP_VERSION; });
    document.getElementById("btn-update-reload")?.addEventListener("click", () => this.reload());
    document.getElementById("btn-check-update")?.addEventListener("click", () => this.check(true));
    if (!("serviceWorker" in navigator)) return;
    this.hadController = !!navigator.serviceWorker.controller;
    // nowy SW przejął kartę (skipWaiting + clients.claim) -> automatyczne przeładowanie na nową wersję
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (this.hadController && !this.reloading) {
        this.reloading = true;
        location.reload();
      }
      this.hadController = true;
    });
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" })
        .then(reg => { this.reg = reg; reg.update().catch(() => {}); })
        .catch(console.warn);
    });
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") this.check(false); });
    setInterval(() => this.check(false), 30 * 60 * 1000);
  },
  showUpdate() {
    const bar = document.getElementById("update-bar");
    if (bar) bar.hidden = false;
  },
  reload() { this.reloading = true; location.reload(); },
  async check(manual) {
    if (!this.reg) { if (manual) showToast("Aktualizacje są niedostępne w tym trybie.", "error"); return; }
    try {
      await this.reg.update();
      if (!manual) return;
      if (this.reg.installing || this.reg.waiting) showToast("Pobieram nową wersję…");
      else showToast(`Masz najnowszą wersję (${APP_VERSION}).`);
    } catch (e) { if (manual) showToast("Nie udało się sprawdzić aktualizacji (brak sieci?).", "error"); }
  }
};
