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

1. Otwórz repozytorium na GitHub: **Settings → Pages**.
2. W sekcji **Build and deployment**, w polu **Source**, wybierz **Deploy from a branch**.
3. Wybierz gałąź **main** i katalog **/(root)**, a następnie kliknij **Save**.
4. Adres strony będzie mieć postać: https://linkerman1.github.io/secretsanta/

Repozytorium jest obecnie prywatne. Publikacja GitHub Pages z prywatnego repozytorium wymaga kwalifikującego się planu GitHub (np. Pro). Na planie Free alternatywą jest udostępnienie kodu w publicznym repozytorium. Wyniki losowania nie są przesyłane do GitHuba.

## Test lokalny

Otwórz `index.html` w przeglądarce lub uruchom `python3 -m http.server 8000` i przejdź na `http://localhost:8000`.
