import { Router } from 'express'
import { listarCategorias, listarMarcas, listarFabricantes } from '../controllers/catalogos.controller.js'
import { manejar } from '../utils/manejar.js'

const router = Router()

router.get('/categorias', manejar(listarCategorias))
router.get('/marcas', manejar(listarMarcas))
router.get('/fabricantes', manejar(listarFabricantes))

export default router
