// Protección de rutas con JWT
import jwt from 'jsonwebtoken'

// 1) ¿Viene un token válido? Lee "Authorization: Bearer <token>"
export function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ')

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Necesitas iniciar sesión.' })
  }

  try {
    // verify revisa la firma (con JWT_SECRET) y la fecha de expiración
    const datos = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = { id: Number(datos.sub), rol: datos.rol, nombre: datos.nombre }
    next()
  } catch (error) {
    const expirado = error.name === 'TokenExpiredError'
    return res.status(401).json({
      error: expirado ? 'Tu sesión expiró. Inicia sesión de nuevo.' : 'Sesión no válida.',
    })
  }
}

// 2) ¿El usuario del token es administrador? (se usa después de verificarToken)
export function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes permiso para realizar esta acción.' })
  }
  next()
}
