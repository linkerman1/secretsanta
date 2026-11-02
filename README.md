# 🎁 Secret Santa — jeden link dla wszystkich, osobne PIN-y

Wspólny link do aplikacji: https://linkerman1.github.io/secretsanta/

Wersja działa jako statyczna strona **GitHub Pages**, bez kont, osobnej bazy danych i udostępniania osobnego adresu każdemu uczestnikowi. Wszystkie przydziały przygotowuje organizator **raz** na swoim urządzeniu.

## Instrukcja dla organizatora

1. Wejdź na **główny adres** (bez `#room=`) na swoim telefonie lub komputerze.
2. Dodaj 2–24 uczestników. Imiona muszą być unikalne.
3. Aplikacja automatycznie odmienia imiona w wynikach (np. **Kasia → dla Kasi**, **Piotr → dla Piotra**, **Ania → dla Ani**). W razie nietypowego imienia kliknij **✏️** przy osobie i popraw formę po słowie „dla”, **zanim** rozpoczniesz losowanie.
4. Kliknij **Rozlosuj prezenty**. Każdy dostanie dokładnie jedną osobę; nikt nie trafi na siebie, nie będzie powtórek. Przy większej grupie szyfrowanie może potrwać kilka chwil — widoczny jest postęp 1/N, 2/N itd.
5. Zobaczysz **jeden wspólny link**. Skopiuj go i wyślij całej grupie (np. na Messengerze). To nie jest po prostu adres strony głównej: kończy się długim kodem `#room=...`, zawierającym zaszyfrowane wyniki.
6. Każdy uczestnik otrzymuje **osobny 16-cyfrowy PIN**. Wyślij mu ten PIN **prywatnie** (lub podaj osobiście). Nigdy nie publikuj listy PIN-ów na grupie.
7. Pobierz **prywatną kopię .json** — przywraca przydziały i PIN-y, jeśli wyczyścisz przeglądarkę. Możesz też pobrać CSV z listą par i kodów.

Uczestnik otwiera **ten sam wspólny link** na swoim urządzeniu, wybiera swoje imię, **wkleja PIN** (może być zapisany w grupach oddzielonych spacją lub myślnikiem) i klika **Odkryj mój wynik**. Widzi tylko przypisaną mu osobę.

## Co chroni prywatność?

- Każdy odbiorca prezentu jest szyfrowany **oddzielnie** algorytmem AES-GCM. Klucz dla danego uczestnika powstaje przez PBKDF2-SHA256 z jego losowego 16-cyfrowego PIN-u i unikalnej soli (310 000 iteracji).
- Publiczny wspólny link zawiera **imiona i zaszyfrowane dane**. Nie zawiera PIN-ów ani czytelnej listy przydziałów. Uczestnik posiadający wyłącznie swój PIN nie może normalnie odszyfrować cudzych wyników.
- Nie ma centralnego serwera do sprawdzania PIN-ów ani ograniczania liczby prób. Używaj tylko **automatycznie wygenerowanych 16-cyfrowych PIN-ów**; krótkie lub łatwe PIN-y byłyby narażone na ataki słownikowe/offline. PIN-y nie są jednorazowe — kto je pozna, może sprawdzić przydział danej osoby.
- Organizator dysponuje wszystkimi przydziałami i PIN-ami w **localStorage** swojego urządzenia i może je podejrzeć. Każda osoba z dostępem do urządzenia organizatora lub prywatnego pliku kopii również może je zobaczyć.
- Wspólny link i PIN można otworzyć wielokrotnie. **Nowe losowanie nie unieważnia poprzedniego linku** — po losowaniu na nowo poinformuj wszystkich, że stare przydziały nie obowiązują.
- Bez odrębnej bazy nie da się wymusić jednokrotnego otwarcia, śledzić kto już zajrzał, odzyskać zgubionego PIN-u bez organizatora ani odebrać dostępu do starego linku.

## Gdy link lub PIN nie działa

- PIN składa się z **16 cyfr**. Nie musisz przepisywać go ręcznie: organizator może skopiować PIN jednym przyciskiem, a uczestnik może go wkleić do pola również z myślnikami lub spacjami.
- Przy pierwszym losowaniu szyfrowanie może wyglądać na wolne na starszym telefonie. Interfejs pokazuje postęp przygotowywania wyników.
- **Jeśli po otwarciu wspólnego linku widać ekran „Przygotuj losowanie” zamiast pola z PIN-em**, komunikator prawdopodobnie uciął długą końcówkę linku. Poproś organizatora o skopiowanie pełnego adresu z **#room=…** i wysłanie go bez skracania.
- Jeżeli organizator ponownie rozlosuje prezenty, stary link z poprzedniego losowania nadal istnieje — do nowego losowania używaj tylko nowego wspólnego linku i nowych PIN-ów.

## Kopie zapasowe

- **JSON** zawiera cały stan organizatora (imiona, PIN-y, wyniki, zaszyfrowany zestaw). Można go zaimportować z poziomu strony głównej.
- **CSV** zawiera imiona, PIN-y i osoby przypisane do prezentów. Ułatwia ręczny podgląd, ale nie służy do automatycznego importu.
- Oba pliki są **poufne**. Nigdy nie umieszczaj ich w publicznym repozytorium GitHub.

## Publikacja

Pliki `index.html` i `santa-core.mjs` publikowane są przez `.github/workflows/deploy.yml` (GitHub Actions). Przed wdrożeniem workflow uruchamia `node test.mjs`, który sprawdza losowanie, szyfrowanie, błędne PIN-y i kopie zapasowe.

[Ustawienia GitHub Pages](https://github.com/linkerman1/secretsanta/settings/pages) • [Wdrożenia](https://github.com/linkerman1/secretsanta/actions/workflows/deploy.yml)

## Test lokalny

Zainstaluj Node.js 20 lub nowszy, uruchom `node test.mjs`. Do testu strony użyj `python3 -m http.server 8000` i przejdź na `http://localhost:8000`. Web Crypto wymaga HTTPS lub localhost.
