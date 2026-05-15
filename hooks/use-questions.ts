'use client'

import { useState, useCallback } from 'react'
import { parsePartialJson } from 'ai'
import type { Question } from '@/lib/schema'

interface QuestionsObject {
  questions?: Array<Partial<Question> | undefined>
}

export function useQuestions() {
  const [object, setObject] = useState<QuestionsObject | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submit = useCallback(async (jobTitle: string) => {
    setIsLoading(true)
    setError(null)
    setObject(undefined)

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle }),
      })

      if (!res.ok) throw new Error('Failed to generate questions')

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          accumulated += decoder.decode()
          break
        }
        accumulated += decoder.decode(value, { stream: true })
        const { state, value: parsed } = await parsePartialJson(accumulated)
        if (state === 'successful-parse' || state === 'repaired-parse') {
          setObject(parsed as QuestionsObject)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { object, submit, isLoading, error }
}
