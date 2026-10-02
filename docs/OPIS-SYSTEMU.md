# Dzienniczek samoobserwacji — opis systemu i prompt dla AI programistycznego

Aplikacja: „Dzienniczek samoobserwacji — WOTUiUW Gdańsk”. Nie twórz jej od zera. Pracuj na istniejącym projekcie i zachowuj jego działające funkcje.

## 1. Cel systemu

Prosty, spokojny i bezpieczny dzienniczek samoobserwacji wspierający pracę terapeutyczną. Użytkownik może:

- zalogować się przez Google,
- korzystać z trybu gościa,
- otworzyć konkretny dzień,
- zaznaczyć występujące objawy,
- dodać własną notatkę,
- przeglądać wpisy w kalendarzu,
- zobaczyć statystyki,
- korzystać z cytatów i dodawać własne,
- wygenerować miesięczne zestawienie,
- wydrukować zestawienie w formacie A4 poziomo,
- korzystać z aplikacji jako PWA.

## 2. Zasada nadrzędna

Najpierw zachowaj istniejącą funkcjonalność, dopiero potem refaktoryzuj. Nie upraszczaj aplikacji tylko dlatego, że prostszy kod łatwiej napisać. Jeżeli istniejąca wersja repozytorium ma funkcję, której nie ma w nowym module, funkcja ma zostać zachowana. Przed usunięciem lub zmianą mechanizmu sprawdź, czy nie jest używany przez inną część aplikacji.

## 3. Architektura

Kod ma być modularny, bez jednego ogromnego `app.js`. Preferowana struktura:

```text
dzienniczek/
├── index.html
├── manifest.json
├── sw.js
├── README.md
├── icons/            (icon.svg, ikony PNG, apple-touch-icon)
├── css/              (base, layout, components, calendar, modal, responsive, print)
├── js/               (config, state, utils, storage, symptoms, auth, calendar,
│                      modal, statistics, quotes, month-view, app, version, pwa)
└── docs/OPIS-SYSTEMU.md
```

Modularność przez natywne moduły ES (`<script type="module" src="js/app.js">`), jeśli to możliwe; bez frameworka i bundlera.

## 4. Objawy (dokładnie 27, bez zmian nazw, kolejności i liczby bez wyraźnego polecenia)

1. Zaburzenia snu
2. Zachowania kompulsywne
3. Ból fizyczny bez powodu
4. Zaburzenia łaknienia
5. Stałe zmęczenie
6. Koncentracja na partnerze
7. Organizowanie czasu partnerowi
8. Kontrola trzeźwości
9. Zamartwianie się
10. Oczekiwanie podporządkowania
11. Pouczanie / wyzywanie
12. Działania za partnera
13. Planowanie „gdyby nie pił”
14. Poczucie pustki
15. Napięcie i rozdrażnienie
16. Nie mówienie wprost
17. Pielęgnowanie złości
18. Skupienie na krzywdzie
19. Zwiększone konflikty
20. Powątpiewanie w terapię
21. Skupienie na innych
22. Oczekiwanie instrukcji
23. Usprawiedliwianie
24. Wymówki
25. Obwinianie
26. Agresja
27. Autoagresja

## 5. Model danych

```json
{
  "YYYY-MM-DD": {
    "symptoms": [true, false, "..."],
    "note": "tekst użytkownika"
  }
}
```

Dokładnie 27 wartości `symptoms`. Dane użytkownika Google są pod kluczem `dzienniczek_user_<sub>`. Nie zmieniaj formatu danych bez migracji.

## 6. Daty — krytyczne

Nigdy nie używaj `new Date().toISOString().slice(0, 10)` do określania dnia użytkownika. Klucz dnia budujemy z lokalnych `getFullYear()`, `getMonth()`, `getDate()`. Przykład: 2 października 2026 → `2026-10-02`, nigdy `2026-10-01`.

## 7. Migracja starych danych

Starsza wersja zapisywała daty przez UTC i w Polsce mogła przesunąć wpis o jeden dzień. Przy pierwszym uruchomieniu nowej wersji: wykryj stary format, utwórz kopię bezpieczeństwa, wykonaj migrację (przesuń stare klucze o jeden dzień do przodu), zapisz wersję migracji i nie wykonuj jej ponownie. Migracja musi być idempotentna. Kolejność: backup → migracja → zapis → oznaczenie jako wykonanej. Nigdy nie usuwaj danych przed wykonaniem kopii.

