# Interview Questions Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js app that accepts a job title and returns 3 role-specific interview questions with rationale, powered by Gemini via the Vercel AI SDK.

**Architecture:** Single-page Next.js App Router app. A Server Action in `actions.ts` calls `generateObject()` (Vercel AI SDK) with a Zod schema to get typed structured output from Gemini. The page component uses `useTransition` for loading state and renders results as shadcn/ui Cards.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Vercel AI SDK (`ai` + `@ai-sdk/google`), Zod, lucide-react

---

## File Map

| File | Responsibility |
|------|----------------|
| `app/layout.tsx` | Root layout — title and metadata |
| `app/page.tsx` | Client component — form, results, loading state |
| `app/actions.ts` | Server action — input validation, AI call, error handling |
| `lib/ai.ts` | AI model config — provider abstraction via env var |
| `.env.local` | Local secrets (gitignored) |
| `.env.example` | Committed env var template |

---

### Task 1: Scaffold Next.js App

**Files:**
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `tailwind.config.ts`, `package.json`, `tsconfig.json`, `next.config.ts` (all scaffolded)

- [ ] **Step 1: Save the assignment README before scaffolding**

The scaffolder will overwrite `README.md`. Save the original:

```bash
cp /Users/jag/Codes/Personal/melo-practice-app/README.md /Users/jag/Codes/Personal/melo-practice-app/docs/ASSIGNMENT.md
```

- [ ] **Step 2: Run the scaffolder**

```bash
cd /Users/jag/Codes/Personal/melo-practice-app
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

When warned about the non-empty directory, choose **Yes** to continue. Accept defaults for all other prompts (including Turbopack if asked).

- [ ] **Step 3: Verify it runs**

```bash
npm run dev
```

Open http://localhost:3000. Expected: Next.js default page loads without errors. Press `Ctrl+C` to stop.

- [ ] **Step 4: Initialize git and commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js app"
```

---

### Task 2: Install AI Dependencies + shadcn/ui Components

**Files:**
- Modify: `package.json`, `components.json`
- Create: `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/card.tsx`

- [ ] **Step 1: Install Vercel AI SDK, Zod, and lucide-react**

```bash
npm install ai @ai-sdk/google zod lucide-react
```

- [ ] **Step 2: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted: choose **Default** style and **Slate** base color. Accept other defaults.

- [ ] **Step 3: Add required components**

```bash
npx shadcn@latest add button input card
```

Expected: `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/card.tsx` created.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: install AI SDK, Zod, shadcn/ui components"
```

---

### Task 3: Environment Variables

**Files:**
- Create: `.env.local`, `.env.example`

- [ ] **Step 1: Verify `.env.local` is gitignored**

```bash
grep "\.env\.local" .gitignore
```

Expected: `.env.local` appears in output. If missing, run: `echo ".env.local" >> .gitignore`

- [ ] **Step 2: Create `.env.local`**

Create the file at `.env.local` with your real Gemini API key from ai.google.dev:

```
GEMINI_API_KEY=your_actual_key_here
AI_MODEL=gemini
```

- [ ] **Step 3: Create `.env.example`**

Create the file at `.env.example`:

```
GEMINI_API_KEY=     # Required — get free key at ai.google.dev
AI_MODEL=gemini     # Optional — defaults to gemini
```

- [ ] **Step 4: Commit only the example file**

```bash
git add .env.example
git commit -m "chore: add env var template"
```

Do NOT `git add .env.local` — it contains your secret key.

---

### Task 4: AI Model Config

**Files:**
- Create: `lib/ai.ts`

- [ ] **Step 1: Create the `lib/` directory and `lib/ai.ts`**

```bash
mkdir -p lib
```

Then create `lib/ai.ts`:

```ts
import { google } from '@ai-sdk/google'

const MODELS = {
  gemini: google('gemini-2.0-flash'),
} as const

export const model = MODELS[(process.env.AI_MODEL ?? 'gemini') as keyof typeof MODELS]
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/ai.ts
git commit -m "feat: add AI model config with provider abstraction"
```

---

### Task 5: Spike the AI Call (Verify Before Building UI)

`generateObject()` is new territory. Verify the Gemini API call returns valid structured data before wiring up the full UI. This catches API key issues early.

**Files:**
- Create: `app/actions.ts` (spike version — will be replaced in Task 6)
- Modify: `app/page.tsx` (temporary spike — will be replaced in Task 7)

- [ ] **Step 1: Create a minimal `app/actions.ts`**

```ts
'use server'

import { generateObject } from 'ai'
import { z } from 'zod'
import { model } from '@/lib/ai'

const schema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      rationale: z.string(),
    })
  ).length(3),
})

export async function generateQuestions(jobTitle: string) {
  const { object } = await generateObject({
    model,
    schema,
    prompt: `Generate 3 interview questions for: ${jobTitle}`,
  })
  return object
}
```

- [ ] **Step 2: Replace `app/page.tsx` with a temporary spike page**

```tsx
import { generateQuestions } from './actions'

