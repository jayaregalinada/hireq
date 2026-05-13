import { readFileSync } from 'fs'
import { join } from 'path'
import { streamObject } from 'ai'
import { model } from '@/lib/ai'
import { questionsSchema } from '@/lib/schema'

const promptTemplate = readFileSync(
  join(process.cwd(), 'prompts/questions.md'),
  'utf-8'
)

function buildPrompt(jobTitle: string) {
  return promptTemplate.replace('{jobTitle}', jobTitle)
}

export async function POST(req: Request) {
  const { jobTitle } = await req.json()
  const trimmed = (jobTitle ?? '').trim()

  if (!trimmed) {
    return new Response('Job title is required', { status: 400 })
  }

  const result = streamObject({
    model,
    schema: questionsSchema,
    prompt: buildPrompt(trimmed),
  })

  return result.toTextStreamResponse()
}
