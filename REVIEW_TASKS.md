# Proponowane zadania po przeglądzie bazy kodu

## 1) Literówka do poprawy
**Obszar:** `docs/papers.md`.

W publikacji z 2017 roku występuje literówka w tytule: `Shooting trainning system in Virtual Reality`.

**Proponowane zadanie:**
- Zmienić `trainning` na `training` i sprawdzić spójność angielskich tytułów publikacji w całym pliku.

## 2) Błąd do usunięcia
**Obszar:** `theme-switcher.js`.

Funkcja `applyTheme` aktualizuje klasę `.active`, ale nie aktualizuje `aria-selected`. To powoduje rozjazd stanu wizualnego i stanu dostępności po zmianie motywu wykonywanej poza handlerem kliknięcia opcji.

**Proponowane zadanie:**
- Przenieść aktualizację `aria-selected` do `applyTheme`, aby jedna funkcja była jedynym źródłem prawdy dla stanu aktywnego motywu.
- Dodać krótki test/manual checklist dla a11y: po każdej zmianie motywu dokładnie jedna opcja ma `aria-selected=\"true\"`.

## 3) Korekta komentarza / dokumentacji
**Obszar:** `scroll-animations.js`.

Komentarz mówi o czasie `150 ms`, ale stała `DURATION` ma wartość `520`.

**Proponowane zadanie:**
- Ujednolicić komentarz z implementacją (albo zmienić komentarz na `520 ms`, albo dopasować `DURATION` do docelowej wartości) i dopisać uzasadnienie UX w komentarzu.

## 4) Ulepszenie testu
**Obszar:** brak testów automatycznych dla JS UI.

Aktualnie logika interakcji (motywy, smooth scroll, nawigacja 2D) nie ma pokrycia testowego.

**Proponowane zadanie:**
- Dodać test E2E (np. Playwright) dla `theme-switcher.js`:
  1. Ustawić motyw `forest`.
  2. Odświeżyć stronę.
  3. Zweryfikować `data-theme=\"forest\"` na `<html>`.
  4. Zweryfikować spójność `.active` i `aria-selected`.
- W kolejnym kroku rozszerzyć o test na anchor smooth scroll i aktualizację URL hash.
