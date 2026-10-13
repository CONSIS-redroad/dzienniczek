# 🌿 Dzienniczek samoobserwacji — wersja scalona / modularna

Wersja przygotowana na bazie pełniejszego repo `CONSIS-redroad/dzienniczek`, z zachowaniem jego funkcji PWA, 25 cytatów, kalendarza, widoku miesięcznego 27 × dni i wydruku A4 poziomo. Z nowszej wersji modularnej przeniesiono podział kodu, tryb gościa i lokalne obliczanie dat.

## Stan na 13.10.2026 — wersja 5.5.1 (na żywo)

- Adres: https://consis-redroad.github.io/dzienniczek/ (sprawdzenie wersji: `js/version.js`).
- Dolne menu — trzy zakładki: **Dziennik** (27 objawów × dni, notatka, widok miesiąca, wydruk), **Koło** (koło uczuć, `js/kolo.js`),
  **Wstyd** („Dzienniczek wstydu”, `js/wstyd.js`: data, sytuacja, 9 odmian wstydu, 13 objawów w ciele + własny dopisek,
  jak się wyraził; podsumowanie „Najczęściej w ciele”, „Kopiuj wszystko”). Adres `#kolo` / `#wstyd` otwiera zakładkę.
- Wpisy wstydu leżą pod OSOBNYM kluczem `<klucz użytkownika>_wstyd` (od 5.5.1) — zapis dnia/koła, także ze starej
  karty, ich nie nadpisuje; wpisy z 5.5.0 (w rekordzie głównym) przenoszą się same; druga karta odświeża listę (zdarzenie `storage`).
- Testy telefonu (Playwright, 320/390 px, jasny/ciemny, `service_workers='block'`, `has_touch=True`): skrypty w oknie AI
  (`test_dz_wstyd*.py`) — sprawdzają m.in. ukryty „Anuluj edycję” przy nowym wpisie i to, że stara karta nie kasuje wstydu.
- Każda zmiana na żywo dopiero po adwersarzu; wydanie = PR do `main` (Pages), podbicie `js/version.js` i listy `SHELL` w `sw.js`.

## Plan poprawek

1. **Dane przy koncie, nie przy urządzeniu (D034 w repo terapia; prowadzący 13.10).** Dziś wszystko leży w pamięci przeglądarki
   (`localStorage`) — telefon i komputer mają osobne dzienniczki, wyczyszczenie przeglądarki kasuje wpisy. Cel: zapis na
   **Dysku Google użytkownika, w ukrytym folderze aplikacji** (`appDataFolder`, uprawnienie `drive.appdata` — aplikacja nie widzi
   innych plików, my nie mamy dostępu do danych, nic na naszym serwerze). Kroki:
   a) klient Google: dopisać uprawnienie `drive.appdata` (ekran zgody), logowanie GIS + token dostępu (`google.accounts.oauth2`);
   b) zapis/odczyt jednego pliku JSON na konto (dni, koło, wstyd), `localStorage` zostaje jako zapas offline, synchronizacja po powrocie sieci,
      konflikt = nowszy zapis per dzień / per wpis;
   c) migracja: przy pierwszym logowaniu po zmianie wpisy z urządzenia dokładane do pliku na Dysku (scalanie, nic nie ginie);
   d) gość bez zmian (`sessionStorage`); test na dwóch „urządzeniach” (dwa konteksty przeglądarki) + adwersarz przed wydaniem.
   Status: **czeka na „robić” prowadzącego.**
2. Audyt bezpieczeństwa (karta 00b345f1): wspólny adres `consis-redroad.github.io` z TERAPIĄ = wspólny `localStorage`.

## Siostrzana aplikacja — TERAPIA (grupa)

