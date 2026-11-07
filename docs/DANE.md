# Dane użytkownika — struktura i zasady zmian

> **Jedyne źródło prawdy o tym, co dzienniczek zapisuje u użytkownika.** Każda zmiana kodu, która dotyka zapisu
> (nowe pole, nowy klucz, zmiana formatu, usunięcie), **w tym samym PR** zmienia ten plik. Test `tests/test.js`
> (sekcja 12) nie przepuści klucza zapisu, którego tu nie ma.
>
> Stan: **wersja aplikacji 5.6.1** (07.11.2026), format rekordu głównego `schemaVersion: 2`.

## 1. Gdzie leżą dane

- Wszystko leży **w przeglądarce użytkownika, na tym urządzeniu**. Nie ma naszego serwera ani bazy. Konto Google służy tylko do rozpoznania osoby.
- **Zalogowany przez Google:** `localStorage`. Klucze zawierają `<sub>`, czyli stały identyfikator konta Google z tokenu (`p.sub`). Na jednym telefonie każde konto ma osobne dane.
- **Gość („Wypróbuj bez logowania”):** `sessionStorage`. Dane znikają po zamknięciu karty. Klucz rekordu głównego to `dzienniczek_guest_session_v4`. Klucze pochodne tworzy się tak samo jak u konta: `<klucz>_wstyd` i `<klucz>_przemoc`.
- **Wygląd** (motyw, tapeta, wielkość tekstu, ostatnia zakładka) nie zależy od konta. Leży w `localStorage` i jest wspólny dla wszystkich osób na tym urządzeniu. Część kluczy `rr_ui_*` jest docelowo wspólna z TERAPIĄ, bo obie aplikacje działają pod tym samym adresem `consis-redroad.github.io`.

## 2. Klucze — spis

`<K>` oznacza klucz rekordu głównego: `dzienniczek_user_<sub>` dla konta albo `dzienniczek_guest_session_v4` dla gościa.

