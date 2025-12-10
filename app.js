import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import hpp from 'hpp'
import morgan from 'morgan'

import usersRoutes from './routes/users.routes.js'
import adminUsersRoutes from './routes/admin.users.routes.js'
import beneficiariesRoutes from './routes/beneficiaries.routes.js'
import feesRoutes from './routes/fees.routes.js'
import maintenanceRoutes from './routes/maintenance.routes.js'
import medRoutes from './routes/med.routes.js'
import operatorRoutes from './routes/operator.routes.js'
import providerRoutes from './routes/provider.routes.js'

import { notFoundHandler, globalErrorHandler } from './core/errorHandler.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
app.use(helmet())
app.use(hpp())


app.use('/api', usersRoutes)
app.use('/api', adminUsersRoutes)
app.use('/api', beneficiariesRoutes)
app.use('/api', feesRoutes)
app.use('/api', maintenanceRoutes)
app.use('/api', medRoutes)
app.use('/api', operatorRoutes)
app.use('/api', providerRoutes)


app.use(notFoundHandler)
app.use(globalErrorHandler)

export default app
