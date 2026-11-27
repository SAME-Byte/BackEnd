import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crearEnigmaI, crearEnigmaDesdeClave, cifrarConEnigma, ALFABETO_IMPRIMIBLE } from '../src/utils/enigma.js'

const CLAVE = 'clave-de-prueba-para-enigma-1234'

test('reproduce la Enigma I histórica (I-II-III, reflector B, AAA): AAAAA -> BDZGO', () => {
  assert.equal(crearEnigmaI().cifrar('AAAAA'), 'BDZGO')
})

test('Enigma I: doble paso del rotor medio (posiciones ADU)', () => {
  // Con ADU el rotor medio llega a su muesca (E) y vuelve a avanzar junto al izquierdo
  const m = crearEnigmaI({ posiciones: 'ADU' })
  m.cifrar('AAAA')
  assert.deepEqual(m.rotores.map((r) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[r.posicion]).join(''), 'BFY')
})

test('Enigma I con anillos y clavijero descifra su propio mensaje', () => {
  const opciones = { rotores: ['IV', 'II', 'V'], posiciones: 'GLY', anillos: 'BUL', clavijero: ['AT', 'BL', 'DF', 'GJ', 'HM'] }
  const texto = 'ATAQUEALAMANECERENELPUENTE'
  const cifrado = crearEnigmaI(opciones).cifrar(texto)
  assert.notEqual(cifrado, texto)
  assert.equal(crearEnigmaI(opciones).cifrar(cifrado), texto)
})

test('ninguna letra se cifra como sí misma', () => {
  const m = crearEnigmaDesdeClave(CLAVE)
  const texto = ALFABETO_IMPRIMIBLE.repeat(20)
  const cifrado = m.cifrar(texto)
  for (let i = 0; i < texto.length; i++) assert.notEqual(cifrado[i], texto[i])
})

test('es recíproca y determinista con la misma clave', () => {
  const m = crearEnigmaDesdeClave(CLAVE)
  const pw = 'Tr0mb0n#Azul_2026'
  const c = m.cifrar(pw)
  assert.equal(m.cifrar(pw), c)
  assert.equal(crearEnigmaDesdeClave(CLAVE).cifrar(c), pw)
})

test('la misma letra repetida da caracteres distintos (polialfabética)', () => {
  const c = crearEnigmaDesdeClave(CLAVE).cifrar('a'.repeat(30))
  assert.ok(new Set(c).size > 10)
})

test('otra clave produce otro resultado', () => {
  const pw = 'Tr0mb0n#Azul_2026'
  assert.notEqual(crearEnigmaDesdeClave(CLAVE).cifrar(pw), crearEnigmaDesdeClave(CLAVE + 'x').cifrar(pw))
})

test('caracteres fuera del alfabeto pasan sin cambio', () => {
  const c = crearEnigmaDesdeClave(CLAVE).cifrar('ab ñ')
  assert.equal(c[2], ' ')
  assert.equal(c[3], 'ñ')
})

test('rechaza claves cortas', () => {
  assert.throws(() => crearEnigmaDesdeClave('corta'))
})

test('cifrarConEnigma usa ENIGMA_CLAVE', () => {
  process.env.ENIGMA_CLAVE = CLAVE
  assert.equal(cifrarConEnigma('Hola#123'), crearEnigmaDesdeClave(CLAVE).cifrar('Hola#123'))
})
