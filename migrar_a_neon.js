const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// PEGA AQUÍ TU CONNECTION STRING DE NEON (entre comillas)
const DATABASE_URL = process.env.DATABASE_URL || 'liga';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function pick(obj, ...keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return null;
}

function getArray(data, ...keys) {
  for (const k of keys) {
    if (Array.isArray(data[k])) return data[k];
  }
  return [];
}

function toBitInt(val) {
  if (typeof val === 'boolean') return val ? 1 : 0;
  const n = Number(val);
  return Number.isNaN(n) ? 0 : (n ? 1 : 0);
}

async function migrar() {
  if (!DATABASE_URL || DATABASE_URL.includes('PEGA_AQUI')) {
    console.error('Falta poner tu DATABASE_URL de Neon dentro de migrar_a_neon.js.');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    const rutaRespaldo = path.join(__dirname, 'respaldo_datos.json');
    if (!fs.existsSync(rutaRespaldo)) {
      throw new Error('No se encontró respaldo_datos.json en la carpeta del proyecto.');
    }

    const raw = JSON.parse(fs.readFileSync(rutaRespaldo, 'utf8'));
    const data = raw.datos || raw.data || raw;

    await client.query('BEGIN');

    await client.query(`
      DROP TABLE IF EXISTS alertassistema CASCADE;
      DROP TABLE IF EXISTS banners CASCADE;
      DROP TABLE IF EXISTS contabilidadgastos CASCADE;
      DROP TABLE IF EXISTS contenido_inicio CASCADE;
      DROP TABLE IF EXISTS direccion CASCADE;
      DROP TABLE IF EXISTS localidad CASCADE;
      DROP TABLE IF EXISTS municipio CASCADE;
      DROP TABLE IF EXISTS estado CASCADE;
      DROP TABLE IF EXISTS fororespuestas CASCADE;
      DROP TABLE IF EXISTS forocomentarios CASCADE;
      DROP TABLE IF EXISTS oferta_detalle CASCADE;
      DROP TABLE IF EXISTS producto CASCADE;
      DROP TABLE IF EXISTS pedidos CASCADE;
      DROP TABLE IF EXISTS pedidospersonalizados CASCADE;
      DROP TABLE IF EXISTS sucursales CASCADE;
      DROP TABLE IF EXISTS telefono CASCADE;
      DROP TABLE IF EXISTS usuarios CASCADE;

      CREATE TABLE alertassistema (
        id INTEGER PRIMARY KEY,
        roldestino TEXT,
        mensaje TEXT,
        fecha TIMESTAMP,
        emailusuario TEXT,
        generadopor TEXT
      );

      CREATE TABLE banners (
        id INTEGER PRIMARY KEY,
        nombre TEXT,
        imagen TEXT
      );

      CREATE TABLE contabilidadgastos (
        id INTEGER PRIMARY KEY,
        concepto TEXT,
        categoria TEXT,
        monto NUMERIC(12,2) DEFAULT 0,
        fecha BIGINT
      );

      CREATE TABLE contenido_inicio (
        id INTEGER PRIMARY KEY,
        tipo TEXT,
        nombre TEXT,
        precio NUMERIC(12,2) DEFAULT 0,
        descripcion TEXT,
        detalles TEXT,
        imagen TEXT,
        producto_id BIGINT,
        unidades_paquete INTEGER,
        stock_promocional INTEGER,
        componentes_oferta TEXT
      );

      CREATE TABLE estado (
        id_estado TEXT PRIMARY KEY,
        descripcion TEXT
      );

      CREATE TABLE municipio (
        id_municipio TEXT PRIMARY KEY,
        id_estado TEXT,
        descripcion TEXT
      );

      CREATE TABLE localidad (
        id_localidad BIGINT PRIMARY KEY,
        id_municipio TEXT,
        id_estado TEXT,
        descripcion TEXT
      );

      CREATE TABLE direccion (
        id_direccion TEXT PRIMARY KEY,
        id_localidad BIGINT,
        calle TEXT,
        num_ext INTEGER,
        num_int INTEGER,
        cod_postal INTEGER
      );

      CREATE TABLE forocomentarios (
        id BIGINT PRIMARY KEY,
        correocliente TEXT,
        tema TEXT,
        estrellas INTEGER DEFAULT 0,
        mensaje TEXT,
        timestamp BIGINT,
        nombre TEXT,
        foto TEXT
      );

      CREATE TABLE fororespuestas (
        id BIGINT PRIMARY KEY,
        idpadre BIGINT,
        correocliente TEXT,
        mensaje TEXT,
        timestamp BIGINT,
        nombre TEXT,
        foto TEXT
      );

      CREATE TABLE producto (
        id_producto BIGINT PRIMARY KEY,
        nombre TEXT NOT NULL,
        id_proveedor BIGINT,
        descripcion TEXT,
        precio NUMERIC(12,2) DEFAULT 0,
        stock INTEGER DEFAULT 0,
        imagen TEXT
      );

      CREATE TABLE oferta_detalle (
        id INTEGER PRIMARY KEY,
        oferta_id INTEGER,
        producto_id BIGINT,
        cantidad INTEGER DEFAULT 1
      );

      CREATE TABLE pedidos (
        idpedido TEXT PRIMARY KEY,
        cliente TEXT,
        correocliente TEXT,
        productos TEXT,
        servicio TEXT,
        total TEXT,
        estado TEXT DEFAULT 'pendiente',
        fecha BIGINT,
        fecha_estado BIGINT,
        detalle TEXT,
        oculto_admin INTEGER DEFAULT 0
      );

      CREATE TABLE pedidospersonalizados (
        id INTEGER PRIMARY KEY,
        folio TEXT,
        cliente TEXT,
        telefono TEXT,
        tipo TEXT,
        descripcion TEXT,
        foto_referencia TEXT,
        precio NUMERIC(12,2) DEFAULT 0,
        anticipo NUMERIC(12,2) DEFAULT 0,
        fecha_orden BIGINT,
        fecha_entrega TEXT,
        estado TEXT DEFAULT 'pendiente',
        oculto_admin INTEGER DEFAULT 0
      );

      CREATE TABLE sucursales (
        id INTEGER PRIMARY KEY,
        nombre TEXT,
        estado TEXT,
        latitud NUMERIC(12,6),
        longitud NUMERIC(12,6),
        info TEXT
      );

      CREATE TABLE telefono (
        id_telefono BIGINT PRIMARY KEY,
        id_proveedor BIGINT
      );

      CREATE TABLE usuarios (
        id INTEGER PRIMARY KEY,
        nombre TEXT,
        correo TEXT UNIQUE NOT NULL,
        contrasena TEXT NOT NULL,
        foto TEXT
      );
    `);

    // 1. AlertasSistema
    for (const r of getArray(data, 'AlertasSistema', 'alertassistema', 'alertas_sistema')) {
      const idVal = Number(pick(r, 'id', 'Id'));
      if (!idVal) continue;
      const fechaRaw = pick(r, 'fecha', 'Fecha');
      await client.query(
        `INSERT INTO alertassistema (id, roldestino, mensaje, fecha, emailusuario, generadopor)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        [
          idVal,
          pick(r, 'rolDestino', 'roldestino') || '',
          pick(r, 'mensaje', 'Mensaje') || '',
          fechaRaw ? new Date(fechaRaw) : null,
          pick(r, 'emailUsuario', 'emailusuario') || null,
          pick(r, 'generadoPor', 'generadopor') || null
        ]
      );
    }

    // 2. Banners
    for (const r of getArray(data, 'Banners', 'banners')) {
      const idVal = Number(pick(r, 'id', 'Id'));
      if (!idVal) continue;
      await client.query(
        `INSERT INTO banners (id, nombre, imagen) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING`,
        [idVal, pick(r, 'nombre', 'Nombre') || '', pick(r, 'imagen', 'Imagen') || '']
      );
    }

    // 3. ContabilidadGastos
    for (const r of getArray(data, 'ContabilidadGastos', 'contabilidadgastos', 'contabilidad_gastos')) {
      const idVal = Number(pick(r, 'id', 'Id'));
      if (!idVal) continue;
      await client.query(
        `INSERT INTO contabilidadgastos (id, concepto, categoria, monto, fecha)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
        [
          idVal,
          pick(r, 'concepto', 'Concepto') || '',
          pick(r, 'categoria', 'Categoria') || '',
          Number(pick(r, 'monto', 'Monto')) || 0,
          Number(pick(r, 'fecha', 'Fecha')) || null
        ]
      );
    }

    // 4. Contenido_Inicio
    for (const r of getArray(data, 'Contenido_Inicio', 'contenido_inicio', 'contenidofolio')) {
      const idVal = Number(pick(r, 'id', 'Id'));
      if (!idVal) continue;
      await client.query(
        `INSERT INTO contenido_inicio
         (id, tipo, nombre, precio, descripcion, detalles, imagen, producto_id, unidades_paquete, stock_promocional, componentes_oferta)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id) DO NOTHING`,
        [
          idVal,
          pick(r, 'tipo', 'Tipo') || '',
          pick(r, 'nombre', 'Nombre') || '',
          Number(pick(r, 'precio', 'Precio')) || 0,
          pick(r, 'descripcion', 'Descripcion') || '',
          pick(r, 'detalles', 'Detalles') || '',
          pick(r, 'imagen', 'Imagen') || '',
          pick(r, 'producto_id', 'productoId') != null ? Number(pick(r, 'producto_id', 'productoId')) : null,
          pick(r, 'unidades_paquete', 'unidadesPaquete') != null ? Number(pick(r, 'unidades_paquete', 'unidadesPaquete')) : null,
          pick(r, 'stock_promocional', 'stockPromocional') != null ? Number(pick(r, 'stock_promocional', 'stockPromocional')) : null,
          pick(r, 'componentes_oferta', 'componentesOferta') || null
        ]
      );
    }

    // 5. Estado, Municipio, Localidad, Direccion
    for (const r of getArray(data, 'Estado', 'estado')) {
      const idEst = pick(r, 'Id_Estado', 'id_estado');
      if (!idEst) continue;
      await client.query(
        `INSERT INTO estado (id_estado, descripcion) VALUES ($1,$2) ON CONFLICT (id_estado) DO NOTHING`,
        [String(idEst), pick(r, 'Descripcion', 'descripcion') || '']
      );
    }

    for (const r of getArray(data, 'Municipio', 'municipio')) {
      const idMun = pick(r, 'Id_Municipio', 'id_municipio');
      if (!idMun) continue;
      await client.query(
        `INSERT INTO municipio (id_municipio, id_estado, descripcion) VALUES ($1,$2,$3) ON CONFLICT (id_municipio) DO NOTHING`,
        [String(idMun), String(pick(r, 'Id_Estado', 'id_estado') || ''), pick(r, 'Descripcion', 'descripcion') || '']
      );
    }

    for (const r of getArray(data, 'Localidad', 'localidad')) {
      const idLoc = Number(pick(r, 'Id_Localidad', 'id_localidad'));
      if (!idLoc) continue;
      await client.query(
        `INSERT INTO localidad (id_localidad, id_municipio, id_estado, descripcion)
         VALUES ($1,$2,$3,$4) ON CONFLICT (id_localidad) DO NOTHING`,
        [
          idLoc,
          String(pick(r, 'Id_Municipio', 'id_municipio') || ''),
          String(pick(r, 'Id_Estado', 'id_estado') || ''),
          pick(r, 'Descripcion', 'descripcion') || ''
        ]
      );
    }

    for (const r of getArray(data, 'Direccion', 'direccion')) {
      const idDir = pick(r, 'Id_Direccion', 'id_direccion');
      if (!idDir) continue;
      await client.query(
        `INSERT INTO direccion (id_direccion, id_localidad, calle, num_ext, num_int, cod_postal)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id_direccion) DO NOTHING`,
        [
          String(idDir),
          Number(pick(r, 'Id_Localidad', 'id_localidad')) || null,
          pick(r, 'Calle', 'calle') || '',
          Number(pick(r, 'Num_Ext', 'num_ext')) || null,
          Number(pick(r, 'Num_Int', 'num_int')) || null,
          Number(pick(r, 'Cod_Postal', 'cod_postal')) || null
        ]
      );
    }

    // 6. ForoComentarios y ForoRespuestas
    for (const r of getArray(data, 'ForoComentarios', 'forocomentarios', 'foro_comentarios')) {
      const idCom = Number(pick(r, 'id', 'Id'));
      if (!idCom) continue;
      await client.query(
        `INSERT INTO forocomentarios (id, correocliente, tema, estrellas, mensaje, timestamp, nombre, foto)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
        [
          idCom,
          pick(r, 'correoCliente', 'correocliente') || '',
          pick(r, 'tema', 'Tema') || '',
          Number(pick(r, 'estrellas', 'Estrellas')) || 0,
          pick(r, 'mensaje', 'Mensaje') || '',
          Number(pick(r, 'timestamp', 'Timestamp')) || null,
          pick(r, 'nombre', 'Nombre') || '',
          pick(r, 'foto', 'Foto') || null
        ]
      );
      if (Array.isArray(r.respuestas)) {
        for (const resp of r.respuestas) {
          const idResp = Number(pick(resp, 'id', 'Id'));
          if (!idResp) continue;
          await client.query(
            `INSERT INTO fororespuestas (id, idpadre, correocliente, mensaje, timestamp, nombre, foto)
             VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
            [
              idResp,
              idCom,
              pick(resp, 'correoCliente', 'correocliente') || '',
              pick(resp, 'mensaje', 'Mensaje') || '',
              Number(pick(resp, 'timestamp', 'Timestamp')) || null,
              pick(resp, 'nombre', 'Nombre') || '',
              pick(resp, 'foto', 'Foto') || null
            ]
          );
        }
      }
    }

    for (const r of getArray(data, 'ForoRespuestas', 'fororespuestas', 'foro_respuestas')) {
      const idResp = Number(pick(r, 'id', 'Id'));
      if (!idResp) continue;
      await client.query(
        `INSERT INTO fororespuestas (id, idpadre, correocliente, mensaje, timestamp, nombre, foto)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
        [
          idResp,
          Number(pick(r, 'idPadre', 'idpadre', 'id_padre')) || null,
          pick(r, 'correoCliente', 'correocliente') || '',
          pick(r, 'mensaje', 'Mensaje') || '',
          Number(pick(r, 'timestamp', 'Timestamp')) || null,
          pick(r, 'nombre', 'Nombre') || '',
          pick(r, 'foto', 'Foto') || null
        ]
      );
    }

    // 7. Producto y Oferta_Detalle
    for (const r of getArray(data, 'Producto', 'producto', 'productos')) {
      const idProd = Number(pick(r, 'Id_Producto', 'id_producto', 'id'));
      if (!idProd) continue;
      await client.query(
        `INSERT INTO producto (id_producto, nombre, id_proveedor, descripcion, precio, stock, imagen)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id_producto) DO NOTHING`,
        [
          idProd,
          pick(r, 'Nombre', 'nombre') || '',
          Number(pick(r, 'Id_Proveedor', 'id_proveedor')) || null,
          pick(r, 'Descripcion', 'descripcion') || '',
          Number(pick(r, 'Precio', 'precio')) || 0,
          Number(pick(r, 'Stock', 'stock')) || 0,
          pick(r, 'Imagen', 'imagen') || ''
        ]
      );
    }

    for (const r of getArray(data, 'Oferta_Detalle', 'oferta_detalle', 'ofertadetalle')) {
      const idOd = Number(pick(r, 'id', 'Id'));
      if (!idOd) continue;
      await client.query(
        `INSERT INTO oferta_detalle (id, oferta_id, producto_id, cantidad)
         VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING`,
        [
          idOd,
          Number(pick(r, 'oferta_id', 'ofertaId')) || null,
          Number(pick(r, 'producto_id', 'productoId')) || null,
          Number(pick(r, 'cantidad', 'Cantidad')) || 1
        ]
      );
    }

    // 8. Pedidos y PedidosPersonalizados
    for (const r of getArray(data, 'Pedidos', 'pedidos')) {
      const idPed = pick(r, 'idPedido', 'idpedido', 'id_pedido');
      if (!idPed) continue;
      await client.query(
        `INSERT INTO pedidos
         (idpedido, cliente, correocliente, productos, servicio, total, estado, fecha, fecha_estado, detalle, oculto_admin)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (idpedido) DO NOTHING`,
        [
          String(idPed),
          pick(r, 'cliente', 'Cliente') || '',
          pick(r, 'correoCliente', 'correocliente') || '',
          pick(r, 'productos', 'Productos') || '',
          pick(r, 'servicio', 'Servicio') || '',
          String(pick(r, 'total', 'Total') || ''),
          pick(r, 'estado', 'Estado') || 'pendiente',
          Number(pick(r, 'fecha', 'Fecha')) || null,
          pick(r, 'fecha_estado', 'fechaEstado') != null ? Number(pick(r, 'fecha_estado', 'fechaEstado')) : null,
          pick(r, 'detalle', 'Detalle') || null,
          toBitInt(pick(r, 'oculto_admin', 'ocultoAdmin'))
        ]
      );
    }

    for (const r of getArray(data, 'PedidosPersonalizados', 'pedidospersonalizados', 'pedidos_personalizados')) {
      const idPer = Number(pick(r, 'id', 'Id'));
      if (!idPer) continue;
      await client.query(
        `INSERT INTO pedidospersonalizados
         (id, folio, cliente, telefono, tipo, descripcion, foto_referencia, precio, anticipo, fecha_orden, fecha_entrega, estado, oculto_admin)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (id) DO NOTHING`,
        [
          idPer,
          pick(r, 'folio', 'Folio') || '',
          pick(r, 'cliente', 'Cliente') || '',
          pick(r, 'telefono', 'Telefono') || '',
          pick(r, 'tipo', 'Tipo') || '',
          pick(r, 'descripcion', 'Descripcion') || '',
          pick(r, 'foto_referencia', 'fotoReferencia') || null,
          Number(pick(r, 'precio', 'Precio')) || 0,
          Number(pick(r, 'anticipo', 'Anticipo')) || 0,
          Number(pick(r, 'fecha_orden', 'fechaOrden')) || null,
          pick(r, 'fecha_entrega', 'fechaEntrega') || '',
          pick(r, 'estado', 'Estado') || 'pendiente',
          toBitInt(pick(r, 'oculto_admin', 'ocultoAdmin'))
        ]
      );
    }

    // 9. Sucursales, Telefono y Usuarios
    for (const r of getArray(data, 'Sucursales', 'sucursales')) {
      const idSuc = Number(pick(r, 'id', 'Id'));
      if (!idSuc) continue;
      await client.query(
        `INSERT INTO sucursales (id, nombre, estado, latitud, longitud, info)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        [
          idSuc,
          pick(r, 'nombre', 'Nombre') || '',
          pick(r, 'estado', 'Estado') || '',
          Number(pick(r, 'latitud', 'Latitud')) || 0,
          Number(pick(r, 'longitud', 'Longitud')) || 0,
          pick(r, 'info', 'Info') || ''
        ]
      );
    }

    for (const r of getArray(data, 'Telefono', 'telefono')) {
      const idTel = Number(pick(r, 'Id_Telefono', 'id_telefono', 'id'));
      if (!idTel) continue;
      await client.query(
        `INSERT INTO telefono (id_telefono, id_proveedor)
         VALUES ($1,$2) ON CONFLICT (id_telefono) DO NOTHING`,
        [idTel, Number(pick(r, 'Id_Proveedor', 'id_proveedor')) || null]
      );
    }

    for (const r of getArray(data, 'Usuarios', 'usuarios')) {
      const correo = pick(r, 'correo', 'Correo');
      if (!correo) continue;
      const idUsr = Number(pick(r, 'id', 'Id'));
      await client.query(
        `INSERT INTO usuarios (id, nombre, correo, contrasena, foto)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (correo) DO NOTHING`,
        [
          idUsr || null,
          pick(r, 'nombre', 'Nombre') || '',
          String(correo).trim().toLowerCase(),
          String(pick(r, 'contrasena', 'Contrasena') || ''),
          pick(r, 'foto', 'Foto') || null
        ]
      );
    }

    await client.query('COMMIT');
    console.log('Migración completada con las 17 tablas de respaldo.xlsx.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error durante la migración:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrar();