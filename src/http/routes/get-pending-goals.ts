import { getWeekPendingGoals } from "@/functions/get-week-pending-goals"
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod"

export const getPendingGoalsRoute: FastifyPluginAsyncZod = async app => {
  app.get('/pending-goals', async () => {
    const { pendingGoals } = await getWeekPendingGoals()

    return { pendingGoals }
  })
}