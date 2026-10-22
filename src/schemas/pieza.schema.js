// Reglas de los datos de una pieza (crear y editar usan el mismo esquema)
import { z } from 'zod'

// Texto obligatorio con un máximo de caracteres
const texto = (obligatorio, max) =>
  z.string({ required_error: obligatorio }).trim().min(1, obligatorio).max(max, `Máximo ${max} caracteres.`)

export const esquemaPieza = z.object({
  sku: texto('El SKU es obligatorio.', 40).transform((v) => v.toUpperCase()),
  nombre: texto('El nombre es obligatorio.', 150),
  descripcion: texto('La descripción es obligatoria.', 5000),
  fabricante: texto('El fabricante es obligatorio.', 100),
  precio: z.coerce.number({ invalid_type_error: 'El precio debe ser un número.' }).min(0, 'El precio no puede ser negativo.'),
  stock: z.coerce.number({ invalid_type_error: 'El stock debe ser un número.' }).int('El stock debe ser un número entero.').min(0, 'El stock no puede ser negativo.'),
  // Opcional: vacío o null se guarda como NULL (el FrontEnd muestra el recuadro gris)
  imagenUrl: z
    .union([z.string().trim().url('La URL de la imagen no es válida.').max(500), z.literal(''), z.null()])
    .optional()
    .transform((v) => v || null),
  destacada: z.boolean().optional().default(false),
  categoriaId: z.coerce.number({ invalid_type_error: 'Selecciona una categoría.' }).int().positive('Selecciona una categoría.'),
  marcasCompatibles: z.array(z.coerce.number().int().positive()).optional().default([]),
})
