
# Foodprint AI – Backend (TypeScript/Express)

Implements two endpoints for Reewild's take‑home challenge:

- `POST /estimate` — JSON body `{ "dish": "Chicken Biryani", "servings": 1 }`
- `POST /estimate/image` — `multipart/form-data` with `file` (png/jpg/webp), optional `?servings=2`

Uses OpenAI (text + vision). If `OPENAI_API_KEY` is not set, returns deterministic **mock** outputs so reviewers can run it without credentials.

## Run locally
```bash
npm i
cp .env.example .env  # add OPENAI_API_KEY if available
npm run dev           # http://localhost:8080/docs
```

## Build
```bash
npm run build
npm start
```

## Docker
```bash
docker build -t foodprint-api .
docker run -p 8080:8080 --env-file .env foodprint-api
```

## Example
```bash
curl -X POST http://localhost:8080/estimate   -H "Content-Type: application/json"   -d '{"dish":"Chicken Curry","servings":1}'
```
```bash
curl -F file=@dish.jpg "http://localhost:8080/estimate/image?servings=2"
```

## Notes
- Carbon factors are mocked but centralized (`carbonService.ts`) for easy replacement with a real LCA dataset.
- Vision/text prompts are biased for JSON‑only outputs; responses are schema‑less but parsed safely with a mock fallback.
- Basic security: file size/type checks, Helmet, CORS, error handler.
