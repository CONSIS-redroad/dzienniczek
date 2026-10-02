# 🌿 Dzienniczek samoobserwacji — wersja scalona / modularna

Wersja przygotowana na bazie pełniejszego repo `CONSIS-redroad/dzienniczek`, z zachowaniem jego funkcji PWA, 25 cytatów, kalendarza, widoku miesięcznego 27 × dni i wydruku A4 poziomo. Z nowszej wersji modularnej przeniesiono podział kodu, tryb gościa i lokalne obliczanie dat.

## Co zostało poprawione

- daty są tworzone jako lokalne `YYYY-MM-DD`, bez `toISOString()`;
- przy pierwszym uruchomieniu wersji scalonej istniejące dane Google zapisane przez v3 są jednorazowo przesuwane o +1 dzień, aby odtworzyć datę lokalną; przed migracją tworzona jest kopia zapasowa pod dodatkowym kluczem `*_backup_v3_*`;
- migracja jest wykonywana osobno dla każdego konta;
- tryb gościa używa `sessionStorage`;
- notatki, nazwa użytkownika, objawy i cytaty użytkownika są wstawiane przez `textContent` / właściwości DOM, bez HTML z danych użytkownika;
- widok miesiąca nie używa `innerHTML` do zaznaczeń;
- manifest wskazuje tylko istniejącą ikonę SVG;
- Service Worker ma wersjonowany cache i usuwa stare cache przy aktywacji;
- kod aplikacji jest rozdzielony na moduły JS i CSS.

## Struktura

```text
index.html
manifest.json
sw.js
icons/icon.svg
css/
  base.css
  layout.css
  components.css
  calendar.css
  modal.css
  responsive.css
  print.css
js/
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
  app.js
```

## Dane i logowanie

Dane zalogowanego użytkownika pozostają w `localStorage` pod kluczem `dzienniczek_user_<sub>`. Gość używa `sessionStorage`.

Google Identity Services dostarcza poświadczenie, którego payload jest odczytywany w przeglądarce w celu identyfikacji profilu. **Ta aplikacja nie posiada backendu i nie wykonuje serwerowej weryfikacji podpisu tokenu.** Nie należy traktować jej jako pełnego systemu bezpiecznego uwierzytelniania danych medycznych/terapeutycznych.

## Uruchomienie

To jest aplikacja statyczna. Nie wymaga Node ani procesu build. Na GitHub Pages powinna działać z katalogu repozytorium; `start_url` i `scope` są względne.

Przed publikacją zalecane jest uruchomienie aplikacji w przeglądarce i sprawdzenie logowania Google, migracji danych, PWA/offline oraz wydruku A4.
