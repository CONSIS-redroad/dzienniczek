# 🌿 Dzienniczek Samoobserwacji — WOTUiUW Gdańsk

Prywatna aplikacja webowa (Progressive Web App – PWA) stworzona jako narzędzie wspierające proces terapeutyczny w **Wojewódzkim Ośrodku Terapii Uzależnień i Współuzależnienia (WOTUiUW) w Gdańsku**.

Aplikacja służy do codziennego monitorowania 27 kluczowych stanów, zachowań i objawów współuzależnienia oraz prowadzenia krótkich notatek z samoobserwacji.

---

## 📌 Główne funkcjonalności

* **Interaktywny kalendarz**: szybkie dodawanie i przeglądanie wpisów z danego dnia.
* **Lista 27 objawów**: ustandaryzowany zestaw zachowań i mechanizmów do codziennej autodiagnozy.
* **Podgląd tabelaryczny (miesięczny)**: zestawienie wszystkich dni miesiąca w formie czytelnej siatki wraz z sumami objawów.
* **Wydruk A4 poziomy**: możliwość bezpośredniego wydrukowania miesięcznej karty samoobserwacji na spotkanie z terapeutą (`Ctrl+P` / przycisk *Drukuj*).
* **Cytaty wspierające**: rotacyjna baza inspirujących myśli z możliwością dodawania własnych sentencji.
* **Instalacja PWA**: działa bezpośrednio na smartfonach (Android / iOS) oraz komputerach jak natywna aplikacja, również w trybie offline.

---

## 🔒 Bezpieczeństwo i prywatność

* **Logowanie Google (Google Identity Services)**: autoryzacja bez konieczności tworzenia osobnych haseł.
* **Brak zewnętrznej bazy danych**: dane nie trafiają na żaden zewnętrzny serwer ani do chmury firm trzecich.
* **Izolacja danych**: wpisy są bezpiecznie zapisywane w pamięci przeglądarki (`localStorage`) w powiązaniu z unikalnym identyfikatorem konta Google.
* **Brak trackerów i reklam**: pełna poufność procesu terapeutycznego.

---

## 🚀 Uruchomienie i instalacja

Aplikacja jest hostowana za pośrednictwem GitHub Pages pod adresem:  
👉 **`https://consis-redroad.github.io/dzienniczek/`**

### Instalacja na telefonie:
1. Otwórz powyższy link w przeglądarce **Chrome** (Android) lub **Safari** (iOS).
2. Wybierz przycisk **„Zainstaluj aplikację”** na ekranie startowym (lub w menu przeglądarki wybierz *Dodaj do ekranu głównego*).
3. Ikona dzienniczka pojawi się na Twoim pulpicie.

---

## 🛠️ Technologie

* **Frontend**: HTML5, Modern Vanilla CSS, JavaScript (ES6+)
* **PWA**: Web App Manifest, Service Worker (Cache-first offline shell)
* **Auth**: Google Identity Services (GIS)
* **Hosting**: GitHub Pages