| Klucz | Pamięć | Co zawiera | Od wersji | Kod |
|---|---|---|---|---|
| `dzienniczek_user_<sub>` | local | rekord główny: dni, cytaty, koło (§3) | 4.x (`schemaVersion` 2 od PR #1) | `js/storage.js` `save/load` |
| `dzienniczek_guest_session_v4` | session | to samo dla gościa | 4.x | `js/config.js` |
| `<K>_wstyd` | jak `<K>` | dzienniczek wstydu, lista wpisów (§4) | 5.5.1 (w 5.5.0 był w rekordzie głównym) | `Storage.saveWstyd/loadWstyd/migrateWstyd` |
| `<K>_przemoc` | jak `<K>` | kwestionariusz: odpowiedzi i historia wyników (§5) | 5.6.0 | `js/przemoc.js` |
| `dzienniczek_user_<sub>_dzienniczek_local_date_migration_v4` | local | flaga `"1"`: migracja dat v3 → lokalne wykonana | 4.x | `Storage.migrateOldLocalDates` |
| `dzienniczek_user_<sub>_backup_v3_<ms>` | local | kopia surowego rekordu sprzed migracji dat (NIE kasować) | 4.x | jw. |
| `rr_ui_theme_v1` | local | tryb kolorów: `"light"` \| `"dark"` (brak = jak w systemie) | 5.2.0 | `js/theme.js` + `<head>` |
| `rr_ui_wallpaper_v2` | local | wybrany wygląd tła, tylko pola różne od domyślnych (§6) | 5.3.x | `js/theme.js` |
| `rr_ui_text_v1` | local | wielkość tekstu: `"s"` \| `"l"` (brak = średni) | 5.6.1 | `js/theme.js` + `<head>` |
| `dzienniczek_ui_tab_v1` | local | ostatnia zakładka: `dziennik` \| `kolo` \| `wstyd` (zakładki `pytania` celowo nie zapamiętujemy) | 5.4.0 | `js/kolo.js` `Views` |
| `rr_ui_wallpaper_v1`, `dzienniczek_ui_wallpaper_v1`, `dzienniczek_ui_theme_v1` | local | **stare**, tylko odczyt przy migracji do kluczy wyżej | — | `js/theme.js` |

## 3. Rekord główny `<K>`

```json
{
  "schemaVersion": 2,
  "days":   { "2026-11-07": { "symptoms": [true, false, …27 wartości], "note": "tekst ≤ 500 znaków" } },
  "quotes": { "1730985600000": "własny cytat ≤ 200 znaków" },
  "kolo":   ["gniew|ZŁOŚĆ", "wstyd|LEKCEWAŻENIE", "smutek|*"]
}
```

- `days`: klucz to **lokalna** data `YYYY-MM-DD` (`dateKey()`, nigdy `toISOString()`). `symptoms` ma zawsze **27** wartości, a kolejność odpowiada liście w `js/symptoms.js`. Zmiana listy objawów zmienia znaczenie zapisanych danych, więc wymaga migracji.
- `quotes`: klucz to `Date.now()` w chwili dodania.
- `kolo`: zaznaczone uczucia w formacie `"<id grupy>|<SŁOWO>"`, gdzie `*` oznacza samo uczucie grupy. Id grup: `wstyd, gniew, smutek, radosc, strach` (`js/kolo.js`), słowa wielkimi literami jak na karcie. Słowo `LEKCEWAŻENIE` występuje w dwóch grupach, dlatego identyfikator grupy jest w kluczu.
- `save()` zapisuje **cały** rekord naraz. Nowe pole rekordu trzeba dopisać w `Storage.save()`, inaczej zniknie przy pierwszym zapisie.

## 4. Dzienniczek wstydu `<K>_wstyd`

Lista wpisów (max 500, najnowsze z przodu):

```json
[{ "id": "w<base36>", "date": "2026-11-07", "at": "ISO czas zapisu",
   "sytuacja": "≤ 1000", "odmiany": ["Zażenowanie"], "cialo": ["Ścisk w gardle"], "cialoInne": "≤ 200", "wyrazenie": "≤ 1000" }]
```

`odmiany` i `cialo` zawierają tylko wartości z list `WSTYD_ODMIANY` i `WSTYD_CIALO` w `js/wstyd.js`. Inne wartości są odrzucane przy odczycie. **Zmiana tekstu pozycji na liście sprawia, że stare wpisy tracą tę pozycję**, więc przy zmianie trzeba zachować starą nazwę jako alias albo zrobić migrację.

## 5. Kwestionariusz `<K>_przemoc`

```json
{ "answers": { "izolacja.1": "c", "grozby.9": "r" },
  "history": [{ "date": "2026-11-07", "at": "ISO", "answered": 65, "total": 41, "scores": { "izolacja": 6, … } }] }
```

- Klucz odpowiedzi ma postać `"<id obszaru>.<nr pytania w obszarze, od 1>"`. Wartość to `"c"` (często, 2 pkt), `"r"` (rzadko, 1 pkt) albo `"n"` (nigdy, 0 pkt).
- Id obszarów: `izolacja, uwaga, wyzszosc, wymagania, wyczerpanie, ponizanie, grozby, nagrody, rzeczywistosc` (`PRZEMOC` w `js/przemoc.js`).
- ⚠️ **Odpowiedź jest przypięta do numeru pytania.** Wstawienie pytania w środek obszaru albo zmiana kolejności przesuwa odpowiedzi na inne pytania. Nowe pytanie dopisuje się **na końcu obszaru**. Usunięcie albo przestawienie pytania wymaga migracji `answers`.
- Poprawki stylistyczne treści pytania są bezpieczne, o ile pytanie znaczy to samo.
- `history` ma max 50 pozycji, jedną na dzień (nowszy zapis zastępuje starszy). `total` przy odczycie jest **liczony z `scores`**, a liczby są przycinane do zakresu.

## 6. Wygląd `rr_ui_wallpaper_v2`

Rzadki obiekt zawierający tylko pola wybrane przez użytkownika: `{ themeId?: "sakura"|"deszcz"|"swit"|"ksiezyc"|"brak", particles?: bool, density?: 0.5|1|1.6, motion?: bool, veil?: 0…0.6 }`. Na ekranie widać `DEFAULTS ⊕ wybór`. Dzięki temu zmiana wartości domyślnej dociera do osób, które nic nie wybierały, a cudzy wybór zostaje.

## 7. Zasady zmian (żeby dane się nie rozjechały)

1. **Nie zmieniaj nazwy klucza ani nie przenoś danych bez migracji.** Migracja ma stałą kolejność: **kopia → przeniesienie → zapis → oznaczenie jako wykonanej**. Musi być idempotentna (drugi raz nic nie robi). Starego klucza nie usuwa się przed udanym zapisem nowego.
2. **Nowe pole = opcjonalne z wartością domyślną przy odczycie.** Stare dane bez tego pola muszą działać.
3. **Zmiana znaczenia lub formatu istniejącego pola:** podbij `schemaVersion` (rekord główny) albo dodaj pole `v` w danym kluczu, napisz migrację i test w `tests/test.js` na danych w STARYM formacie.
4. **Odczyt traktuje dane jak obce:** sprawdza typy i zakresy, odrzuca nieznane wartości. Zepsute dane nie mogą wywrócić aplikacji ani zmienić wyniku (wzorzec: `Przemoc.load`, `Wstyd.load`).
5. **Przypięcie do pozycji na liście (objawy, pytania, odmiany wstydu):** nowe pozycje dopisuje się na końcu. Przestawienie, usunięcie albo zmiana nazwy wymaga migracji (zob. §3–§5).
6. **„Wyczyść wpisy”** (`Storage.clear`) usuwa wszystkie klucze konta z §2. Nowy klucz konta trzeba dopisać do `Storage.clear()`. Wylogowanie czyści ekran (`reset()` modułów), ale nie usuwa danych.
7. **Nic z danych użytkownika nie trafia do `innerHTML`**, tylko do `textContent` albo właściwości DOM.
8. **Ten plik i zmiana kodu idą razem w jednym PR.** Do historii (§8) dopisz wersję i co się zmieniło.

## 8. Historia formatu

| Wersja | Zmiana | Migracja |
|---|---|---|
| ≤ v3 | klucz dnia przez `toISOString()` (w Polsce dzień wcześniej) | — |
| 4.x / PR #1 | daty lokalne, `schemaVersion: 2`, gość w `sessionStorage` | `migrateOldLocalDates` (+1 dzień, kopia `_backup_v3_`) |
| 5.4.0 | `kolo` w rekordzie głównym | brak (nowe pole) |
| 5.5.0 | `wstyd` w rekordzie głównym | — |
| 5.5.1 | `wstyd` → osobny klucz `<K>_wstyd` | `migrateWstyd` (z rekordu głównego, gdy klucza jeszcze nie ma) |
| 5.6.0 | kwestionariusz `<K>_przemoc` | brak (nowy klucz) |
| 5.6.1 | `rr_ui_text_v1` (wielkość tekstu) | brak (nowy klucz) |

## 9. Zaplanowane — dane przy koncie (README § Plan poprawek)

Docelowo zapis **jednego pliku JSON na konto** w ukrytym folderze aplikacji na Dysku Google użytkownika (`appDataFolder`). Plik ma mieć **tę samą strukturę co §3–§5** w jednym obiekcie: `{ schemaVersion, days, quotes, kolo, wstyd, przemoc }`. Pamięć przeglądarki zostaje jako zapas offline. Przy wdrożeniu ten plik dostaje sekcję o scalaniu (nowszy zapis per dzień / per wpis) i o migracji z urządzenia.
