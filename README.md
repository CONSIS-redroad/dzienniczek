# 🌿 Dzienniczek samoobserwacji — wersja scalona / modularna

Wersja przygotowana na bazie pełniejszego repo `CONSIS-redroad/dzienniczek`, z zachowaniem jego funkcji PWA, 25 cytatów, kalendarza, widoku miesięcznego 27 × dni i wydruku A4 poziomo. Z nowszej wersji modularnej przeniesiono podział kodu, tryb gościa i lokalne obliczanie dat.

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

Dane zalogowanego użytkownika pozostają w `localStorage` pod kluczem `dzienniczek_user_<sub>`. Gość używa `sessionStorage`.

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
