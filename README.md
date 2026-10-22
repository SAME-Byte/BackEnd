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
```

## Rutas

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | /api/salud | Público | Comprueba que la API responde |
| POST | /api/auth/login | Público | `{ email, contrasena }` → `{ token, usuario }` |
| POST | /api/auth/registro | Público | `{ nombre, email, contrasena }` → crea usuario con rol `user` |
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
