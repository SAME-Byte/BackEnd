// Reglas de los datos que llegan a /api/auth
import { z } from 'zod'

const email = z
  .string({ required_error: 'El correo es obligatorio.' })
  .trim()
  .toLowerCase()
  .email('El correo no es válido.')
  .max(150, 'El correo es demasiado largo.')

export const esquemaLogin = z.object({
  email,
  contrasena: z.string({ required_error: 'La contraseña es obligatoria.' }).min(1, 'La contraseña es obligatoria.'),
})

export const esquemaRegistro = z.object({
  nombre: z.string({ required_error: 'El nombre es obligatorio.' }).trim().min(3, 'Escribe tu nombre completo.').max(100),
  email,
  contrasena: z
    .string({ required_error: 'La contraseña es obligatoria.' })
    .min(8, 'Usa al menos 8 caracteres.')
    .regex(/\d/, 'Incluye al menos un número.'),
})
