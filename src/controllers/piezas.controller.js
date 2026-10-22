import { pool } from '../config/db.js'

// Consulta base: la pieza + el nombre de su categoría + sus marcas compatibles en un arreglo
const SELECT_PIEZAS = `
  SELECT p.*, c.name AS categoria_nombre,
         COALESCE(
           json_agg(json_build_object('id', m.id, 'nombre', m.name, 'logoUrl', m.logo_url) ORDER BY m.name)
             FILTER (WHERE m.id IS NOT NULL),
           '[]'
         ) AS marcas
  FROM Piezas p
  JOIN Categorias c ON c.id = p.category_id
  LEFT JOIN Parte_Compatible pc ON pc.parte_id = p.id
  LEFT JOIN Marcas m ON m.id = pc.marca_id
`

// Traduce una fila de la base (nombres de columnas) al JSON que usa el FrontEnd
const aPieza = (f) => ({
  id: f.id,
  sku: f.sku,
  nombre: f.name,
  descripcion: f.description,
  fabricante: f.manofaturadora,
  precio: Number(f.precio), // NUMERIC llega como texto desde PostgreSQL
  stock: f.stock,
  imagenUrl: f.image_url,
  destacada: f.is_featured,
  categoria: { id: f.category_id, nombre: f.categoria_nombre },
  marcasCompatibles: f.marcas,
  creadaEn: f.created_at,
  actualizadaEn: f.updated_at,
})

async function buscarPorId(id, cliente = pool) {
  const { rows } = await cliente.query(`${SELECT_PIEZAS} WHERE p.id = $1 GROUP BY p.id, c.name`, [id])
  return rows[0] ? aPieza(rows[0]) : null
}

const idValido = (valor) => {
  const id = Number(valor)
  return Number.isInteger(id) && id > 0 ? id : null
}

// Reemplaza las marcas compatibles de una pieza (dentro de la misma transacción)
async function guardarCompatibles(cliente, piezaId, marcas) {
  await cliente.query('DELETE FROM Parte_Compatible WHERE parte_id = $1', [piezaId])
  if (marcas.length > 0) {
    await cliente.query(
      'INSERT INTO Parte_Compatible (parte_id, marca_id) SELECT $1, UNNEST($2::int[]) ON CONFLICT DO NOTHING',
      [piezaId, marcas]
    )
  }
}

// GET /api/piezas            -> todas las piezas
// GET /api/piezas?destacadas=true -> solo las destacadas
export async function listar(req, res) {
  const soloDestacadas = req.query.destacadas === 'true'
  const { rows } = await pool.query(
    `${SELECT_PIEZAS} ${soloDestacadas ? 'WHERE p.is_featured = TRUE' : ''}
     GROUP BY p.id, c.name
     ORDER BY p.created_at DESC, p.id DESC`
  )
  res.json(rows.map(aPieza))
}

// GET /api/piezas/:id
export async function obtener(req, res) {
  const id = idValido(req.params.id)
  const pieza = id && (await buscarPorId(id))
  if (!pieza) return res.status(404).json({ error: 'La pieza no existe.' })
  res.json(pieza)
}

// POST /api/piezas  (solo admin)
export async function crear(req, res) {
  const d = req.body
  const cliente = await pool.connect()

  try {
    await cliente.query('BEGIN') // transacción: o se guarda todo, o nada
    const { rows } = await cliente.query(
      `INSERT INTO Piezas (sku, name, description, Manofaturadora, Precio, Stock, image_url, is_featured, category_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [d.sku, d.nombre, d.descripcion, d.fabricante, d.precio, d.stock, d.imagenUrl, d.destacada, d.categoriaId, req.usuario.id]
    )
    await guardarCompatibles(cliente, rows[0].id, d.marcasCompatibles)
    await cliente.query('COMMIT')

    res.status(201).json(await buscarPorId(rows[0].id))
  } catch (error) {
    await cliente.query('ROLLBACK')
    throw error
  } finally {
    cliente.release()
  }
}

// PUT /api/piezas/:id  (solo admin)
export async function actualizar(req, res) {
  const id = idValido(req.params.id)
  if (!id) return res.status(404).json({ error: 'La pieza no existe.' })

  const d = req.body
  const cliente = await pool.connect()

  try {
    await cliente.query('BEGIN')
    const { rowCount } = await cliente.query(
      `UPDATE Piezas
       SET sku = $1, name = $2, description = $3, Manofaturadora = $4, Precio = $5, Stock = $6,
           image_url = $7, is_featured = $8, category_id = $9, updated_at = NOW()
       WHERE id = $10`,
      [d.sku, d.nombre, d.descripcion, d.fabricante, d.precio, d.stock, d.imagenUrl, d.destacada, d.categoriaId, id]
    )

    if (rowCount === 0) {
      await cliente.query('ROLLBACK')
      return res.status(404).json({ error: 'La pieza no existe.' })
    }

    await guardarCompatibles(cliente, id, d.marcasCompatibles)
    await cliente.query('COMMIT')

    res.json(await buscarPorId(id))
  } catch (error) {
    await cliente.query('ROLLBACK')
    throw error
  } finally {
    cliente.release()
  }
}

// DELETE /api/piezas/:id  (solo admin) -> 204 sin contenido
export async function eliminar(req, res) {
  const id = idValido(req.params.id)
  const { rowCount } = id ? await pool.query('DELETE FROM Piezas WHERE id = $1', [id]) : { rowCount: 0 }
  if (rowCount === 0) return res.status(404).json({ error: 'La pieza no existe.' })
  res.status(204).end()
}
