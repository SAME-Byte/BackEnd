// Junta todas las rutas bajo /api
import { Router } from 'express'
import authRoutes from './auth.routes.js'
import piezasRoutes from './piezas.routes.js'
import catalogosRoutes from './catalogos.routes.js'

const router = Router()

router.get('/salud', (req, res) => res.json({ ok: true })) // para comprobar que la API responde

router.use('/auth', authRoutes)
router.use('/piezas', piezasRoutes)
router.use('/', catalogosRoutes) // /api/categorias, /api/marcas, /api/fabricantes

export default router
