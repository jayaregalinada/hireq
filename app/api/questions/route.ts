import { streamObject } from 'ai'
import { model } from '@/lib/ai'
import { questionsSchema } from '@/lib/schema'

const PROMPT = (jobTitle: string) =>
  `You are an expert HR interviewer with deep knowledge of hiring across industries.

Generate exactly 3 thoughtful, role-specific interview questions for a candidate applying for the role of: ${jobTitle}

Requirements:
- Each question should reveal something meaningful about candidate fit for this specific role
- Mix behavioral and situational questions
- Avoid generic questions that could apply to any job
- For each question, provide a one-sentence rationale explaining what it reveals`

export async function POST(req: Request) {
  const { jobTitle } = await req.json()
  const trimmed = (jobTitle ?? '').trim()

  if (!trimmed) {
    return new Response('Job title is required', { status: 400 })
  }

  const result = streamObject({
    model,
    schema: questionsSchema,
    prompt: PROMPT(trimmed),
  })

  return result.toTextStreamResponse()
}
