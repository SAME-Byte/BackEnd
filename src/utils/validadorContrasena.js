// Validador de fortaleza de contraseñas.
//
// Cada regla corresponde a un error de los operadores de Enigma que permitió a
// los criptoanalistas (Rejewski en Polonia, Turing y Bletchley Park después)
// romperla. La máquina era fuerte; las claves que elegían las personas, no.
//
//   espacio      La fuerza de Enigma venía del enorme número de configuraciones.
//                Aquí: longitud mínima y los 4 tipos de caracteres.
//   cribs        Bletchley buscaba palabras que sabía que aparecían ("WETTER",
//                "HEILHITLER", nombres). Aquí: nada de palabras comunes, nombre ni correo.
//   cillies      Operadores que usaban "AAA" o letras seguidas del teclado ("QWE")
//                como clave de mensaje. Aquí: sin repeticiones ni secuencias.
//   duplicado    La clave de mensaje se tecleaba dos veces ("ABCABC"); así entró Rejewski.
//                Aquí: la contraseña no puede ser un bloque repetido.
//   variedad     Pocas letras distintas = menos combinaciones reales.
//   reflejo      Enigma nunca cifraba una letra como sí misma: un patrón que delata.
//                Aquí: la contraseña no puede ser un palíndromo ("abccba").

export const LONGITUD_MINIMA = 8
export const LONGITUD_MAXIMA = 64 // bcrypt solo usa los primeros 72 bytes

const PALABRAS_COMUNES = [
  'password', 'contrasena', 'contraseña', 'admin', 'administrador', 'usuario', 'user',
  'qwerty', 'qwertz', 'azerty', 'letmein', 'welcome', 'bienvenido', 'hola', 'secreto',
  'secret', 'login', 'refaccionaria', 'enigma', 'soporte', 'root', 'test', 'prueba',
  'abc123', '123456', 'iloveyou', 'teamo', 'dragon', 'monkey', 'master', 'football',
  'futbol', 'america', 'mexico', 'wetter', 'heilhitler',
]

// Filas del teclado (QWERTY y el QWERTZ de la propia Enigma) y secuencias comunes
const SECUENCIAS = [
  'abcdefghijklmnopqrstuvwxyz', '01234567890',
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm', // QWERTY
  'qwertzuio', 'asdfghjk', 'pyxcvbnml', // teclado de la Enigma
  '1qaz2wsx3edc', '!@#$%^&*()',
]

const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', '@': 'a', $: 's', '!': 'i', '|': 'l' }

// Minúsculas, sin acentos y deshaciendo sustituciones típicas (p4ssw0rd -> password)
const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[01345789@$!|]/g, (c) => LEET[c] ?? c)

const minusculasSinAcentos = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function tieneRepeticion(texto, veces = 3) {
  let racha = 1
  for (let i = 1; i < texto.length; i++) {
    racha = texto[i] === texto[i - 1] ? racha + 1 : 1
    if (racha >= veces) return true
  }
  return false
}

function tieneSecuencia(texto, largo = 4) {
  const t = texto.toLowerCase()
  for (let i = 0; i + largo <= t.length; i++) {
    const trozo = t.slice(i, i + largo)
    const alReves = [...trozo].reverse().join('')
    if (SECUENCIAS.some((s) => s.includes(trozo) || s.includes(alReves))) return true
  }
  return false
}

const esBloqueRepetido = (t) => t.length >= 4 && /^(.+)\1+$/s.test(t)

function esPalindromo(t) {
  const s = t.toLowerCase()
  return s.length >= 4 && s === [...s].reverse().join('')
}

// Palabras "conocidas" de esta persona: partes del nombre y del correo
function datosPersonales({ nombre = '', email = '' } = {}) {
  const [local = '', dominio = ''] = email.split('@')
  return [...nombre.split(/\s+/), ...local.split(/[._\-+]/), local, dominio.split('.')[0]]
    .map(minusculasSinAcentos)
    .filter((p) => p.length >= 3)
}

// Bits de entropía aproximados según los tipos de caracteres usados
function calcularEntropia(texto) {
  let tamano = 0
  if (/[a-z]/.test(texto)) tamano += 26
  if (/[A-Z]/.test(texto)) tamano += 26
  if (/\d/.test(texto)) tamano += 10
  if (/[^A-Za-z0-9]/.test(texto)) tamano += 33
  return tamano ? Math.round(texto.length * Math.log2(tamano)) : 0
}

/**
 * Revisa una contraseña.
 * @param {string} contrasena
 * @param {{ nombre?: string, email?: string }} [contexto] datos del usuario que no deben aparecer
 * @returns {{ valida: boolean, errores: {regla: string, mensaje: string}[], entropia: number, nivel: string }}
 */
export function validarContrasena(contrasena, contexto = {}) {
  const errores = []
  const falla = (regla, mensaje) => errores.push({ regla, mensaje })
  const texto = typeof contrasena === 'string' ? contrasena : ''

  // 1) Espacio de claves
  if (texto.length < LONGITUD_MINIMA) falla('espacio', `Usa al menos ${LONGITUD_MINIMA} caracteres.`)
  if (texto.length > LONGITUD_MAXIMA) falla('espacio', `Usa como máximo ${LONGITUD_MAXIMA} caracteres.`)
  if (!/[a-z]/.test(texto)) falla('espacio', 'Incluye al menos una letra minúscula.')
  if (!/[A-Z]/.test(texto)) falla('espacio', 'Incluye al menos una letra mayúscula.')
  if (!/\d/.test(texto)) falla('espacio', 'Incluye al menos un número.')
  if (!/[^A-Za-z0-9\s]/.test(texto)) falla('espacio', 'Incluye al menos un símbolo (por ejemplo ! # $ % & *).')
  if (/^\s|\s$/.test(texto)) falla('espacio', 'No empieces ni termines con espacios.')

  // 2) Variedad
  if (new Set(texto).size < 5) falla('variedad', 'Usa al menos 5 caracteres distintos.')

  // 3) Cillies: repeticiones y secuencias
  if (tieneRepeticion(texto)) falla('cillies', 'No repitas el mismo carácter 3 veces seguidas (como "aaa").')
  if (tieneSecuencia(texto)) falla('cillies', 'Evita secuencias del abecedario, números o teclado (como "abcd", "1234" o "qwer").')

  // 4) Clave duplicada y reflejo
  if (esBloqueRepetido(texto)) falla('duplicado', 'No repitas el mismo bloque (como "Ab1!Ab1!").')
  if (esPalindromo(texto)) falla('reflejo', 'No uses una contraseña que se lea igual al revés.')

  // 5) Cribs: palabras predecibles
  const normal = normalizar(texto)
  const simple = minusculasSinAcentos(texto)
  const comun = PALABRAS_COMUNES.find((p) => normal.includes(p) || simple.includes(p))
  if (comun) falla('cribs', `Contiene una palabra muy común ("${comun}").`)
  if (datosPersonales(contexto).some((p) => normal.includes(normalizar(p)) || simple.includes(p))) {
    falla('cribs', 'No incluyas tu nombre ni partes de tu correo.')
  }

  const entropia = calcularEntropia(texto)
  const nivel = errores.length ? 'débil' : entropia >= 80 ? 'muy fuerte' : entropia >= 60 ? 'fuerte' : 'aceptable'

  return { valida: errores.length === 0, errores, entropia, nivel }
}
