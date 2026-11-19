# Reguły dla AI — Dzienniczek (stan 19.11.2026)

Najpierw: `README.md` (stan, plan), `docs/DANE.md` (struktura danych — obowiązkowo przed zmianą zapisu), `docs/OPIS-SYSTEMU.md`.
Zasady pochodzą od prowadzącego (cytaty w MEMO RedRoad: `domains/dev/reference_dzienniczek_github_pages_consis_redroad_2026_10_05.md`).
Siostrzana aplikacja: TERAPIA (`CONSIS-redroad/terapia`, zasady w jej `.ai/RULES.md`).

## Prywatność
1. Dzienniczek jest prywatny i osobny — grupa (TERAPIA) nie ma dostępu do wpisów; członkostwo w grupie niczego nie otwiera.
2. Żadnych danych na naszym serwerze. Kierunek (czeka na „robić” prowadzącego): wpisy przy koncie użytkownika na jego Dysku Google
   (`appDataFolder`). Dopóki to nie wejdzie — dane są w przeglądarce urządzenia; nie mów nikomu, że „są na koncie”.
3. Teksty z prawami autorskimi nie trafiają do Dzienniczka (tylko do Archiwum TERAPII).
4. Logowania nie przekazuj między Dzienniczkiem a TERAPIĄ; wspólny jest tylko wygląd (`rr_ui_theme_v1`, `rr_ui_wallpaper_v1`).

## Dane
5. Każda zmiana formatu zapisu = aktualizacja `docs/DANE.md` w tym samym PR (kopia → przeniesienie → zapis → oznaczenie; nowe pola
   opcjonalne; pozycje list dopisuj na końcu). Test `tests/test.js` (sekcja 12) pilnuje, by każdy klucz z kodu był w DANE.md.
6. Nowa wersja nie może skasować wpisów ani ustawień użytkownika.

## Treść i wygląd
7. Wygląd spójny z TERAPIĄ (kolory, czcionka, tapety, przycisk „Terapia”); jasny i ciemny tryb wszędzie; telefon najpierw
   (bez przewijania w bok, cele dotyku ≥ 44 px). Wielkość tekstu: Mały/Średni/Duży (`rr_ui_text_v1`).
8. Zakładka „Pytania” (kwestionariusz): neutralny podpis w menu, bez progów typu „wysoki wskaźnik” — to nie diagnoza;
   numery pomocy: 112, 800 120 002, 116 123.
9. Element z `hidden` i własnym `display` wymaga `[hidden]{display:none!important}` — testuj widoczność na wszystkich zakładkach.

## Wydanie
10. Gałąź → test (Playwright 320/390 px, jasny/ciemny) → PR do `main` (GitHub Pages) kontem `CONSIS-redroad`.
    Każde wydanie podbija `APP_VERSION` w `js/version.js` i listę `SHELL` w `sw.js`. Na żywo dopiero po adwersarzu
    (lekcja 5.4.0: scalenie przed końcem adwersarza wpuściło błąd) albo na wyraźne „wprowadź aktualizację” prowadzącego.
