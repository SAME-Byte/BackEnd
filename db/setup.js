// Crea las tablas y carga los datos iniciales en la base configurada en .env
// Uso: npm run db:setup
import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import pg from 'pg'
import { hashearContrasena } from '../src/utils/contrasenas.js'

const archivos = ['schema.sql', 'seed.sql']

// Contraseñas de los admins del seed (se cifran con la Enigma de ENIGMA_CLAVE + bcrypt)
const admins = [
  { email: 'admin@refaccionaria.com', contrasena: 'Admin123!' },
  { email: 'soporte@refaccionaria.com', contrasena: 'Soporte123!' },
]

const cliente = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

try {
  await cliente.connect()
  console.log(`Conectado a "${process.env.DB_NAME}" en ${process.env.DB_HOST}:${process.env.DB_PORT}`)

  for (const nombre of archivos) {
    const sql = await readFile(new URL(`./${nombre}`, import.meta.url), 'utf8')
    await cliente.query(sql)
    console.log(`  ✔ ${nombre} ejecutado`)
  }

  for (const { email, contrasena } of admins) {
    const hash = await hashearContrasena(contrasena)
    await cliente.query('UPDATE Usuarios SET Contrasena = $1 WHERE LOWER(Email) = $2', [hash, email])
  }
  console.log('  ✔ contraseñas de administradores cifradas')

  console.log('Base de datos lista.')
} catch (error) {
  console.error('  ✖ No se pudo preparar la base de datos:', error.message)
  process.exitCode = 1
} finally {
  await cliente.end()
}
