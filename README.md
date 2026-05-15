# HireQ

Generate role-specific interview questions powered by AI. Enter a job title and get 3 thoughtful, behavioral interview questions with rationale — streamed in real time.

## Stack

- **Next.js 16** — App Router
- **Vercel AI SDK** — `streamText` with streaming response
- **Groq** (`llama-3.3-70b-versatile`) — primary provider
- **Google Gemini** (`gemini-2.0-flash`) — fallback provider
- **shadcn/ui + Tailwind CSS** — UI components

## Getting Started

1. Copy `.env.example` to `.env.local` and add your API key:

```bash
cp .env.example .env.local
```

2. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes (default) | Free at [console.groq.com](https://console.groq.com) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | If using Gemini | Free at [ai.google.dev](https://ai.google.dev) |
| `AI_MODEL` | No | `groq` (default) or `gemini` |

## Deployment

Deploy to Vercel with one click. Add `GROQ_API_KEY` and `AI_MODEL=groq` as environment variables in the Vercel dashboard.
