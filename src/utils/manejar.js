// Express 4 no atrapa errores de funciones async: este envoltorio los manda a manejarErrores
export const manejar = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
