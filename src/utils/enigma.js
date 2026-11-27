// Máquina Enigma (modelo de 3 rotores) generalizada a cualquier alfabeto de tamaño par.
//
// Recorrido de cada carácter, igual que en la máquina original:
//   clavijero -> rotor derecho -> medio -> izquierdo -> reflector
//             -> izquierdo -> medio -> derecho -> clavijero
//
// Antes de cifrar cada carácter los rotores avanzan (como al presionar una tecla),
// incluido el "doble paso" del rotor medio. Por eso la misma letra se cifra distinto
// según su posición (sustitución polialfabética).
//
// Propiedades que hereda de la Enigma real:
//   - Es recíproca: cifrar dos veces con la misma configuración devuelve el original.
//   - Ningún carácter se cifra como sí mismo (consecuencia del reflector).
//
// Con el alfabeto de 26 letras y los rotores históricos reproduce la Enigma I
// (ver ENIGMA_I más abajo). Con crearEnigmaDesdeClave() se arma una Enigma de
// 94 caracteres (ASCII imprimible) cuyos rotores salen de una clave secreta.
import { createHmac } from 'node:crypto'

const mod = (a, n) => ((a % n) + n) % n

class Rotor {
  constructor(alfabeto, { cableado, muescas = '', posicion = 0, anillo = 0 }) {
    const n = alfabeto.length
    this.n = n
    this.adelante = [...cableado].map((c) => alfabeto.indexOf(c))
    if (this.adelante.length !== n || new Set(this.adelante).size !== n || this.adelante.includes(-1)) {
      throw new Error('El cableado del rotor debe ser una permutación del alfabeto.')
    }
    this.atras = new Array(n)
    this.adelante.forEach((salida, entrada) => { this.atras[salida] = entrada })
    this.muescas = new Set([...muescas].map((c) => alfabeto.indexOf(c)))
    this.posicion = typeof posicion === 'string' ? alfabeto.indexOf(posicion) : posicion
    this.anillo = typeof anillo === 'string' ? alfabeto.indexOf(anillo) : anillo
  }

  enMuesca() { return this.muescas.has(this.posicion) }
  avanzar() { this.posicion = (this.posicion + 1) % this.n }

  pasar(x, tabla) {
    const d = this.posicion - this.anillo
    return mod(tabla[mod(x + d, this.n)] - d, this.n)
  }
  haciaAdelante(x) { return this.pasar(x, this.adelante) }
  haciaAtras(x) { return this.pasar(x, this.atras) }
}

export class Enigma {
  /**
   * @param {object} config
   * @param {string} config.alfabeto     Caracteres que la máquina sabe cifrar (tamaño par)
   * @param {Array}  config.rotores      [izquierdo, medio, derecho]: { cableado, muescas, posicion, anillo }
   * @param {string} config.reflector    Permutación del alfabeto sin puntos fijos y simétrica
   * @param {string[]} [config.clavijero] Pares de caracteres intercambiados, p. ej. ['AB', 'CD']
   */
  constructor({ alfabeto, rotores, reflector, clavijero = [] }) {
    if (alfabeto.length % 2 !== 0) throw new Error('El alfabeto debe tener un número par de caracteres.')
    if (new Set(alfabeto).size !== alfabeto.length) throw new Error('El alfabeto tiene caracteres repetidos.')
    if (rotores.length !== 3) throw new Error('Se necesitan exactamente 3 rotores.')

    this.alfabeto = alfabeto
    this.n = alfabeto.length
    this.config = { rotores: rotores.map((r) => ({ ...r })) } // para reiniciar posiciones
    this.rotores = rotores.map((r) => new Rotor(alfabeto, r))

    // Reflector: debe ser una involución sin puntos fijos (a<->b, nunca a<->a)
    this.reflector = [...reflector].map((c) => alfabeto.indexOf(c))
    this.reflector.forEach((salida, entrada) => {
      if (salida === -1 || salida === entrada || this.reflector[salida] !== entrada) {
        throw new Error('El reflector debe emparejar cada carácter con otro distinto.')
      }
    })

    // Clavijero: intercambia pares antes y después de los rotores
    this.clavijero = [...Array(this.n).keys()]
    const usados = new Set()
    for (const par of clavijero) {
      const [a, b] = [...par].map((c) => alfabeto.indexOf(c))
      if (par.length !== 2 || a === -1 || b === -1 || a === b || usados.has(a) || usados.has(b)) {
        throw new Error(`Par de clavijero inválido: "${par}".`)
      }
      usados.add(a).add(b)
      this.clavijero[a] = b
      this.clavijero[b] = a
    }
  }

  // Avance de rotores antes de cada tecla, con el doble paso del rotor medio
  avanzar() {
    const [izq, medio, der] = this.rotores
    if (medio.enMuesca()) {
      medio.avanzar()
      izq.avanzar()
    } else if (der.enMuesca()) {
      medio.avanzar()
    }
    der.avanzar()
  }

