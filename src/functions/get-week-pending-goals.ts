import { db } from "@/db"
import { goalCompletions, goals } from "@/db/schema"
import dayjs from "dayjs"
import { count, lte, gte, and, eq, sql } from 'drizzle-orm'

export async function getWeekPendingGoals() {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db.select({
      id: goals.id,
      title: goals.title,
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      createAt: goals.createdAt,
    })
    .from(goals)
    .where(lte(goals.createdAt,lastDayOfWeek))
  )

  const goalsCompletionCounts = db.$with('goal_completion_counts').as(
    db.select({
      goalId: goalCompletions.goalId,
      completionCount: count(goalCompletions.id).as('completion_counts')
    })
    .from(goalCompletions)
    .where(and(
      gte(goalCompletions.createdAt, firstDayOfWeek),
      lte(goalCompletions.createdAt, lastDayOfWeek),
    ))
    .groupBy(goalCompletions.goalId)
  )

  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalsCompletionCounts)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeeklyFrequency:  goalsCreatedUpToWeek.desiredWeeklyFrequency,
      completionCount: sql/*sql*/`
        COALESCE(${goalsCompletionCounts.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(goalsCompletionCounts,
    eq(goalsCompletionCounts.goalId, goalsCreatedUpToWeek.id)
    )

  return { pendingGoals }
}