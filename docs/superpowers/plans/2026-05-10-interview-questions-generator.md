# Interview Question Generator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Next.js app that generates 3 AI-powered, role-specific interview questions with rationale using Gemini via the Vercel AI SDK.

**Architecture:** Next.js App Router with a Server Action calling `generateObject()` from the Vercel AI SDK. Business logic lives in `lib/generate.ts` (pure, testable). The server action in `app/actions.ts` is a thin error-boundary wrapper. UI state is driven by `useTransition`.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Vercel AI SDK (`ai` + `@ai-sdk/google`), Zod, Vitest

---

## File Map

| File | Responsibility |
|---|---|
| `app/page.tsx` | Client component: form, loading state, results |
| `app/actions.ts` | `'use server'` wrapper: calls generate logic, returns typed result |
| `app/layout.tsx` | Root layout + metadata |
| `lib/schema.ts` | Zod schema + exported TypeScript types |
| `lib/ai.ts` | AI model config (swap model via `AI_MODEL` env var) |
| `lib/generate.ts` | Business logic: validates input, calls `generateObject()` |
| `lib/generate.test.ts` | Unit tests for `generateInterviewQuestions()` |
| `.env.local` | `GOOGLE_GENERATIVE_AI_API_KEY` (gitignored) |
| `.env.example` | Template for required env vars |
| `vitest.config.ts` | Test runner config with `@/*` alias |

---

## Tasks

### Task 1: Scaffold the project

**Files:**
- Creates: all Next.js boilerplate