export default async function Home() {
  const result = await generateQuestions('Customer Success Manager')
  return <pre style={{ padding: '2rem' }}>{JSON.stringify(result, null, 2)}</pre>
}
```

- [ ] **Step 3: Start dev server and verify output**

```bash
npm run dev
```

Open http://localhost:3000. Expected: Raw JSON printed on screen with 3 objects, each having `question` and `rationale` fields.

If you see an error:
- Check `.env.local` exists and has your real `GEMINI_API_KEY` (not the placeholder)
- Restart the dev server after changing env vars: `Ctrl+C` then `npm run dev`

- [ ] **Step 4: Stop dev server once verified**

Press `Ctrl+C`. Do NOT commit the spike code — the next two tasks replace both files.

---

### Task 6: Server Action — Production Version

**Files:**
- Modify: `app/actions.ts`

- [ ] **Step 1: Replace `app/actions.ts` with the production version**

```ts
'use server'

import { generateObject } from 'ai'
import { z } from 'zod'
import { model } from '@/lib/ai'

const schema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      rationale: z.string(),
    })
  ).length(3),
})

type ActionResult =
  | { questions: { question: string; rationale: string }[] }
  | { error: string }

export async function generateQuestions(jobTitle: string): Promise<ActionResult> {
  const trimmed = jobTitle.trim()
  if (!trimmed) return { error: 'Job title is required' }

  try {
    const { object } = await generateObject({
      model,
      schema,
      prompt: `You are an expert HR interviewer with deep knowledge of hiring across industries.

Generate exactly 3 thoughtful, role-specific interview questions for a candidate applying for the role of: ${trimmed}

Requirements:
- Each question should reveal something meaningful about candidate fit for this specific role
- Mix behavioral and situational questions
- Avoid generic questions that could apply to any job
- For each question, provide a one-sentence rationale explaining what it reveals`,
    })
    return { questions: object.questions }
  } catch {
    return { error: 'Failed to generate questions. Please try again.' }
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/actions.ts
git commit -m "feat: add generateQuestions server action with Zod schema and error handling"
```

---

### Task 7: Page UI

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx` with the full client UI**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { generateQuestions } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Result =
  | { questions: { question: string; rationale: string }[] }
  | { error: string }
  | null

export default function Home() {
  const [jobTitle, setJobTitle] = useState('')
  const [result, setResult] = useState<Result>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!jobTitle.trim()) return

    startTransition(async () => {
      const data = await generateQuestions(jobTitle)
      setResult(data)
    })
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">Interview Question Generator</h1>
      <p className="text-muted-foreground mb-8">
        Enter a job title to get 3 role-specific interview questions.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <Input
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Customer Success Manager"
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending || !jobTitle.trim()}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate'
          )}
        </Button>
      </form>

      {result && 'error' in result && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-destructive">{result.error}</CardContent>
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
                <p className="text-sm text-muted-foreground italic">{q.rationale}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Test the golden path**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
1. Type "Customer Success Manager" → button enabled
2. Click Generate → button shows spinner + "Generating..." and is disabled
3. 3 cards appear, each with a bold question and italic rationale below it
4. Clear the input → button is disabled
5. Type a single space → button is disabled (`.trim()` blocks it)

- [ ] **Step 4: Test the error state**

In `.env.local`, temporarily change `GEMINI_API_KEY` to `invalid`. Restart the dev server. Submit a job title.

Expected: A red-bordered error card appears with "Failed to generate questions. Please try again."

Restore your real API key and restart the dev server.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add form UI with loading spinner, results cards, and error display"
```

---

### Task 8: Update Layout Metadata

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update the `metadata` export in `app/layout.tsx`**

Find the existing `metadata` constant and replace it:

```ts
export const metadata: Metadata = {
  title: 'Interview Question Generator',
  description: 'Generate role-specific interview questions powered by AI',
}
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "chore: update page metadata"
```

---

### Task 9: Push to GitHub and Deploy to Vercel

- [ ] **Step 1: Create a public GitHub repository**

Go to github.com → New repository → name it `melo-practice-app` → Public → do NOT initialize with README → Create.

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin https://github.com/<your-username>/melo-practice-app.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Deploy to Vercel**

1. Go to vercel.com → Add New → Project
2. Import the `melo-practice-app` repository
3. Under **Environment Variables**, add: `GEMINI_API_KEY` = your actual key from ai.google.dev
4. Click **Deploy**

- [ ] **Step 4: Verify the live deployment**

Open the Vercel URL. Test:
1. Type "Customer Success Manager" → Generate
2. 3 questions appear with rationales

- [ ] **Step 5: Save the live URL**

Copy the Vercel URL. You need it for:
- The email submission body
- The opening of the Loom recording

---

### Task 10: Loom Prep Checklist

Record the Loom only after the live URL is confirmed working.

**Required talking points (from the assignment):**

- [ ] Introduce yourself
- [ ] Show the live app working — use "Customer Success Manager" as the demo input
- [ ] Walk through `actions.ts`: explain `generateObject()`, the Zod schema, and the prompt
- [ ] Walk through `lib/ai.ts`: explain why the model is a config value, not a code dependency
- [ ] Answer: What provider and model, and why? → Gemini 2.0 Flash — free tier, fast, native structured output support
- [ ] Answer: One thing you'd improve with more time → streaming (`streamObject` instead of `generateObject`) so questions appear word-by-word instead of all at once
- [ ] Answer: Your philosophy around building in general
- [ ] Answer: How you collaborate with others when building
- [ ] Answer: How you figure things out when stuck

**Opening line to open with:**

> "I built this not just because it was assigned, but because I've been an interviewer myself — and this is a small version of the problem HRTech companies are actually trying to solve: how do you make great interviews consistent, not dependent on who's in the room that day."
