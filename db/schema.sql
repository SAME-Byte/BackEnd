-- =========================================================
-- Esquema de la base de datos engine_db
-- Se puede ejecutar varias veces: primero borra las tablas
-- (en orden inverso a sus dependencias) y luego las crea.
-- =========================================================

DROP TABLE IF EXISTS Parte_Compatible CASCADE;
DROP TABLE IF EXISTS Piezas           CASCADE;
DROP TABLE IF EXISTS Marcas           CASCADE;
DROP TABLE IF EXISTS Categorias       CASCADE;
DROP TABLE IF EXISTS Usuarios         CASCADE;


CREATE TABLE Usuarios (
  id            SERIAL        PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  Email         VARCHAR(150)  NOT NULL UNIQUE,
  Contrasena VARCHAR(255)  NOT NULL,
  role          VARCHAR(10)   NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);


CREATE TABLE Categorias (
  id          SERIAL       PRIMARY KEY,
  name        VARCHAR(80)  NOT NULL UNIQUE,
  description TEXT
);


CREATE TABLE Marcas (
  id        SERIAL       PRIMARY KEY,
  name      VARCHAR(80)  NOT NULL UNIQUE,
  Pais   VARCHAR(60),
  Logo_url  VARCHAR(500)
);


CREATE TABLE Piezas (
  id            SERIAL         PRIMARY KEY,
  sku           VARCHAR(40)    NOT NULL UNIQUE,
  name          VARCHAR(150)   NOT NULL,
  description   TEXT           NOT NULL,
  Manofaturadora  VARCHAR(100)   NOT NULL,
  Precio         NUMERIC(10,2)  NOT NULL CHECK (Precio >= 0),
  Stock         INT            NOT NULL DEFAULT 0 CHECK (Stock >= 0),
  image_url     VARCHAR(500),
  is_featured   BOOLEAN        NOT NULL DEFAULT FALSE,
  category_id   INT            NOT NULL REFERENCES Categorias(id) ON DELETE RESTRICT,
  created_by    INT            NOT NULL REFERENCES Usuarios(id)      ON DELETE RESTRICT,
  created_at    TIMESTAMP      NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP      NOT NULL DEFAULT NOW()
);


CREATE TABLE Parte_Compatible (
  parte_id   INT NOT NULL REFERENCES Piezas(id)  ON DELETE CASCADE,
  marca_id  INT NOT NULL REFERENCES Marcas(id) ON DELETE CASCADE,
  PRIMARY KEY (parte_id, marca_id)
);


CREATE INDEX idx_partes_categorias ON Piezas(category_id);
CREATE INDEX idx_partes_compartidas ON Piezas(is_featured);
CREATE INDEX idx_partes_precio   ON Piezas(Precio);
CREATE INDEX idx_compat_marca   ON Parte_Compatible(marca_id);