- [ ] **Step 1: Run create-next-app in the current directory**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias="@/*" --yes
```

If prompted interactively, answer:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Turbopack: Yes
- Customize import alias: Yes → `@/*`

- [ ] **Step 2: Verify the dev server starts**

```bash
npm run dev
```

Expected: server starts at http://localhost:3000 with the default Next.js page. Stop with Ctrl+C.

- [ ] **Step 3: Initialize git and commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js project"
```

---

### Task 2: Install shadcn/ui

**Files:**
- Modifies: `app/layout.tsx`, `tailwind.config.ts`, adds `components.json`
- Creates: `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/card.tsx`, `lib/utils.ts`

- [ ] **Step 1: Initialize shadcn**

```bash
npx shadcn@latest init --defaults
```

If prompted interactively: Default style, Slate base color, CSS variables Yes.

- [ ] **Step 2: Add required components**

```bash
npx shadcn@latest add button input card
```

- [ ] **Step 3: Verify components exist**

```bash
ls components/ui/
```

Expected: `button.tsx  card.tsx  input.tsx`

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: add shadcn/ui with button, input, card"
```

---

### Task 3: Install AI dependencies and configure environment

**Files:**
- Creates: `.env.local`, `.env.example`, `vitest.config.ts`
- Modifies: `package.json`

- [ ] **Step 1: Install packages**

```bash
npm install ai @ai-sdk/google zod
npm install -D vitest
```

- [ ] **Step 2: Create `.env.local`**

Get your free API key from https://ai.google.dev (no credit card required).

```
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
AI_MODEL=gemini
```

- [ ] **Step 3: Create `.env.example`**

```
GOOGLE_GENERATIVE_AI_API_KEY=
AI_MODEL=gemini
```

- [ ] **Step 4: Verify `.env.local` is gitignored**

```bash
grep ".env.local" .gitignore
```

Expected: line appears in output. If not: `echo ".env.local" >> .gitignore`

- [ ] **Step 5: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 6: Add test scripts to `package.json`**

In the `"scripts"` section, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: Commit**

```bash
git add .env.example vitest.config.ts package.json package-lock.json
git commit -m "chore: install AI deps and configure vitest"
```

---

### Task 4: Define schema and AI config

**Files:**
- Create: `lib/schema.ts`
- Create: `lib/ai.ts`

- [ ] **Step 1: Create `lib/schema.ts`**

```ts
import { z } from 'zod'

export const questionSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      rationale: z.string(),
    })
  ).length(3),
})

export type Question = z.infer<typeof questionSchema>['questions'][number]
```

- [ ] **Step 2: Create `lib/ai.ts`**

```ts
import { google } from '@ai-sdk/google'
// GOOGLE_GENERATIVE_AI_API_KEY is picked up automatically

const MODELS = {
  gemini: google('gemini-2.0-flash'),
} as const

type ModelKey = keyof typeof MODELS

export const model = MODELS[(process.env.AI_MODEL as ModelKey) ?? 'gemini']
```

- [ ] **Step 3: Commit**

```bash
git add lib/schema.ts lib/ai.ts
git commit -m "feat: add Zod schema and AI model config"
```

---

### Task 5: Write failing tests for generate logic (RED)

**Files:**
- Create: `lib/generate.test.ts`

- [ ] **Step 1: Create `lib/generate.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('ai', () => ({
  generateObject: vi.fn(),
}))

vi.mock('@/lib/ai', () => ({
  model: 'mock-model',
}))

import { generateObject } from 'ai'
import { generateInterviewQuestions } from './generate'

describe('generateInterviewQuestions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws for empty job title', async () => {
    await expect(generateInterviewQuestions('')).rejects.toThrow(
      'Please enter a job title.'
    )
  })

  it('throws for whitespace-only job title', async () => {
    await expect(generateInterviewQuestions('   ')).rejects.toThrow(
      'Please enter a job title.'
    )
  })

  it('returns 3 questions each with question and rationale', async () => {
    const mockQuestions = [
      { question: 'Q1', rationale: 'R1' },
      { question: 'Q2', rationale: 'R2' },
      { question: 'Q3', rationale: 'R3' },
    ]
    vi.mocked(generateObject).mockResolvedValue({
      object: { questions: mockQuestions },
    } as any)

    const result = await generateInterviewQuestions('Customer Success Manager')

    expect(result).toHaveLength(3)
    expect(result[0]).toHaveProperty('question')
    expect(result[0]).toHaveProperty('rationale')
  })

  it('propagates errors from generateObject', async () => {
    vi.mocked(generateObject).mockRejectedValue(new Error('API error'))

    await expect(
      generateInterviewQuestions('Software Engineer')
    ).rejects.toThrow('API error')
  })
})
```

- [ ] **Step 2: Run tests and verify they fail**

```bash
npm test
```

Expected: 4 tests fail with `Cannot find module './generate'`

---

### Task 6: Implement generate logic (GREEN)

**Files:**
- Create: `lib/generate.ts`

- [ ] **Step 1: Create `lib/generate.ts`**

```ts
import { generateObject } from 'ai'
import { model } from './ai'
import { questionSchema, type Question } from './schema'

const buildPrompt = (jobTitle: string) => `\
You are an expert HR interviewer with deep knowledge of hiring across industries.

Generate exactly 3 thoughtful, role-specific interview questions for a candidate applying for the role of: ${jobTitle}

Requirements:
- Each question should reveal something meaningful about candidate fit for this specific role
- Mix behavioral and situational questions
- Avoid generic questions that could apply to any job
- For each question, provide a one-sentence rationale explaining what it reveals about the candidate`

export async function generateInterviewQuestions(jobTitle: string): Promise<Question[]> {
  if (!jobTitle.trim()) {
    throw new Error('Please enter a job title.')
  }

  const { object } = await generateObject({
    model,
    schema: questionSchema,
    prompt: buildPrompt(jobTitle.trim()),
  })

  return object.questions
}
```

- [ ] **Step 2: Run tests and verify all pass**

```bash
npm test
```

Expected: 4 tests pass

- [ ] **Step 3: Commit**

```bash
git add lib/generate.ts lib/generate.test.ts
git commit -m "feat: implement question generation with tests"
```

---

### Task 7: Implement server action

**Files:**
- Create: `app/actions.ts`

- [ ] **Step 1: Create `app/actions.ts`**

```ts
'use server'

import { generateInterviewQuestions } from '@/lib/generate'
import type { Question } from '@/lib/schema'

export type ActionResult =
  | { questions: Question[] }
  | { error: string }

export async function generateQuestions(jobTitle: string): Promise<ActionResult> {
  try {
    const questions = await generateInterviewQuestions(jobTitle)
    return { questions }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Failed to generate questions. Please try again.',
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/actions.ts
git commit -m "feat: add server action for question generation"
```

---

### Task 8: Build the UI

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Update metadata in `app/layout.tsx`**

Find the `metadata` export and replace it with:

```ts
export const metadata: Metadata = {
  title: 'Interview Question Generator',
  description: 'Generate tailored interview questions for any job role',
}
```

Keep all other content shadcn added (fonts, className, etc.) unchanged.

- [ ] **Step 2: Replace `app/page.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateQuestions, type ActionResult } from './actions'

export default function Home() {
  const [jobTitle, setJobTitle] = useState('')
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)
    startTransition(async () => {
      const res = await generateQuestions(jobTitle)
      setResult(res)
    })
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Interview Question Generator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter a job title to generate 3 tailored interview questions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            placeholder="e.g. Customer Success Manager"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            disabled={isPending}
            className="flex-1"
          />
          <Button type="submit" disabled={isPending || !jobTitle.trim()}>
            {isPending ? 'Generating...' : 'Generate Questions'}
          </Button>
        </form>

        {result && 'error' in result && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{result.error}</p>
            </CardContent>
          </Card>
        )}

        {result && 'questions' in result && (
          <div className="space-y-4">
            {result.questions.map((q, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-base">Question {i + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">{q.question}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Why this matters: </span>
                    {q.rationale}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Smoke test the full flow**

```bash
npm run dev
```

1. Open http://localhost:3000
2. Type "Customer Success Manager" — button should be disabled while input is empty
3. Click "Generate Questions"
4. Verify button shows "Generating..." while loading
5. Verify 3 Cards appear, each with a question and a "Why this matters:" rationale
6. Clear the input and verify button is disabled again
7. Stop with Ctrl+C

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/layout.tsx
git commit -m "feat: build UI with form, loading state, and results"
```

---

### Task 9: Push to GitHub

- [ ] **Step 1: Create a new public repository on GitHub**

Go to https://github.com/new. Name it `melo-practice-app`, set to **Public**. Do NOT initialize with README, .gitignore, or license.

- [ ] **Step 2: Add remote and push**

```bash
git remote add origin https://github.com/YOUR_USERNAME/melo-practice-app.git
git branch -M main
git push -u origin main
```

Expected: all commits pushed, visible on GitHub.

---

### Task 10: Deploy to Vercel

- [ ] **Step 1: Import the project on Vercel**

Go to https://vercel.com/new → "Import Git Repository" → select `melo-practice-app`.

- [ ] **Step 2: Add environment variable before deploying**

In the "Environment Variables" section:
- Key: `GOOGLE_GENERATIVE_AI_API_KEY`
- Value: your Gemini API key

- [ ] **Step 3: Deploy**

Click "Deploy". Build takes roughly 1-2 minutes.

- [ ] **Step 4: Verify the live URL**

1. Click the Vercel-provided URL
2. Type "Customer Success Manager" and generate questions
3. Verify the full flow works identically to local
4. Copy the live URL — include this in your submission email

---

## Loom Talking Points

- **Why Gemini `gemini-2.0-flash`:** free tier, no credit card, fast enough for structured output — the lowest-friction choice for a demo that needs to work for reviewers
- **Why Vercel AI SDK + `generateObject()`:** the model is a config value, not a code dependency — swap providers by changing one env var, zero code changes
- **Why Zod schema instead of prompt-level JSON instructions:** output contract is enforced by the type system, not by trusting the model to follow instructions — malformed output is a typed error, not a silent bug
- **Why Server Actions:** no REST layer needed for internal UI calls; this is idiomatic Next.js and the right default for a single-team product
- **Why rationale field:** a non-technical founder using this tool wants to know *why* a question matters, not just what to ask — I added rationale because it makes the output genuinely useful
- **What I'd add with more time:** Vercel AI Gateway for observability and fallback handling across providers, streaming responses for faster perceived performance, search history
