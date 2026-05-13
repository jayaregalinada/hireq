import { z } from 'zod'

export const questionsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      rationale: z.string(),
    })
  ).length(3),
})

export type Question = z.infer<typeof questionsSchema>['questions'][number]
