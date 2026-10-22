import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'

// Datos públicos del usuario (nunca se manda la contraseña)
const aUsuario = (fila) => ({ id: fila.id, nombre: fila.name, email: fila.email, rol: fila.role })

// POST /api/auth/login  { email, contrasena }  ->  { token, usuario }
export async function login(req, res) {
  const { email, contrasena } = req.body

  const { rows } = await pool.query(
    'SELECT id, name, email, contrasena, role FROM Usuarios WHERE LOWER(email) = $1',
    [email]
  )
  const fila = rows[0]

  // Mismo mensaje si no existe el correo o si la contraseña no coincide:
  // así no se revela qué correos están registrados
  const valida = fila && (await bcrypt.compare(contrasena, fila.contrasena))
  if (!valida) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' })
  }

  const usuario = aUsuario(fila)

  // El token lleva quién es (sub), su rol y su nombre. Va FIRMADO, no cifrado.
  const token = jwt.sign(
    { sub: String(usuario.id), rol: usuario.rol, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  )

  res.json({ token, usuario })
}

// POST /api/auth/registro  { nombre, email, contrasena }  ->  201 { usuario }
// Siempre crea usuarios con rol "user"; los admin solo se crean desde la base
export async function registro(req, res) {
  const { nombre, email, contrasena } = req.body

  const existe = await pool.query('SELECT 1 FROM Usuarios WHERE LOWER(email) = $1', [email])
  if (existe.rowCount > 0) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' })
  }

  const hash = await bcrypt.hash(contrasena, 10)
  const { rows } = await pool.query(
    `INSERT INTO Usuarios (name, email, contrasena, role)
     VALUES ($1, $2, $3, 'user')
     RETURNING id, name, email, role`,
    [nombre, email, hash]
  )

  res.status(201).json({ usuario: aUsuario(rows[0]) })
}

// GET /api/auth/perfil  (con token)  ->  { usuario }
// El FrontEnd lo usa para comprobar que el token guardado sigue siendo válido
export async function perfil(req, res) {
  const { rows } = await pool.query('SELECT id, name, email, role FROM Usuarios WHERE id = $1', [req.usuario.id])
  if (!rows[0]) return res.status(401).json({ error: 'Sesión no válida.' })
  res.json({ usuario: aUsuario(rows[0]) })
}