Stan wdrożenia (PR #1): dane zapisują `schemaVersion: 2`; dane z `schemaVersion` migracja pomija, a dla starszych odtwarza datę zależnie od strefy czasowej przeglądarki. Dane bez `schemaVersion`, które już mają daty lokalne, są nie do odróżnienia od v3 i w Polsce zostaną przesunięte o +1 dzień — ratunkiem jest kopia `*_backup_v3_*`.

## 8. Tryb gościa

Tymczasowy. Dane gościa: `sessionStorage`, klucz `dzienniczek_guest_session_v4`, nie `localStorage`. Użytkownik Google: `localStorage`, `dzienniczek_user_<sub>`.

## 9. Bezpieczeństwo

Nigdy `element.innerHTML = userData`. Dla danych użytkownika (nazwa, notatki, własne cytaty, nazwy i opisy, dane w tabelach) używaj `textContent`. `innerHTML` tylko dla kontrolowanego, statycznego HTML i tylko gdy to konieczne.

## 10. Google login

Google Identity Services pozostaje mechanizmem logowania. Publiczny Client ID może być w kodzie frontendowym (nie jest sekretem). Nie dodawaj haseł, kluczy prywatnych, tokenów API ani danych serwerowych. Odczyt payloadu JWT we froncie to nie serwerowa weryfikacja tokenu. Nie opisuj aplikacji jako pełnego systemu bezpiecznej autoryzacji medycznej bez backendowej weryfikacji.

## 11. PWA

Zachowaj `manifest.json`, `sw.js`, ikonę aplikacji, możliwość instalacji i cache offline. Service Worker ma wersjonowany cache; przy zmianie wersji tworzony jest nowy cache, stare są usuwane w `activate`, a aplikacja korzysta z aktualnych plików. Użytkownik po aktualizacji nie może dostawać starego JS/CSS z cache.

Stan wdrożenia (PR #2): stała `APP_VERSION` w `js/version.js`, cache `dzienniczek-<APP_VERSION>`, network-first, `skipWaiting` + `clients.claim`, pasek „Nowa wersja – odśwież”.

## 12. Manifest

Każdy wpis manifestu musi odpowiadać plikowi, który istnieje w repozytorium. Nie wpisuj nieistniejących `icons/icon-192.png` ani `icons/icon-512.png`.

## 13. CSP

Zachowaj CSP i aktualizuj ją tylko wtedy, gdy to konieczne. Nie wyłączaj CSP z powodu problemu z modułem — najpierw znajdź przyczynę.

## 14. Widok miesiąca

Ważna funkcja, nie może zostać usunięta. Tabela: wiersze to 27 objawów, kolumny to dni 1–31, na końcu wiersz SUMA; zaznaczony objaw to ✓. Możliwy wydruk jako A4 landscape.

## 15. Cytaty

Zachowaj wszystkie istniejące cytaty (według promptu: 25 cytatów, 9 z autorami — do weryfikacji względem kodu). Nie zastępuj ich krótszą listą. Własne cytaty użytkownika zapisuj w jego danych.

## 16. Interfejs

Bez zbędnych zmian stylu. Charakter: spokojny, terapeutyczny, minimalistyczny, profesjonalny, niedominujący, bez agresywnych kolorów. Kolor bazowy `#6b9080`, tło `#f5f3ef`, font Inter.

## 17. Responsywność

Komputer, tablet, telefon. Nie usuwaj mobilnego panelu bocznego. Nie zakładaj dużego ekranu.

## 18. Zasada „nie zepsuj”

Przed każdą zmianą: czy funkcja już istnieje, czy ktoś z niej korzysta, czy zmieniam format danych, czy potrzebna migracja, czy zmiana wpływa na PWA, druk i urządzenia mobilne. Jeśli „tak” — zachowaj kompatybilność.

## 19. Testowanie

- **JavaScript:** brak błędów składni i niezdefiniowanych zmiennych, wszystkie moduły się ładują, zależności funkcji są poprawne.
- **HTML:** wszystkie ID używane przez JS istnieją, brak duplikatów.
- **Dane:** zapis, odczyt i usunięcie dnia, zapis notatki, objawów i cytatu.
- **Daty:** 31.12 → 01.01, 28/29.02 → 01.03, zmiana miesiąca, zmiana roku.
- **PWA:** manifest, SW, cache, aktualizacja cache.
- **Druk:** A4 poziomo, tabela 27 × dni, brak elementów interfejsu na wydruku.

## 20. Zasada pracy AI

Etapami: ANALIZA → PLAN → ZMIANA → TEST → RAPORT. Bez dużej refaktoryzacji „w ciemno”. Przed usunięciem kodu sprawdź jego użycie. Nie twórz fikcyjnych funkcji, nie zakładaj, że plik istnieje — sprawdź. Nie dodawaj bibliotek, frameworka, bundlera ani Node.js bez potrzeby.

## 21. Kompatybilność

Preferowane technologie: HTML, CSS, vanilla JavaScript, PWA, localStorage, sessionStorage, Google Identity Services. Bez React/Vue/Angular tylko dla organizacji kodu.

## 22. Dokumentacja

README wyjaśnia: strukturę projektu, uruchomienie, działanie danych, różnicę Google / Gość, migrację danych, PWA i ograniczenia bezpieczeństwa. Nie pisz, że dane są „w pełni bezpieczne”. Precyzyjnie: dane są przechowywane lokalnie w przeglądarce użytkownika.

## 23. Zakaz samowolnych zmian

Bez wyraźnego polecenia NIE: zmieniaj listy objawów, modelu danych, usuwaj funkcji, PWA, widoku miesiąca, cytatów, nie zmieniaj całkowicie wyglądu, nie dodawaj systemu kont, backendu, bazy danych, płatności ani analityki śledzącej.

## 24. Oczekiwany rezultat (DZIENNICZEK v4)

Pełne repo + modularność ZIP + poprawne daty + migracja + tryb gościa + bezpieczny DOM (XSS) + poprawne PWA + stabilny Service Worker. Nie kończ na „kod wygląda dobrze” — dopiero po sprawdzeniu spójności całego projektu i krótkim raporcie:

```text
ZMIENIONE:
ZACHOWANE:
MIGRACJA:
TESTY:
ZNANE OGRANICZENIA:
```

Jeżeli czegoś nie udało się zweryfikować, napisz to wprost zamiast zakładać, że działa.
