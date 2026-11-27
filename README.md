# BackEnd — API de la refaccionaria

API REST con **Node.js + Express** y **PostgreSQL**. Autenticación con **JWT**.

## Puesta en marcha

1. Instalar dependencias: `npm install`
2. Copiar `.env.example` a `.env` y ajustar los datos de PostgreSQL.
3. Crear tablas y datos de ejemplo (borra y recrea todo): `npm run db:setup`
4. Encender la API: `npm run dev` → `http://localhost:3000/api`

## Usuarios administradores de prueba

| Correo | Contraseña |
| --- | --- |
| admin@refaccionaria.com | Admin123! |
| soporte@refaccionaria.com | Soporte123! |

## Estructura

```
db/
  schema.sql        Tablas (se pueden recrear: empieza con DROP TABLE IF EXISTS)
  seed.sql          Admins, categorías, marcas, piezas y compatibilidades
  setup.js          Ejecuta schema.sql y seed.sql (npm run db:setup)
src/
  server.js         Carga .env, prueba la base y enciende el servidor
  app.js            Express: middlewares globales, rutas y errores
  config/db.js      Pool de conexiones a PostgreSQL
  routes/           Qué URL llama a qué controlador y con qué protecciones
  controllers/      Lógica de cada ruta (consultas SQL y respuesta JSON)
  middlewares/      auth.js (JWT y rol), validar.js (Zod), errores.js
  schemas/          Reglas de validación de los datos que llegan (Zod)
  utils/manejar.js  Pasa los errores de funciones async al manejador de errores
  utils/enigma.js   Máquina Enigma (3 rotores, doble paso, reflector y clavijero)
  utils/validadorContrasena.js  Reglas de fortaleza inspiradas en cómo se rompió Enigma
  utils/contrasenas.js          Guarda/compara contraseñas: bcrypt(Enigma(contraseña))
tests/              Pruebas (npm test)
```

## Rutas

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | /api/salud | Público | Comprueba que la API responde |
| POST | /api/auth/login | Público | `{ email, contrasena }` → `{ token, usuario }` |
| POST | /api/auth/registro | Público | `{ nombre, email, contrasena }` → crea usuario con rol `user` |
| POST | /api/auth/validar-contrasena | Público | `{ contrasena, nombre?, email? }` → `{ valida, errores, entropia, nivel }` (no guarda nada) |
| GET | /api/auth/perfil | Con token | Datos del usuario del token |
| GET | /api/piezas | Público | Todas las piezas (`?destacadas=true` solo destacadas) |
| GET | /api/piezas/:id | Público | Una pieza |
| POST | /api/piezas | Admin | Crear pieza |
| PUT | /api/piezas/:id | Admin | Editar pieza |
| DELETE | /api/piezas/:id | Admin | Eliminar pieza |
| GET | /api/categorias | Público | Categorías |
| GET | /api/marcas | Público | Marcas de autos (compatibilidad) |
| GET | /api/fabricantes | Público | Fabricantes que ya existen en las piezas |

Las rutas de admin requieren el encabezado `Authorization: Bearer <token>`.
Respuestas de error: siempre `{ "error": "mensaje" }` (y `detalles` por campo cuando falla la validación).

## Contraseñas y la máquina Enigma

**Cómo se guardan.** Antes de bcrypt, cada contraseña pasa por una máquina Enigma
(`src/utils/enigma.js`): 3 rotores que avanzan con cada tecla (con el doble paso del
rotor medio), un reflector y un clavijero de 10 pares, sobre los 94 caracteres ASCII
imprimibles. Toda la configuración sale de `ENIGMA_CLAVE` en el `.env`, así que funciona
como una *pimienta*: si se roba la base sin el `.env`, los hashes no sirven para probar
contraseñas. La seguridad principal la sigue dando bcrypt (Enigma sola se rompió en los
años 40; aquí es una capa extra, nunca la única).

> Si cambias `ENIGMA_CLAVE`, las contraseñas guardadas dejan de coincidir.
> Los admins del seed se recalculan con `npm run db:setup`.

La implementación es fiel: con el alfabeto de 26 letras, rotores I-II-III, reflector B y
posiciones `AAA`, cifra `AAAAA` como `BDZGO`, igual que la Enigma I real (ver `tests/`).

**Qué se valida al registrarse.** Cada regla imita un error de los operadores alemanes
que ayudó a romper Enigma:

| Regla | En Enigma | En la contraseña |
| --- | --- | --- |
| `espacio` | Su fuerza venía del número de configuraciones | 8–64 caracteres, mayúscula, minúscula, número y símbolo |
| `variedad` | Claves con pocas letras distintas | Al menos 5 caracteres distintos |
| `cillies` | Claves de mensaje como `AAA` o `QWE` | Sin 3 caracteres iguales seguidos ni secuencias (`abcd`, `1234`, `qwer`, también al revés) |
| `duplicado` | La clave de mensaje se tecleaba dos veces (así entró Rejewski) | No puede ser un bloque repetido (`Ab1!Ab1!`) |
| `reflejo` | Una letra nunca se cifraba como sí misma: un patrón que delataba | No puede ser un palíndromo |
| `cribs` | Palabras previsibles en los mensajes (`WETTER`, nombres) | Sin palabras comunes (también en *leetspeak*: `P4ssw0rd`), ni tu nombre o correo |
