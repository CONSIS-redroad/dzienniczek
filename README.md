[README.md](https://github.com/user-attachments/files/32712019/README.md)
# Dzienniczek samoobserwacji

**Wersja:** 1.0.0  
**Data:** 2025-11-21  
**Kompatybilność:** Przeglądarki nowoczesne (Chrome, Firefox, Edge, Safari - ostatnie 2 wersje)

## 📋 Opis

Aplikacja webowa do prowadzenia dzienniczka samoobserwacji. Umożliwia codzienne notowanie objawów, dodawanie notatek oraz zarządzanie inspiracjami poprzez cytaty.

## ✨ Funkcjonalności

### Kalendarz i wpisy
- **Kalendarz miesięczny** - wizualizacja dni z wpisami
- **27 objawów do zaznaczania** - lista objawów związanych z samoobserwacją
- **Notatki dzienne** - możliwość dodawania notatek do każdego dnia (max 300 znaków)
- **Wizualne oznaczenia** - zielone kropki na dniach z wpisami

### Cytaty inspiracji
- **Losowe cytaty** - wyświetlanie losowego cytatu na stronie głównej
- **Domyślne cytaty** - zestaw wbudowanych cytatów znanych osób
- **Własne cytaty** - możliwość dodawania własnych cytatów (max 200 znaków)
- **Cytaty z autorami** - każdy cytat może mieć przypisanego autora

### Podgląd miesiąca
- **Tabela zbiorcza** - podgląd wszystkich 27 objawów dla całego miesiąca
- **Wiersz podsumowania** - suma objawów dla każdego dnia
- **Drukowanie** - optymalizacja do druku A4 poziomego
- **Numery objawów** - łatwa identyfikacja objawów w tabeli

### Import/Eksport danych
- **Eksport JSON** - pobieranie wszystkich danych do pliku JSON
- **Import JSON** - wczytywanie danych z pliku
- **Przeciąganie plików** - drag & drop plików JSON
- **Walidacja danych** - automatyczna naprawa niepoprawnych struktur

### Statystyki
- **Dni z wpisami** - liczba dni z zapisanymi danymi
- **Średnia objawów** - średnia liczba objawów na dzień
- **Ostatni wpis** - data ostatniego wpisu

## 🛠️ Technologie

- **HTML5** - struktura strony
- **CSS3** - style i responsywność
  - CSS Variables (custom properties)
  - Flexbox i Grid
  - Media queries (responsywność)
  - Print media queries (optymalizacja druku)
- **JavaScript (ES6+)** - logika aplikacji
  - LocalStorage API - przechowywanie danych lokalnie
  - FileReader API - wczytywanie plików
  - Drag & Drop API - przeciąganie plików
  - Blob API - generowanie plików do pobrania
- **Brak zależności zewnętrznych** - aplikacja działa bez bibliotek

## 📁 Struktura plików

```
dzienniczek/
├── index.html          # Główny plik HTML
├── app.js             # Logika aplikacji JavaScript
├── style.css          # Style CSS
├── quotes.js          # Cytaty domyślne (łatwe do edycji)
└── README.md          # Dokumentacja
```

## 💾 Przechowywanie danych

**⚠️ WAŻNE:** Aplikacja **NIE przechowuje danych na serwerze**. Wszystkie dane są zapisywane **tylko w przeglądarce użytkownika** (localStorage).

### Format danych
```json
{
  "days": {
    "2025-01-15": {
      "symptoms": [true, false, true, ...],  // 27 boolean
      "note": "Tekst notatki"
    }
  },
  "customQuotes": {
    "1737123456789": "Tekst cytatu"
  }
}
```

### Eksport/Import
- **Eksport:** Pobiera plik `dzienniczek.json` z wszystkimi danymi
- **Import:** Wczytuje dane z pliku JSON (przez przycisk lub drag & drop)
- **Zalecenie:** Eksportuj regularnie, aby nie stracić danych przy czyszczeniu przeglądarki

## 🚀 Instalacja/Uruchomienie

### Lokalnie (XAMPP/WAMP)
1. Skopiuj pliki do folderu `htdocs` (XAMPP) lub `www` (WAMP)
2. Otwórz w przeglądarce: `http://localhost/dzienniczek/index.html`

### Na serwerze
1. Wgraj wszystkie pliki na serwer przez FTP/WebDAV
2. **⚠️ WAŻNE:** Aplikacja wymaga HTTPS (certyfikat SSL) dla prawidłowego działania
3. Otwórz w przeglądarce: `https://www.majtasy.pl/dzienniczek/index.html`

**Uwaga:** Jeśli nie masz certyfikatu SSL, przeglądarki mogą blokować niektóre funkcje (localStorage, FileReader API) lub wyświetlać ostrzeżenia bezpieczeństwa.

## ⚠️ Znane problemy

### Problem z brakiem certyfikatu SSL

**Opis problemu:**
Brak certyfikatu SSL (HTTPS) może powodować:
- Ostrzeżenia phishing w przeglądarkach
- Blokowanie niektórych funkcji JavaScript (localStorage, FileReader)
- Problemy z wyświetlaniem strony u niektórych użytkowników
- Ostrzeżenia "Strona nie jest bezpieczna"

**Rozwiązania:**

1. **Sprawdź w panelu hostingu webd.pl:**
   - Zaloguj się do panelu hostingu webd.pl
   - Szukaj sekcji: **"SSL"**, **"Certyfikaty"**, **"Bezpieczeństwo"** lub **"HTTPS"**
   - Wiele hostingu oferuje Let's Encrypt jako opcję "Włącz SSL" lub "Darmowy SSL"
   - Jeśli jest dostępne - włącz jednym kliknięciem
   - Certyfikat będzie automatycznie generowany i odnawiany

2. **Let's Encrypt przez SSH (jeśli masz dostęp):**
   ```bash
   # Instalacja certbot (przykład dla Ubuntu/Debian)
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-apache
   
   # Generowanie certyfikatu dla domeny
   sudo certbot --apache -d www.majtasy.pl -d majtasy.pl
   
   # Automatyczne odnowienie (dodaje się automatycznie do cron)
   sudo certbot renew --dry-run
   ```
   - Certyfikat jest **całkowicie darmowy**
   - Ważny przez 90 dni, automatycznie odnawiany
   - Wymaga dostępu SSH do serwera

3. **Cloudflare (DARMOWE - alternatywa):**
   - Zarejestruj domenę w Cloudflare
   - Włącz "Flexible SSL" lub "Full SSL"
   - Certyfikat SSL jest automatycznie dodawany
   - Dodatkowo: ochrona DDoS, CDN, cache

3. **Hosting z wbudowanym SSL:**
   - Wiele hostingu oferuje darmowy SSL (Let's Encrypt)
   - Sprawdź w panelu hostingu opcję "SSL" lub "Certyfikaty"
   - Często można włączyć jednym kliknięciem

4. **Tymczasowe rozwiązanie (NIE ZALECANE):**
   - Jeśli nie możesz dodać SSL, aplikacja może działać na HTTP
   - Użytkownicy będą widzieć ostrzeżenia w przeglądarce
   - Niektóre funkcje mogą nie działać poprawnie
   - **Nie zalecane dla aplikacji z danymi użytkownika**

**Jak sprawdzić czy SSL działa:**
- Otwórz `https://www.majtasy.pl` w przeglądarce
- Sprawdź czy widzisz zieloną kłódkę w pasku adresu
- Kliknij kłódkę → "Certyfikat" → sprawdź czy jest ważny

**Po dodaniu SSL:**
- Wszystkie linki powinny używać `https://` zamiast `http://`
- Sprawdź czy `.htaccess` przekierowuje HTTP → HTTPS (opcjonalne)
- Wyczyść cache przeglądarki po zmianie

### Problem z ostrzeżeniami phishing

**Opis problemu:**
Niektóre przeglądarki mogą wyświetlać ostrzeżenia o potencjalnym phishing'u lub podejrzanej stronie.

**Możliwe przyczyny:**

1. **Brak nagłówków bezpieczeństwa:**
   - Brak `X-Content-Type-Options: nosniff`
   - Brak `X-Frame-Options`
   - Brak `X-XSS-Protection`
   - Brak `Referrer-Policy`

2. **Brak meta tagów opisujących stronę:**
   - Brak `meta description`
   - Brak `meta author`
   - Brak informacji o stronie w HTML

3. **Problemy z HTTPS:**
   - Nieprawidłowy certyfikat SSL
   - Mieszane treści (HTTP i HTTPS)
   - Certyfikat wygasły lub nieprawidłowy

4. **Podejrzane praktyki:**
   - Używanie localStorage bez wyjaśnienia (może być traktowane jako śledzenie)
   - Brak informacji o przechowywaniu danych
   - Brak polityki prywatności

**Rozwiązania (zaimplementowane):**

1. ✅ **Nagłówki bezpieczeństwa** - dodane w `.htaccess`:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`

2. ✅ **Meta tagi** - dodane w `index.html`:
   - `meta description` - opis strony
   - `meta author` - autor strony
   - `meta robots` - instrukcje dla robotów
   - `meta theme-color` - kolor motywu

3. ✅ **Informacje o danych** - wyraźnie opisane w aplikacji:
   - Informacja że dane są tylko w przeglądarce
   - Instrukcje eksportu danych
   - Brak śledzenia użytkownika

**Dodatkowe kroki (jeśli problem nadal występuje):**

1. **⚠️ Dodaj certyfikat SSL (KRYTYCZNE):**
   - Brak SSL jest główną przyczyną ostrzeżeń phishing
   - Zobacz sekcję "Problem z brakiem certyfikatu SSL" powyżej
   - Użyj Let's Encrypt (darmowy) lub Cloudflare

2. **Sprawdź w Google Search Console:**
   - Zarejestruj stronę w Google Search Console
   - Sprawdź czy nie ma ostrzeżeń bezpieczeństwa
   - Zweryfikuj własność domeny

3. **Sprawdź w przeglądarce:**
   - Otwórz DevTools (F12) → Security
   - Sprawdź czy są ostrzeżenia bezpieczeństwa
   - Sprawdź czy wszystkie zasoby ładują się przez HTTPS

4. **Dodaj politykę prywatności (opcjonalne):**
   - Stwórz stronę z informacją o przechowywaniu danych
   - Wyjaśnij że dane są tylko lokalnie w przeglądarce
   - Dodaj link do polityki prywatności w stopce

### Problem z wyświetlaniem na www.majtasy.pl

**Opis problemu:**
Po wrzuceniu aplikacji na serwer www.majtasy.pl, aplikacja działa poprawnie u właściciela serwera (w jego przeglądarce), ale inni użytkownicy zgłaszają, że strona się nie wyświetla.

**Możliwe przyczyny:**

1. **Problem z WebDAV/serwerem:**
   - Nieprawidłowe uprawnienia do plików (644 dla plików, 755 dla folderów)
   - Problemy z kodowaniem znaków (UTF-8)
   - Cache serwera - stara wersja plików w cache

2. **Problem z MIME types:**
   - Serwer może nie rozpoznawać `.js` jako JavaScript
   - Brak konfiguracji `Content-Type: application/javascript` dla plików `.js`
   - Brak konfiguracji `Content-Type: text/css` dla plików `.css`

3. **Problem z CORS (jeśli używane są zewnętrzne zasoby):**
   - Brak nagłówków CORS (nie dotyczy tej aplikacji - brak zewnętrznych zasobów)

4. **Problem z kodowaniem:**
   - Pliki nie są w kodowaniu UTF-8
   - BOM (Byte Order Mark) w plikach może powodować problemy

**Rozwiązania:**

1. **Sprawdź uprawnienia plików:**
   ```bash
   chmod 644 *.html *.js *.css
   chmod 755 .
   ```

2. **Sprawdź kodowanie plików:**
   - Wszystkie pliki powinny być w UTF-8 bez BOM
   - Sprawdź w edytorze (Notepad++ → Encoding → UTF-8)

3. **Dodaj `.htaccess` (jeśli Apache):**
   ```apache
   AddType application/javascript .js
   AddType text/css .css
   AddDefaultCharset UTF-8
   ```

4. **Wyczyść cache:**
   - Wyczyść cache przeglądarki (Ctrl+Shift+Delete)
   - Wyczyść cache serwera (jeśli dostępne)

5. **Sprawdź konsolę przeglądarki:**
   - Otwórz DevTools (F12)
   - Sprawdź zakładkę Console - mogą być błędy ładowania plików
   - Sprawdź zakładkę Network - czy pliki `.js` i `.css` się ładują

6. **Test w trybie incognito:**
   - Otwórz stronę w trybie incognito/private
   - Jeśli działa w incognito, problem jest z cache

**Debugowanie:**
- Sprawdź czy pliki są dostępne bezpośrednio:
  - `https://www.majtasy.pl/dzienniczek/app.js`
  - `https://www.majtasy.pl/dzienniczek/style.css`
  - `https://www.majtasy.pl/dzienniczek/quotes.js`
- Jeśli pliki się nie ładują, problem jest z serwerem/uprawnieniami
- Jeśli pliki się ładują, ale aplikacja nie działa, problem jest z JavaScript

## 📝 Edycja cytatów

Cytaty domyślne znajdują się w pliku `quotes.js`. Możesz je łatwo edytować:
- Dodawać nowe cytaty
- Usuwać cytaty
- Modyfikować istniejące cytaty
- Format: `"Tekst cytatu — Autor"` lub `"Tekst cytatu — Anonim"`

## 🔄 Historia wersji

### v1.0.0 (2025-11-21)
- Pierwsza wersja aplikacji
- Kalendarz z wpisami
- 27 objawów do zaznaczania
- Notatki dzienne
- Cytaty inspiracji
- Import/Eksport JSON
- Podgląd miesiąca z drukowaniem
- Statystyki

## 📄 Licencja

Aplikacja do użytku osobistego.

## 👤 Autor

Stworzona dla dzienniczka samoobserwacji.

---

**Pamiętaj:** Regularnie eksportuj dane do pliku JSON, aby nie stracić wpisów!

