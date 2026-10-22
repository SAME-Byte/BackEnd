// Configuración de Express: middlewares globales, rutas y manejo de errores
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rutas from './routes/index.js'
import { rutaNoEncontrada, manejarErrores } from './middlewares/errores.js'

const app = express()

app.use(helmet())                                                   // encabezados de seguridad
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' })) // solo el FrontEnd puede llamar
app.use(express.json())                                             // leer cuerpos JSON
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))         // registrar cada petición en consola

app.use('/api', rutas)

app.use(rutaNoEncontrada)
app.use(manejarErrores)

export default app
