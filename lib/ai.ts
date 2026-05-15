import { google } from '@ai-sdk/google'
import { groq } from '@ai-sdk/groq'

const MODELS = {
  gemini: google('gemini-2.0-flash'),
  groq: groq('llama-3.3-70b-versatile'),
} as const

const key = (process.env.AI_MODEL ?? 'groq') as string

if (!(key in MODELS)) {
  throw new Error(`Invalid AI_MODEL "${key}". Must be one of: ${Object.keys(MODELS).join(', ')}`)
}

if (key === 'groq' && !process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is required when AI_MODEL=groq')
}

if (key === 'gemini' && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is required when AI_MODEL=gemini')
}

export const model = MODELS[key as keyof typeof MODELS]
