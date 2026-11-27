// Reglas de los datos que llegan a /api/auth
import { z } from 'zod'
import { validarContrasena } from '../utils/validadorContrasena.js'

const email = z
  .string({ required_error: 'El correo es obligatorio.' })
  .trim()
  .toLowerCase()
  .email('El correo no es válido.')
  .max(150, 'El correo es demasiado largo.')

const nombre = z.string({ required_error: 'El nombre es obligatorio.' }).trim().min(3, 'Escribe tu nombre completo.').max(100)

const contrasena = z.string({ required_error: 'La contraseña es obligatoria.' })

// Agrega cada regla incumplida del validador como un error del campo "contrasena"
const revisarContrasena = (datos, ctx) => {
  const { errores } = validarContrasena(datos.contrasena, { nombre: datos.nombre, email: datos.email })
  for (const { mensaje } of errores) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['contrasena'], message: mensaje })
  }
}

export const esquemaLogin = z.object({
  email,
  contrasena: contrasena.min(1, 'La contraseña es obligatoria.'),
})

export const esquemaRegistro = z.object({ nombre, email, contrasena }).superRefine(revisarContrasena)

// Para que el FrontEnd muestre la fortaleza mientras se escribe (nombre y correo son opcionales)
export const esquemaRevisarContrasena = z.object({
  contrasena,
  nombre: z.string().trim().max(100).optional(),
  email: z.string().trim().toLowerCase().max(150).optional(),
})
