'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useQuestions } from '@/hooks/use-questions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const [jobTitle, setJobTitle] = useState('')
  const { object, submit, isLoading, error } = useQuestions()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!jobTitle.trim()) return
    submit(jobTitle)
  }

  return (
    <main className="w-full max-w-2xl mx-auto px-4 py-16">
      <div className="mb-10">
        <Image
          src="/logo.jpg"
          alt="HireQ"
          width={160}
          height={54}
          className="mb-4"
          priority
        />
        <p className="text-muted-foreground">
          Enter a job title to generate 3 role-specific interview questions.
        </p>
      </div>

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
              <Card key={i} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wide">
                    Question {i + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium text-foreground">{q.question}</p>
                  {q.rationale && (
                    <p className="text-sm text-muted-foreground">{q.rationale}</p>
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
