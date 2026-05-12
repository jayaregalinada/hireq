import { google } from '@ai-sdk/google'

const MODELS = {
  gemini: google('gemini-2.0-flash'),
} as const

export const model = MODELS[(process.env.AI_MODEL ?? 'gemini') as keyof typeof MODELS]
