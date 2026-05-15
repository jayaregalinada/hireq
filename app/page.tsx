'use client'

import { parsePartialJson } from 'ai'
import { useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { type Question } from '@/lib/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type PartialQuestion = Partial<Question> | undefined

interface PartialObject {
  questions?: PartialQuestion[]
}

export default function Home() {
  const [jobTitle, setJobTitle] = useState('')
  const [object, setObject] = useState<PartialObject | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submit = useCallback(async (payload: { jobTitle: string }) => {
    setIsLoading(true)
    setError(null)
    setObject(null)

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        const parsed = await parsePartialJson(accumulated)
        if (
          parsed.state === 'successful-parse' ||
          parsed.state === 'repaired-parse'
        ) {
          setObject(parsed.value as PartialObject)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!jobTitle.trim()) return
    submit({ jobTitle })
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
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !jobTitle.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate'
          )}
        </Button>
      </form>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-destructive">
            Failed to generate questions. Please try again.
          </CardContent>
        </Card>
      )}

      {object?.questions && (
        <div className="space-y-4">
          {object.questions.map((q, i) =>
            q ? (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-base">Question {i + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">{q.question}</p>
                  {q.rationale && (
                    <p className="text-sm text-muted-foreground italic">{q.rationale}</p>
                  )}
                </CardContent>
              </Card>
            ) : null
          )}
        </div>
      )}
    </main>
  )
}
