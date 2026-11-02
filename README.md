# Secret Santa 🎁

Prosta aplikacja do losowania świątecznych prezentów po polsku. Działa bez serwera, bez kont i bez zewnętrznych bibliotek.

## Jak używać

1. Dodaj co najmniej 2 uczestników (nie można dodać tego samego imienia dwa razy).
2. Kliknij **Rozlosuj prezenty**. Każdy dostanie dokładnie jedną osobę i nikt nie wylosuje samego siebie.
3. Przekazuj urządzenie kolejnym osobom. Każdy wybiera swoje imię, sprawdza wynik i klika **Ukryj wynik** przed przekazaniem telefonu.
4. Wyniki i lista są przechowywane lokalnie w pamięci przeglądarki (`localStorage`). Można wrócić do nich po odświeżeniu strony na tym samym urządzeniu.
5. Organizator może kliknąć **Pokaż wszystkie pary (organizator)** i potwierdzić ostrzeżenie, by zobaczyć pełną listę przydziałów. Przed przekazaniem telefonu należy użyć **Ukryj wszystkie pary**. Panel pozostaje ukryty po odświeżeniu strony.

**Uwaga:** panel organizatora nie ma hasła ani kontroli dostępu. Każda osoba korzystająca z tego samego urządzenia może go otworzyć. Ukrycie wyników jest jedynie zabezpieczeniem przed przypadkowym podejrzeniem.

**Ważne:** Każdy korzystający z tego samego urządzenia może wybrać dowolne imię i podejrzeć jego wynik. Aplikacja nie zapewnia indywidualnych tajnych linków ani synchronizacji między urządzeniami. Do pełnej prywatności potrzebny jest backend lub wysyłanie indywidualnych wyników.

## Publikacja na GitHub Pages

Repozytorium jest publiczne. Aplikacja ma automatyczny workflow `.github/workflows/deploy.yml`, który publikuje `index.html` w GitHub Pages po pushu na `main` lub ręcznym uruchomieniu.

**Pierwsze uruchomienie:**

1. Otwórz [Settings → Pages](https://github.com/linkerman1/secretsanta/settings/pages).
2. W **Build and deployment → Source** wybierz **GitHub Actions** (nie „Deploy from a branch”).
3. Przejdź do [Actions → Publish Secret Santa to GitHub Pages](https://github.com/linkerman1/secretsanta/actions/workflows/deploy.yml), wybierz **Run workflow**, gałąź **main**, i kliknij zielony **Run workflow**.
4. Po pomyślnej publikacji witryna będzie dostępna pod adresem: https://linkerman1.github.io/secretsanta/

Przyszłe zmiany w gałęzi `main` będą publikowane automatycznie. Ustawienia Pages wymagają jednorazowej konfiguracji przez osobę mającą dostęp do ustawień repozytorium.

**Prywatność:** nie zapisuj wyników losowania w publicznym repozytorium. Wyniki są zapisywane lokalnie w pamięci przeglądarki użytkownika, a nie na GitHubie.

## Test lokalny

Otwórz `index.html` w przeglądarce lub uruchom `python3 -m http.server 8000` i przejdź na `http://localhost:8000`.
