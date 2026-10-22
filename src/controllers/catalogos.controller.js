import { pool } from '../config/db.js'

// GET /api/categorias -> lista para el formulario del admin y los filtros
export async function listarCategorias(req, res) {
  const { rows } = await pool.query(
    'SELECT id, name AS nombre, description AS descripcion FROM Categorias ORDER BY name'
  )
  res.json(rows)
}

// GET /api/marcas -> marcas de autos (para "Marcas compatibles")
export async function listarMarcas(req, res) {
  const { rows } = await pool.query(
    'SELECT id, name AS nombre, pais, logo_url AS "logoUrl" FROM Marcas ORDER BY name'
  )
  res.json(rows)
}

// GET /api/fabricantes -> fabricantes distintos que ya existen en las piezas
// (el formulario del admin los sugiere para no escribir el mismo de varias formas)
export async function listarFabricantes(req, res) {
  const { rows } = await pool.query(
    'SELECT DISTINCT Manofaturadora AS nombre FROM Piezas ORDER BY Manofaturadora'
  )
  res.json(rows.map((f) => f.nombre))
}
