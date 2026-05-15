import { google } from '@ai-sdk/google'
import { groq } from '@ai-sdk/groq'

const MODELS = {
  gemini: google('gemini-2.0-flash'),
  groq: groq('llama-3.3-70b-versatile'),
} as const

export const model = MODELS[(process.env.AI_MODEL ?? 'groq') as keyof typeof MODELS]