  cifrarCaracter(c) {
    let x = this.alfabeto.indexOf(c)
    if (x === -1) return c // como en la Enigma real, lo que no está en el teclado pasa igual (y no gira rotores)

    this.avanzar()
    const [izq, medio, der] = this.rotores
    x = this.clavijero[x]
    x = izq.haciaAdelante(medio.haciaAdelante(der.haciaAdelante(x)))
    x = this.reflector[x]
    x = der.haciaAtras(medio.haciaAtras(izq.haciaAtras(x)))
    x = this.clavijero[x]
    return this.alfabeto[x]
  }

  /** Cifra (o descifra, es lo mismo) un texto partiendo siempre de las posiciones iniciales. */
  cifrar(texto) {
    this.rotores = this.config.rotores.map((r) => new Rotor(this.alfabeto, r))
    return Array.from(texto, (c) => this.cifrarCaracter(c)).join('')
  }
}

// ---------------------------------------------------------------------------
// Enigma I histórica (rotores I, II, III y reflector B). Sirve para comprobar
// que la implementación es fiel: con posiciones AAA, "AAAAA" -> "BDZGO".
// ---------------------------------------------------------------------------
export const ALFABETO_LATINO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const ROTORES_HISTORICOS = {
  I: { cableado: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', muescas: 'Q' },
  II: { cableado: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', muescas: 'E' },
  III: { cableado: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', muescas: 'V' },
  IV: { cableado: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', muescas: 'J' },
  V: { cableado: 'VZBRGITYUPSDNHLXAWMJQOFECK', muescas: 'Z' },
}
export const REFLECTOR_B = 'YRUHQSLDPXNGOKMIEBFZCWVJAT'

export function crearEnigmaI({ rotores = ['I', 'II', 'III'], posiciones = 'AAA', anillos = 'AAA', clavijero = [] } = {}) {
  return new Enigma({
    alfabeto: ALFABETO_LATINO,
    rotores: rotores.map((nombre, i) => ({ ...ROTORES_HISTORICOS[nombre], posicion: posiciones[i], anillo: anillos[i] })),
    reflector: REFLECTOR_B,
    clavijero,
  })
}

// ---------------------------------------------------------------------------
// Enigma de 94 caracteres (ASCII imprimible: letras, dígitos y símbolos) cuya
// configuración completa (cableados, muescas, reflector, clavijero, posiciones
// y anillos) se deriva de forma determinista de una clave secreta.
// ---------------------------------------------------------------------------
export const ALFABETO_IMPRIMIBLE = Array.from({ length: 94 }, (_, i) => String.fromCharCode(33 + i)).join('')

// Generador de números determinista a partir de la clave (HMAC-SHA256 en modo contador)
function generadorDesdeClave(clave) {
  let contador = 0
  let bloque = Buffer.alloc(0)
  let i = 0
  const byte = () => {
    if (i >= bloque.length) {
      bloque = createHmac('sha256', clave).update(`enigma:${contador++}`).digest()
      i = 0
    }
    return bloque[i++]
  }
  // Entero uniforme en [0, max) sin sesgo de módulo
  return (max) => {
    const limite = 2 ** 32 - (2 ** 32 % max)
    let v
    do { v = ((byte() << 24) | (byte() << 16) | (byte() << 8) | byte()) >>> 0 } while (v >= limite)
    return v % max
  }
}

function barajar(arreglo, azar) {
  const a = [...arreglo]
  for (let i = a.length - 1; i > 0; i--) {
    const j = azar(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function crearEnigmaDesdeClave(clave, alfabeto = ALFABETO_IMPRIMIBLE) {
  if (!clave || clave.length < 16) throw new Error('La clave de Enigma debe tener al menos 16 caracteres.')
  const azar = generadorDesdeClave(clave)
  const n = alfabeto.length

  const rotores = [0, 1, 2].map(() => ({
    cableado: barajar(alfabeto, azar).join(''),
    muescas: barajar(alfabeto, azar).slice(0, 2).join(''), // 2 muescas, como los rotores VI-VIII
    posicion: azar(n),
    anillo: azar(n),
  }))

  // Reflector: emparejar todos los caracteres de dos en dos
  const orden = barajar(alfabeto, azar)
  const reflector = new Array(n)
  for (let i = 0; i < n; i += 2) {
    const [a, b] = [alfabeto.indexOf(orden[i]), alfabeto.indexOf(orden[i + 1])]
    reflector[a] = orden[i + 1]
    reflector[b] = orden[i]
  }

  // Clavijero: 10 pares (lo que usaba el ejército alemán)
  const libres = barajar(alfabeto, azar)
  const clavijero = Array.from({ length: 10 }, (_, i) => libres[2 * i] + libres[2 * i + 1])

  return new Enigma({ alfabeto, rotores, reflector: reflector.join(''), clavijero })
}

// Máquina del servidor, configurada con ENIGMA_CLAVE (se crea la primera vez que se usa)
let maquina = null
let claveUsada = null
export function cifrarConEnigma(texto) {
  const clave = process.env.ENIGMA_CLAVE
  if (!maquina || clave !== claveUsada) {
    maquina = crearEnigmaDesdeClave(clave)
    claveUsada = clave
  }
  return maquina.cifrar(texto)
}
