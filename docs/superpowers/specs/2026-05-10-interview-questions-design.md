# Interview Questions Generator — Design Spec

**Date:** 2026-05-10
**Context:** Technical screen for Technical Co-Founder / Founding Engineer role at an early-stage HRTech startup via Melo Associates. Submission includes a live hosted app and a 4–7 minute Loom walkthrough.

---

## Overview

A single-page web app that accepts a job title and returns 3 role-specific interview questions, each with a rationale explaining why it reveals meaningful signal about candidate fit.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js App Router | Vercel-native, zero-config deploy |
| UI | shadcn/ui + Tailwind | Production-quality components, fast to build |
| AI SDK | Vercel AI SDK (`ai`) | Provider-agnostic, easy model swapping |
| AI Provider | `@ai-sdk/google` → `gemini-2.0-flash` | Free tier, no credit card |
| Schema | Zod + `generateObject()` | Output contract enforced regardless of provider |
| Server | Server Actions | No REST layer needed for internal UI calls |
| Hosting | Vercel | Free tier, zero-config Next.js |

---

## File Structure

```
app/
  layout.tsx          ← root layout with shadcn font/theme
  page.tsx            ← client component: form + results UI
  actions.ts          ← "use server": generateQuestions(jobTitle)
components/
  ui/                 ← shadcn-generated (Button, Input, Card)
lib/
  ai.ts               ← AI model config (swap via AI_MODEL env var)
.env.local            ← GEMINI_API_KEY (gitignored)
.env.example          ← committed, shows required vars
```

Two files contain all meaningful logic: `app/page.tsx` and `app/actions.ts`.

---

## Data Flow

```
User types job title
  → clicks "Generate Questions"
  → page.tsx calls generateQuestions(jobTitle) [server action]
  → useTransition isPending → button disabled + spinner
  → actions.ts validates input
  → calls generateObject() with Gemini + Zod schema
  → returns { questions: [{ question, rationale }] } or { error: string }
  → page.tsx renders 3 Cards (question + rationale) or error message
```

---

## AI Configuration

```ts
// lib/ai.ts
const MODELS = {
  gemini: google('gemini-2.0-flash'),
} as const

export const model = MODELS[process.env.AI_MODEL ?? 'gemini']
```

Switching providers = changing `AI_MODEL` env var. No code changes required.

---

## Output Schema (Zod)

```ts
const schema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      rationale: z.string(),
    })
  ).length(3),
})
```

`generateObject()` enforces this shape via the provider's native structured output mechanism. Zod validates the result regardless of provider — malformed output throws a typed error, not a runtime crash.

---

## Prompt

```
You are an expert HR interviewer with deep knowledge of hiring across industries.

Generate exactly 3 thoughtful, role-specific interview questions for a candidate
applying for the role of: {jobTitle}

Requirements:
- Each question should reveal something meaningful about candidate fit for this specific role
- Mix behavioral and situational questions
- Avoid generic questions that could apply to any job
- For each question, provide a one-sentence rationale explaining what it reveals
```

JSON structure is enforced by the Zod schema and `generateObject()` — not by prompt instructions.

---

## Server Action Return Type

```ts
type ActionResult =
  | { questions: { question: string; rationale: string }[] }
  | { error: string }
```

Actions return `{ error }` instead of throwing — thrown errors surface ugly messages to the client.

---

## Loading & Error Handling

**Loading:** `useTransition` → `isPending` disables the button and shows a spinner. No separate loading boolean.

**Validation:** Client-side empty input check before calling the server action.

**Errors — two layers:**
- `actions.ts` wraps `generateObject()` in try/catch, returns `{ error: string }`
- `page.tsx` checks `result.error` and renders an inline error Card

**Out of scope for this screen:** retry logic, rate limit handling, streaming, offline detection.

---

## Environment Variables

```
GEMINI_API_KEY=     ← required, free from ai.google.dev
AI_MODEL=gemini     ← optional, defaults to gemini
```

For Vercel deployment: add `GEMINI_API_KEY` in the Vercel dashboard environment variables.

---

## Deployment

1. Push to public GitHub repo
2. Connect repo to Vercel (zero config for Next.js)
3. Add `GEMINI_API_KEY` as Vercel environment variable
4. Deploy — live URL for Loom and submission

---

## Loom Talking Points

- **Why Gemini:** free tier, fast, sufficient for structured output tasks
- **Why Vercel AI SDK:** the model is a config value, not a code dependency — swap providers by changing one env var
- **Why `generateObject()` + Zod:** output contract is enforced independent of the provider; if the model returns malformed data, it's a typed error not a silent bug
- **Why Server Actions:** no REST layer needed for internal UI calls; this is the idiomatic Next.js pattern
- **Why rationale field:** makes the app more useful for a non-technical founder — not just "here are questions" but "here's why each one matters"
- **What I'd add with more time:** Vercel AI Gateway for observability and fallback handling, streaming responses for faster perceived performance, history of past searches
