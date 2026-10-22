// Respuestas de error uniformes: siempre { error: 'mensaje' }

export function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` })
}

// Express reconoce este middleware como manejador de errores porque recibe 4 parámetros
// eslint-disable-next-line no-unused-vars
export function manejarErrores(error, req, res, next) {
  // Errores de PostgreSQL más comunes
  // 23505 = valor repetido en una columna UNIQUE
  if (error.code === '23505') {
    const mensaje = error.constraint === 'piezas_sku_key'
      ? 'Ya existe una pieza con ese SKU.'
      : 'Ya existe un registro con ese valor.'
    return res.status(409).json({ error: mensaje })
  }
  // 23503 = llave foránea que apunta a algo que no existe
  if (error.code === '23503') {
    return res.status(400).json({ error: 'La categoría, marca o registro relacionado no existe.' })
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido.' })
  }

  console.error(error)
  res.status(500).json({ error: 'Ocurrió un error en el servidor.' })
}
