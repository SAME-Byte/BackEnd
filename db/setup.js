// Crea las tablas y carga los datos iniciales en la base configurada en .env
// Uso: npm run db:setup
import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import pg from 'pg'

const archivos = ['schema.sql', 'seed.sql']

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

  console.log('Base de datos lista.')
} catch (error) {
  console.error('  ✖ No se pudo preparar la base de datos:', error.message)
  process.exitCode = 1
} finally {
  await cliente.end()
}
