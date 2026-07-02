# finance-tracker-web

Frontend React + TypeScript do `finance-tracker-api`.

## Co jest zaimplementowane

- logowanie i rejestracja (`/api/auth/login`, `/api/auth/register`)
- autoryzacja JWT z automatycznym nagłówkiem `Authorization: Bearer ...`
- dashboard z:
  - statystykami (`/api/stats/summary`, `/api/stats/by-category`, `/api/stats/monthly`)
  - kategoriami (listowanie, dodawanie, usuwanie)
  - budżetami (listowanie, dodawanie, usuwanie)
  - transakcjami (listowanie, dodawanie, usuwanie)
- cache i odświeżanie danych przez React Query

## Wymagania

- Node.js 20+
- działające `finance-tracker-api` na `http://localhost:5200`
- frontend uruchamiany na `http://localhost:4200` (zgodne z CORS API)

## Konfiguracja

Utwórz plik `.env`:

```bash
VITE_API_BASE_URL=http://localhost:5200/api
```

## Uruchomienie

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
```
