const sql = require('mssql');
const fs = require('fs');

const configSql = {
    user: 'sa',
    password: '12345',
    server: '127.0.0.1',
    database: 'Dulce Alquimia',
    options: { encrypt: false, trustServerCertificate: true }
};

const tablas = [
    'Producto', 'Usuarios', 'Pedidos', 'Contenido_Inicio', 'Banners',
    'AlertasSistema', 'ForoComentarios', 'ForoRespuestas',
    'PedidosPersonalizados', 'Sucursales', 'ContabilidadGastos'
];

async function exportar() {
    const pool = await sql.connect(configSql);
    const respaldo = {};
    for (const tabla of tablas) {
        try {
            const res = await pool.request().query(`SELECT * FROM dbo.${tabla}`);
            respaldo[tabla] = res.recordset;
            console.log(`✅ ${tabla}: ${res.recordset.length} registros`);
        } catch (e) {
            console.log(`⚠️ ${tabla}: ${e.message}`);
        }
    }
    fs.writeFileSync('respaldo_datos.json', JSON.stringify(respaldo, null, 2));
    console.log('Listo: respaldo_datos.json creado.');
    process.exit(0);
}

exportar();