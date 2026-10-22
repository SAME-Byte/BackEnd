// Valida req.body con un esquema de Zod; si falla responde 400 con el detalle por campo
export const validar = (esquema) => (req, res, next) => {
  const resultado = esquema.safeParse(req.body)

  if (!resultado.success) {
    return res.status(400).json({
      error: 'Revisa los datos enviados.',
      detalles: resultado.error.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message })),
    })
  }

  req.body = resultado.data // datos ya limpios y con el tipo correcto
  next()
}
