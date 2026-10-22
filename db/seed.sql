-- =========================================================
-- Datos iniciales de engine_db
-- Se ejecuta después de schema.sql (npm run db:setup)
-- =========================================================

-- Usuarios administradores (deben ir PRIMERO: las piezas usan created_by = 1)
-- Las contraseñas están cifradas con bcrypt (10 rondas). En texto plano son:
--   admin@refaccionaria.com   -> Admin123!
--   soporte@refaccionaria.com -> Soporte123!
INSERT INTO Usuarios (name, Email, Contrasena, role) VALUES
 ('Administrador', 'admin@refaccionaria.com',   '$2a$10$Kapj5wzgvnrCGCWqjq9atO8ik5Z/HZ7qLR.7xWEP9e7MNsgYk3Xmy', 'admin'),
 ('Soporte',       'soporte@refaccionaria.com', '$2a$10$w4sNwxM461ar9AV.TecVkuMy.hASatVu40rG2Si4/VYKd8JXQ6tua', 'admin');

INSERT INTO Categorias (name, description) VALUES
 ('Supercargadores', 'Compresores mecánicos para más potencia'),
 ('Turbos',          'Turbocompresores y upgrades'),
 ('Bloques de motor','Bloques forjados y reforzados'),
 ('Escapes',         'Headers y sistemas de escape'),
 ('Inyectores',      'Inyectores de alto flujo'),
 ('Intercoolers',    'Enfriadores de aire de admisión');

INSERT INTO Marcas (name, Pais) VALUES
 ('Ford',       'EE.UU.'),
 ('Chevrolet',  'EE.UU.'),
 ('Nissan',     'Japón'),
 ('Toyota',     'Japón'),
 ('Subaru',     'Japón'),
 ('BMW',        'Alemania'),
 ('Honda',      'Japón'),
 ('Mitsubishi', 'Japón');

-- image_url en NULL: el FrontEnd muestra el recuadro gris hasta que el admin agregue una URL
INSERT INTO Piezas (sku, name, description, Manofaturadora, Precio, Stock, image_url, is_featured, category_id, created_by) VALUES
 ('SC-ROOTS-23',  'Supercargador Roots 2.3L',      'Kit completo de supercargador tipo Roots con soportes y poleas.',         'Whipple',           6500.00,  5, NULL, TRUE,  1, 1),
 ('SC-CENT-V3',   'Supercargador Centrífugo V-3',  'Compresor centrífugo de alta eficiencia con intercooler opcional.',       'Vortech',           4200.00,  8, NULL, FALSE, 1, 1),
 ('SC-TWIN-TVS',  'Supercargador Twin-Screw',      'Compresor de doble tornillo, empuje desde bajas revoluciones.',           'Magnuson',          5900.00,  4, NULL, FALSE, 1, 1),
 ('TB-GT3076R',   'Turbo GT3076R',                 'Turbo de balero cerámico con respuesta rápida y gran rango de flujo.',    'Garrett',           1850.00, 12, NULL, TRUE,  2, 1),
 ('TB-EFR-7163',  'Turbo EFR 7163',                'Upgrade de turbo con carcasa de titanio y aluminuro.',                    'BorgWarner',        2300.00,  6, NULL, FALSE, 2, 1),
 ('TB-T04Z',      'Turbo T04Z Upgrade',            'Turbo de alto flujo para proyectos de 500 a 700 hp.',                     'Precision Turbo',   2100.00,  7, NULL, FALSE, 2, 1),
 ('BL-LS-62',     'Bloque forjado LS 6.2L',        'Bloque reforzado para alta compresión y turbo o supercargador.',          'Dart',              5400.00,  3, NULL, TRUE,  3, 1),
 ('BL-EJ25-CD',   'Bloque closed-deck EJ25',       'Bloque closed-deck para motores boxer con mayor rigidez de cilindros.',   'Cosworth',          4800.00,  2, NULL, FALSE, 3, 1),
 ('BL-RB26-RF',   'Bloque RB26 reforzado',         'Bloque de seis cilindros en línea preparado para altas presiones.',       'Nismo',             7200.00,  1, NULL, FALSE, 3, 1),
 ('ES-HDR-41',    'Header 4-1 acero inoxidable',   'Header de tubo largo en acero inoxidable con soldadura TIG.',             'Kooks',              980.00, 10, NULL, FALSE, 4, 1),
 ('ES-CBK-3',     'Escape cat-back 3 pulgadas',    'Sistema cat-back de acero inoxidable con silenciador de alto flujo.',     'Borla',             1450.00,  9, NULL, FALSE, 4, 1),
 ('IN-1000',      'Inyectores 1000cc',             'Juego de 4 inyectores de alto flujo compatibles con etanol.',             'Injector Dynamics', 1100.00, 15, NULL, FALSE, 5, 1),
 ('IN-1200',      'Inyectores 1200cc',             'Juego de 4 inyectores de baja impedancia y alta resolución.',             'DeatschWerks',       890.00, 11, NULL, FALSE, 5, 1),
 ('IC-FM-3',      'Intercooler frontal 3 pulgadas','Intercooler de montaje frontal con núcleo de barra y placa.',              'Mishimoto',          780.00, 14, NULL, FALSE, 6, 1);

-- Compatibilidad (parte_id, marca_id)
-- Marcas: 1 Ford, 2 Chevrolet, 3 Nissan, 4 Toyota, 5 Subaru, 6 BMW, 7 Honda, 8 Mitsubishi
INSERT INTO Parte_Compatible (parte_id, marca_id) VALUES
 (1,1),(1,2),
 (2,1),(2,2),(2,6),
 (3,1),(3,2),
 (4,3),(4,4),(4,5),(4,6),(4,8),
 (5,3),(5,5),(5,6),(5,8),
 (6,3),(6,4),(6,5),(6,8),
 (7,2),
 (8,5),
 (9,3),
 (10,1),(10,2),(10,3),(10,4),
 (11,1),(11,2),(11,6),(11,7),
 (12,3),(12,4),(12,5),(12,6),(12,8),
 (13,3),(13,5),(13,7),(13,8),
 (14,3),(14,4),(14,5),(14,7),(14,8);
