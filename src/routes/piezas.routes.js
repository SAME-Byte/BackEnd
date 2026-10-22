import { Router } from 'express'
import { listar, obtener, crear, actualizar, eliminar } from '../controllers/piezas.controller.js'
import { verificarToken, soloAdmin } from '../middlewares/auth.js'
import { validar } from '../middlewares/validar.js'
import { esquemaPieza } from '../schemas/pieza.schema.js'
import { manejar } from '../utils/manejar.js'

const router = Router()

// Públicas: cualquiera puede ver las piezas
router.get('/', manejar(listar))
router.get('/:id', manejar(obtener))

// Solo admin: primero se verifica el token, luego el rol, luego los datos
router.post('/', verificarToken, soloAdmin, validar(esquemaPieza), manejar(crear))
router.put('/:id', verificarToken, soloAdmin, validar(esquemaPieza), manejar(actualizar))
router.delete('/:id', verificarToken, soloAdmin, manejar(eliminar))

export default router
