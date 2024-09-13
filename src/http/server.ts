import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createGoalRoute } from './routes/create-goal'
import { createCompletionRoute } from './routes/create-completion'
import { getPendingGoalsRoute } from './routes/get-pending-goals'
import { getWeekSummaryRoute } from './routes/get-week-summary'
import fastifyCors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import path from 'node:path'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyStatic, {
  root: path.join(__dirname, '../documentation'),
  prefix: '/documentation',
})

app.register(require('@scalar/fastify-api-reference'), {
  routePrefix: '/',
  configuration: {
    title: 'Documentation GoalsKeeper',
    spec: {
      url: '/documentation/swagger.json',
    },
    theme: 'Default',
  },
  metaData: {
    title: 'Documentation GoalsKeeper'
  }
})

app.register(createGoalRoute)
app.register(createCompletionRoute)
app.register(getPendingGoalsRoute)
app.register(getWeekSummaryRoute)

const port = 3333

app
  .listen({
    port: port,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log(`Running on ${port}!`)
  })
