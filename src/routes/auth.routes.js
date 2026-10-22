import { Router } from 'express'
import { login, registro, perfil } from '../controllers/auth.controller.js'
import { verificarToken } from '../middlewares/auth.js'
import { validar } from '../middlewares/validar.js'
import { esquemaLogin, esquemaRegistro } from '../schemas/auth.schema.js'
import { manejar } from '../utils/manejar.js'

const router = Router()

router.post('/login', validar(esquemaLogin), manejar(login))
router.post('/registro', validar(esquemaRegistro), manejar(registro))
router.get('/perfil', verificarToken, manejar(perfil))

export default router