Dzienniczek jest **prywatny i osobny** — dane zostają w przeglądarce użytkownika, grupa ich nie widzi.
Grupowa aplikacja TERAPIA (kalendarz zajęć, prace domowe, czat, archiwum lektur):
repo [`CONSIS-redroad/terapia`](https://github.com/CONSIS-redroad/terapia) · grupa https://consis-redroad.github.io/terapia/grupa/ · demo https://consis-redroad.github.io/terapia/.
Obie aplikacje mają **jeden styl** (od wersji 5.2.0): te same kolory jasny/ciemny, motywy tapet (wiśnia na śniegu, deszcz, świt — `js/theme.js`, `css/theme.css`)
i przyciski w obie strony (w Dzienniczku „Terapia” w nagłówku, w TERAPII „Mój dzienniczek”).

## Co zostało poprawione

- daty są tworzone jako lokalne `YYYY-MM-DD`, bez `toISOString()`;
- przy pierwszym uruchomieniu wersji scalonej istniejące dane Google zapisane przez v3 są jednorazowo przeliczane na daty lokalne (w Polsce +1 dzień); przed migracją tworzona jest kopia zapasowa pod dodatkowym kluczem `*_backup_v3_*`;
- migracja jest wykonywana osobno dla każdego konta;
- tryb gościa używa `sessionStorage`;
- notatki, nazwa użytkownika, objawy i cytaty użytkownika są wstawiane przez `textContent` / właściwości DOM, bez HTML z danych użytkownika;
- widok miesiąca nie używa `innerHTML` do zaznaczeń;
- manifest wskazuje ikony PNG 192/512 (+ maskable) i SVG; `apple-touch-icon` jest PNG;
- dane zapisywane są z `schemaVersion: 2`; migracja dat (v3 → daty lokalne) dotyczy tylko danych bez `schemaVersion` i odtwarza datę zależnie od strefy czasowej przeglądarki;
- przejście do poprzedniego/następnego miesiąca działa poprawnie także z 29.–31. dnia;
- Service Worker ma wersjonowany cache (nazwa zależy od `APP_VERSION`) i usuwa stare cache przy aktywacji;
- kod aplikacji jest rozdzielony na moduły JS i CSS.

## Struktura

```text
index.html
manifest.json
sw.js
icons/ (icon.svg, icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png)
css/
  base.css
  layout.css
  components.css
  calendar.css
  modal.css
  responsive.css
  print.css
tests/test.js
js/
  version.js   <- jedyne miejsce z numerem wersji (APP_VERSION)
  config.js
  state.js
  symptoms.js
  utils.js
  storage.js
  quotes.js
  auth.js
  calendar.js
  statistics.js
  modal.js
  month-view.js
  pwa.js       <- rejestracja SW, komunikat „Nowa wersja – odśwież”
  app.js
```

## Dane i logowanie

Dane zalogowanego użytkownika pozostają w `localStorage` **tego urządzenia** pod kluczem `dzienniczek_user_<sub>` (dni, cytaty, koło) i `dzienniczek_user_<sub>_wstyd` (dzienniczek wstydu). Konto Google służy tylko do rozpoznania osoby — danych na koncie ani na żadnym serwerze nie ma (zmiana w „Plan poprawek”). Gość używa `sessionStorage`.

Google Identity Services dostarcza poświadczenie, którego payload jest odczytywany w przeglądarce w celu identyfikacji profilu. **Ta aplikacja nie posiada backendu i nie wykonuje serwerowej weryfikacji podpisu tokenu.** Nie należy traktować jej jako pełnego systemu bezpiecznego uwierzytelniania danych medycznych/terapeutycznych.

## Testy offline

```bash
TZ=Europe/Warsaw node tests/test.js
```

Testy (Node, bez zależności) sprawdzają daty lokalne, migrację w różnych strefach czasowych, nawigację miesięcy oraz istnienie plików z manifestu/SW. Nie zastępują testu w przeglądarce.

## Wersjonowanie i aktualizacje PWA

Numer wersji jest zapisany **w jednym pliku: `js/version.js`** (`const APP_VERSION = "x.y.z";`). Czyta go zarówno `index.html` (pokazuje wersję w stopce i w panelu „Twoje dane”), jak i `sw.js` (`importScripts`), który buduje z niego nazwę cache `dzienniczek-<wersja>`.

**Jak wydać nową wersję:**

1. Wprowadź zmiany w kodzie.
2. Podbij `APP_VERSION` w `js/version.js` (np. `5.1.0` → `5.1.1`). To jedyna ręczna zmiana wersji.
3. Jeśli dodałeś/usunąłeś plik `js/`, `css/` lub ikonę, dopisz go do listy `SHELL` w `sw.js` (test `tests/test.js` pilnuje zgodności).
4. `TZ=Europe/Warsaw node tests/test.js`, potem commit i scalenie do `main`.

**Co się dzieje u użytkownika (bez odinstalowywania):**

- przeglądarka przy otwarciu aplikacji/powrocie do niej sprawdza `sw.js` i `js/version.js` (rejestracja z `updateViaCache:"none"`, więc omija cache HTTP GitHub Pages);
- nowy Service Worker pobiera pliki do nowego cache, robi `skipWaiting` + `clients.claim` i usuwa stare cache `dzienniczek-*` (cudzych cache nie rusza);
- otwarta aplikacja pokazuje pasek „Nowa wersja – odśwież”; przycisk przeładowuje stronę. W panelu „Twoje dane” jest też przycisk „Sprawdź aktualizacje”;
- pliki są pobierane strategią **network-first** (z rewalidacją), a gdy nie ma sieci lub odpowiedź trwa > 4 s, aplikacja używa cache — offline nadal działa. Parametry `?v=` w URL-ach nie są potrzebne (są ignorowane przy dopasowaniu do cache).

Jeśli zmieniasz tylko dane/treść bez podbicia `APP_VERSION`, pliki i tak będą pobierane z sieci (network-first), ale pasek „Nowa wersja” się nie pojawi, a cache offline zostanie odświeżony dopiero przy kolejnym otwarciu online.

## Uruchomienie

To jest aplikacja statyczna. Nie wymaga Node ani procesu build. Na GitHub Pages powinna działać z katalogu repozytorium; `start_url` i `scope` są względne.

Przed publikacją zalecane jest uruchomienie aplikacji w przeglądarce i sprawdzenie logowania Google, migracji danych, PWA/offline oraz wydruku A4.

Opis systemu: [docs/OPIS-SYSTEMU.md](docs/OPIS-SYSTEMU.md)
