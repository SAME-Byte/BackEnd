// Punto de entrada: carga las variables de .env y enciende el servidor
import 'dotenv/config'
import app from './app.js'
import { pool } from './config/db.js'

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env')
  process.exit(1)
}

const PORT = Number(process.env.PORT) || 3000

// Probar la conexión a la base antes de aceptar peticiones
try {
  await pool.query('SELECT 1')
  console.log(`Conectado a la base "${process.env.DB_NAME}"`)
} catch (error) {
  console.error('No se pudo conectar a PostgreSQL:', error.message)
  process.exit(1)
}

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}/api`)
})
