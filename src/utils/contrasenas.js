// Guardar y comprobar contraseñas: bcrypt( Enigma(contraseña) )
//
// La contraseña pasa por la máquina Enigma del servidor (configurada con ENIGMA_CLAVE)
// antes de bcrypt. Funciona como una "pimienta": si alguien roba la base de datos sin
// el .env, no puede probar contraseñas contra los hashes porque no conoce los rotores.
// bcrypt sigue siendo quien da la seguridad principal (sal + costo lento).
import bcrypt from 'bcryptjs'
import { cifrarConEnigma } from './enigma.js'

export const hashearContrasena = (contrasena) => bcrypt.hash(cifrarConEnigma(contrasena), 10)

export const compararContrasena = (contrasena, hash) => bcrypt.compare(cifrarConEnigma(contrasena), hash)
