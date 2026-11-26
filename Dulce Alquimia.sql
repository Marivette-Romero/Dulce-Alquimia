IF NOT EXISTS(SELECT 1 FROM sys.databases WHERE name = N'Dulce Alquimia')
   CREATE DATABASE [Dulce Alquimia]
GO
USE [Dulce Alquimia]
GO

TRUNCATE TABLE ForoComentarios;
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FK_Pedidos_Usuarios]') AND type in (N'F'))
ALTER TABLE Pedidos DROP CONSTRAINT FK_Pedidos_Usuarios;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FK_Inventario_Proveedor]') AND type in (N'F'))
ALTER TABLE Inventario DROP CONSTRAINT FK_Inventario_Proveedor;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FK_Inventario_Producto]') AND type in (N'F'))
ALTER TABLE Inventario DROP CONSTRAINT FK_Inventario_Producto;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FK_Producto_Proveedor]') AND type in (N'F'))
ALTER TABLE Producto DROP CONSTRAINT FK_Producto_Proveedor;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FK_Telefono_Proveedor]') AND type in (N'F'))
ALTER TABLE Telefono DROP CONSTRAINT FK_Telefono_Proveedor;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FK_Proveedor_Direccion]') AND type in (N'F'))
ALTER TABLE Proveedor DROP CONSTRAINT FK_Proveedor_Direccion;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FK_Direccion_Localidad]') AND type in (N'F'))
ALTER TABLE Direccion DROP CONSTRAINT FK_Direccion_Localidad;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FK_Localidad_Estado]') AND type in (N'F'))
ALTER TABLE Localidad DROP CONSTRAINT FK_Localidad_Estado;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FK_Localidad_Municipio]') AND type in (N'F'))
ALTER TABLE Localidad DROP CONSTRAINT FK_Localidad_Municipio;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FK_Municipio_Estado]') AND type in (N'F'))
ALTER TABLE Municipio DROP CONSTRAINT FK_Municipio_Estado;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FK_Respuestas_Padre]') AND type in (N'F'))
ALTER TABLE ForoRespuestas DROP CONSTRAINT FK_Respuestas_Padre;
GO

IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ForoRespuestas]') AND type in (N'U')) DROP TABLE [dbo].[ForoRespuestas]
GO 
IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ForoComentarios]') AND type in (N'U')) DROP TABLE [dbo].[ForoComentarios]
GO
IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AlertasSistema]') AND type in (N'U')) DROP TABLE [dbo].[AlertasSistema]
GO 
IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Banners]') AND type in (N'U')) DROP TABLE [dbo].[Banners]
GO
IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Contenido_Inicio]') AND type in (N'U')) DROP TABLE [dbo].[Contenido_Inicio]
GO
IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Pedidos]') AND type in (N'U')) DROP TABLE [dbo].[Pedidos]
GO
IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Inventario]') AND type in (N'U')) DROP TABLE [dbo].[Inventario]
GO
IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Producto]') AND type in (N'U')) DROP TABLE [dbo].[Producto]
GO
IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Telefono]') AND type in (N'U')) DROP TABLE [dbo].[Telefono]
GO
IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Proveedor]') AND type in (N'U')) DROP TABLE [dbo].[Proveedor]
GO
IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Direccion]') AND type in (N'U')) DROP TABLE [dbo].[Direccion]
GO
IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Localidad]') AND type in (N'U')) DROP TABLE [dbo].[Localidad]
GO
IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Municipio]') AND type in (N'U')) DROP TABLE [dbo].[Municipio]
GO
IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Estado]') AND type in (N'U')) DROP TABLE [dbo].[Estado]
GO
IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Usuarios]') AND type in (N'U')) DROP TABLE [dbo].[Usuarios]
GO
CREATE TABLE Estado
(
	Id_Estado nvarchar(50) primary key,
	Descripcion varchar(50) not null
)
GO

CREATE TABLE Municipio
(
	Id_Municipio nvarchar(50) primary key,
	Id_Estado nvarchar(50) not null,
	Descripcion varchar(50) not null
)
GO

CREATE TABLE Localidad
(
	Id_Localidad bigint primary key,
	Id_Municipio nvarchar(50) not null,
	Id_Estado nvarchar(50) not null,
	Descripcion varchar(50) not null
)
GO

CREATE TABLE Direccion
(
	Id_Direccion nvarchar(50) primary key,
	Id_Localidad bigint not null,
	Calle varchar(30) not null,
	Num_Ext int not null,
	Num_Int int null,
	Cod_Postal int not null
)
GO

CREATE TABLE Telefono
(
	Id_Telefono bigint primary key,
	Id_Proveedor bigint not null
)
GO

CREATE TABLE Producto
(
	Id_Producto bigint primary key,
	Nombre varchar(100) not null,
	Id_Proveedor bigint not null,
	Descripcion varchar(250) not null,
	Precio decimal(10,2) not null,
	Stock int not null,
	Imagen text null
)
GO

CREATE TABLE Inventario
(
	Id_Inventario bigint primary key,
	Id_Producto bigint not null,
	Id_Proveedor bigint not null,
	Fecha_Caducidad date not null,
	Cantidad_Producto int check (Cantidad_Producto <= 300),
	Precio_Unitario decimal not null
)
GO

CREATE TABLE Usuarios
(
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) not null,
    correo VARCHAR(100) not null,
    contrasena VARCHAR(100) not null,
    foto TEXT NULL
);
CREATE TABLE ForoComentarios (
    id BIGINT PRIMARY KEY,
    correoCliente VARCHAR(150),
    tema VARCHAR(100),
    estrellas INT,
    mensaje TEXT,
    timestamp BIGINT
);
GO
CREATE TABLE ForoRespuestas (
    id BIGINT PRIMARY KEY,
    idPadre BIGINT,
    correoCliente VARCHAR(150),
    mensaje TEXT,
    timestamp BIGINT
);
GO
CREATE TABLE Pedidos (
    idPedido VARCHAR(50) PRIMARY KEY,
    cliente VARCHAR(100) not null,
    correoCliente VARCHAR(100) not null,
    productos TEXT not null,
    servicio VARCHAR(255) not null,
    total VARCHAR(50) not null,
    estado VARCHAR(50) not null
);
GO

CREATE TABLE AlertasSistema (
    id INT IDENTITY(1,1) PRIMARY KEY,
    rolDestino VARCHAR(20) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Contenido_Inicio (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo VARCHAR(20) not null,
    nombre VARCHAR(100) not null,
    precio DECIMAL(10,2) not null,
    descripcion VARCHAR(250) null,
    detalles VARCHAR(50) null,
    imagen TEXT not null
);
GO

CREATE TABLE Banners (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) not null,
    imagen TEXT not null
);
GO

ALTER TABLE Municipio WITH CHECK ADD CONSTRAINT FK_Municipio_Estado FOREIGN KEY (Id_Estado) REFERENCES Estado(Id_Estado)
GO
ALTER TABLE Localidad WITH CHECK ADD CONSTRAINT FK_Localidad_Municipio FOREIGN KEY (Id_Municipio) REFERENCES Municipio(Id_Municipio)
GO
ALTER TABLE Localidad WITH CHECK ADD CONSTRAINT FK_Localidad_Estado FOREIGN KEY (Id_Estado) REFERENCES Estado(Id_Estado)
GO
ALTER TABLE Direccion WITH CHECK ADD CONSTRAINT FK_Direccion_Localidad FOREIGN KEY (Id_Localidad) REFERENCES Localidad(Id_Localidad)
GO
ALTER TABLE Proveedor WITH CHECK ADD CONSTRAINT FK_Proveedor_Direccion FOREIGN KEY (Id_Direccion) REFERENCES Direccion(Id_Direccion)
GO
ALTER TABLE Telefono WITH CHECK ADD CONSTRAINT FK_Telefono_Proveedor FOREIGN KEY (Id_Proveedor) REFERENCES Proveedor(Id_Proveedor)
GO
ALTER TABLE Producto WITH CHECK ADD CONSTRAINT FK_Producto_Proveedor FOREIGN KEY (Id_Proveedor) REFERENCES Proveedor(Id_Proveedor)
GO
ALTER TABLE Inventario WITH CHECK ADD CONSTRAINT FK_Inventario_Producto FOREIGN KEY (Id_Producto) REFERENCES Producto(Id_Producto)
GO
ALTER TABLE Inventario WITH CHECK ADD CONSTRAINT FK_Inventario_Proveedor FOREIGN KEY (Id_Proveedor) REFERENCES Proveedor(Id_Proveedor)
GO

INSERT INTO Estado (Id_Estado, Descripcion) VALUES ('E01', 'Campeche');
INSERT INTO Estado (Id_Estado, Descripcion) VALUES ('E02', 'Yucat�n');

INSERT INTO Municipio (Id_Municipio, Id_Estado, Descripcion) VALUES ('M01', 'E01', 'Campeche');
INSERT INTO Municipio (Id_Municipio, Id_Estado, Descripcion) VALUES ('M02', 'E02', 'M�rida');

INSERT INTO Localidad (Id_Localidad, Id_Municipio, Id_Estado, Descripcion) VALUES (1, 'M01', 'E01', 'Centro');
INSERT INTO Localidad (Id_Localidad, Id_Municipio, Id_Estado, Descripcion) VALUES (2, 'M02', 'E02', 'Paseo de Montejo');

INSERT INTO Direccion (Id_Direccion, Id_Localidad, Calle, Num_Ext, Num_Int, Cod_Postal) VALUES ('D01', 1, 'Calle 10', 45, NULL, 24000);

INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (1, 'Pastelito de Durazno', 1, '�Lanzamiento especial!', 30.00, 20, 'Lanzamiento1.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (2, 'Choco-Pastelito', 1, '�Lanzamiento especial!', 30.00, 20, 'Lanzamiento2.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (3, 'Pastelito zarzamora', 1, '�Lanzamiento especial!', 30.00, 20, 'Lanzamiento3.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (4, 'Pastelito de Frambuesa', 1, '�Lanzamiento especial!', 30.00, 20, 'Lanzamiento4.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (5, 'Tarta Esmeralda', 1, '�Lanzamiento especial!', 45.00, 20, 'TARTA Esmeralda.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (6, 'Tropiblum', 1, '�Lanzamiento especial!', 35.00, 20, 'TROpical.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (7, 'Pastel de Chocolate', 1, 'Base de chocolate con toques de chocolate', 200.00, 10, 'PastelCho.jpg');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (8, 'Cheesecake de Frutos Rojos', 1, 'Base crujiente de galleta con crema de queso y salsa natural.', 22.00, 15, 'FrutosRojosPostre.jpg');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (9, 'Muffin Especial', 1, 'Un muffim muy bueno', 18.00, 25, 'Muffim de chocolate.jpg');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (10, 'Helado de Chocolate', 1, 'Es fantasticon y muy rico', 25.00, 12, 'Helados caseros de leche.jpg');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (11, 'Helado de vainilla', 1, 'Refrescante y delicioso', 20.00, 18, 'helados de fresa con vainilla.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (12, 'Pay de Lim�n', 1, 'Con sabor exquisito', 25.00, 8, 'paydelimon.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (13, 'Torre de Durazno', 1, 'Con sabor exquisito', 15.00, 14, 'TorreDeDurazno.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (14, 'Cheesecake de Frambuesa', 1, 'Con sabor exquisito', 35.00, 7, 'Tarta-de_Fresa.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (15, 'Volcan de Chocolate', 1, 'Una explosi�n de sabor en cada bocado', 30.00, 9, 'volcan_choc.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (16, 'Brownie', 1, 'El chocolate se derrite en tu boca', 15.00, 30, 'brownie.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (17, 'Mini-Hechizo de Frambuesa', 1, 'Con sabor exquisito', 15.00, 22, 'Mini_Hechizo.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (18, 'Tarta de Zarsamora', 1, 'Con sabor exquisito', 250.00, 5, 'Tarta de Zarsamora.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (19, 'Merengues', 1, 'Paquete de 10 piezas', 18.00, 40, 'Merengue.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (20, 'scuichi de fresa', 1, 'Paquete de 10 piezas', 27.00, 15, 'scuichi de fresa.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (21, 'Cheesecake de Oreo', 1, 'Trocitos dulces', 15.00, 20, 'cheescakeOreo.png');
INSERT INTO Producto (Id_Producto, Nombre, Id_Proveedor, Descripcion, Precio, Stock, Imagen) VALUES (22, 'Macarrons', 1, '15 piezas', 20.00, 25, 'Macarrons.png');

INSERT INTO Contenido_Inicio (tipo, nombre, precio, descripcion, detalles, imagen) VALUES ('oferta', 'Pay de Lim�n', 35.00, 'Equilibrio perfecto entre el toque �cido del lim�n natural y la suavidad cremosa de nuestra receta secreta.', '2 porciones', 'paydelimon.png');
INSERT INTO Contenido_Inicio (tipo, nombre, precio, descripcion, detalles, imagen) VALUES ('oferta', 'Muffin Chocolate', 18.00, 'Panecillo esponjoso repleto de chispas de chocolate belga fundido, ideal para acompa�ar con tu caf�.', '1 pieza', 'Muffim de chocolate.jpg');
INSERT INTO Contenido_Inicio (tipo, nombre, precio, descripcion, detalles, imagen) VALUES ('oferta', 'Pastel Fudge Supremo', 200.00, 'Tres capas de bizcocho h�medo de chocolate, cubierto con un sedoso ganache artesanal premium.', '12 porciones', 'PastelCho.jpg');

INSERT INTO Contenido_Inicio (tipo, nombre, precio, descripcion, detalles, imagen) VALUES ('favorito', 'CHEESECAKE FRUTOS ROJOS', 22.00, NULL, NULL, 'FrutosRojosPostre.jpg');
INSERT INTO Contenido_Inicio (tipo, nombre, precio, descripcion, detalles, imagen) VALUES ('favorito', 'MERENGUES', 18.00, NULL, NULL, 'Merengue.png');
INSERT INTO Contenido_Inicio (tipo, nombre, precio, descripcion, detalles, imagen) VALUES ('favorito', 'MACARRONS FRANCESES', 20.00, NULL, NULL, 'Macarrons.png');
INSERT INTO Contenido_Inicio (tipo, nombre, precio, descripcion, detalles, imagen) VALUES ('favorito', 'PAY DE LIM�N', 25.00, NULL, NULL, 'paydelimon.png');
INSERT INTO Contenido_Inicio (tipo, nombre, precio, descripcion, detalles, imagen) VALUES ('favorito', 'BROWNIE NUTELLA', 50.00, NULL, NULL, 'brownie.png');

INSERT INTO Banners (nombre, imagen) VALUES ('Eslogan', 'Eslogan.png');
INSERT INTO Banners (nombre, imagen) VALUES ('banner1', 'banner1.png');
INSERT INTO Banners (nombre, imagen) VALUES ('Banner_Lim', 'Banner_Lim.png');
INSERT INTO Banners (nombre, imagen) VALUES ('Banner_Nuv', 'Banner_Nuv.png');
GO