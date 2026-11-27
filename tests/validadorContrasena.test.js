import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validarContrasena } from '../src/utils/validadorContrasena.js'

const reglas = (pw, ctx) => validarContrasena(pw, ctx).errores.map((e) => e.regla)

test('acepta una contraseña fuerte', () => {
  const r = validarContrasena('Tr0mb0n#Azul_2026')
  assert.equal(r.valida, true, JSON.stringify(r.errores))
  assert.equal(r.nivel, 'muy fuerte')
})

test('espacio de claves: longitud y tipos de caracteres', () => {
  assert.ok(reglas('Ab1!').includes('espacio'))
  assert.ok(reglas('tromboneazul').includes('espacio'))
  assert.ok(reglas('A'.repeat(30) + 'b1!x'.repeat(10)).includes('espacio'))
})

test('cillies: repeticiones y secuencias', () => {
  assert.ok(reglas('Gato#aaa9Lr').includes('cillies'))
  assert.ok(reglas('Gato#1234Lr').includes('cillies'))
  assert.ok(reglas('Gato#qwerLr9').includes('cillies'))
  assert.ok(reglas('Gato#zyxwLr9').includes('cillies')) // al revés
})

test('cribs: palabras comunes, también con leetspeak', () => {
  assert.ok(reglas('P4ssw0rd#Lx').includes('cribs'))
  assert.ok(reglas('MiContraseña#9').includes('cribs'))
})

test('cribs: nombre o correo del usuario', () => {
  const ctx = { nombre: 'Ernesto Saldívar', email: 'neto.mx@correo.com' }
  assert.ok(reglas('Saldivar#9Tq', ctx).includes('cribs'))
  assert.ok(reglas('xN3to#9Tqz', ctx).includes('cribs'))
  assert.ok(!reglas('Tr0mb0n#Azul_2026', ctx).includes('cribs'))
})

test('duplicado: bloque repetido (como la clave de mensaje doble)', () => {
  assert.ok(reglas('Xk9#Xk9#').includes('duplicado'))
})

test('reflejo: palíndromo', () => {
  assert.ok(reglas('Xk9#t#9kX').includes('reflejo'))
})

test('variedad: pocos caracteres distintos', () => {
  assert.ok(reglas('Ab1!Ab1!b').includes('variedad'))
})

test('no truena con valores que no son texto', () => {
  assert.equal(validarContrasena(undefined).valida, false)
})
