import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import hpp from 'hpp'
import morgan from 'morgan'

import usersRoutes from './routes/users.routes.js'

import { notFoundHandler, globalErrorHandler } from './core/errorHandler.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
app.use(helmet())
app.use(hpp())

app.use('/api', usersRoutes)

app.use(notFoundHandler)
app.use(globalErrorHandler)

export default app
