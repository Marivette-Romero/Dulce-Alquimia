const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Usa DATABASE_URL en entorno/producción o la cadena local por defecto si la defines
const connectionString = process.env.DATABASE_URL || '';

const pool = new Pool({
    connectionString,
    ssl: connectionString ? { rejectUnauthorized: false } : false
});

function esHashBcrypt(valor) {
    return typeof valor === 'string' && /^\$2[aby]\$\d{2}\$/.test(valor);
}

app.get('/api/productos', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM producto ORDER BY id_producto ASC');
        const filas = resultado.rows.map(p => ({
            ...p,
            Id_Producto: p.id_producto,
            Nombre: p.nombre,
            Id_Proveedor: p.id_proveedor,
            Descripcion: p.descripcion,
            Precio: Number(p.precio),
            Stock: Number(p.stock),
            Imagen: p.imagen
        }));
        res.json(filas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/registrar', async (req, res) => {
    const { nombre, email, contrasena } = req.body;
    try {
        const correoNormalizado = String(email || '').trim().toLowerCase();
        const verificarUser = await pool.query(
            'SELECT 1 FROM usuarios WHERE LOWER(correo) = LOWER($1)',
            [correoNormalizado]
        );

        if (verificarUser.rows.length > 0) {
            return res.status(400).json({ error: 'Este correo ya está registrado.' });
        }

        const hashContrasena = await bcrypt.hash(String(contrasena || ''), 10);
        const idRes = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM usuarios');
        const nextId = Number(idRes.rows[0].next_id) || 1;

        await pool.query(
            'INSERT INTO usuarios (id, nombre, correo, contrasena) VALUES ($1, $2, $3, $4)',
            [nextId, nombre, correoNormalizado, hashContrasena]
        );

        res.status(201).json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, contrasena } = req.body;
    try {
        const correoNormalizado = String(email || '').trim().toLowerCase();
        const verificarCorreo = await pool.query(
            'SELECT * FROM usuarios WHERE LOWER(correo) = LOWER($1)',
            [correoNormalizado]
        );

        if (verificarCorreo.rows.length === 0) {
            return res.status(404).json({ error: 'Este usuario no existe.' });
        }

        const usuario = verificarCorreo.rows[0];
        const passPlano = String(contrasena || '');
        const passGuardada = String(usuario.contrasena || '');

        let valida = false;
        if (esHashBcrypt(passGuardada)) {
            valida = await bcrypt.compare(passPlano, passGuardada);
        } else {
            valida = passPlano === passGuardada;
            if (valida) {
                const nuevoHash = await bcrypt.hash(passPlano, 10);
                await pool.query(
                    'UPDATE usuarios SET contrasena = $1 WHERE id = $2',
                    [nuevoHash, usuario.id]
                );
            }
        }

        if (!valida) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        res.json({
            usuario: {
                nombre: usuario.nombre,
                correo: usuario.correo,
                foto: usuario.foto
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/perfil/actualizar', async (req, res) => {
    const { email, nombre, contrasena, foto } = req.body;
    try {
        const campos = ['nombre = $1'];
        const valores = [nombre];
        let idx = 2;

        if (contrasena && contrasena.trim() !== '') {
            const hash = await bcrypt.hash(contrasena.trim(), 10);
            campos.push(`contrasena = $${idx++}`);
            valores.push(hash);
        }

        if (foto && foto.trim() !== '') {
            campos.push(`foto = $${idx++}`);
            valores.push(foto);
        }

        valores.push(String(email || '').trim().toLowerCase());
        const queryStr = `UPDATE usuarios SET ${campos.join(', ')} WHERE LOWER(correo) = LOWER($${idx})`;

        await pool.query(queryStr, valores);
        res.json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/perfil/eliminar', async (req, res) => {
    const { email } = req.body;
    const correoNormalizado = String(email || '').trim().toLowerCase();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Obtener nombre del usuario antes de borrarlo para limpiar también sus comentarios del foro
        const userRes = await client.query(
            'SELECT nombre FROM usuarios WHERE LOWER(correo) = LOWER($1)',
            [correoNormalizado]
        );
        const nombreUsuario = userRes.rows[0]?.nombre || '';

        // 2. Eliminar todos los pedidos del cliente (desaparecen también del panel de admin)
        await client.query(
            'DELETE FROM pedidos WHERE LOWER(correocliente) = LOWER($1)',
            [correoNormalizado]
        );

        // 3. Eliminar todas las alertas asociadas o generadas por ese cliente
        await client.query(
            'DELETE FROM alertassistema WHERE LOWER(emailusuario) = LOWER($1) OR LOWER(generadopor) = LOWER($1)',
            [correoNormalizado]
        );

        // 4. Eliminar sus comentarios y respuestas en el foro (si tenía)
        if (nombreUsuario) {
            await client.query(
                `DELETE FROM fororespuestas
                 WHERE LOWER(nombre) = LOWER($1)
                    OR idpadre IN (SELECT id FROM forocomentarios WHERE LOWER(nombre) = LOWER($1))`,
                [nombreUsuario]
            );
            await client.query(
                'DELETE FROM forocomentarios WHERE LOWER(nombre) = LOWER($1)',
                [nombreUsuario]
            );
        }
app.delete('/api/perfil/eliminar', async (req, res) => {
    const { email } = req.body;
    const correoNormalizado = String(email || '').trim().toLowerCase();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Obtener nombre del usuario antes de borrarlo para limpiar también sus comentarios del foro
        const userRes = await client.query(
            'SELECT nombre FROM usuarios WHERE LOWER(correo) = LOWER($1)',
            [correoNormalizado]
        );
        const nombreUsuario = userRes.rows[0]?.nombre || '';

        // 2. Eliminar todos los pedidos del cliente (desaparecen también del panel de admin)
        await client.query(
            'DELETE FROM pedidos WHERE LOWER(correocliente) = LOWER($1)',
            [correoNormalizado]
        );

        // 3. Eliminar todas las alertas asociadas o generadas por ese cliente
        await client.query(
            'DELETE FROM alertassistema WHERE LOWER(emailusuario) = LOWER($1) OR LOWER(generadopor) = LOWER($1)',
            [correoNormalizado]
        );

        // 4. Eliminar sus comentarios y respuestas en el foro (si tenía)
        if (nombreUsuario) {
            await client.query(
                `DELETE FROM fororespuestas
                 WHERE LOWER(nombre) = LOWER($1)
                    OR idpadre IN (SELECT id FROM forocomentarios WHERE LOWER(nombre) = LOWER($1))`,
                [nombreUsuario]
            );
            await client.query(
                'DELETE FROM forocomentarios WHERE LOWER(nombre) = LOWER($1)',
                [nombreUsuario]
            );
        }

        // 5. Eliminar la cuenta de usuario
        await client.query(
            'DELETE FROM usuarios WHERE LOWER(correo) = LOWER($1)',
            [correoNormalizado]
        );

        await client.query('COMMIT');
        res.json({ exito: true });
    } catch (error) {
        try { await client.query('ROLLBACK'); } catch (e) {}
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});
        await client.query(
            'DELETE FROM usuarios WHERE LOWER(correo) = LOWER($1)',
            [correoNormalizado]
        );

        await client.query('COMMIT');
        res.json({ exito: true });
    } catch (error) {
        try { await client.query('ROLLBACK'); } catch (e) {}
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});
app.post('/api/carrito/comprar', async (req, res) => {
    const { idPedido, cliente, correoCliente, productos, servicio, total, carritoDetalle } = req.body;
    const ahora = Date.now();
    const client = await pool.connect();

    try {
        if (!Array.isArray(carritoDetalle) || carritoDetalle.length === 0) {
            throw new Error('El carrito está vacío o no es válido.');
        }

        await client.query('BEGIN');

        await client.query(
            `INSERT INTO pedidos
             (idpedido, cliente, correocliente, productos, servicio, total, estado, fecha, fecha_estado, detalle, oculto_admin)
             VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', $7, $7, $8, 0)`,
            [
                idPedido,
                cliente,
                correoCliente,
                productos,
                servicio,
                String(total),
                ahora,
                JSON.stringify(carritoDetalle)
            ]
        );

        for (const item of carritoDetalle) {
            const nombre = String(item.nombre || '').trim();
            const cantidad = Number(item.cantidad);

            if (!nombre || !Number.isSafeInteger(cantidad) || cantidad < 1) {
                throw new Error('El nombre o la cantidad del artículo no es válido.');
            }

            const productoRes = await client.query(
                `SELECT id_producto FROM producto
                 WHERE LOWER(BTRIM(nombre)) = LOWER(BTRIM($1))`,
                [nombre]
            );

            if (productoRes.rows.length > 1) {
                throw new Error(`Hay varios productos con el nombre "${nombre}".`);
            }

            if (productoRes.rows.length === 1) {
                const idProducto = productoRes.rows[0].id_producto;
                const resultado = await client.query(
                    `UPDATE producto SET stock = stock - $1
                     WHERE id_producto = $2 AND stock >= $1`,
                    [cantidad, idProducto]
                );

                if (resultado.rowCount !== 1) {
                    throw new Error(`Stock insuficiente para "${nombre}".`);
                }
                continue;
            }

            const ofertaRes = await client.query(
                `SELECT nombre, componentes_oferta FROM contenido_inicio
                 WHERE tipo = 'oferta'
                   AND LOWER(BTRIM(nombre)) = LOWER(BTRIM($1))
                 LIMIT 1`,
                [nombre]
            );

            if (ofertaRes.rows.length === 0) {
                throw new Error(`No se encontró el producto ni la oferta "${nombre}".`);
            }

            const json = ofertaRes.rows[0].componentes_oferta;
            if (!json) throw new Error(`La oferta "${nombre}" no tiene componentes guardados.`);

            const componentes = typeof json === 'string' ? JSON.parse(json) : json;
            if (!Array.isArray(componentes) || componentes.length === 0) {
                throw new Error(`La oferta "${nombre}" no contiene productos.`);
            }

            for (const comp of componentes) {
                const nombreComp = String(comp.nombreProducto || '').trim();
                const piezas = Number(comp.piezas);
                const cantidadDescontar = piezas * cantidad;

                const componenteRes = await client.query(
                    `SELECT id_producto FROM producto
                     WHERE LOWER(BTRIM(nombre)) = LOWER(BTRIM($1))`,
                    [nombreComp]
                );

                if (componenteRes.rows.length !== 1) {
                    throw new Error(`Error con el componente "${nombreComp}" en la oferta.`);
                }

                const idComp = componenteRes.rows[0].id_producto;
                const descuento = await client.query(
                    `UPDATE producto SET stock = stock - $1
                     WHERE id_producto = $2 AND stock >= $1`,
                    [cantidadDescontar, idComp]
                );

                if (descuento.rowCount !== 1) {
                    throw new Error(`Stock insuficiente para "${nombreComp}".`);
                }
            }
        }

        await client.query('COMMIT');
        return res.json({ exito: true, mensaje: 'Compra registrada y stock actualizado.' });
    } catch (error) {
        try { await client.query('ROLLBACK'); } catch (e) {}
        return res.status(400).json({ exito: false, error: error.message });
    } finally {
        client.release();
    }
});

app.get('/api/pedidos', async (req, res) => {
    try {
        const correo = String(req.query.correo || '').trim();
        let resultado;

        if (correo) {
            resultado = await pool.query(
                `SELECT idpedido, cliente, correocliente, productos, servicio, total, estado, fecha, fecha_estado
                 FROM pedidos WHERE LOWER(correocliente) = LOWER($1)`,
                [correo]
            );
        } else {
            resultado = await pool.query(
                `SELECT idpedido, cliente, correocliente, productos, servicio, total, estado, fecha, fecha_estado
                 FROM pedidos WHERE COALESCE(oculto_admin, 0) = 0`
            );
        }

        res.json(resultado.rows.map(p => ({
            ...p,
            idPedido: p.idpedido,
            correoCliente: p.correocliente,
            fecha: Number(p.fecha) || Date.now(),
            fecha_estado: p.fecha_estado === null ? null : Number(p.fecha_estado)
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/pedidos/estado', async (req, res) => {
    const { idPedido, estado } = req.body;
    const ESTADOS_VALIDOS = ['pendiente', 'entrega', 'completado'];
    try {
        if (!ESTADOS_VALIDOS.includes(estado)) {
            return res.status(400).json({ error: 'Estado no válido.' });
        }

        const pedidoRes = await pool.query(
            'SELECT correocliente, estado FROM pedidos WHERE idpedido = $1',
            [idPedido]
        );

        if (pedidoRes.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        const { correocliente: correoCliente, estado: estadoActual } = pedidoRes.rows[0];
        if (estadoActual === 'cancelado') {
            return res.status(409).json({ error: 'El pedido ya fue cancelado por el cliente.' });
        }

        await pool.query(
            'UPDATE pedidos SET estado = $1, fecha_estado = $2 WHERE idpedido = $3',
            [estado, Date.now(), idPedido]
        );

        const idAlertaRes = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM alertassistema');
        const nextAlertaId = Number(idAlertaRes.rows[0].next_id) || 1;

        await pool.query(
            `INSERT INTO alertassistema (id, roldestino, mensaje, emailusuario, generadopor)
             VALUES ($1, 'cliente', $2, $3, 'marivetteromero.1603@gmail.com')`,
            [
                nextAlertaId,
                `El estado de tu pedido ${idPedido} ha cambiado a: ${estado.toUpperCase()}`,
                String(correoCliente || '').trim().toLowerCase()
            ]
        );

        res.json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/alertas', async (req, res) => {
    const rol = String(req.query.rol || '').trim().toLowerCase();
    const email = String(req.query.email || '').trim().toLowerCase();

    try {
        let resultado;
        if (rol === 'admin') {
            resultado = await pool.query(
                `SELECT * FROM alertassistema
                 WHERE roldestino = 'admin'
                   AND (generadopor IS NULL OR LOWER(generadopor) != LOWER($1))
                 ORDER BY id DESC`,
                [email]
            );
        } else {
            // Para clientes: solo alertas dirigidas a su correo o alertas globales (emailusuario IS NULL)
            resultado = await pool.query(
                `SELECT * FROM alertassistema
                 WHERE roldestino = 'cliente'
                   AND (emailusuario IS NULL OR LOWER(emailusuario) = LOWER($1))
                   AND (generadopor IS NULL OR LOWER(generadopor) != LOWER($1))
                 ORDER BY id DESC`,
                [email]
            );
        }
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/alertas/vaciar', async (req, res) => {
    const rol = String(req.body.rol || '').trim().toLowerCase();
    const email = String(req.body.email || '').trim().toLowerCase();

    try {
        if (rol === 'admin') {
            await pool.query(`DELETE FROM alertassistema WHERE roldestino = 'admin'`);
        } else {
            await pool.query(
                `DELETE FROM alertassistema
                 WHERE roldestino = 'cliente'
                   AND LOWER(emailusuario) = LOWER($1)`,
                [email]
            );
        }
        res.json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/pedidos/ocultar-admin', async (req, res) => {
    const { idPedido } = req.body;
    try {
        await pool.query(
            'UPDATE pedidos SET oculto_admin = 1 WHERE idpedido = $1',
            [idPedido]
        );
        res.json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function devolverStock(client, nombre, cantidad) {
    const prod = await client.query(
        'SELECT id_producto FROM producto WHERE LOWER(BTRIM(nombre)) = LOWER(BTRIM($1))',
        [nombre]
    );

    if (prod.rows.length === 1) {
        await client.query(
            'UPDATE producto SET stock = stock + $1 WHERE id_producto = $2',
            [cantidad, prod.rows[0].id_producto]
        );
        return;
    }

    const oferta = await client.query(
        `SELECT componentes_oferta FROM contenido_inicio
         WHERE tipo = 'oferta' AND LOWER(BTRIM(nombre)) = LOWER(BTRIM($1))
         LIMIT 1`,
        [nombre]
    );

    if (oferta.rows.length === 0 || !oferta.rows[0].componentes_oferta) return;
    const componentes = typeof oferta.rows[0].componentes_oferta === 'string'
        ? JSON.parse(oferta.rows[0].componentes_oferta)
        : oferta.rows[0].componentes_oferta;

    if (Array.isArray(componentes)) {
        for (const c of componentes) {
            await devolverStock(client, String(c.nombreProducto || '').trim(), Number(c.piezas) * cantidad);
        }
    }
}

function leerArticulos(pedido) {
    if (pedido.detalle) {
        try {
            const lista = JSON.parse(pedido.detalle);
            if (Array.isArray(lista)) {
                return lista.map(i => ({ nombre: String(i.nombre || '').trim(), cantidad: Number(i.cantidad) }));
            }
        } catch (e) {}
    }
    const items = [];
    const re = /(.+?) \(x(\d+)\)(?:, |$)/g;
    let m;
    const texto = String(pedido.productos || '');
    while ((m = re.exec(texto)) !== null) {
        items.push({ nombre: m[1].trim(), cantidad: Number(m[2]) });
    }
    return items;
}

app.put('/api/pedidos/cancelar', async (req, res) => {
    const { idPedido, correo } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const r = await client.query(
            `SELECT idpedido, cliente, correocliente, productos, estado, detalle
             FROM pedidos WHERE idpedido = $1 FOR UPDATE`,
            [idPedido]
        );

        if (r.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        const pedido = r.rows[0];
        if (String(pedido.correocliente).toLowerCase() !== String(correo || '').toLowerCase()) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Este pedido no te pertenece.' });
        }

        if (pedido.estado !== 'pendiente') {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Solo se pueden cancelar pedidos en estado pendiente.' });
        }

        for (const art of leerArticulos(pedido)) {
            if (art.nombre && Number.isSafeInteger(art.cantidad) && art.cantidad > 0) {
                await devolverStock(client, art.nombre, art.cantidad);
            }
        }

        await client.query(
            `UPDATE pedidos SET estado = 'cancelado', fecha_estado = $1 WHERE idpedido = $2`,
            [Date.now(), idPedido]
        );

        const idAlertaRes = await client.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM alertassistema');
        const nextAlertaId = Number(idAlertaRes.rows[0].next_id) || 1;

        await client.query(
            `INSERT INTO alertassistema (id, roldestino, mensaje, emailusuario, generadopor)
             VALUES ($1, 'admin', $2, NULL, $3)`,
            [
                nextAlertaId,
                `El cliente ${pedido.cliente} canceló su pedido ${idPedido}.`,
                pedido.correocliente
            ]
        );

        await client.query('COMMIT');
        res.json({ exito: true });
    } catch (error) {
        try { await client.query('ROLLBACK'); } catch (e) {}
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

app.post('/api/admin/nuevo-producto', async (req, res) => {
    const { nombre, precio, descripcion, stock, imagen } = req.body;
    try {
        const idNuevo = Date.now() % 1000000;
        await pool.query(
            `INSERT INTO producto (id_producto, nombre, id_proveedor, descripcion, precio, stock, imagen)
             VALUES ($1, $2, 1, $3, $4, $5, $6)`,
            [idNuevo, nombre, descripcion, Number(precio) || 0, Number(stock) || 0, imagen]
        );
        res.status(201).json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/actualizar-producto', async (req, res) => {
    const { id, nombre, precio, descripcion, stock } = req.body;
    try {
        await pool.query(
            `UPDATE producto
             SET nombre = $1, precio = $2, descripcion = $3, stock = $4
             WHERE id_producto = $5`,
            [nombre, Number(precio) || 0, descripcion, Number(stock) || 0, id]
        );
        res.json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/nuevo-oferta', async (req, res) => {
    const { nombre, precio, descripcion, detalles, imagen, componentesOferta } = req.body;
    try {
        const componentesJson = componentesOferta ? JSON.stringify(componentesOferta) : null;
        const idRes = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM contenido_inicio');
        const nextId = Number(idRes.rows[0].next_id) || 1;

        await pool.query(
            `INSERT INTO contenido_inicio
             (id, tipo, nombre, precio, descripcion, detalles, imagen, componentes_oferta)
             VALUES ($1, 'oferta', $2, $3, $4, $5, $6, $7)`,
            [nextId, nombre, Number(precio) || 0, descripcion, detalles, imagen, componentesJson]
        );

        res.status(201).json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/nuevo-favorito', async (req, res) => {
    const { nombre, precio, imagen } = req.body;
    try {
        const idRes = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM contenido_inicio');
        const nextId = Number(idRes.rows[0].next_id) || 1;

        await pool.query(
            `INSERT INTO contenido_inicio (id, tipo, nombre, precio, imagen)
             VALUES ($1, 'favorito', $2, $3, $4)`,
            [nextId, nombre, Number(precio) || 0, imagen]
        );
        res.status(201).json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/nuevo-banner', async (req, res) => {
    const { nombre, imagen } = req.body;
    try {
        const idRes = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM banners');
        const nextId = Number(idRes.rows[0].next_id) || 1;

        await pool.query(
            'INSERT INTO banners (id, nombre, imagen) VALUES ($1, $2, $3)',
            [nextId, nombre, imagen]
        );
        res.status(201).json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/contenido-inicio', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM contenido_inicio ORDER BY id ASC');
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/banners', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM banners ORDER BY id ASC');
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/eliminar-contenido', async (req, res) => {
    const { id } = req.body;
    try {
        await pool.query('DELETE FROM contenido_inicio WHERE id = $1', [id]);
        res.json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/eliminar-banner', async (req, res) => {
    const { id } = req.body;
    try {
        await pool.query('DELETE FROM banners WHERE id = $1', [id]);
        res.json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/eliminar-producto', async (req, res) => {
    const { id } = req.body;
    try {
        await pool.query('DELETE FROM producto WHERE id_producto = $1', [id]);
        res.json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/alertas/crear', async (req, res) => {
    const { rolDestino, mensaje, emailUsuario, generadoPor } = req.body;
    try {
        const idRes = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM alertassistema');
        const nextId = Number(idRes.rows[0].next_id) || 1;

        await pool.query(
            `INSERT INTO alertassistema (id, roldestino, mensaje, emailusuario, generadopor)
             VALUES ($1, $2, $3, $4, $5)`,
            [nextId, rolDestino, mensaje, emailUsuario || null, generadoPor || null]
        );
        res.json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/foro', async (req, res) => {
    try {
        const comentarios = await pool.query('SELECT * FROM forocomentarios ORDER BY timestamp DESC');
        const respuestas = await pool.query('SELECT * FROM fororespuestas ORDER BY timestamp ASC');
        const foroCompleto = comentarios.rows.map(c => ({
            ...c,
            respuestas: respuestas.rows
                .filter(r => Number(r.idpadre) === Number(c.id))
                .map(r => ({ ...r, idPadre: r.idpadre }))
        }));
        res.json(foroCompleto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/foro/comentario', async (req, res) => {
    const { id, nombre, tema, estrellas, mensaje, timestamp, foto } = req.body;
    try {
        await pool.query(
            `INSERT INTO forocomentarios (id, nombre, tema, estrellas, mensaje, timestamp, foto)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, nombre, tema, Number(estrellas) || 0, mensaje, timestamp, foto]
        );
        res.status(201).json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/foro/respuesta', async (req, res) => {
    const { id, idPadre, nombre, mensaje, timestamp, foto } = req.body;
    try {
        await pool.query(
            `INSERT INTO fororespuestas (id, idpadre, nombre, mensaje, timestamp, foto)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, idPadre, nombre, mensaje, timestamp, foto]
        );
        res.status(201).json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/foro/comentario', async (req, res) => {
    const { id } = req.body;
    try {
        await pool.query('DELETE FROM fororespuestas WHERE idpadre = $1', [id]);
        await pool.query('DELETE FROM forocomentarios WHERE id = $1', [id]);
        res.json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/personalizados', async (req, res) => {
    try {
        const r = await pool.query(
            `SELECT id, folio, cliente, telefono, tipo, descripcion, foto_referencia,
                    precio, anticipo, fecha_orden, fecha_entrega, estado
             FROM pedidospersonalizados
             WHERE COALESCE(oculto_admin, 0) = 0
             ORDER BY fecha_entrega ASC, id DESC`
        );
        res.json(r.rows.map(p => ({
            ...p,
            precio: Number(p.precio),
            anticipo: Number(p.anticipo),
            fecha_orden: Number(p.fecha_orden)
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/personalizados', async (req, res) => {
    const { cliente, telefono, tipo, descripcion, foto_referencia, precio, anticipo, fecha_entrega, estado } = req.body;
    try {
        const folio = 'PERS-' + Math.floor(1000 + Math.random() * 9000);
        const ahora = Date.now();
        const idRes = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM pedidospersonalizados');
        const nextId = Number(idRes.rows[0].next_id) || 1;

        await pool.query(
            `INSERT INTO pedidospersonalizados
             (id, folio, cliente, telefono, tipo, descripcion, foto_referencia, precio, anticipo, fecha_orden, fecha_entrega, estado, oculto_admin)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 0)`,
            [
                nextId,
                folio,
                cliente,
                telefono || '',
                tipo,
                descripcion,
                foto_referencia || null,
                Number(precio) || 0,
                Number(anticipo) || 0,
                ahora,
                fecha_entrega,
                estado || 'pendiente'
            ]
        );

        res.status(201).json({ exito: true, folio });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/personalizados/estado', async (req, res) => {
    const { id, estado } = req.body;
    try {
        await pool.query(
            'UPDATE pedidospersonalizados SET estado = $1 WHERE id = $2',
            [estado, id]
        );
        res.json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/sucursales', async (req, res) => {
    try {
        const r = await pool.query('SELECT id, nombre, estado, latitud, longitud, info FROM sucursales ORDER BY id ASC');
        res.json(r.rows.map(s => ({
            ...s,
            latitud: Number(s.latitud),
            longitud: Number(s.longitud)
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sucursales', async (req, res) => {
    const { nombre, estado, latitud, longitud, info } = req.body;
    try {
        const idRes = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM sucursales');
        const nextId = Number(idRes.rows[0].next_id) || 1;

        await pool.query(
            'INSERT INTO sucursales (id, nombre, estado, latitud, longitud, info) VALUES ($1, $2, $3, $4, $5, $6)',
            [nextId, nombre, estado, Number(latitud), Number(longitud), info]
        );
        res.status(201).json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/sucursales', async (req, res) => {
    const { id, nombre, estado, latitud, longitud, info } = req.body;
    try {
        await pool.query(
            `UPDATE sucursales
             SET nombre = $1, estado = $2, latitud = $3, longitud = $4, info = $5
             WHERE id = $6`,
            [nombre, estado, Number(latitud), Number(longitud), info, parseInt(id, 10)]
        );
        res.json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/sucursales', async (req, res) => {
    const { id } = req.body;
    try {
        await pool.query('DELETE FROM sucursales WHERE id = $1', [parseInt(id, 10)]);
        res.json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/contabilidad/gastos', async (req, res) => {
    try {
        const r = await pool.query('SELECT id, concepto, categoria, monto, fecha FROM contabilidadgastos ORDER BY fecha DESC');
        res.json(r.rows.map(g => ({
            ...g,
            fecha: Number(g.fecha),
            monto: Number(g.monto)
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/contabilidad/gastos', async (req, res) => {
    const { concepto, categoria, monto } = req.body;
    try {
        const idRes = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM contabilidadgastos');
        const nextId = Number(idRes.rows[0].next_id) || 1;

        await pool.query(
            'INSERT INTO contabilidadgastos (id, concepto, categoria, monto, fecha) VALUES ($1, $2, $3, $4, $5)',
            [nextId, concepto, categoria, Number(monto), Date.now()]
        );
        res.status(201).json({ exito: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`SERVIDOR DULCE ALQUIMIA CORRIENDO EN EL PUERTO ${PORT}`);
});