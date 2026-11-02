# Secret Santa 🎁

Świąteczne losowanie prezentów: organizator przygotowuje uczestników, a każdy dostaje **swój prywatny link** i może odkryć wynik na własnym telefonie. Aplikacja jest po polsku, działa bez kont i bez własnego serwera na GitHub Pages.

## Jak przeprowadzić losowanie na różnych telefonach

1. Organizator otwiera https://linkerman1.github.io/secretsanta/ **bez dodatkowego fragmentu w adresie**.
2. Dodaje uczestników (minimum dwie osoby), a potem klika **Losuj i przygotuj linki**.
3. Aplikacja losuje wszystkich jednocześnie: każdy otrzymuje jednego odbiorcę prezentu, nikt nie trafia na siebie ani nie zostaje przydzielony dwa razy.
4. Na liście przy każdym imieniu są przyciski **Kopiuj link** oraz (jeśli telefon obsługuje) **Wyślij**. Organizator przesyła **indywidualny** link danej osobie przez komunikator.
5. Uczestnik otwiera link na swoim telefonie i klika **Odkryj, komu kupujesz prezent**. Widzi tylko swoje imię i jedną wylosowaną osobę.
6. W razie problemów organizator używa **Pokaż wszystkie pary (organizator)** lub pobiera **Pobierz prywatną kopię losowania (.csv)**.

**Nie wystarczy rozesłać wszystkim głównego adresu strony.** Każdy uczestnik musi otrzymać oddzielny link wygenerowany po losowaniu.

## Ważne ograniczenia i prywatność

- Losowanie odbywa się **jednorazowo u organizatora**, przed wysłaniem linków. Uczestnicy odsłaniają gotowe przydziały. To gwarantuje brak powtórek bez współdzielonej bazy danych.
- **Linki są poufne, ale nie jednorazowe**: każda osoba z danym linkiem może wielokrotnie zobaczyć przypisany wynik. Nie ma logowania ani weryfikacji tożsamości.
- Treść przydziału w linku jest szyfrowana AES-GCM za pomocą Web Crypto. Klucz znajduje się w fragmencie adresu po znaku `#`; GitHub Pages nie otrzymuje fragmentu URL w żądaniu HTTP. Nie wysyłaj linków publicznie.
- Uczestnicy nie mogą poznać innych przydziałów na podstawie **samego swojego** linku. Organizator ma jednak dostęp do wszystkich wyników.
- Lista uczestników, gotowe przydziały i wygenerowane linki są zapisane w **localStorage organizatora** na tym samym urządzeniu/przeglądarce. Nie są zapisywane na GitHubie ani synchronizowane między urządzeniami.
- **Pobierz kopię CSV i zachowaj ją prywatnie**. W razie utraty danych przeglądarki plik pozwoli odzyskać wszystkie przydziały i wysłane linki. Nie publikuj tego pliku w repozytorium.
- Jeśli organizator kliknie **Losuj ponownie**, stare linki wciąż będą pokazywały poprzednie przydziały. Trzeba wtedy powiadomić uczestników, że obowiązują **nowe** linki.
- Dodatkowo zachowano możliwość odkrywania wyników na jednym urządzeniu, jeśli ktoś nie może użyć swojego telefonu.

## GitHub Pages

Repozytorium jest publiczne. Automatyczna publikacja działa przez GitHub Actions (`.github/workflows/deploy.yml`) po każdym wypchnięciu zmian do `main`.

Strona: https://linkerman1.github.io/secretsanta/

[Ustawienia Pages](https://github.com/linkerman1/secretsanta/settings/pages) · [Wdrożenia](https://github.com/linkerman1/secretsanta/actions/workflows/deploy.yml)

## Uruchomienie lokalne

Zamiast otwierać plik z dysku, uruchom serwer HTTPS lub `python3 -m http.server 8000` i wejdź na `http://localhost:8000`; Web Crypto wymaga bezpiecznego kontekstu (HTTPS lub localhost).
