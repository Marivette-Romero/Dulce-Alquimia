const API_BASE = window.location.protocol === 'file:'
    ? 'http://127.0.0.1:3000'
    : window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
    try {
        verificarSesionUsuario();
    } catch (error) {
        console.error('Error en barra de usuario:', error);
    }
    inicializarBuscador();
    inicializarEventosBotonesCatalogo();
    const path = window.location.pathname;
    if (path.includes('Dulce_Alquimia.html') || path === '/' || path.includes('index.html')) {
        cargarElementosInicioDinamicos();
        inicializarCarruseles();
    }
    if (path.includes('catalogo.html')) {
        cargarProductosDesdeBD();
    }
    if (path.includes('Carrito.html')) {
        renderizarCarrito();
    }
    if (path.includes('Login.html')) {
        inicializarLogin();
    }
    if (path.includes('Regristrese.html')) {
        inicializarRegistro();
    }
    if (path.includes('sucursales.html')) {
        inicializarMapa();
    }
    if (path.includes('Perfil.html')) {
        inicializarPerfil();
    }
    if (path.includes('Foro.html')) {
        inicializarForoComunidad();
    }
});

function inicializarPerfil() {
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioAlquimia'));

    if (!usuarioLogueado) {
        window.location.href = 'Login.html';
        return;
    }

    const inputNombre = document.getElementById('nombre-perfil');
    const inputCorreo = document.getElementById('correo-perfil');
    const btnGuardar = document.querySelector('.btn-guardar');
    const btnLogout = document.getElementById('btn-cerrar-sesion');
    const btnEliminar = document.getElementById('btn-eliminar-cuenta');
    const zonaFoto = document.getElementById('zona-foto-perfil');
    const inputArchivo = document.getElementById('input-archivo-foto');
    const avatarIcono = document.getElementById('avatar-icono');
    const avatarImagen = document.getElementById('avatar-imagen');

    const correoReal = usuarioLogueado.email || usuarioLogueado.correo;

    if (inputNombre && inputCorreo) {
        inputNombre.value = usuarioLogueado.nombre || '';
        inputCorreo.value = correoReal || '';
    }

    let grupoPass = document.getElementById('grupo-pass-perfil');
    if (!grupoPass && inputCorreo) {
        grupoPass = document.createElement('div');
        grupoPass.id = 'grupo-pass-perfil';
        grupoPass.style.cssText = 'margin-top:15px; margin-bottom:15px;';
        grupoPass.innerHTML = `
            <label style="font-size:12px; font-weight:bold; color:#5d4037; display:block; margin-bottom:4px;">
                Nueva contraseña (Opcional):
            </label>
            <input type="password" id="pass-perfil" placeholder="Escribe una nueva contraseña si deseas cambiarla"
                style="width:100%; padding:9px 12px; border:1px solid #ddd; border-radius:6px; box-sizing:border-box; font-family:'Montserrat';">
        `;
        inputCorreo.closest('div')?.insertAdjacentElement('afterend', grupoPass);
    }

    const fotoGuardada = localStorage.getItem('fotoPerfilAlquimia');

    if (fotoGuardada) {
        if (avatarIcono) avatarIcono.style.display = 'none';

        if (avatarImagen) {
            avatarImagen.src = fotoGuardada;
            avatarImagen.style.display = 'block';
        }
    }

    const esAdmin = correoReal === 'marivetteromero.1603@gmail.com';
    const tarjeta = document.querySelector('.tarjeta-perfil');

    if (esAdmin && tarjeta && !document.getElementById('panel-control-admin')) {
        const h2Bienvenida = tarjeta.querySelector('h2');

        if (h2Bienvenida) {
            h2Bienvenida.innerHTML =
                `¡Bienvenido Admin! <span class="badge-admin-verificado">Verified Admin</span>`;
        }

        const panelHTML = document.createElement('div');
        panelHTML.id = 'panel-control-admin';
        panelHTML.style.cssText =
            'background:#fffbfb;border:2px dashed #C5A447;border-radius:12px;' +
            'padding:20px;margin-top:25px;font-family:"Montserrat",sans-serif;';

        panelHTML.innerHTML = `
            <h3 style="color:#C5A447;margin-top:0;display:flex;align-items:center;gap:8px;">
                <span class="material-icons">admin_panel_settings</span> Panel de Contenido
            </h3>

            <p style="font-size:12px;color:#5d4037;margin-bottom:15px;">
                Elige la acción que deseas hacer:
            </p>

            <div style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">
                <button type="button" id="btn-tab-prod"
                    style="background:#5d4037;color:white;border:none;padding:8px 12px;border-radius:15px;cursor:pointer;font-size:11px;font-weight:bold;">
                    + Nuevo Producto
                </button>

                <button type="button" id="btn-tab-oferta"
                    style="background:#ff69b4;color:white;border:none;padding:8px 12px;border-radius:15px;cursor:pointer;font-size:11px;font-weight:bold;">
                    + Nueva Oferta
                </button>

                <button type="button" id="btn-tab-fav"
                    style="background:#C5A447;color:white;border:none;padding:8px 12px;border-radius:15px;cursor:pointer;font-size:11px;font-weight:bold;">
                    + Nuevo Favorito
                </button>

                <button type="button" id="btn-tab-banner"
                    style="background:#007bff;color:white;border:none;padding:8px 12px;border-radius:15px;cursor:pointer;font-size:11px;font-weight:bold;">
                    + Nuevo Banner
                </button>
            </div>

            <form id="form-admin-cms" style="display:flex;flex-direction:column;gap:12px;">
                <input type="hidden" id="cms-tipo" value="producto">

                <div>
                    <label id="lbl-cms-nombre"
                        style="font-size:12px;font-weight:bold;color:#5d4037;display:block;margin-bottom:4px;">
                        Nombre del Producto:
                    </label>
                    <input type="text" id="cms-nombre" required
                        style="width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;font-family:'Montserrat';">
                </div>

                <div id="cms-bloque-valores" style="display:flex;gap:10px;">
                    <div style="flex:1;">
                        <label style="font-size:12px;font-weight:bold;color:#5d4037;display:block;margin-bottom:4px;">
                            Precio ($):
                        </label>
                        <input type="number" id="cms-precio" step="0.01" min="0" value="0.00"
                            style="width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;font-family:'Montserrat';">
                    </div>

                    <div id="cms-contenedor-stock" style="flex:1;">
                        <label style="font-size:12px;font-weight:bold;color:#5d4037;display:block;margin-bottom:4px;">
                            Stock Inicial:
                        </label>
                        <input type="number" id="cms-stock" min="0" step="1" value="15"
                            style="width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;font-family:'Montserrat';">
                    </div>
                </div>

                <div id="cms-contenedor-detalles" style="display:flex;gap:10px;">
                    <div style="flex:1;">
                        <label style="font-size:12px;font-weight:bold;color:#5d4037;display:block;margin-bottom:4px;">
                            Detalle de Porciones:
                        </label>
                        <input type="text" id="cms-detalles"
                            placeholder="Ej: 1 pieza o 12 porciones"
                            style="width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;font-family:'Montserrat';">
                    </div>
                </div>

                <div id="cms-contenedor-desc">
                    <label style="font-size:12px;font-weight:bold;color:#5d4037;display:block;margin-bottom:4px;">
                        Descripción:
                    </label>
                    <textarea id="cms-descripcion"
                        style="width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:6px;height:60px;box-sizing:border-box;resize:none;font-family:'Montserrat';"></textarea>
                </div>

                <div id="cms-contenedor-componentes-oferta"
                    style="display:none;background:#fff5f8;padding:15px;border-radius:10px;border:1px solid #ffb6c1;box-shadow:0 2px 5px rgba(255,105,180,0.08);">

                    <label style="font-size:12px;font-weight:bold;color:#5d4037;display:block;margin-bottom:8px;">
                        ¿Cuántos productos diferentes incluye esta oferta?
                    </label>

                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <button type="button" id="btn-menos-comp"
                            style="background:#ff69b4;color:white;border:none;width:32px;height:32px;border-radius:6px;font-weight:bold;cursor:pointer;">
                            -
                        </button>

                        <span id="num-componentes-txt"
                            style="font-weight:bold;font-size:15px;color:#5d4037;min-width:20px;text-align:center;">
                            1
                        </span>

                        <button type="button" id="btn-mas-comp"
                            style="background:#ff69b4;color:white;border:none;width:32px;height:32px;border-radius:6px;font-weight:bold;cursor:pointer;">
                            +
                        </button>
                    </div>

                    <div id="lista-inputs-componentes"
                        style="display:flex;flex-direction:column;gap:10px;"></div>

                    <p id="cms-estado-inventario"
                        style="font-size:12px;color:#5d4037;margin-bottom:0;">
                        Selecciona productos del inventario.
                    </p>
                </div>

                <div>
                    <label style="font-size:12px;font-weight:bold;color:#5d4037;display:block;margin-bottom:4px;">
                        Imagen del Recurso:
                    </label>
                    <input type="file" id="cms-imagen" accept="image/*" required
                        style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;background:#fff;">
                </div>

                <button type="submit"
                    style="background:#2e8b57;color:white;border:none;padding:11px;border-radius:6px;font-weight:bold;width:100%;margin-top:5px;cursor:pointer;">
                    🚀 Guardar Contenido
                </button>
            </form>`;

        const divisor = tarjeta.querySelector('.divisor-perfil');

        if (divisor) {
            divisor.insertAdjacentElement('beforebegin', panelHTML);
        } else {
            tarjeta.appendChild(panelHTML);
        }

        const formCms = document.getElementById('form-admin-cms');
        const cmsTipo = document.getElementById('cms-tipo');
        const lblNombre = document.getElementById('lbl-cms-nombre');
        const contenedorStock = document.getElementById('cms-contenedor-stock');
        const contenedorDesc = document.getElementById('cms-contenedor-desc');
        const contenedorDetalles = document.getElementById('cms-contenedor-detalles');
        const bloqueValores = document.getElementById('cms-bloque-valores');
        const contenedorComponentes = document.getElementById('cms-contenedor-componentes-oferta');
        const listaComponentes = document.getElementById('lista-inputs-componentes');
        const estadoInventario = document.getElementById('cms-estado-inventario');
        const inputStock = document.getElementById('cms-stock');
        const inputPrecio = document.getElementById('cms-precio');

        let cantidadComponentes = 1;
        let productosInventario = [];
        let inventarioCargado = false;
        let cargandoInventario = false;

        async function cargarProductosInventario() {
            cargandoInventario = true;
            inventarioCargado = false;

            if (estadoInventario) {
                estadoInventario.textContent = 'Consultando inventario...';
            }

            try {
                const respuesta = await fetch(`${API_BASE}/api/productos`);

                if (!respuesta.ok) {
                    throw new Error(`Error HTTP ${respuesta.status}`);
                }

                const datos = await respuesta.json();

                if (!Array.isArray(datos)) {
                    throw new Error('La respuesta no es una lista de productos.');
                }

                productosInventario = datos
                    .filter(p =>
                        p.Nombre &&
                        p.Stock !== null &&
                        p.Stock !== undefined &&
                        Number.isFinite(Number(p.Stock)) &&
                        Number(p.Stock) >= 0
                    )
                    .map(p => ({
                        nombre: String(p.Nombre).trim(),
                        stock: Math.floor(Number(p.Stock))
                    }))
                    .filter(p => p.nombre !== '');

                inventarioCargado = true;

                if (estadoInventario) {
                    estadoInventario.textContent = productosInventario.length
                        ? 'El stock mostrado corresponde a la última consulta del inventario.'
                        : 'No se encontraron productos válidos.';
                }

                renderizarCamposComponentes();
            } catch (error) {
                inventarioCargado = false;
                console.error('Error al cargar productos:', error);

                if (estadoInventario) {
                    estadoInventario.textContent =
                        'No se pudo cargar el inventario. Comprueba que el servidor esté activo.';
                }

                if (typeof mostrarMensajeWeb === 'function') {
                    mostrarMensajeWeb('❌ No se pudo cargar el inventario.', 'error');
                }
            } finally {
                cargandoInventario = false;
            }
        }

        function renderizarCamposComponentes() {
            listaComponentes.innerHTML = '';

            for (let i = 0; i < cantidadComponentes; i++) {
                const fila = document.createElement('div');

                fila.style.cssText =
                    'display:flex;gap:12px;align-items:center;background:#fff;' +
                    'padding:10px 12px;border-radius:8px;border:1px solid #e0d0d5;';

                fila.innerHTML = `
                    <div style="flex:2;min-width:0;">
                        <label style="font-size:11px;font-weight:bold;color:#5d4037;display:block;margin-bottom:3px;">
                            Producto y stock:
                        </label>
                        <select class="comp-nombre-prod" required
                            style="width:100%;padding:7px 10px;border:1px solid #ccc;border-radius:5px;font-size:12px;box-sizing:border-box;font-family:'Montserrat';">
                        </select>
                    </div>

                    <div style="flex:1;text-align:center;">
                        <label style="font-size:11px;font-weight:bold;color:#5d4037;display:block;margin-bottom:3px;">
                            Piezas:
                        </label>
                        <div style="display:flex;align-items:center;justify-content:center;gap:6px;">
                            <button type="button" class="btn-sub-pza"
                                style="background:#ff69b4;color:white;border:none;width:26px;height:26px;border-radius:4px;cursor:pointer;font-weight:bold;">
                                -
                            </button>
                            <span class="comp-valor-pzas"
                                style="font-size:13px;font-weight:bold;min-width:18px;color:#5d4037;">
                                1
                            </span>
                            <button type="button" class="btn-add-pza"
                                style="background:#ff69b4;color:white;border:none;width:26px;height:26px;border-radius:4px;cursor:pointer;font-weight:bold;">
                                +
                            </button>
                        </div>
                    </div>
                `;

                listaComponentes.appendChild(fila);

                const selector = fila.querySelector('.comp-nombre-prod');
                const spanPiezas = fila.querySelector('.comp-valor-pzas');
                const btnMenos = fila.querySelector('.btn-sub-pza');
                const btnMas = fila.querySelector('.btn-add-pza');

                const opcionInicial = document.createElement('option');
                opcionInicial.value = '';
                opcionInicial.textContent = inventarioCargado
                    ? 'Selecciona un producto'
                    : 'Inventario no cargado';
                opcionInicial.disabled = true;
                opcionInicial.selected = true;
                selector.appendChild(opcionInicial);

                if (inventarioCargado) {
                    productosInventario.forEach(producto => {
                        const opcion = document.createElement('option');
                        opcion.value = producto.nombre;
                        opcion.textContent =
                            `${producto.nombre} — Stock: ${producto.stock}`;
                        opcion.dataset.stock = String(producto.stock);
                        opcion.disabled = producto.stock <= 0;
                        selector.appendChild(opcion);
                    });
                }

                function obtenerStock() {
                    const opcion = selector.selectedOptions[0];
                    return opcion && opcion.value
                        ? Number(opcion.dataset.stock)
                        : 0;
                }

                btnMenos.onclick = () => {
                    const actual = Number(spanPiezas.textContent) || 1;

                    if (actual > 1) {
                        spanPiezas.textContent = String(actual - 1);
                    }
                };

                btnMas.onclick = () => {
                    if (!selector.value) {
                        mostrarMensajeWeb('⚠️ Selecciona un producto primero.', 'error');
                        return;
                    }

                    const stock = obtenerStock();
                    const actual = Number(spanPiezas.textContent) || 1;

                    if (actual >= stock) {
                        mostrarMensajeWeb(
                            `⚠️ Stock disponible: ${stock} pieza(s).`,
                            'error'
                        );
                        return;
                    }

                    spanPiezas.textContent = String(actual + 1);
                };
            }
        }

        document.getElementById('btn-menos-comp').onclick = () => {
            if (cantidadComponentes > 1) {
                cantidadComponentes--;
                document.getElementById('num-componentes-txt').textContent =
                    String(cantidadComponentes);
                renderizarCamposComponentes();
            }
        };

        document.getElementById('btn-mas-comp').onclick = () => {
            if (cantidadComponentes < 5) {
                cantidadComponentes++;
                document.getElementById('num-componentes-txt').textContent =
                    String(cantidadComponentes);
                renderizarCamposComponentes();
            }
        };

        document.getElementById('btn-tab-prod').onclick = () => {
            cmsTipo.value = 'producto';
            lblNombre.textContent = 'Nombre del Producto:';
            contenedorStock.style.display = 'block';
            contenedorDesc.style.display = 'block';
            contenedorDetalles.style.display = 'none';
            bloqueValores.style.display = 'flex';
            contenedorComponentes.style.display = 'none';
            document.getElementById('cms-nombre').required = true;
            inputStock.required = true;
        };

        document.getElementById('btn-tab-oferta').onclick = async () => {
            cmsTipo.value = 'oferta';
            lblNombre.textContent = 'Nombre de la Oferta de Temporada:';
            contenedorStock.style.display = 'none';
            contenedorDesc.style.display = 'block';
            contenedorDetalles.style.display = 'flex';
            bloqueValores.style.display = 'flex';
            contenedorComponentes.style.display = 'block';
            inputStock.required = false;

            await cargarProductosInventario();
        };

        document.getElementById('btn-tab-fav').onclick = () => {
            cmsTipo.value = 'favorito';
            lblNombre.textContent = 'Nombre del Favorito de la Casa:';
            contenedorStock.style.display = 'none';
            contenedorDesc.style.display = 'none';
            contenedorDetalles.style.display = 'none';
            bloqueValores.style.display = 'flex';
            contenedorComponentes.style.display = 'none';
            inputStock.required = false;
        };

        document.getElementById('btn-tab-banner').onclick = () => {
            cmsTipo.value = 'banner';
            lblNombre.textContent = 'Nombre identificador del Banner:';
            contenedorStock.style.display = 'none';
            contenedorDesc.style.display = 'none';
            contenedorDetalles.style.display = 'none';
            bloqueValores.style.display = 'none';
            contenedorComponentes.style.display = 'none';
            inputStock.required = false;
        };

        formCms.onsubmit = async (e) => {
            e.preventDefault();

            const tipo = cmsTipo.value;
            const nombre = document.getElementById('cms-nombre').value.trim();
            const precio = Number(inputPrecio.value);
            const descripcion = document.getElementById('cms-descripcion').value.trim();
            const detalles = document.getElementById('cms-detalles').value.trim();
            const stock = Number(inputStock.value);

            if (!nombre) {
                mostrarMensajeWeb('⚠️ Escribe un nombre.', 'error');
                return;
            }

            if (tipo !== 'banner' && (!Number.isFinite(precio) || precio < 0)) {
                mostrarMensajeWeb('⚠️ Introduce un precio válido.', 'error');
                return;
            }

            if (tipo === 'producto' &&
                (!Number.isInteger(stock) || stock < 0)) {
                mostrarMensajeWeb('⚠️ Introduce un stock inicial válido.', 'error');
                return;
            }

            let componentesOferta = [];

            if (tipo === 'oferta') {
                if (!inventarioCargado || cargandoInventario) {
                    mostrarMensajeWeb(
                        '⚠️ Espera a que se cargue el inventario antes de guardar.',
                        'error'
                    );
                    return;
                }

                const cantidades = new Map();

                for (const fila of listaComponentes.children) {
                    const selector = fila.querySelector('.comp-nombre-prod');
                    const spanPiezas = fila.querySelector('.comp-valor-pzas');

                    if (!selector || !selector.value || !spanPiezas) {
                        mostrarMensajeWeb(
                            '⚠️ Selecciona un producto en cada fila.',
                            'error'
                        );
                        return;
                    }

                    const producto = productosInventario.find(
                        p => p.nombre === selector.value
                    );

                    const piezas = Number(spanPiezas.textContent);

                    if (!producto || !Number.isInteger(piezas) || piezas < 1) {
                        mostrarMensajeWeb(
                            '⚠️ Comprueba el producto y la cantidad de piezas.',
                            'error'
                        );
                        return;
                    }

                    const total = (cantidades.get(producto.nombre) || 0) + piezas;

                    if (total > producto.stock) {
                        mostrarMensajeWeb(
                            `⚠️ Stock insuficiente de ${producto.nombre}. ` +
                            `Disponible: ${producto.stock}; solicitado: ${total}.`,
                            'error'
                        );
                        return;
                    }

                    cantidades.set(producto.nombre, total);
                }

                if (cantidades.size === 0) {
                    mostrarMensajeWeb(
                        '⚠️ Añade al menos un producto a la oferta.',
                        'error'
                    );
                    return;
                }

                componentesOferta = Array.from(
                    cantidades,
                    ([nombreProducto, piezas]) => ({
                        nombreProducto,
                        piezas
                    })
                );
            }

            const archivoImagen = document.getElementById('cms-imagen').files[0];

            if (!archivoImagen) {
                mostrarMensajeWeb('⚠️ Selecciona una imagen.', 'error');
                return;
            }

            if (!archivoImagen.type.startsWith('image/')) {
                mostrarMensajeWeb('⚠️ El archivo debe ser una imagen.', 'error');
                return;
            }

            lanzarNotificacionFlotanteIzquierda(
                `📡 Sincronizando nuevo ${tipo} con la base de datos...`
            );

            const lector = new FileReader();

            lector.onload = async function(evento) {
                const imagenBase64 = evento.target.result;

                const urlEndpoint = tipo === 'banner'
                    ? `${API_BASE}/api/admin/nuevo-banner`
                    : `${API_BASE}/api/admin/nuevo-${tipo}`;

                try {
                    const res = await fetch(urlEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nombre,
                            precio,
                            descripcion,
                            detalles,
                            stock,
                            imagen: imagenBase64,
                            componentesOferta
                        })
                    });

                    if (res.ok) {
                        mostrarMensajeWeb(
                            `✨ ¡${tipo.toUpperCase()} guardado con éxito!`,
                            'exito'
                        );

                        formCms.reset();

                        if (tipo === 'oferta') {
                            cantidadComponentes = 1;
                            document.getElementById('num-componentes-txt').textContent = '1';
                            await cargarProductosInventario();
                        }
                    } else {
                        const mensaje = await res.text().catch(() => '');
                        console.error('Error al guardar contenido:', res.status, mensaje);
                        mostrarMensajeWeb(
                            '❌ El servidor no pudo guardar el contenido. Revisa la consola.',
                            'error'
                        );
                    }
                } catch (err) {
                    console.error('Error de conexión:', err);
                    mostrarMensajeWeb('❌ Error de conexión con el servidor.', 'error');
                }
            };

            lector.onerror = () => {
                mostrarMensajeWeb('❌ No se pudo leer la imagen.', 'error');
            };

            lector.readAsDataURL(archivoImagen);
        };
    }

    if (zonaFoto && inputArchivo) {
        zonaFoto.onclick = function() {
            inputArchivo.click();
        };

        inputArchivo.onchange = function(e) {
            const archivo = e.target.files[0];
            if (!archivo) return;

            if (!archivo.type.startsWith('image/')) {
                alert('Por favor, selecciona un archivo de imagen válido.');
                return;
            }

            const lector = new FileReader();

            lector.onload = function(evento) {
                const imgOriginal = new Image();
                imgOriginal.src = evento.target.result;

                imgOriginal.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const MAX_ANCHO = 150;
                    const MAX_ALTO = 150;
                    let ancho = imgOriginal.width;
                    let alto = imgOriginal.height;

                    if (ancho > alto) {
                        if (ancho > MAX_ANCHO) {
                            alto *= MAX_ANCHO / ancho;
                            ancho = MAX_ANCHO;
                        }
                    } else if (alto > MAX_ALTO) {
                        ancho *= MAX_ALTO / alto;
                        alto = MAX_ALTO;
                    }

                    canvas.width = ancho;
                    canvas.height = alto;
                    ctx.drawImage(imgOriginal, 0, 0, ancho, alto);

                    const imagenComprimidaBase64 =
                        canvas.toDataURL('image/jpeg', 0.7);

                    const imgElemento = document.getElementById('avatar-imagen');
                    const iconoElemento = document.getElementById('avatar-icono');

                    if (imgElemento && iconoElemento) {
                        iconoElemento.style.setProperty('display', 'none', 'important');
                        imgElemento.src = imagenComprimidaBase64;
                        imgElemento.style.setProperty('display', 'block', 'important');
                    }

                    localStorage.setItem(
                        'fotoPerfilAlquimia',
                        imagenComprimidaBase64
                    );
                };
            };

            lector.readAsDataURL(archivo);
        };
    }

    if (btnGuardar) {
        btnGuardar.onclick = async (e) => {
            e.preventDefault();

            const nuevoNombre = inputNombre.value.trim();
            const nuevaPass = document.getElementById('pass-perfil') ? document.getElementById('pass-perfil').value.trim() : '';
            if (!nuevoNombre) return;

            usuarioLogueado.nombre = nuevoNombre;

            localStorage.setItem(
                'usuarioAlquimia',
                JSON.stringify(usuarioLogueado)
            );

            const fotoActual = localStorage.getItem('fotoPerfilAlquimia') || null;

            try {
                await fetch(`${API_BASE}/api/perfil/actualizar`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: correoReal,
                        nombre: nuevoNombre,
                        contrasena: nuevaPass,
                        foto: fotoActual
                    })
                });

                mostrarMensajeWeb('🔄 ¡Datos y contraseña actualizados! ✨', 'exito');
                if (document.getElementById('pass-perfil')) document.getElementById('pass-perfil').value = '';
            } catch (error) {
                mostrarMensajeWeb('🔄 Cambios guardados localmente.', 'exito');
            }

            verificarSesionUsuario();
        };
    }

    if (btnLogout) {
        btnLogout.onclick = () => {
            if (confirm('¿Cerrar sesión?')) {
                localStorage.removeItem('usuarioAlquimia');
                localStorage.removeItem('fotoPerfilAlquimia');
                window.location.href = 'Dulce_Alquimia.html';
            }
        };
    }

    if (btnEliminar) {
        btnEliminar.onclick = async () => {
            if (confirm(
                '⚠ ¿Estás completamente segura de que deseas borrar tu cuenta? Esta acción no se puede deshacer.'
            )) {
                try {
                    const res = await fetch(`${API_BASE}/api/perfil/eliminar`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: correoReal })
                    });

                    if (res.ok) {
                        mostrarMensajeWeb(
                            '🗑️ Tu cuenta ha sido eliminada correctamente.',
                            'error'
                        );

                        localStorage.removeItem('usuarioAlquimia');
                        localStorage.removeItem('fotoPerfilAlquimia');
                        localStorage.removeItem('carritoAlquimia');
                        localStorage.removeItem('ultimaAlerta_cliente');
                        localStorage.removeItem('ultimaAlerta_admin');

                        setTimeout(() => {
                            window.location.href = 'Dulce_Alquimia.html';
                        }, 1500);
                    } else {
                        mostrarMensajeWeb(
                            '❌ Error al intentar eliminar la cuenta del servidor.',
                            'error'
                        );
                    }
                } catch (error) {
                    mostrarMensajeWeb(
                        '❌ Error de conexión con el servidor.',
                        'error'
                    );
                }
            }
        };
    }
}

async function cargarElementosInicioDinamicos() {
    const seccionBanners = document.querySelector('.lanzamientos');
    const carruselOfertas = document.querySelector('.carrusel-productos');
    const carruselFavoritos = document.getElementById('carruselTrack');
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioAlquimia'));
    const esAdmin = usuarioLogueado && (
        usuarioLogueado.email === 'marivetteromero.1603@gmail.com' ||
        usuarioLogueado.correo === 'marivetteromero.1603@gmail.com'
    );

    const resolverRutaImagen = (rutaRaw, carpetaDefecto = 'Productos/') => {
        const limpia = String(rutaRaw || '').trim();
        if (!limpia) return `${carpetaDefecto}paydelimon.png`;
        if (/^(Productos\/|Banners\/|Diseño\/|\/|https?:|data:image)/i.test(limpia)) {
            return limpia;
        }
        return `${carpetaDefecto}${limpia}`;
    };

    if (seccionBanners) {
        try {
            const res = await fetch(`${API_BASE}/api/banners`);
            const bannersRaw = await res.json();
            const banners = (bannersRaw || []).filter(b => b.imagen && String(b.imagen).trim() !== '');

            if (banners.length > 0) {
                seccionBanners.innerHTML = '';
                const alturaBanner = '420px';

                if (banners.length === 1) {
                    const b = banners[0];
                    const bannerId = b.id || b.Id || b.ID;
                    const srcBanner = resolverRutaImagen(b.imagen, 'Banners/');
                    let botonBorrar = '';

                    if (esAdmin) {
                        botonBorrar = `
                            <button
                                class="btn-eliminar-banner"
                                onclick="eliminarRecursoInicio('banner', ${bannerId}, event)"
                                type="button"
                                title="Eliminar banner"
                                style="position: absolute; top: 15px; right: 15px; z-index: 10; background: #d9534f; color: white; border: none; padding: 8px; border-radius: 50%; cursor: pointer; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"
                            >
                                <span class="material-icons" style="color: white; font-size: 18px;">delete</span>
                            </button>`;
                    }

                    seccionBanners.style.cssText = 'position: relative; width: 100%; margin-top: 105px; overflow: hidden; display: block;';
                    seccionBanners.innerHTML = `
                        ${botonBorrar}
                        <img src="${srcBanner}" alt="${b.nombre || 'Banner'}" style="width: 100%; height: auto; display: block;">
                    `;
                } else {
                    seccionBanners.style.cssText = `position: relative; width: 100%; height: ${alturaBanner}; margin-top: 105px; overflow: hidden; display: block;`;

                    const trackBanners = document.createElement('div');
                    trackBanners.style.cssText = `display: flex; transition: transform 0.5s ease-in-out; width: ${banners.length * 100}%; height: 100%;`;

                    banners.forEach((b) => {
                        const bannerId = b.id || b.Id || b.ID;
                        const srcBanner = resolverRutaImagen(b.imagen, 'Banners/');
                        let botonBorrar = '';

                        if (esAdmin) {
                            botonBorrar = `
                                <button
                                    class="btn-eliminar-banner"
                                    onclick="eliminarRecursoInicio('banner', ${bannerId}, event)"
                                    type="button"
                                    title="Eliminar banner"
                                    style="position: absolute; top: 15px; right: 15px; z-index: 10; background: #d9534f; color: white; border: none; padding: 8px; border-radius: 50%; cursor: pointer; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"
                                >
                                    <span class="material-icons" style="color: white; font-size: 18px;">delete</span>
                                </button>`;
                        }

                        const contenedorBanner = document.createElement('div');
                        contenedorBanner.style.cssText = `position: relative; width: ${100 / banners.length}%; flex-shrink: 0; display: block; height: 100%;`;
                        contenedorBanner.innerHTML = `
                            ${botonBorrar}
                            <img src="${srcBanner}" alt="${b.nombre || 'Banner'}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                        `;
                        trackBanners.appendChild(contenedorBanner);
                    });
                    seccionBanners.appendChild(trackBanners);

                    const btnPrev = document.createElement('button');
                    btnPrev.className = 'btn-flecha prev-banner';
                    btnPrev.innerHTML = '&#10094;';
                    btnPrev.style.cssText = 'position: absolute; left: 15px; top: 50%; transform: translateY(-50%); z-index: 10; background: rgba(0,0,0,0.5); color: white; border: none; width: 40px; height: 40px; cursor: pointer; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;';

                    const btnNext = document.createElement('button');
                    btnNext.className = 'btn-flecha next-banner';
                    btnNext.innerHTML = '&#10095;';
                    btnNext.style.cssText = 'position: absolute; right: 15px; top: 50%; transform: translateY(-50%); z-index: 10; background: rgba(0,0,0,0.5); color: white; border: none; width: 40px; height: 40px; cursor: pointer; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;';

                    seccionBanners.appendChild(btnPrev);
                    seccionBanners.appendChild(btnNext);

                    let indiceBannerActual = 0;
                    const totalBanners = banners.length;

                    function actualizarPosicionBanner() {
                        trackBanners.style.transform = `translateX(-${indiceBannerActual * (100 / totalBanners)}%)`;
                    }

                    btnNext.onclick = (e) => {
                        e.preventDefault();
                        indiceBannerActual = (indiceBannerActual + 1) % totalBanners;
                        actualizarPosicionBanner();
                    };

                    btnPrev.onclick = (e) => {
                        e.preventDefault();
                        indiceBannerActual = (indiceBannerActual - 1 + totalBanners) % totalBanners;
                        actualizarPosicionBanner();
                    };

                    setInterval(() => {
                        indiceBannerActual = (indiceBannerActual + 1) % totalBanners;
                        actualizarPosicionBanner();
                    }, 5000);
                }
            }
        } catch (e) {
            console.log("Banners en modo estático:", e);
        }
    }

    if (carruselOfertas || carruselFavoritos) {
        try {
            const res = await fetch(`${API_BASE}/api/contenido-inicio`);
            const items = await res.json();

            if (carruselOfertas) {
                const ofertas = items.filter(i => i.tipo === 'oferta');
                if (ofertas.length > 0) {
                    carruselOfertas.innerHTML = '';
                    ofertas.forEach(o => {
                        const srcOferta = resolverRutaImagen(o.imagen, 'Productos/');
                        const tarjeta = document.createElement('div');
                        tarjeta.className = 'tarjeta-producto';
                        tarjeta.style.position = 'relative';
                        let botonBorrar = '';
                        let botonesCompraHTML = '';

                        if (esAdmin) {
                            botonBorrar = `<button onclick="eliminarRecursoInicio('contenido', ${o.id}, event)" style="position:absolute; top:10px; right:10px; z-index:10; background:#d9534f; color:white; border:none; padding:5px; border-radius:50%; cursor:pointer; width:32px; height:32px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.2);"><span class="material-icons" style="color:white; font-size:16px;">delete</span></button>`;
                        } else {
                            botonesCompraHTML = `
                                <div style="display:flex; gap:8px; margin-top:8px;">
                                    <button class="btn-pedir" data-nombre="${o.nombre}" data-precio="${o.precio}" data-imagen="${srcOferta}" style="padding:8px; font-size:11px; border-radius:15px; width:50%;">Pedir ahora</button>
                                    <button class="btn-agregar" data-nombre="${o.nombre}" data-precio="${o.precio}" data-imagen="${srcOferta}" style="padding:8px; font-size:11px; border-radius:15px; width:50%;">Agregar al Carrito</button>
                                </div>
                            `;
                        }

                        tarjeta.innerHTML = `
                            ${botonBorrar}
                            <div class="productoI"><img src="${srcOferta}" alt="${o.nombre}"></div>
                            <div class="producto-info">
                                <h3>${o.nombre}</h3>
                                <p class="descripcion">${o.descripcion}</p>
                                <div class="detalles-compra">
                                    <span class="piezas">${o.detalles}</span>
                                    <span class="precio">$${parseFloat(o.precio).toFixed(2)}</span>
                                </div>
                                ${botonesCompraHTML}
                            </div>`;
                        carruselOfertas.appendChild(tarjeta);
                    });
                }
            }

            if (carruselFavoritos) {
                const favoritos = items.filter(i => i.tipo === 'favorito');
                if (favoritos.length > 0) {
                    carruselFavoritos.innerHTML = '';
                    favoritos.forEach(f => {
                        const srcFav = resolverRutaImagen(f.imagen, 'Productos/');
                        const tarjetaFav = document.createElement('div');
                        tarjetaFav.className = 'carrusel-card';
                        tarjetaFav.style.position = 'absolute';
                        tarjetaFav.style.top = '0';
                        tarjetaFav.style.left = '0';
                        tarjetaFav.style.width = '100%';
                        tarjetaFav.style.height = '100%';
                        let botonBorrar = '';

                        if (esAdmin) {
                            botonBorrar = `<button onclick="eliminarRecursoInicio('contenido', ${f.id}, event)" style="position:absolute; top:10px; right:10px; z-index:10; background:#d9534f; color:white; border:none; padding:5px; border-radius:50%; cursor:pointer; width:32px; height:32px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.2);"><span class="material-icons" style="color:white; font-size:16px;">delete</span></button>`;
                        }

                        tarjetaFav.innerHTML = `
                            ${botonBorrar}
                            <img src="${srcFav}" alt="${f.nombre}">
                            <div>
                                <h3>${f.nombre}</h3>
                                <span class="precio">$${parseFloat(f.precio).toFixed(2)}</span>
                            </div>`;
                        carruselFavoritos.appendChild(tarjetaFav);
                    });

                    setTimeout(() => {
                        inicializarCarruseles();
                    }, 100);
                }
            }

        } catch (e) {
            console.log("Carruseles operando en modo estático:", e);
        }
    }
}

function inicializarCarruseles() {
    const carruselOfertas = document.querySelector('.carrusel-productos');
    if (carruselOfertas) {
        window.siguiente = () => carruselOfertas.scrollBy({ left: 340, behavior: 'smooth' });
        window.anterior = () => carruselOfertas.scrollBy({ left: -340, behavior: 'smooth' });
    }
    const track = document.getElementById('carruselTrack');
    if (track) {
        const cards = Array.from(track.querySelectorAll('.carrusel-card'));
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        let currentIndex = 0;

        function updateCarrusel() {
            const totalCards = cards.length;
            if (totalCards === 0) return;
            cards.forEach((card, index) => {
                let offset = index - currentIndex;
                if (offset < -Math.floor(totalCards / 2)) offset += totalCards;
                else if (offset > Math.floor(totalCards / 2)) offset -= totalCards;
                if (Math.abs(offset) > 2) {
                    card.style.display = 'none';
                    return;
                } else {
                    card.style.display = 'flex';
                }
                const rotateY = offset * 45;
                const translateX = offset * 140;
                const translateZ = -Math.abs(offset) * 150;
                card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${offset === 0 ? 1 : 0.8})`;
                card.style.opacity = offset === 0 ? 1 : 0.6;
                card.style.zIndex = totalCards - Math.abs(offset);
            });
        }

        if (nextBtn && prevBtn && cards.length > 0) {
            nextBtn.onclick = () => { currentIndex = (currentIndex + 1) % cards.length; updateCarrusel(); };
            prevBtn.onclick = () => { currentIndex = (currentIndex - 1 + cards.length) % cards.length; updateCarrusel(); };
            updateCarrusel();
        }
    }
}

window.eliminarRecursoInicio = async function(tabla, id, evento) {
    evento.stopPropagation();
    evento.preventDefault();
    const boton = evento.currentTarget;
    const contenedor = boton.closest('.tarjeta-recurso') || boton.parentElement;
    if (contenedor) {
        contenedor.style.position = 'relative';
    }
    boton.style.position = 'absolute';

    if (!confirm(`¿Estás segura de que deseas eliminar este elemento de la página de inicio?`)) return;

    lanzarNotificacionFlotanteIzquierda(`🗑️ Eliminando recurso ID ${id}...`);
    try {
        const res = await fetch(`${API_BASE}/api/admin/eliminar-${tabla}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (res.ok) {
            mostrarMensajeWeb('🗑️ Elemento removido con éxito de la base de datos.', 'exito');
            setTimeout(() => { location.reload(); }, 1000);
        } else {
            mostrarMensajeWeb('❌ Error al intentar borrar el elemento.', 'error');
        }
    } catch (err) {
        mostrarMensajeWeb('❌ Error de conexión con el servidor.', 'error');
    }
};

function mostrarMensajeWeb(texto, tipo = 'exito') {
    let contenedor = document.getElementById('notificaciones-contenedor');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'notificaciones-contenedor';
        contenedor.style.cssText = 'position:fixed; top:120px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px;';
        document.body.appendChild(contenedor);
    }
    const alerta = document.createElement('div');
    alerta.innerText = texto;
    const colorFondo = tipo === 'exito' ? '#d4edda' : '#f8d7da';
    const colorTexto = tipo === 'exito' ? '#155724' : '#721c24';
    const colorBorde = tipo === 'exito' ? '#c3e6cb' : '#f5c6cb';
    alerta.style.cssText = `padding:15px 20px; background:${colorFondo}; color:${colorTexto}; border:1px solid ${colorBorde}; border-radius:8px; font-family:'Montserrat',sans-serif; font-size:14px; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.1); transition: opacity 0.3s;`;
    contenedor.appendChild(alerta);
    setTimeout(() => {
        alerta.style.opacity = '0';
        setTimeout(() => alerta.remove(), 300);
    }, 3000);
}

function verificarSesionUsuario() {
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioAlquimia'));
    const enlaceUsuario = document.querySelector('a[href="Login.html"]') || document.querySelector('a[href="Perfil.html"]');
    const enlaceCarrito = document.querySelector('a[href="Carrito.html"]');
    const fotoGlobal = localStorage.getItem('fotoPerfilAlquimia');
    const path = window.location.pathname;

    const botonFlotanteExistente = document.getElementById('nav-historial-cliente');
    if (botonFlotanteExistente) {
        botonFlotanteExistente.remove();
    }
    if (enlaceCarrito) {
        enlaceCarrito.onclick = (e) => {
            const sesionActual = JSON.parse(localStorage.getItem('usuarioAlquimia'));
            const esAdminActual = sesionActual && sesionActual.email === 'marivetteromero.1603@gmail.com';

            if (!sesionActual || !sesionActual.email) {
                e.preventDefault();
                mostrarMensajeWeb('❌ Tienes que iniciar sesión para ver el carrito.', 'error');
                setTimeout(() => {
                    window.location.href = 'Login.html';
                }, 1500);
            } else if (esAdminActual) {
                e.preventDefault();
                window.location.href = 'HistorialPedidos.html';
            }
        };
    }

    if (usuarioActivo && enlaceUsuario) {
        const esAdmin = usuarioActivo.email === 'marivetteromero.1603@gmail.com';
        if (fotoGlobal) {
            enlaceUsuario.innerHTML = `
                <div style="position:relative; display:inline-block; vertical-align:middle;">
                    <img src="${fotoGlobal}" alt="Perfil" style="width:32px; height:32px; border-radius:50%; object-fit:cover; border:2px solid ${esAdmin ? '#C5A447' : '#ff69b4'};">
                    ${esAdmin ? '<span style="position:absolute; bottom:-2px; right:-2px; background:#C5A447; color:white; font-size:8px; border-radius:50%; width:12px; height:12px; display:flex; align-items:center; justify-content:center; border:1px solid white; font-weight:bold;">✓</span>' : ''}
                </div>`;
        } else {
            enlaceUsuario.innerHTML = `<span class="material-icons" style="color:${esAdmin ? '#C5A447' : '#ff69b4'}; vertical-align:middle;">account_circle</span>`;
        }
        enlaceUsuario.href = 'Perfil.html';

        if (enlaceCarrito) {
            if (esAdmin) {
                enlaceCarrito.href = 'HistorialPedidos.html';
                enlaceCarrito.className = 'contenedor-icono-notif';
                enlaceCarrito.innerHTML = `<span class="material-icons" style="color:#C5A447;" title="Pedidos:">assignment</span>`;
                let liNotif = document.getElementById('nav-notif-admin');
                if (!liNotif) {
                    liNotif = document.createElement('a');
                    liNotif.id = 'nav-notif-admin';
                    liNotif.href = '#';
                    liNotif.className = 'contenedor-icono-notif';
                    liNotif.style.marginLeft = '15px';
                    liNotif.innerHTML = `<span class="material-icons" style="color:#C5A447;" title="Notificaciones de la Tienda">notifications</span>`;
                    enlaceCarrito.insertAdjacentElement('afterend', liNotif);
                }
                liNotif.onclick = (e) => {
                    e.preventDefault();
                    abrirModalNotificaciones('admin');
                };

                let liVentas = document.getElementById('nav-ventas-admin');
                if (!liVentas) {
                    liVentas = document.createElement('a');
                    liVentas.id = 'nav-ventas-admin';
                    liVentas.href = 'ControlVentas.html';
                    liVentas.className = 'contenedor-icono-notif';
                    liVentas.style.marginLeft = '15px';
                    liVentas.innerHTML = `<span class="material-icons" style="color:#2e8b57;" title="Control de Ventas y Personalizados">analytics</span>`;
                    liNotif.insertAdjacentElement('afterend', liVentas);
                }
            } else {
                if (path.includes('Carrito.html')) {
                    const botonFlotante = document.createElement('a');
                    botonFlotante.id = 'nav-historial-cliente';
                    botonFlotante.href = 'HistorialPedidos.html';
                    botonFlotante.className = 'btn-historial-flotante';
                    botonFlotante.innerHTML = `<span class="material-icons">assignment_ind</span> Mis Pedidos`;
                    document.body.appendChild(botonFlotante);
                }
                let liNotifCliente = document.getElementById('nav-notif-cliente');
                if (!liNotifCliente) {
                    liNotifCliente = document.createElement('a');
                    liNotifCliente.id = 'nav-notif-cliente';
                    liNotifCliente.href = '#';
                    liNotifCliente.className = 'contenedor-icono-notif';
                    liNotifCliente.style.marginLeft = '15px';
                    liNotifCliente.innerHTML = `<span class="material-icons" style="color:#ff69b4;" title="Mis Notificaciones">notifications</span>`;
                    enlaceCarrito.insertAdjacentElement('afterend', liNotifCliente);
                }
                liNotifCliente.onclick = (e) => {
                    e.preventDefault();
                    abrirModalNotificaciones('cliente');
                };
            }
        }
    }
    actualizarPuntitosRojosAlerta();
}

async function abrirModalNotificaciones(rol) {
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioAlquimia')) || {};
    const correoUser = usuarioActivo.email || usuarioActivo.correo || '';
    let contenidoAlertas = '';
    try {
        const res = await fetch(
            `${API_BASE}/api/alertas?rol=${encodeURIComponent(rol)}&email=${encodeURIComponent(correoUser)}`
        );

        if (!res.ok) {
            throw new Error(`Servidor respondió ${res.status}`);
        }

        const bolsa = await res.json();
        contenidoAlertas = bolsa.length === 0
            ? '<p style="color:#888; font-size:13px; text-align:center; padding:10px 0;">No tienes alertas nuevas por el momento.</p>'
            : bolsa.map(a => `
                <div style="
                    padding:10px;
                    background:#fff5f7;
                    border-left:3px solid #ff69b4;
                    border-radius:4px;
                    font-size:12px;
                    margin-bottom:8px;
                    color:#5d4037;
                    font-weight:500;
                ">
                    ${a.mensaje}
                </div>
            `).join('');
    } catch (err) {
        console.error("ERROR COMPLETO DE NOTIFICACIONES:", err);
        contenidoAlertas = `
            <p style="
                color:#721c24;
                font-size:13px;
                text-align:center;
                padding:10px 0;
            ">
                Error al conectar con el servidor.
            </p>
        `;
    }
    let modal = document.getElementById('modal-buzon-alertas');
    if (modal) modal.remove();
    modal = document.createElement('div');
    modal.id = 'modal-buzon-alertas';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); z-index:99999; display:flex; align-items:center; justify-content:center; font-family:"Montserrat",sans-serif;';
    modal.innerHTML = `
        <div style="background:#fff; width:90%; max-width:400px; padding:25px; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
            <h3 style="margin-top:0; color:#5c3d2e; display:flex; align-items:center; gap:8px; font-size:1.3rem;">
                <span class="material-icons" style="color:#ff69b4;">notifications</span>Notificaciones
            </h3>
            <div style="max-height:250px; overflow-y:auto; margin:15px 0; padding-right:5px;">${contenidoAlertas}</div>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button id='btn-vaciar-alertas' style='background:#d9534f; color:#fff; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer; flex:1; font-size:12px;'>Limpiar Alertas</button>
                <button id='btn-cerrar-modal-alert' style='background:#f2e1e1; color:#5c3d2e; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer; flex:1; font-size:12px;'>Cerrar</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    document.getElementById('btn-cerrar-modal-alert').onclick = () => modal.remove();
    document.getElementById('btn-vaciar-alertas').onclick = async () => {
        try {
            await fetch(`${API_BASE}/api/alertas/vaciar`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rol, email: correoUser })
            });
            actualizarPuntitosRojosAlerta();
            modal.remove();
            mostrarMensajeWeb('🧹 Centro de notificaciones limpio.');
        } catch (e) {
            mostrarMensajeWeb('❌ Error al limpiar alertas.', 'error');
        }
    };
}

async function actualizarPuntitosRojosAlerta() {
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioAlquimia'));
    if (!usuarioActivo) return;
    const correoReal = usuarioActivo.email || usuarioActivo.correo;
    const esAdmin = correoReal === 'marivetteromero.1603@gmail.com';
    const rolConsulta = esAdmin ? 'admin' : 'cliente';
    const campana = document.getElementById(esAdmin ? 'nav-notif-admin' : 'nav-notif-cliente');
    if (!campana) return;
    try {
        const res = await fetch(`${API_BASE}/api/alertas?rol=${rolConsulta}&email=${encodeURIComponent(correoReal)}`);
        if (res.ok) {
            const alertas = await res.json();
            let puntito = campana.querySelector('.badge-notif');
            if (alertas.length > 0) {
                if (!puntito) {
                    puntito = document.createElement('span');
                    puntito.className = 'badge-notif';
                    puntito.style.cssText = 'position:absolute; top:2px; right:2px; background:red; border-radius:50%; width:8px; height:8px;';
                    campana.appendChild(puntito);
                }
                const ultimaAlertaVista = localStorage.getItem(`ultimaAlerta_${rolConsulta}`);
                const ultimaAlertaServidor = alertas[0].id.toString();
                if (ultimaAlertaVista !== ultimaAlertaServidor) {
                    lanzarNotificacionFlotanteIzquierda(`🔔 ${alertas[0].mensaje}`);
                    localStorage.setItem(`ultimaAlerta_${rolConsulta}`, ultimaAlertaServidor);
                }
            } else if (puntito) {
                puntito.remove();
            }
        }
    } catch (err) { }
}

const normalizarTextoBusqueda = (txt) =>
    String(txt || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

const CONTENIDO_ESTATICO_BUSQUEDA = [
    {
        seccion: 'Nosotros',
        titulo: 'El Origen de la Alquimia',
        detalle: 'Repostería clásica, taller artesanal, cocina familiar, ingredientes seleccionados.',
        url: 'nosotros.html',
        selector: '.bloque-historia'
    },
    {
        seccion: 'Nosotros',
        titulo: 'Misión, Visión y Valores',
        detalle: 'Postres artesanales de la más alta calidad, innovación, recetas 100% reales desde cero.',
        url: 'nosotros.html',
        selector: '.bloque-valores'
    },
    {
        seccion: 'Sucursales',
        titulo: 'Sucursal Centro Histórico (Campeche)',
        detalle: 'Ubicación en Campeche, horario de 8:00 AM a 9:00 PM.',
        url: 'sucursales.html',
        selector: '#contenedor-mapa'
    },
    {
        seccion: 'Sucursales',
        titulo: 'Sucursal Av. Resurgimiento (Campeche)',
        detalle: 'Ubicación en Campeche con servicio Drive-Thru disponible.',
        url: 'sucursales.html',
        selector: '#contenedor-mapa'
    },
    {
        seccion: 'Sucursales',
        titulo: 'Sucursal Paseo de Montejo (Yucatán)',
        detalle: 'Nuestra sucursal gourmet más grande en Mérida, Yucatán.',
        url: 'sucursales.html',
        selector: '#contenedor-mapa'
    },
    {
        seccion: 'Sucursales',
        titulo: 'Sucursal Altabrisa (Yucatán)',
        detalle: 'Ubicada dentro de la plaza comercial en Mérida, Yucatán.',
        url: 'sucursales.html',
        selector: '#contenedor-mapa'
    }
];

async function construirIndiceGlobal() {
    if (window._indiceBusquedaGlobal) return window._indiceBusquedaGlobal;
    const indice = [...CONTENIDO_ESTATICO_BUSQUEDA];

    try {
        const resProd = await fetch(`${API_BASE}/api/productos`);
        if (resProd.ok) {
            const prods = await resProd.json();
            prods.forEach(p => {
                indice.push({
                    seccion: 'Catálogo',
                    titulo: p.Nombre,
                    detalle: `${p.Descripcion || 'Postre artesanal'} · $${parseFloat(p.Precio).toFixed(2)}`,
                    url: 'catalogo.html',
                    textoObjetivo: p.Nombre
                });
            });
        }
    } catch (e) {
        document.querySelectorAll('.contenedor-catalogo .producto').forEach(card => {
            const nombre = card.querySelector('h2')?.innerText || '';
            const desc = card.querySelector('p')?.innerText || '';
            if (nombre) {
                indice.push({
                    seccion: 'Catálogo',
                    titulo: nombre,
                    detalle: desc,
                    url: 'catalogo.html',
                    textoObjetivo: nombre
                });
            }
        });
    }

    try {
        const resInicio = await fetch(`${API_BASE}/api/contenido-inicio`);
        if (resInicio.ok) {
            const items = await resInicio.json();
            items.forEach(i => {
                const esOferta = i.tipo === 'oferta';
                indice.push({
                    seccion: esOferta ? 'Inicio · Ofertas' : 'Inicio · Favoritos',
                    titulo: i.nombre,
                    detalle: `${i.descripcion || (esOferta ? 'Oferta de temporada' : 'Favorito de la casa')} · $${parseFloat(i.precio).toFixed(2)}`,
                    url: 'Dulce_Alquimia.html',
                    tipoCarrusel: esOferta ? 'oferta' : 'favorito',
                    textoObjetivo: i.nombre
                });
            });
        }
    } catch (e) {}

    try {
        const resForo = await fetch(`${API_BASE}/api/foro`);
        if (resForo.ok) {
            const posts = await resForo.json();
            posts.forEach(c => {
                const textoRespuestas = (c.respuestas || []).map(r => `${r.nombre}: ${r.mensaje}`).join(' ');
                indice.push({
                    seccion: 'Foro',
                    titulo: `${c.nombre} (${c.tema})`,
                    detalle: `${c.mensaje} ${textoRespuestas}`.trim(),
                    url: 'Foro.html',
                    selector: `#post-${c.id}`
                });
            });
        }
    } catch (e) {}

    window._indiceBusquedaGlobal = indice;
    return indice;
}

function irAResultadoBusqueda(item) {
    const panel = document.getElementById('panel-buscador-global');
    if (panel) panel.style.display = 'none';

    sessionStorage.setItem('destinoBusquedaAlquimia', JSON.stringify(item));
    const paginaActual = window.location.pathname.split('/').pop() || 'Dulce_Alquimia.html';
    if (paginaActual === item.url) {
        enfocarDestinoBusqueda();
    } else {
        window.location.href = item.url;
    }
}

function enfocarDestinoBusqueda() {
    const raw = sessionStorage.getItem('destinoBusquedaAlquimia');
    if (!raw) return;
    sessionStorage.removeItem('destinoBusquedaAlquimia');

    let destino;
    try { destino = JSON.parse(raw); } catch { return; }

    let intentos = 0;
    const buscarElemento = setInterval(() => {
        intentos++;
        let elemento = null;

        if (destino.textoObjetivo) {
            const objetivoNorm = normalizarTextoBusqueda(destino.textoObjetivo);
            const candidatos = document.querySelectorAll('.producto, .tarjeta-producto, .carrusel-card, .post-foro');
            for (const el of candidatos) {
                const tituloEl = el.querySelector('h2, h3, h4')?.innerText || el.innerText;
                if (normalizarTextoBusqueda(tituloEl).includes(objetivoNorm)) {
                    elemento = el;
                    break;
                }
            }
        }

        if (!elemento && destino.selector) {
            elemento = document.querySelector(destino.selector);
        }

        if (elemento) {
            clearInterval(buscarElemento);

            const contenedorHorizontal = elemento.closest('.carrusel-productos');
            if (contenedorHorizontal) {
                contenedorHorizontal.scrollTo({
                    left: elemento.offsetLeft - 20,
                    behavior: 'smooth'
                });
            }

            if (elemento.classList.contains('carrusel-card')) {
                const track = document.getElementById('carruselTrack');
                const nextBtn = document.getElementById('nextBtn');
                if (track && nextBtn) {
                    const cards = Array.from(track.querySelectorAll('.carrusel-card'));
                    const idxObjetivo = cards.indexOf(elemento);
                    let giros = 0;
                    while (elemento.style.opacity !== '1' && giros < cards.length && idxObjetivo !== -1) {
                        nextBtn.click();
                        giros++;
                    }
                }
            }

            elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const bordeOriginal = elemento.style.boxShadow;
            const transicionOriginal = elemento.style.transition;
            elemento.style.transition = 'box-shadow 0.4s ease, transform 0.3s ease';
            elemento.style.boxShadow = '0 0 0 4px #ff69b4, 0 10px 25px rgba(255, 105, 180, 0.35)';
            elemento.style.transform = elemento.classList.contains('carrusel-card') ? elemento.style.transform : 'scale(1.02)';

            setTimeout(() => {
                elemento.style.boxShadow = bordeOriginal;
                if (!elemento.classList.contains('carrusel-card')) {
                    elemento.style.transform = '';
                }
                setTimeout(() => { elemento.style.transition = transicionOriginal; }, 400);
            }, 2600);
        } else if (intentos >= 20) {
            clearInterval(buscarElemento);
        }
    }, 150);
}

function inicializarBuscador() {
    enfocarDestinoBusqueda();

    const inputBuscar = document.querySelector('.buscador');
    const formulario = inputBuscar ? inputBuscar.closest('form') : null;
    if (!inputBuscar || !formulario) return;

    formulario.style.position = 'relative';

    let panelResultados = document.getElementById('panel-buscador-global');
    if (!panelResultados) {
        panelResultados = document.createElement('div');
        panelResultados.id = 'panel-buscador-global';
        panelResultados.style.cssText =
            'display:none; position:absolute; top:115%; left:0; width:340px; max-width:85vw; max-height:360px;' +
            'overflow-y:auto; background:#fff; border:2px solid #f4e7e6; border-radius:14px;' +
            'box-shadow:0 12px 30px rgba(92,61,46,0.18); z-index:99999; font-family:"Montserrat",sans-serif; padding:8px;';
        formulario.appendChild(panelResultados);
    }

    let resultadosActuales = [];

    const filtrarYMostrar = async (terminoRaw) => {
        const termino = normalizarTextoBusqueda(terminoRaw);
        if (!termino) {
            panelResultados.style.display = 'none';
            resultadosActuales = [];
            return;
        }

        const indice = await construirIndiceGlobal();
        const palabras = termino.split(/\s+/).filter(Boolean);

        resultadosActuales = indice.filter(item => {
            const textoCompleto = normalizarTextoBusqueda(`${item.seccion} ${item.titulo} ${item.detalle}`);
            return palabras.every(p => textoCompleto.includes(p));
        });

        if (resultadosActuales.length === 0) {
            panelResultados.innerHTML = `
                <div style="padding:14px; text-align:center; color:#8d6e63; font-size:13px;">
                    No encontramos coincidencias para "<strong>${terminoRaw}</strong>".
                </div>`;
            panelResultados.style.display = 'block';
            return;
        }

        panelResultados.innerHTML = resultadosActuales.slice(0, 12).map((item, idx) => `
            <div class="item-resultado-global" data-idx="${idx}"
                style="padding:10px 12px; border-radius:10px; cursor:pointer; border-bottom:1px solid #faf0f0; transition:background 0.2s;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                    <strong style="color:#5c3d2e; font-size:13px;">${item.titulo}</strong>
                    <span style="background:#fff0f6; color:#ff69b4; font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px;">
                        ${item.seccion}
                    </span>
                </div>
                <p style="margin:0; font-size:11.5px; color:#7d665e; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${item.detalle}
                </p>
            </div>
        `).join('');

        panelResultados.style.display = 'block';

        panelResultados.querySelectorAll('.item-resultado-global').forEach(el => {
            el.onmouseenter = () => { el.style.background = '#fff5f8'; };
            el.onmouseleave = () => { el.style.background = 'transparent'; };
            el.onclick = () => {
                const elegido = resultadosActuales[Number(el.dataset.idx)];
                if (elegido) irAResultadoBusqueda(elegido);
            };
        });
    };

    inputBuscar.addEventListener('input', (e) => {
        filtrarYMostrar(e.target.value);
    });

    inputBuscar.addEventListener('focus', () => {
        if (inputBuscar.value.trim()) filtrarYMostrar(inputBuscar.value);
    });

    formulario.onsubmit = async (e) => {
        e.preventDefault();
        if (!resultadosActuales.length && inputBuscar.value.trim()) {
            await filtrarYMostrar(inputBuscar.value);
        }
        if (resultadosActuales.length > 0) {
            irAResultadoBusqueda(resultadosActuales[0]);
        }
    };

    document.addEventListener('click', (e) => {
        if (!formulario.contains(e.target)) {
            panelResultados.style.display = 'none';
        }
    });
}

async function cargarProductosDesdeBD() {
    const contenedor = document.querySelector('.contenedor-catalogo');
    if (!contenedor) return;
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioAlquimia'));
    const esAdmin = usuarioLogueado && usuarioLogueado.email === 'marivetteromero.1603@gmail.com';
    try {
        const respuesta = await fetch(`${API_BASE}/api/productos`);
        const productos = await respuesta.json();
        if (productos && productos.length > 0) {
            contenedor.innerHTML = '';
            productos.forEach(prod => {
                const tarjeta = document.createElement('div');
                tarjeta.classList.add('producto');
                const disponible = prod.Stock > 0;
                const textoBoton = disponible ? 'Agregar al carrito' : 'Agotado';
                const botonDesactivado = disponible ? '' : 'disabled style="background:#ccc; cursor:not-allowed;"';
                const imgLimpia = String(prod.Imagen || 'paydelimon.png').trim();
                const imgUrl = /^(Productos\/|\/|https?:|data:image)/i.test(imgLimpia)
                    ? imgLimpia
                    : `Productos/${imgLimpia}`;
                let botonesHTML = '';
                if (esAdmin) {
                    botonesHTML = `
                        <button class="btn-actualizar-admin" data-id="${prod.Id_Producto}" style="background:#C5A447; color:white; border:none; padding:8px; margin-top:5px; border-radius:6px; font-weight:bold; cursor:pointer; width:100%;">Actualizar Producto</button>
                        <button class="btn-eliminar-admin" data-id="${prod.Id_Producto}" style="background:#d9534f; color:white; border:none; padding:8px; margin-top:5px; border-radius:6px; font-weight:bold; cursor:pointer; width:100%;">Eliminar Producto</button>
                    `;
                } else {
                    botonesHTML = `
                        <button class="btn-pedir" data-nombre="${prod.Nombre}" data-precio="${prod.Precio}" data-imagen="${imgUrl}" ${botonDesactivado}>Pedir ahora</button>
                        <button class="btn-agregar" data-nombre="${prod.Nombre}" data-precio="${prod.Precio}" data-imagen="${imgUrl}" ${botonDesactivado}>${textoBoton}</button>
                    `;
                }
                tarjeta.innerHTML = `
                    <img src="${imgUrl}" alt="${prod.Nombre}">
                    <h2>${prod.Nombre}</h2>
                    <p>${prod.Descripcion || 'Sin descripción'}</p>
                    <p style="font-size:12px; font-weight:bold; color:${disponible ? '#2e8b57' : '#721c24'}">
                        ${disponible ? `Disponibles: ${prod.Stock} pzas` : 'Producto Agotado'}
                    </p>
                    <span class="precio">$${parseFloat(prod.Precio).toFixed(2)}</span>
                    ${botonesHTML}`;
                contenedor.appendChild(tarjeta);
            });
            window.productosCargadosMemoria = productos;
        }
    } catch (error) {
        console.log("Catálogo operando en modo estático.");
    }
    if (!esAdmin) {
        inicializarEventosBotonesCatalogo();
    } else {
        inicializarEventosAdminCatalogo();
    }
}

function inicializarEventosBotonesCatalogo() {
    if (window.eventoCompraCatalogoRegistrado) return;
    window.eventoCompraCatalogoRegistrado = true;

    document.addEventListener('click', (e) => {
        const boton = e.target.closest('.btn-agregar, .btn-pedir');
        if (!boton) return;

        const usuarioActivo = JSON.parse(localStorage.getItem('usuarioAlquimia'));

        if (!usuarioActivo || !usuarioActivo.email) {
            const mensajeAlerta = boton.classList.contains('btn-pedir')
                ? '❌ Tienes que iniciar sesión para pedir el producto.'
                : '❌ Tienes que iniciar sesión para agregar al carrito.';

            mostrarMensajeWeb(mensajeAlerta, 'error');
            setTimeout(() => {
                window.location.href = 'Login.html';
            }, 1500);
            return;
        }

        const nombre = boton.getAttribute('data-nombre');
        const precio = parseFloat(boton.getAttribute('data-precio'));
        const imagen = boton.getAttribute('data-imagen');

        let carrito = JSON.parse(localStorage.getItem('carritoAlquimia')) || [];
        const productoExistente = carrito.find(item => item.nombre === nombre);

        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            carrito.push({
                nombre: nombre,
                precio: precio,
                imagen: imagen,
                cantidad: 1
            });
        }

        localStorage.setItem('carritoAlquimia', JSON.stringify(carrito));
        mostrarMensajeWeb(`✨ "${nombre}" se agregó a tu orden.`);

        if (boton.classList.contains('btn-pedir')) {
            setTimeout(() => {
                window.location.href = 'Carrito.html';
            }, 700);
        }
    });
}

function inicializarEventosAdminCatalogo() {
    const contenedor = document.querySelector('.contenedor-catalogo');
    if (!contenedor) return;
    contenedor.addEventListener('click', async (e) => {
        const boton = e.target;
        const idProd = boton.getAttribute('data-id');
        if (!idProd) return;

        if (boton.classList.contains('btn-eliminar-admin')) {
            if (!confirm("¿Estás segura de que deseas eliminar este producto?")) return;
            try {
                const res = await fetch(`${API_BASE}/api/admin/eliminar-producto`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: idProd })
                });
                if (res.ok) {
                    mostrarMensajeWeb('🗑️ Producto removido.');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    mostrarMensajeWeb('No se pudo eliminar.', 'error');
                }
            } catch (err) { mostrarMensajeWeb('Error de conexión.', 'error'); }
        }

        if (boton.classList.contains('btn-actualizar-admin')) {
            const prod = window.productosCargadosMemoria.find(p => p.Id_Producto == idProd);
            if (!prod) return;
            const modal = document.createElement('div');
            modal.className = 'modal-admin-flotante';
            modal.id = 'modal-editar-prod';
            modal.innerHTML = `
                <div class="modal-admin-contenido">
                    <h3>✨ Editar Producto</h3>
                    <form id="form-editar-flotante">
                        <label>Nombre del Producto:</label>
                        <input type="text" id="edit-nombre" value="${prod.Nombre}" required>
                        <label>Precio ($):</label>
                        <input type="number" id="edit-precio" step="0.01" value="${prod.Precio}" required>
                        <label>Stock:</label>
                        <input type="number" id="edit-stock" value="${prod.Stock}" required>
                        <label>Descripción:</label>
                        <textarea id="edit-descripcion" rows="2">${prod.Descripcion || ''}</textarea>
                        <div style="display:flex; gap:10px; margin-top:20px;">
                            <button type="submit" style="background:#2e8b57; color:white; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer; flex:1;">Guardar Cambios</button>
                            <button type="button" id="btn-cerrar-modal-edit" style="background:#f2e1e1; color:#5c3d2e; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer; flex:1;">Cancelar</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('btn-cerrar-modal-edit').onclick = () => modal.remove();
            document.getElementById('form-editar-flotante').onsubmit = async (event) => {
                event.preventDefault();
                const datosActualizados = {
                    id: idProd,
                    nombre: document.getElementById('edit-nombre').value.trim(),
                    precio: parseFloat(document.getElementById('edit-precio').value) || 0,
                    stock: parseInt(document.getElementById('edit-stock').value) || 0,
                    descripcion: document.getElementById('edit-descripcion').value.trim()
                };
                try {
                    const res = await fetch(`${API_BASE}/api/admin/actualizar-producto`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(datosActualizados)
                    });
                    if (res.ok) {
                        mostrarMensajeWeb('🔄 Cambios guardados con éxito.');
                        modal.remove();
                        setTimeout(() => location.reload(), 1000);
                    } else {
                        mostrarMensajeWeb('Error al actualizar en el servidor.', 'error');
                    }
                } catch (err) {
                    mostrarMensajeWeb('Error de red al actualizar.', 'error');
                }
            };
        }
    });
}

function renderizarCarrito() {
    const cuerpoTabla = document.querySelector('.tabla-carrito tbody');
    const contenedorCarrito = document.querySelector('.carrito-contenedor');
    if (!cuerpoTabla) return;
    let carrito = JSON.parse(localStorage.getItem('carritoAlquimia')) || [];
    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = `
            <div style="text-align:center; padding: 60px; font-family:'Montserrat',sans-serif;">
                <span class="material-icons" style="font-size: 70px; color:#ff69b4;">shopping_basket</span>
                <p style="font-size: 20px; color: #5c3d2e; font-weight:bold; margin-top:15px;">Tu carrito de Dulce Alquimia está vacío.</p>
                <a href="catalogo.html" style="display:inline-block; margin-top:15px; padding:12px 25px; background:#ff69b4; color:#fff; text-decoration:none; border-radius:25px; font-weight:bold; box-shadow:0 4px 10px rgba(0,0,0,0.1);">Explorar Catálogo</a>
            </div>`;
        return;
    }
    cuerpoTabla.innerHTML = '';
    let subtotal = 0;
    carrito.forEach((item, index) => {
        const totalProducto = item.precio * item.cantidad;
        subtotal += totalProducto;
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="producto-info">
                <img src="${item.imagen}" class="img-mini" alt="${item.nombre}">
                <div>
                    <p class="nombre-prod" style="font-weight:bold; margin:0; color:#5c3d2e;">${item.nombre}</p>
                    <small style="color:#b17c7c;">Receta de la casa</small>
                </div>
            </td>
            <td style="font-weight:600; color:#5d4037;">$${item.precio.toFixed(2)}</td>
            <td>
                <div class="selector-cantidad">
                    <button class="btn-restar" data-index="${index}">-</button>
                    <span>${item.cantidad}</span>
                    <button class="btn-sumar" data-index="${index}">+</button>
                </div>
            </td>
            <td style="font-weight:bold; color:#ff69b4;">$${totalProducto.toFixed(2)}</td>
            <td>
                <button class="btn-eliminar" data-index="${index}" style="background:none; border:none; color:#ff6584; cursor:pointer;">
                    <span class="material-icons">delete_outline</span>
                </button>
            </td>`;
        cuerpoTabla.appendChild(fila);
    });
    const iva = subtotal * 0.16;
    const totalGeneral = subtotal + iva;
    document.querySelector('.resumen-pago .fila-resumen:nth-child(1) span:last-child').innerText = `$${subtotal.toFixed(2)}`;
    document.querySelector('.resumen-pago .fila-resumen:nth-child(2) span:last-child').innerText = `$${iva.toFixed(2)}`;
    document.querySelector('.total-final span:last-child').innerText = `$${totalGeneral.toFixed(2)}`;
    configurarEventosAcciones(carrito);
    const selectPago = document.getElementById('checkout-pago');
    if (selectPago) {
        selectPago.onchange = () => {
            const metodo = selectPago.value;
            const bTarjeta = document.getElementById('bloque-tarjeta');
            const bSpei = document.getElementById('bloque-spei');
            if (bTarjeta) bTarjeta.style.display = metodo === 'tarjeta' ? 'block' : 'none';
            if (bSpei) bSpei.style.display = metodo === 'transferencia' ? 'block' : 'none';
        };
    }
    const selectSucursal = document.getElementById('checkout-sucursal');
    if (selectSucursal) {
        fetch(`${API_BASE}/api/sucursales`)
            .then(res => res.json())
            .then(sucursales => {
                if (Array.isArray(sucursales) && sucursales.length > 0) {
                    selectSucursal.innerHTML = sucursales.map(s => `<option value="${s.nombre}">${s.nombre} (${s.estado})</option>`).join('');
                }
            })
            .catch(() => {});
    }
}

function configurarEventosAcciones(carrito) {
    window.alternarCampoDireccion = () => {
        const servicio = document.getElementById('checkout-servicio').value;
        const campoDireccion = document.getElementById('campo-direccion-entrega');
        if (servicio === 'domicilio') {
            campoDireccion.style.display = 'block';
        } else {
            campoDireccion.style.display = 'none';
        }
    };
    document.querySelectorAll('.btn-sumar').forEach(btn => {
        btn.onclick = (e) => {
            const index = e.target.getAttribute('data-index');
            carrito[index].cantidad += 1;
            actualizarAlmacen(carrito);
        };
    });
    document.querySelectorAll('.btn-restar').forEach(btn => {
        btn.onclick = (e) => {
            const index = e.target.getAttribute('data-index');
            if (carrito[index].cantidad > 1) {
                carrito[index].cantidad -= 1;
                actualizarAlmacen(carrito);
            }
        };
    });
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.onclick = (e) => {
            const boton = e.target.closest('.btn-eliminar');
            const index = boton.getAttribute('data-index');
            const nombre = carrito[index].nombre;
            carrito.splice(index, 1);
            localStorage.setItem('carritoAlquimia', JSON.stringify(carrito));
            mostrarMensajeWeb(`🗑️ Se eliminó "${nombre}" de tu orden.`, 'error');
            setTimeout(() => renderizarCarrito(), 200);
        };
    });
    const btnPagar = document.querySelector('.btn-pagar');
    if (btnPagar) {
        btnPagar.onclick = async () => {
            const usuarioActivo = JSON.parse(localStorage.getItem('usuarioAlquimia'));
            if (!usuarioActivo || !usuarioActivo.email) {
                mostrarMensajeWeb('❌ Debes iniciar sesión para poder realizar una compra.', 'error');
                setTimeout(() => { window.location.href = 'Login.html'; }, 2000);
                return;
            }
            let carrito = JSON.parse(localStorage.getItem('carritoAlquimia')) || [];
            if (carrito.length === 0) {
                mostrarMensajeWeb('❌ Tu carrito está vacío.', 'error');
                return;
            }
            const metodoPago = document.getElementById('checkout-pago').value;
            if (metodoPago === 'transferencia') {
                const comprobante = document.getElementById('comprobante-spei');
                if (comprobante && comprobante.files && comprobante.files.length === 0) {
                    mostrarMensajeWeb('❌ Por favor, selecciona la captura de tu transferencia SPEI.', 'error');
                    return;
                }
            }
            if (metodoPago === 'tarjeta') {
                const numTar = document.getElementById('num-tarjeta') ? document.getElementById('num-tarjeta').value.trim() : '';
                if (numTar === '') {
                    mostrarMensajeWeb('❌ Por favor, introduce los datos de tu tarjeta bancaria.', 'error');
                    return;
                }
            }
            const servicio = document.getElementById('checkout-servicio').value;
            const sucursal = document.getElementById('checkout-sucursal').value;
            const direccion = document.getElementById('checkout-direccion') ? document.getElementById('checkout-direccion').value.trim() : '';
            const elementoTotal = document.querySelector('.total-final span:last-child');
            const totalTexto = elementoTotal ? elementoTotal.innerText : '$0.00';
            const idPedidoGen = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
            const productosTexto = carrito.map(i => `${i.nombre} (x${i.cantidad})`).join(', ');
            const servicioTexto = servicio === 'sucursal' ? `Recoger en: ${sucursal}` : `Domicilio: ${direccion}`;
            try {
                const respuesta = await fetch(`${API_BASE}/api/carrito/comprar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idPedido: idPedidoGen,
                        cliente: usuarioActivo.nombre,
                        correoCliente: usuarioActivo.email,
                        productos: productosTexto,
                        servicio: servicioTexto,
                        total: totalTexto,
                        carritoDetalle: carrito
                    })
                });
                if (respuesta.ok) {
                    await registrarAlertaEnServidor('admin', `Nuevo pedido recibido: ${idPedidoGen} de ${usuarioActivo.nombre}`);
                    mostrarMensajeWeb('🛒 ¡Pedido realizado con éxito!');
                    localStorage.removeItem('carritoAlquimia');
                    setTimeout(() => { window.location.href = 'Dulce_Alquimia.html'; }, 2500);
                } else {
                    const errData = await respuesta.json().catch(() => ({}));
                    mostrarMensajeWeb(errData.error || 'Error al procesar la compra en el servidor.', 'error');
                }
            } catch (error) {
                mostrarMensajeWeb('Error de conexión.', 'error');
            }
        };
    }
}

function actualizarAlmacen(carritoActualizado) {
    localStorage.setItem('carritoAlquimia', JSON.stringify(carritoActualizado));
    renderizarCarrito();
}

function inicializarLogin() {
    const formulario = document.getElementById('formLogin');
    if (!formulario) return;
    formulario.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const contrasena = document.getElementById('contrasena').value.trim();
        if (!email || !contrasena) {
            mostrarMensajeWeb('Por favor, llena todos los campos.', 'error');
            return;
        }
        try {
            const respuesta = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, contrasena })
            });
            const datos = await respuesta.json();
            if (respuesta.ok) {
                localStorage.setItem('usuarioAlquimia', JSON.stringify({
                    nombre: datos.usuario.nombre,
                    email: datos.usuario.correo,
                    foto: datos.usuario.foto
                }));
                if (datos.usuario.foto) {
                    localStorage.setItem('fotoPerfilAlquimia', datos.usuario.foto);
                } else {
                    localStorage.removeItem('fotoPerfilAlquimia');
                }
                mostrarMensajeWeb(`¡Bienvenido de nuevo!`, 'exito');
                setTimeout(() => { window.location.href = 'Dulce_Alquimia.html'; }, 1500);
            } else {
                mostrarMensajeWeb(`❌ ${datos.error}`, 'error');
            }
        } catch (error) {
            console.error(error);
            mostrarMensajeWeb('Error de conexión con el servidor.', 'error');
        }
    };
}

async function inicializarRegistro() {
    const formRegistro = document.getElementById('formRegistro');
    if (!formRegistro) return;
    formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('correo').value.toLowerCase().trim();
        const pass1 = document.getElementById('contraseña').value;
        const pass2 = document.getElementById('confirmar_contraseña').value;
        if (pass1 !== pass2) {
            mostrarMensajeWeb('❌ Las contraseñas no coinciden. Inténtalo de nuevo.', 'error');
            return;
        }
        try {
            const respuesta = await fetch(`${API_BASE}/api/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, contrasena: pass1 })
            });
            const datos = await respuesta.json();
            if (respuesta.ok) {
                mostrarMensajeWeb('✨ Cuenta creada con éxito. Redirigiendo al login...');
                setTimeout(() => window.location.href = 'Login.html', 1500);
            } else {
                mostrarMensajeWeb(`❌ ${datos.error}`, 'error');
            }
        } catch (error) {
            mostrarMensajeWeb('❌ Error de conexión: El servidor no está respondiendo.', 'error');
        }
    });
}

async function inicializarForoComunidad() {
    const formComentario = document.getElementById('form-comentario');
    const feed = document.querySelector('.foro-comentarios-feed');
    const estrellas = document.querySelectorAll('.estrellas-rating .star-btn');
    let calificacionSeleccionada = 0;
    if (!feed) return;
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioAlquimia')) || { nombre: "Invitado", email: "invitado@correo.com" };
    const esAdminActual = usuarioActivo.email === 'marivetteromero.1603@gmail.com';

    function calcularTiempoReal(timestamp) {
        if (!timestamp) return "Hace tiempo";
        let tiempoNumero = Number(timestamp);
        if (isNaN(tiempoNumero)) return timestamp;
        const ahora = Date.now();
        const diferenciaSegundos = Math.floor((ahora - tiempoNumero) / 1000);
        if (diferenciaSegundos < 60) return "Hace unos instantes";
        const diferenciaMinutos = Math.floor(diferenciaSegundos / 60);
        if (diferenciaMinutos < 60) return `Hace ${diferenciaMinutos} min`;
        const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
        if (diferenciaHoras < 24) return `Hace ${diferenciaHoras} horas`;
        return new Date(tiempoNumero).toLocaleDateString();
    }

    function renderizarRespuestaEnPantalla(postContenedor, resp) {
        let contenedorRespuestas = postContenedor.querySelector('.sub-respuestas-container');
        if (!contenedorRespuestas) {
            contenedorRespuestas = document.createElement('div');
            contenedorRespuestas.classList.add('sub-respuestas-container');
            contenedorRespuestas.style.cssText = 'margin-left: 45px; margin-top: 15px; padding-left: 15px; border-left: 2px solid #f4e7e6;';
            postContenedor.appendChild(contenedorRespuestas);
        }
        const esAdminResp = resp.nombre === 'Mary Romero';
        let avatarHtml = `<span class="material-icons" style="font-size:20px; color:#b17c7c; vertical-align:middle;">account_circle</span>`;
        if (resp.foto) {
            const colorBorde = esAdminResp ? '#C5A447' : '#ff69b4';
            avatarHtml = `<img src="${resp.foto}" style="width:22px; height:22px; border-radius:50%; object-fit:cover; border:1px solid ${colorBorde}; vertical-align:middle;">`;
        }
        const distintivoAdmin = esAdminResp ? `<span style="background:#C5A447; color:white; font-size:9px; padding:2px 6px; border-radius:4px; font-weight:bold; margin-left:5px; text-transform:uppercase; letter-spacing:0.5px; vertical-align:middle;">ADMIN</span>` : '';
        const fondoEstilo = esAdminResp ? 'background: rgba(197, 164, 71, 0.08); border: 1px solid rgba(197, 164, 71, 0.2);' : 'background: rgba(255,255,255,0.6);';
        const miniPost = document.createElement('div');
        miniPost.setAttribute('id', `resp-${resp.id}`);
        miniPost.style.cssText = `${fondoEstilo} padding: 12px; border-radius: 8px; margin-bottom: 8px; font-size: 13px; display: flex; flex-direction: column; position: relative; box-shadow: 0 1px 3px rgba(0,0,0,0.05);`;
        let tiempoFormateado = calcularTiempoReal(resp.timestamp);
        miniPost.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px;">
                <span class="material-icons" style="font-size:16px; color:#b17c7c;">subdirectory_arrow_right</span>
                ${avatarHtml}
                <strong style="color:#5c3d2e; vertical-align:middle;">${resp.nombre}</strong>
                ${distintivoAdmin}
                <span style="font-size:11px; color:#a1887f; margin-left:auto;">${tiempoFormateado}</span>
            </div>
            <p style="margin:0; color:#5d4037; padding-left: 24px; font-weight:500;">${resp.mensaje}</p>
        `;
        contenedorRespuestas.appendChild(miniPost);
    }

    function renderizarPost(id, nombre, tema, estrellasNum, mensaje, timestamp, respuestas = [], fotoBD = null) {
        let estrellasHtml = '';
        for (let i = 1; i <= 5; i++) {
            estrellasHtml += i <= estrellasNum ? '<span class="material-icons">star</span>' : '<span class="material-icons">star_border</span>';
        }
        let botonEliminarHtml = '';
        if (esAdminActual || nombre === usuarioActivo.nombre) {
            botonEliminarHtml = `
                <div class="btn-borrar-comentario" data-id="${id}" title="Eliminar este comentario" style="position:absolute; bottom:15px; right:15px; cursor:pointer; color:#b17c7c; z-index:10;">
                    <span class="material-icons" style="font-size:20px;">delete_outline</span>
                </div>`;
        }
        const esAdminPost = nombre === 'Mary Romero';
        let avatarHtml = `<span class="material-icons usuario-avatar" style="font-size:36px; color:#b17c7c; vertical-align:middle;">face</span>`;
        if (fotoBD) {
            const colorBorde = esAdminPost ? '#C5A447' : '#ff69b4';
            avatarHtml = `<img src="${fotoBD}" style="width:38px; height:38px; border-radius:50%; object-fit:cover; border:2px solid ${colorBorde}; vertical-align:middle;">`;
        }
        const distintivoAdmin = esAdminPost ? `<span style="background:#C5A447; color:white; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:bold; margin-left:5px; vertical-align:middle;">ADMIN</span>` : '';
        const fondoEstilo = esAdminPost ? 'background: #fffdf7; border: 1px solid rgba(197, 164, 71, 0.25);' : 'background: #fff;';
        const nuevoPost = document.createElement('div');
        nuevoPost.classList.add('post-foro');
        nuevoPost.setAttribute('id', `post-${id}`);
        nuevoPost.style.cssText = `${fondoEstilo} position:relative; padding:20px; border-radius:12px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.04);`;
        let tiempoPostFormateado = calcularTiempoReal(timestamp);
        nuevoPost.innerHTML = `
            <div class="post-cabecera" style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                ${avatarHtml}
                <div class="usuario-info">
                    <h4 style="margin:0; color:#5c3d2e; font-size:15px; display:inline-block; vertical-align:middle;">${nombre} ${distintivoAdmin}</h4>
                    <span class="post-fecha" style="font-size:12px; color:#a1887f; display:block; margin-top:2px;">
                        ${tiempoPostFormateado} • <span style="font-weight:600; color:#b17c7c;">${tema}</span> • 
                        <span class="btn-responder-trigger" data-id="${id}" style="color:#ff69b4; cursor:pointer; font-weight:bold; margin-left:5px;">Responder</span>
                    </span>
                </div>
                <div class="post-estrellas" style="margin-left:auto; color:#fbc02d;">${estrellasHtml}</div>
            </div>
            <p class="post-contenido" style="margin:0 0 10px 0; color:#5d4037; font-size:14px; line-height:1.5; padding-left:2px;">${mensaje}</p>
            <div class="zona-respuesta-input" style="display:none; margin-top:15px; gap:10px; padding-left:10px;">
                <input type="text" placeholder="Escribe tu respuesta..." style="flex:1; padding:8px 12px; border:1px solid #ccc; border-radius:20px; font-family:'Montserrat'; font-size:13px; outline:none;">
                <div class="btn-enviar-subrespuesta" data-id="${id}" style="width:auto; background:#ff69b4; color:white; padding:8px 18px; border-radius:20px; font-size:13px; cursor:pointer; font-weight:bold; display:flex; align-items:center;">Enviar</div>
            </div>
            ${botonEliminarHtml}
        `;
        feed.appendChild(nuevoPost);
        if (respuestas && respuestas.length > 0) {
            respuestas.forEach(r => renderizarRespuestaEnPantalla(nuevoPost, r));
        }
    }

    let comentariosMemoria = [];
    let comentariosLocales = JSON.parse(localStorage.getItem('foroAlquimiaHibrido')) || [];
    try {
        const res = await fetch(`${API_BASE}/api/foro`);
        if (res.ok) {
            const comentariosServer = await res.json();
            const idsServidor = new Set(comentariosServer.map(c => Number(c.id)));
            const localesNoSincronizados = comentariosLocales.filter(c => !idsServidor.has(Number(c.id)));
            comentariosMemoria = [...comentariosServer, ...localesNoSincronizados];
        } else {
            throw new Error();
        }
    } catch (err) {
        comentariosMemoria = comentariosLocales;
    }

    const postsViejos = feed.querySelectorAll('.post-foro');
    postsViejos.forEach(p => p.remove());
    comentariosMemoria.forEach(c => renderizarPost(c.id, c.nombre, c.tema, c.estrellas, c.mensaje, c.timestamp, c.respuestas, c.foto));

    if (estrellas.length > 0) {
        estrellas.forEach((estrella, index) => {
            estrella.addEventListener('click', () => {
                calificacionSeleccionada = index + 1;
                estrellas.forEach((e, idx) => e.innerText = idx <= index ? 'star' : 'star_border');
            });
        });
    }

    if (formComentario) {
        formComentario.onsubmit = async function(e) {
            e.preventDefault();
            const temaSelect = document.getElementById('foro-tema');
            const temaTexto = temaSelect.options[temaSelect.selectedIndex].text;
            const mensaje = document.getElementById('foro-mensaje').value.trim();
            if (!mensaje) return;
            if (!localStorage.getItem('usuarioAlquimia')) {
                mostrarMensajeWeb('❌ Debes iniciar sesión para comentar en el foro.', 'error');
                return;
            }
            const nuevoId = Date.now();
            const nuevoComentario = {
                id: nuevoId,
                nombre: usuarioActivo.nombre,
                tema: temaTexto,
                estrellas: calificacionSeleccionada,
                mensaje: mensaje,
                timestamp: nuevoId,
                foto: localStorage.getItem('fotoPerfilAlquimia') || null,
                respuestas: []
            };
            let guardadoEnServer = false;
            try {
                const res = await fetch(`${API_BASE}/api/foro/comentario`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoComentario)
                });
                if (res.ok) guardadoEnServer = true;
            } catch (err) { }
            if (!guardadoEnServer) {
                let locales = JSON.parse(localStorage.getItem('foroAlquimiaHibrido')) || [];
                locales.push(nuevoComentario);
                localStorage.setItem('foroAlquimiaHibrido', JSON.stringify(locales));
            }
            let textoAlerta = usuarioActivo.nombre === 'Mary Romero'
                ? "Dulce Alquimia ha hecho un nuevo comentario en el foro."
                : `El usuario ${usuarioActivo.nombre} ha comentado en el foro.`;
            await registrarAlertaEnServidor('admin', textoAlerta, 'admin', usuarioActivo.email);
            if (usuarioActivo.nombre === 'Mary Romero') {
                await registrarAlertaEnServidor('cliente', textoAlerta);
            }
            renderizarPost(nuevoId, usuarioActivo.nombre, temaTexto, calificacionSeleccionada, mensaje, nuevoId, [], localStorage.getItem('fotoPerfilAlquimia'));
            formComentario.reset();
            calificacionSeleccionada = 0;
            estrellas.forEach(e => e.innerText = 'star_border');
            mostrarMensajeWeb('✨ ¡Tu comentario ha sido publicado!');
            actualizarPuntitosRojosAlerta();
        };
    }

    feed.addEventListener('click', async (e) => {
        const botonBorrador = e.target.closest('.btn-borrar-comentario');
        const botonResponderTrigger = e.target.closest('.btn-responder-trigger');
        const botonEnviarResp = e.target.closest('.btn-enviar-subrespuesta');
        if (botonBorrador) {
            e.stopPropagation();
            const idComentario = parseInt(botonBorrador.getAttribute('data-id'));
            if (confirm('¿Estás seguro de que quieres eliminar este comentario del foro?')) {
                try {
                    await fetch(`${API_BASE}/api/foro/comentario`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: idComentario })
                    });
                } catch (err) { }
                let locales = JSON.parse(localStorage.getItem('foroAlquimiaHibrido')) || [];
                locales = locales.filter(c => Number(c.id) !== idComentario);
                localStorage.setItem('foroAlquimiaHibrido', JSON.stringify(locales));
                const elementoPost = document.getElementById(`post-${idComentario}`);
                if (elementoPost) elementoPost.remove();
                mostrarMensajeWeb('🗑️ El comentario ha sido eliminado.', 'error');
            }
            return;
        }
        if (botonResponderTrigger) {
            const idComentario = botonResponderTrigger.getAttribute('data-id');
            const padre = document.getElementById(`post-${idComentario}`);
            const zonaInput = padre.querySelector('.zona-respuesta-input');
            zonaInput.style.display = zonaInput.style.display === 'none' ? 'flex' : 'none';
            return;
        }
        if (botonEnviarResp) {
            const usuarioActual = JSON.parse(localStorage.getItem('usuarioAlquimia'));
            if (!usuarioActual || !usuarioActual.email) {
                mostrarMensajeWeb('❌ Debes iniciar sesión para poder responder en el foro.', 'error');
                setTimeout(() => { window.location.href = 'Login.html'; }, 2000);
                return;
            }
            const idComentario = parseInt(botonEnviarResp.getAttribute('data-id'));
            const padre = document.getElementById(`post-${idComentario}`);
            const inputTexto = padre.querySelector('.zona-respuesta-input input');
            const texto = inputTexto.value.trim();
            if (!texto) return;
            const nuevoIdResp = Date.now();
            const nuevaResp = {
                id: nuevoIdResp,
                idPadre: idComentario,
                nombre: usuarioActivo.nombre,
                mensaje: texto,
                timestamp: nuevoIdResp,
                foto: localStorage.getItem('fotoPerfilAlquimia') || null
            };
            try {
                await fetch(`${API_BASE}/api/foro/respuesta`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevaResp)
                });
            } catch (err) { }
            let locales = JSON.parse(localStorage.getItem('foroAlquimiaHibrido')) || [];
            locales = locales.map(c => {
                if (Number(c.id) === idComentario) {
                    if (!c.respuestas) c.respuestas = [];
                    c.respuestas.push(nuevaResp);
                }
                return c;
            });
            localStorage.setItem('foroAlquimiaHibrido', JSON.stringify(locales));
            await registrarAlertaEnServidor('admin', `Foro: Nueva respuesta de ${usuarioActivo.nombre}.`);
            renderizarRespuestaEnPantalla(padre, nuevaResp);
            inputTexto.value = '';
            padre.querySelector('.zona-respuesta-input').style.display = 'none';
            mostrarMensajeWeb('💬 ¡Respuesta añadida con éxito!');
            actualizarPuntitosRojosAlerta();
        }
    });
}

async function inicializarMapa() {
    if (typeof L === 'undefined' || !document.getElementById('map')) return;
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioAlquimia'));
    const esAdmin = usuarioActivo && (usuarioActivo.email === 'marivetteromero.1603@gmail.com' || usuarioActivo.correo === 'marivetteromero.1603@gmail.com');

    const map = L.map('map').setView([20.400, -89.600], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    let sucursales = [];
    let modoSeleccionMapa = null;
    let marcadorTemporal = null;

    async function cargarSucursalesDesdeBD() {
        try {
            const res = await fetch(`${API_BASE}/api/sucursales`);
            if (res.ok) {
                const datos = await res.json();
                if (Array.isArray(datos) && datos.length > 0) {
                    sucursales = datos.map(s => ({
                        id: s.id,
                        nombre: s.nombre,
                        estado: s.estado,
                        coords: [Number(s.latitud), Number(s.longitud)],
                        info: s.info
                    }));
                }
            }
        } catch (e) {
            console.log('Usando sucursales locales de respaldo');
        }
        actualizarOpcionesEstado();
    }

    function actualizarOpcionesEstado() {
        const selectEstado = document.getElementById('select-estado');
        if (!selectEstado) return;
        const estadosUnicos = [...new Set(sucursales.map(s => s.estado))];
        selectEstado.innerHTML = `<option value="todos">Todos los estados</option>` +
            estadosUnicos.map(est => `<option value="${est}">${est}</option>`).join('');
    }

    let capaMarcadores = L.layerGroup().addTo(map);
    function pintarMarcadores(filtro) {
        capaMarcadores.clearLayers();
        sucursales.forEach(suc => {
            if (filtro === 'todos' || suc.estado === filtro) {
                const marker = L.marker(suc.coords);

                let botonesAdminPopup = '';
                if (esAdmin) {
                    botonesAdminPopup = `
                        <div style="margin-top:10px; display:flex; gap:6px; justify-content:center;">
                            <button type="button" onclick="window.abrirModalEditarSucursal(${suc.id}, '${suc.nombre.replace(/'/g, "\\'")}', '${suc.estado.replace(/'/g, "\\'")}', ${suc.coords[0]}, ${suc.coords[1]}, '${suc.info.replace(/'/g, "\\'")}')" style="background:#C5A447; color:white; border:none; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">Editar</button>
                            <button type="button" onclick="window.eliminarSucursalServer(${suc.id}, '${suc.nombre.replace(/'/g, "\\'")}')" style="background:#d9534f; color:white; border:none; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">Cerrar Sucursal</button>
                        </div>
                    `;
                }

                marker.bindPopup(`
                    <div style="font-family:'Montserrat',sans-serif; text-align:center;">
                        <h4 style="color:#5c3d2e; margin:0 0 5px 0;">${suc.nombre}</h4>
                        <p style="margin:0; font-size:12px; color:#ff69b4; font-weight:bold;">${suc.info}</p>
                        ${botonesAdminPopup}
                    </div>
                `);
                capaMarcadores.addLayer(marker);
            }
        });
    }

    await cargarSucursalesDesdeBD();
    pintarMarcadores('todos');

    const btnBuscar = document.getElementById('btn-buscar');
    const selectEstado = document.getElementById('select-estado');
    if (btnBuscar && selectEstado) {
        btnBuscar.onclick = () => {
            const estadoSeleccionado = selectEstado.value;
            pintarMarcadores(estadoSeleccionado);
            lanzarNotificacionFlotanteIzquierda(`📍 Mostrando sucursales en: ${estadoSeleccionado === 'todos' ? 'Toda la región' : estadoSeleccionado}`);
        };
    }

    const buscadorZona = document.querySelector('.buscador-zona');
    if (buscadorZona && !document.getElementById('btn-mi-ubicacion')) {
        const btnUbicacion = document.createElement('button');
        btnUbicacion.id = 'btn-mi-ubicacion';
        btnUbicacion.type = 'button';
        btnUbicacion.innerHTML = `<span class="material-icons" style="font-size:16px; vertical-align:middle;">my_location</span> Mi Ubicación`;
        btnUbicacion.style.cssText = 'background:#007bff; color:white; border:none; padding:10px 18px; border-radius:25px; font-family:"Montserrat"; font-weight:bold; cursor:pointer; margin-left:8px; box-shadow:0 3px 10px rgba(0,0,0,0.12);';
        buscadorZona.appendChild(btnUbicacion);
        btnUbicacion.onclick = () => detectarUbicacionUsuario(map, sucursales);
    }

    if (esAdmin && buscadorZona && !document.getElementById('btn-nueva-sucursal')) {
        const btnAddSuc = document.createElement('button');
        btnAddSuc.id = 'btn-nueva-sucursal';
        btnAddSuc.type = 'button';
        btnAddSuc.innerHTML = `<span class="material-icons" style="font-size:16px; vertical-align:middle;">add_location_alt</span> Agregar Sucursal`;
        btnAddSuc.style.cssText = 'background:#C5A447; color:white; border:none; padding:10px 18px; border-radius:25px; font-family:"Montserrat"; font-weight:bold; cursor:pointer; margin-left:8px; box-shadow:0 3px 10px rgba(0,0,0,0.12);';
        buscadorZona.appendChild(btnAddSuc);

        const bannerGuia = document.createElement('div');
        bannerGuia.id = 'banner-guia-mapa';
        bannerGuia.style.cssText = 'display:none; background:#fff0f6; border:2px dashed #ff69b4; color:#5c3d2e; padding:12px 18px; border-radius:12px; margin-bottom:12px; font-family:"Montserrat",sans-serif; font-size:13px; font-weight:bold; align-items:center; justify-content:space-between; gap:10px;';
        bannerGuia.innerHTML = `
            <span id="texto-guia-mapa">👆 Haz clic directamente en el mapa donde deseas ubicar la sucursal.</span>
            <button type="button" id="btn-cancelar-seleccion-mapa" style="background:#f2e1e1; color:#5c3d2e; border:none; padding:6px 12px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:12px;">Cancelar</button>
        `;
        const mapaDiv = document.getElementById('map');
        mapaDiv.parentNode.insertBefore(bannerGuia, mapaDiv);

        function activarSeleccionEnMapa(modo) {
            modoSeleccionMapa = modo;
            bannerGuia.style.display = 'flex';
            mapaDiv.style.cursor = 'crosshair';
            document.getElementById('texto-guia-mapa').innerText = modo === 'crear'
                ? '👆 Paso 1: Haz clic en el mapa en el lugar exacto de la nueva sucursal.'
                : '👆 Haz clic en el mapa en la nueva ubicación para mover esta sucursal.';
        }

        function desactivarSeleccionEnMapa() {
            modoSeleccionMapa = null;
            bannerGuia.style.display = 'none';
            mapaDiv.style.cursor = '';
        }

        document.getElementById('btn-cancelar-seleccion-mapa').onclick = () => {
            const modoPrevio = modoSeleccionMapa;
            desactivarSeleccionEnMapa();
            if (modoPrevio === 'editar') {
                modalEditSuc.style.display = 'flex';
            }
        };

        const modalSuc = document.createElement('div');
        modalSuc.id = 'modal-nueva-sucursal';
        modalSuc.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:99999; align-items:center; justify-content:center; font-family:"Montserrat",sans-serif; padding:15px;';
        modalSuc.innerHTML = `
            <div style="background:#fff; width:100%; max-width:420px; border-radius:16px; padding:25px; box-shadow:0 12px 30px rgba(0,0,0,0.2);">
                <h3 style="font-family:'Courgette', cursive; color:#5c3d2e; margin-top:0; font-size:1.6rem;">📍 Datos de la Nueva Sucursal</h3>
                <div style="background:#f0fff4; border:1px solid #c3e6cb; color:#155724; padding:8px 12px; border-radius:8px; font-size:12px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                    <span>✅ Ubicación seleccionada en el mapa</span>
                    <button type="button" id="btn-cambiar-punto-crear" style="background:none; border:none; color:#2e8b57; text-decoration:underline; font-weight:bold; cursor:pointer; font-size:11px;">Cambiar punto</button>
                </div>
                <form id="form-nueva-sucursal" style="display:flex; flex-direction:column; gap:10px;">
                    <input type="hidden" id="suc-lat">
                    <input type="hidden" id="suc-lng">

                    <label style="font-size:12px; font-weight:bold; color:#5c3d2e;">Nombre de la Sucursal:</label>
                    <input type="text" id="suc-nombre" placeholder="Ej. Dulce Alquimia - Tizimín" required style="padding:9px; border:1px solid #ccc; border-radius:8px;">

                    <label style="font-size:12px; font-weight:bold; color:#5c3d2e;">Estado:</label>
                    <input type="text" id="suc-estado" placeholder="Ej. Yucatán, Quintana Roo, Campeche" required style="padding:9px; border:1px solid #ccc; border-radius:8px;">

                    <label style="font-size:12px; font-weight:bold; color:#5c3d2e;">Horario o detalles:</label>
                    <input type="text" id="suc-info" placeholder="Ej. Abierto de 9:00 AM a 8:00 PM" required style="padding:9px; border:1px solid #ccc; border-radius:8px;">

                    <div style="display:flex; gap:10px; margin-top:12px;">
                        <button type="submit" style="flex:1; background:#2e8b57; color:white; border:none; padding:11px; border-radius:8px; font-weight:bold; cursor:pointer;">Guardar Sucursal</button>
                        <button type="button" id="btn-cerrar-suc" style="flex:1; background:#f2e1e1; color:#5c3d2e; border:none; padding:11px; border-radius:8px; font-weight:bold; cursor:pointer;">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modalSuc);

        const modalEditSuc = document.createElement('div');
        modalEditSuc.id = 'modal-editar-sucursal';
        modalEditSuc.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:99999; align-items:center; justify-content:center; font-family:"Montserrat",sans-serif; padding:15px;';
        modalEditSuc.innerHTML = `
            <div style="background:#fff; width:100%; max-width:420px; border-radius:16px; padding:25px; box-shadow:0 12px 30px rgba(0,0,0,0.2);">
                <h3 style="font-family:'Courgette', cursive; color:#5c3d2e; margin-top:0; font-size:1.6rem;">✏️ Editar Sucursal</h3>
                <form id="form-editar-sucursal" style="display:flex; flex-direction:column; gap:10px;">
                    <input type="hidden" id="edit-suc-id">
                    <input type="hidden" id="edit-suc-lat">
                    <input type="hidden" id="edit-suc-lng">

                    <label style="font-size:12px; font-weight:bold; color:#5c3d2e;">Nombre de la Sucursal:</label>
                    <input type="text" id="edit-suc-nombre" required style="padding:9px; border:1px solid #ccc; border-radius:8px;">

                    <label style="font-size:12px; font-weight:bold; color:#5c3d2e;">Estado:</label>
                    <input type="text" id="edit-suc-estado" required style="padding:9px; border:1px solid #ccc; border-radius:8px;">

                    <label style="font-size:12px; font-weight:bold; color:#5c3d2e;">Horario o detalles:</label>
                    <input type="text" id="edit-suc-info" required style="padding:9px; border:1px solid #ccc; border-radius:8px;">

                    <button type="button" id="btn-reubicar-en-mapa" style="background:#fff5f8; color:#ff69b4; border:1.5px dashed #ff69b4; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:12px; margin-top:4px;">
                        📍 Cambiar ubicación tocando el mapa
                    </button>
                    <small id="estado-reubicacion-txt" style="color:#2e8b57; font-size:11px; display:none; text-align:center; font-weight:bold;">
                        ✅ Nueva ubicación seleccionada en el mapa
                    </small>

                    <div style="display:flex; gap:10px; margin-top:12px;">
                        <button type="submit" style="flex:1; background:#2e8b57; color:white; border:none; padding:11px; border-radius:8px; font-weight:bold; cursor:pointer;">Guardar Cambios</button>
                        <button type="button" id="btn-cerrar-edit-suc" style="flex:1; background:#f2e1e1; color:#5c3d2e; border:none; padding:11px; border-radius:8px; font-weight:bold; cursor:pointer;">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modalEditSuc);

        btnAddSuc.onclick = () => {
            activarSeleccionEnMapa('crear');
        };

        document.getElementById('btn-cambiar-punto-crear').onclick = () => {
            modalSuc.style.display = 'none';
            activarSeleccionEnMapa('crear');
        };

        document.getElementById('btn-reubicar-en-mapa').onclick = () => {
            modalEditSuc.style.display = 'none';
            activarSeleccionEnMapa('editar');
        };

        document.getElementById('btn-cerrar-suc').onclick = () => {
            modalSuc.style.display = 'none';
            if (marcadorTemporal) { map.removeLayer(marcadorTemporal); marcadorTemporal = null; }
        };

        document.getElementById('btn-cerrar-edit-suc').onclick = () => {
            modalEditSuc.style.display = 'none';
            if (marcadorTemporal) { map.removeLayer(marcadorTemporal); marcadorTemporal = null; }
        };

        map.on('click', (e) => {
            if (!modoSeleccionMapa) return;

            const lat = e.latlng.lat.toFixed(6);
            const lng = e.latlng.lng.toFixed(6);

            if (marcadorTemporal) map.removeLayer(marcadorTemporal);
            marcadorTemporal = L.marker([lat, lng]).addTo(map);

            if (modoSeleccionMapa === 'crear') {
                document.getElementById('suc-lat').value = lat;
                document.getElementById('suc-lng').value = lng;
                desactivarSeleccionEnMapa();
                modalSuc.style.display = 'flex';
            } else if (modoSeleccionMapa === 'editar') {
                document.getElementById('edit-suc-lat').value = lat;
                document.getElementById('edit-suc-lng').value = lng;
                document.getElementById('estado-reubicacion-txt').style.display = 'block';
                desactivarSeleccionEnMapa();
                modalEditSuc.style.display = 'flex';
            }
        });

        document.getElementById('form-nueva-sucursal').onsubmit = async (e) => {
            e.preventDefault();
            const nueva = {
                nombre: document.getElementById('suc-nombre').value.trim(),
                estado: document.getElementById('suc-estado').value.trim(),
                latitud: document.getElementById('suc-lat').value,
                longitud: document.getElementById('suc-lng').value,
                info: document.getElementById('suc-info').value.trim()
            };

            try {
                const res = await fetch(`${API_BASE}/api/sucursales`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nueva)
                });
                if (res.ok) {
                    mostrarMensajeWeb('🏪 ¡Nueva sucursal agregada al mapa!', 'exito');
                    document.getElementById('form-nueva-sucursal').reset();
                    modalSuc.style.display = 'none';
                    if (marcadorTemporal) { map.removeLayer(marcadorTemporal); marcadorTemporal = null; }
                    await cargarSucursalesDesdeBD();
                    pintarMarcadores('todos');
                }
            } catch (err) {}
        };

        document.getElementById('form-editar-sucursal').onsubmit = async (e) => {
            e.preventDefault();
            const actualizada = {
                id: document.getElementById('edit-suc-id').value,
                nombre: document.getElementById('edit-suc-nombre').value.trim(),
                estado: document.getElementById('edit-suc-estado').value.trim(),
                latitud: document.getElementById('edit-suc-lat').value,
                longitud: document.getElementById('edit-suc-lng').value,
                info: document.getElementById('edit-suc-info').value.trim()
            };

            try {
                const res = await fetch(`${API_BASE}/api/sucursales`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(actualizada)
                });
                if (res.ok) {
                    mostrarMensajeWeb('🔄 ¡Sucursal actualizada con éxito!', 'exito');
                    modalEditSuc.style.display = 'none';
                    if (marcadorTemporal) { map.removeLayer(marcadorTemporal); marcadorTemporal = null; }
                    await cargarSucursalesDesdeBD();
                    pintarMarcadores('todos');
                }
            } catch (err) {}
        };
    }

    detectarUbicacionUsuario(map, sucursales);
}

window.abrirModalEditarSucursal = function(id, nombre, estado, lat, lng, info) {
    document.getElementById('edit-suc-id').value = id;
    document.getElementById('edit-suc-nombre').value = nombre;
    document.getElementById('edit-suc-estado').value = estado;
    document.getElementById('edit-suc-lat').value = lat;
    document.getElementById('edit-suc-lng').value = lng;
    document.getElementById('edit-suc-info').value = info;
    const avisoReubicacion = document.getElementById('estado-reubicacion-txt');
    if (avisoReubicacion) avisoReubicacion.style.display = 'none';
    document.getElementById('modal-editar-sucursal').style.display = 'flex';
};

window.eliminarSucursalServer = async function(id, nombre) {
    if (!confirm(`¿Estás completamente segura de cerrar y eliminar la sucursal "${nombre}"?`)) return;
    try {
        const res = await fetch(`${API_BASE}/api/sucursales`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (res.ok) {
            mostrarMensajeWeb('🗑️ Sucursal cerrada y removida del sistema.', 'error');
            setTimeout(() => location.reload(), 1000);
        }
    } catch (e) {
        mostrarMensajeWeb('❌ Error de conexión al eliminar sucursal.', 'error');
    }
};

function detectarUbicacionUsuario(map, sucursales) {
    if (navigator.geolocation && sucursales.length > 0) {
        navigator.geolocation.getCurrentPosition(position => {
            const latUser = position.coords.latitude;
            const lonUser = position.coords.longitude;
            let sucursalCercana = null;
            let distanciaMinima = Infinity;

            sucursales.forEach(suc => {
                const R = 6371;
                const dLat = (suc.coords[0] - latUser) * Math.PI / 180;
                const dLon = (suc.coords[1] - lonUser) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(latUser * Math.PI / 180) * Math.cos(suc.coords[0] * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distancia = R * c;
                if (distancia < distanciaMinima) {
                    distanciaMinima = distancia;
                    sucursalCercana = suc;
                }
            });

            const distanciaFinalKm = distanciaMinima.toFixed(1);
            const iconoUsuario = L.divIcon({
                html: '<span class="material-icons" style="color:#007bff; font-size:32px;">my_location</span>',
                className: 'custom-user-marker',
                iconSize: [30, 30]
            });

            L.marker([latUser, lonUser], { icon: iconoUsuario }).addTo(map)
                .bindPopup(`<div style="text-align:center; font-family:'Montserrat';"><strong>Tu Ubicación</strong><br><span style="color:#2e8b57; font-weight:bold;">Estás a ${distanciaFinalKm} km de la sucursal más cercana (${sucursalCercana.nombre}).</span></div>`);

            map.setView([latUser, lonUser], 10);
            lanzarNotificacionFlotanteIzquierda(`📍 Ubicación detectada. La sucursal más cercana (${sucursalCercana.nombre}) está a ${distanciaFinalKm} km.`);
        }, () => {
            lanzarNotificacionFlotanteIzquierda('⚠️ Activa los permisos de ubicación en tu navegador para ver la sucursal más cercana.');
        });
    }
}

function lanzarNotificacionFlotanteIzquierda(texto) {
    let contenedor = document.getElementById('notificaciones-izquierda-contenedor');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'notificaciones-izquierda-contenedor';
        document.body.appendChild(contenedor);
    }
    const burbuja = document.createElement('div');
    burbuja.className = 'burbuja-alerta-premium';
    burbuja.innerHTML = `
        <span class="material-icons" style="color:#C5A447; font-size:18px;">notifications_active</span>
        <span>${texto}</span>`;
    contenedor.appendChild(burbuja);
    actualizarPuntitosRojosAlerta();
    setTimeout(() => {
        burbuja.style.opacity = '0';
        burbuja.style.transform = 'translateX(-30px)';
        burbuja.style.transition = 'all 0.4s ease';
        setTimeout(() => burbuja.remove(), 400);
    }, 4000);
}

// Historial de pedidos y tablero admin
(function () {
    const API = API_BASE;
    const ADMIN_EMAIL = 'marivetteromero.1603@gmail.com';
    const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const RANGO_ESTADO = { pendiente: 0, entrega: 1, completado: 2, cancelado: 3 };

    let usuario = null;
    let esAdmin = false;
    let pedidos = [];
    const filtros = { orden: 'llegada', tipo: 'todos', estado: 'todos', texto: '' };

    const esc = (t) => String(t ?? '').replace(/[&<>"']/g,
        c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function tipoDe(p) { return String(p.servicio || '').startsWith('Domicilio') ? 'domicilio' : 'sucursal'; }
    function claveDia(ms) {
        const d = new Date(ms);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    function textoDia(ms) {
        const d = new Date(ms);
        const base = `${String(d.getDate()).padStart(2, '0')}/${MESES[d.getMonth()]}/${d.getFullYear()}`;
        const hoy = claveDia(Date.now());
        const ayer = claveDia(Date.now() - 86400000);
        const k = claveDia(ms);
        return k === hoy ? `Hoy · ${base}` : k === ayer ? `Ayer · ${base}` : base;
    }
    function textoHora(ms) {
        return new Date(ms).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }
    function numeroFolio(folio) { return parseInt(String(folio).replace(/\D/g, ''), 10) || 0; }

    function comparadorDia(orden) {
        switch (orden) {
            case 'llegada':
                return (a, b) => {
                    const r = RANGO_ESTADO[a.estado] - RANGO_ESTADO[b.estado];
                    if (r !== 0) return r;
                    if (a.estado === 'completado' || a.estado === 'cancelado') {
                        return (b.fecha_estado || b.fecha) - (a.fecha_estado || a.fecha);
                    }
                    return a.fecha - b.fecha;
                };
            case 'fecha_asc': return (a, b) => a.fecha - b.fecha;
            case 'fecha_desc': return (a, b) => b.fecha - a.fecha;
            case 'folio': return (a, b) => numeroFolio(a.idPedido) - numeroFolio(b.idPedido);
            case 'tipo': return (a, b) => tipoDe(a).localeCompare(tipoDe(b)) || a.fecha - b.fecha;
            default: return (a, b) => a.fecha - b.fecha;
        }
    }

    function pedidosFiltrados() {
        const t = filtros.texto.trim().toLowerCase();
        return pedidos.filter(p => {
            if (filtros.tipo !== 'todos' && tipoDe(p) !== filtros.tipo) return false;
            if (filtros.estado !== 'todos' && p.estado !== filtros.estado) return false;
            if (t && !`${p.idPedido} ${p.cliente} ${p.productos}`.toLowerCase().includes(t)) return false;
            return true;
        });
    }

    function pintarBarra() {
        const barra = document.getElementById('barra-filtros');
        if (!barra) return;
        barra.innerHTML = `
            <div class="filtro-grupo">
                <label for="f-orden">Ordenar por</label>
                <select id="f-orden">
                    <option value="llegada">Orden de llegada (pendiente → entrega → completado)</option>
                    <option value="fecha_desc">Fecha: más recientes primero</option>
                    <option value="fecha_asc">Fecha: más antiguos primero</option>
                    <option value="folio">Folio</option>
                    <option value="tipo">Tipo de servicio</option>
                </select>
            </div>
            <div class="filtro-grupo">
                <label for="f-tipo">Tipo</label>
                <select id="f-tipo">
                    <option value="todos">Todos</option>
                    <option value="sucursal">Recoger en sucursal</option>
                    <option value="domicilio">Envío a domicilio</option>
                </select>
            </div>
            <div class="filtro-grupo">
                <label for="f-estado">Estado</label>
                <select id="f-estado">
                    <option value="todos">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="entrega">En entrega</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                </select>
            </div>
            <div class="filtro-grupo filtro-buscar">
                <label for="f-texto">Buscar</label>
                <input type="search" id="f-texto" placeholder="Folio, cliente o postre...">
            </div>
            <button type="button" id="f-actualizar" class="btn-actualizar-pedidos" title="Volver a consultar el servidor">
                <span class="material-icons">refresh</span> Actualizar
            </button>`;

        document.getElementById('f-orden').value = filtros.orden;
        document.getElementById('f-orden').onchange = e => { filtros.orden = e.target.value; pintarTabla(); };
        document.getElementById('f-tipo').onchange = e => { filtros.tipo = e.target.value; pintarTabla(); };
        document.getElementById('f-estado').onchange = e => { filtros.estado = e.target.value; pintarTabla(); };
        document.getElementById('f-texto').oninput = e => { filtros.texto = e.target.value; pintarTabla(); };
        document.getElementById('f-actualizar').onclick = cargarPedidos;
    }

    function pintarTabla() {
        const cuerpo = document.getElementById('cuerpo-tabla-pedidos');
        if (!cuerpo) return;
        const lista = pedidosFiltrados();

        if (lista.length === 0) {
            cuerpo.innerHTML = `<tr><td colspan="6" class="pedidos-vacio">No hay pedidos que coincidan con lo que buscas.</td></tr>`;
            return;
        }

        const grupos = new Map();
        lista.forEach(p => {
            const k = claveDia(p.fecha);
            if (!grupos.has(k)) grupos.set(k, []);
            grupos.get(k).push(p);
        });

        const claves = [...grupos.keys()].sort();
        if (filtros.orden !== 'fecha_asc') claves.reverse();

        const cmp = comparadorDia(filtros.orden);
        let html = '';

        claves.forEach(k => {
            const delDia = grupos.get(k).sort(cmp);
            const cuenta = { pendiente: 0, entrega: 0, completado: 0, cancelado: 0 };
            delDia.forEach(p => { if (cuenta[p.estado] !== undefined) cuenta[p.estado]++; });

            html += `
                <tr class="fila-fecha"><td colspan="6">
                    <span class="material-icons">event</span>
                    <strong>${esc(textoDia(delDia[0].fecha))}</strong>
                    <span class="resumen-dia">
                        ${delDia.length} pedido${delDia.length === 1 ? '' : 's'}
                        ${cuenta.pendiente ? ` · ⏳ ${cuenta.pendiente}` : ''}
                        ${cuenta.entrega ? ` · 🛵 ${cuenta.entrega}` : ''}
                        ${cuenta.completado ? ` · ✅ ${cuenta.completado}` : ''}
                        ${cuenta.cancelado ? ` · ✖ ${cuenta.cancelado}` : ''}
                    </span>
                </td></tr>`;

            delDia.forEach(p => {
                let celdaEstado;
                if (esAdmin && p.estado !== 'cancelado') {
                    celdaEstado = `
                        <select class="select-estado-pedido" data-id="${esc(p.idPedido)}">
                            <option value="pendiente" ${p.estado === 'pendiente' ? 'selected' : ''}>Pendiente ⏳</option>
                            <option value="entrega" ${p.estado === 'entrega' ? 'selected' : ''}>En Entrega 🛵</option>
                            <option value="completado" ${p.estado === 'completado' ? 'selected' : ''}>Completado ✅</option>
                        </select>`;
                } else {
                    celdaEstado = `<span class="status-badge status-${esc(p.estado)}">${esc(p.estado)}</span>`;
                }

                let celdaAccion = '';
                if (esAdmin) {
                    celdaAccion = (p.estado === 'completado' || p.estado === 'cancelado')
                        ? `<button type="button" class="btn-ocultar-admin" data-id="${esc(p.idPedido)}" title="Quitar de mi panel" style="background:#f8d7da; color:#721c24; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:bold;">Quitar</button>`
                        : `<span class="sin-accion" title="En proceso">—</span>`;
                } else {
                    celdaAccion = p.estado === 'pendiente'
                        ? `<button type="button" class="btn-cancelar-pedido" data-id="${esc(p.idPedido)}">Cancelar</button>`
                        : `<span class="sin-accion" title="Solo se puede cancelar mientras está pendiente">—</span>`;
                }

                html += `
                    <tr class="fila-pedido fila-${esc(p.estado)}">
                        <td style="font-weight:bold; color:#5c3d2e;">${esc(p.idPedido)}<br><small class="hora-pedido">${esc(textoHora(p.fecha))}</small></td>
                        <td style="font-size:13px; font-weight:600; color:#5d4037;">${esc(p.cliente)}<br><small style="color:#a1887f;">${esc(p.servicio)}</small></td>
                        <td style="font-size:12px; color:#5d4037; font-weight:500;">${esc(p.productos)}</td>
                        <td style="font-weight:bold; color:#ff69b4;">${esc(p.total)}</td>
                        <td>${celdaEstado}</td>
                        <td>${celdaAccion}</td>
                    </tr>`;
            });
        });

        cuerpo.innerHTML = html;
        enlazarAcciones(cuerpo);
    }

    function enlazarAcciones(cuerpo) {
        cuerpo.querySelectorAll('.select-estado-pedido').forEach(sel => {
            sel.onchange = () => cambiarEstado(sel.dataset.id, sel.value);
        });
        cuerpo.querySelectorAll('.btn-cancelar-pedido').forEach(btn => {
            btn.onclick = () => cancelarPedido(btn.dataset.id);
        });
        cuerpo.querySelectorAll('.btn-ocultar-admin').forEach(btn => {
            btn.onclick = () => ocultarPedidoAdmin(btn.dataset.id);
        });
    }

    async function cambiarEstado(idPedido, nuevoEstado) {
        try {
            const res = await fetch(`${API}/api/pedidos/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idPedido, estado: nuevoEstado })
            });
            if (res.ok) {
                mostrarMensajeWeb('🔄 Estado de entrega modificado con éxito.', 'exito');
            }
        } catch (err) {
            mostrarMensajeWeb('❌ Error de conexión.', 'error');
        }
        await cargarPedidos();
    }

    async function cancelarPedido(idPedido) {
        if (!confirm(`¿Seguro que quieres cancelar el pedido ${idPedido}?`)) return;
        try {
            const res = await fetch(`${API}/api/pedidos/cancelar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idPedido, correo: usuario.email })
            });
            if (res.ok) {
                mostrarMensajeWeb(`🛑 Pedido ${idPedido} cancelado.`, 'exito');
            }
        } catch (err) {
            mostrarMensajeWeb('❌ Error de conexión.', 'error');
        }
        await cargarPedidos();
    }

    async function ocultarPedidoAdmin(idPedido) {
        if (!confirm(`¿Quitar el pedido ${idPedido} de tu vista?`)) return;
        try {
            const res = await fetch(`${API}/api/pedidos/ocultar-admin`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idPedido })
            });
            if (res.ok) {
                mostrarMensajeWeb(`🗑️ Pedido ${idPedido} quitado de tu panel.`, 'exito');
                await cargarPedidos();
            }
        } catch (err) {
            mostrarMensajeWeb('❌ Error de conexión.', 'error');
        }
    }

    async function cargarBannerPersonalizadosEnHistorial() {
        const barra = document.getElementById('barra-filtros');
        if (!barra) return;
        try {
            const res = await fetch(`${API}/api/personalizados`);
            if (!res.ok) return;
            const lista = await res.json();
            const pendientes = lista.filter(p => p.estado === 'pendiente');

            const caja = document.createElement('div');
            caja.style.cssText = 'margin-bottom:20px; border:1.5px solid #C5A447; border-radius:12px; background:#fffdf7; overflow:hidden; font-family:"Montserrat",sans-serif;';

            caja.innerHTML = `
                <div id="toggle-pers-historial" style="padding:12px 18px; background:linear-gradient(90deg, #fff5f8, #fdf6e7); cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="material-icons" style="color:#C5A447;">cake</span>
                        <strong style="color:#5c3d2e; font-size:14px;">
                            Recordatorio: Pedidos Personalizados Pendientes (${pendientes.length})
                        </strong>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:11px; color:#8d6e63;">Clic para desplegar/ocultar</span>
                        <span class="material-icons" id="icono-flecha-pers" style="color:#5c3d2e; transition:transform 0.3s;">expand_more</span>
                    </div>
                </div>
                <div id="contenido-pers-desplegable" style="display:none; padding:15px; border-top:1px dashed #ead8c3;">
                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-bottom:12px;">
                        <a href="ControlVentas.html#seccion-personalizados-completa" 
                           style="background:linear-gradient(135deg, #ff69b4, #C5A447); color:white; text-decoration:none; padding:8px 16px; border-radius:20px; font-size:12px; font-weight:bold; display:inline-flex; align-items:center; gap:6px; box-shadow:0 3px 10px rgba(255,105,180,0.25);">
                            <span class="material-icons" style="font-size:16px;">add_circle</span> + Agregar / Ver Todos los Personalizados
                        </a>
                    </div>
                    ${pendientes.length === 0
                        ? '<p style="margin:0; font-size:13px; color:#888; text-align:center;">No hay pedidos personalizados pendientes por el momento.</p>'
                        : `<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px;">
                            ${pendientes.map(p => `
                                <div onclick="window.location.href='ControlVentas.html#pers-${p.id}'"
                                     title="Clic para ver foto de referencia y detalles completos"
                                     style="background:#fff; border:1px solid #f0d9e0; border-radius:10px; padding:12px; cursor:pointer; transition:transform 0.2s; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
                                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                        <span style="background:#fff0f6; color:#ff69b4; font-weight:700; font-size:11px; padding:2px 8px; border-radius:10px;">${esc(p.tipo)}</span>
                                        <span style="font-size:11px; font-weight:700; color:#C5A447;">Entrega: ${esc(p.fecha_entrega)}</span>
                                    </div>
                                    <p style="margin:6px 0 0 0; font-size:12.5px; color:#5d4037; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                                        <strong>Descripción:</strong> ${esc(p.descripcion)}
                                    </p>
                                    <small style="display:block; margin-top:6px; color:#ff69b4; font-weight:600;">Ver detalles completos →</small>
                                </div>
                            `).join('')}
                           </div>`
                    }
                </div>
            `;

            barra.insertAdjacentElement('beforebegin', caja);

            document.getElementById('toggle-pers-historial').onclick = () => {
                const cuerpo = document.getElementById('contenido-pers-desplegable');
                const flecha = document.getElementById('icono-flecha-pers');
                const abierto = cuerpo.style.display === 'block';
                cuerpo.style.display = abierto ? 'none' : 'block';
                flecha.style.transform = abierto ? 'rotate(0deg)' : 'rotate(180deg)';
            };
        } catch (e) {}
    }

    async function cargarPedidos() {
        const cuerpo = document.getElementById('cuerpo-tabla-pedidos');
        if (!cuerpo) return;
        try {
            const url = esAdmin ? `${API}/api/pedidos` : `${API}/api/pedidos?correo=${encodeURIComponent(usuario.email)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            pedidos = await res.json();
            pintarTabla();
        } catch (error) {
            cuerpo.innerHTML = `<tr><td colspan="6" class="pedidos-vacio" style="color:#721c24;">Error al conectar con el servidor.</td></tr>`;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('cuerpo-tabla-pedidos')) return;
        usuario = JSON.parse(localStorage.getItem('usuarioAlquimia'));
        if (!usuario) { window.location.href = 'Login.html'; return; }

        const correoActual = String(usuario.email || usuario.correo || '').trim().toLowerCase();
        usuario.email = correoActual;
        esAdmin = correoActual === ADMIN_EMAIL.toLowerCase();

        const titulo = document.getElementById('titulo-tablero-pedidos');
        if (titulo) {
            titulo.innerHTML = esAdmin
                ? `🏪 Pedidos: <span class="badge-admin-verificado">Modo Administradora</span>`
                : '📦 Mi Historial de Pedidos';
        }
        filtros.orden = esAdmin ? 'llegada' : 'fecha_desc';
        pintarBarra();

        if (esAdmin) {
            cargarBannerPersonalizadosEnHistorial();
        }
        cargarPedidos();
    });
})();

async function registrarAlertaEnServidor(
    rolDestino,
    mensaje,
    emailUsuario = null,
    generadoPor = null
) {
    try {
        const usuarioActivo =
            JSON.parse(localStorage.getItem('usuarioAlquimia')) || {};

        if (!generadoPor) {
            generadoPor = usuarioActivo.email || usuarioActivo.correo || null;
        }

        const respuesta = await fetch(
            `${API_BASE}/api/alertas/crear`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rolDestino,
                    mensaje,
                    emailUsuario,
                    generadoPor
                })
            }
        );

        if (!respuesta.ok) {
            console.error(
                'El servidor rechazó la alerta:',
                respuesta.status
            );
            return false;
        }

        return true;

    } catch (error) {
        console.error(
            'Error al registrar alerta:',
            error
        );
        return false;
    }
}

// CONTROL DE VENTAS, CONTABILIDAD Y PERSONALIZADOS (SOLO ADMIN)
(function () {
    const API = API_BASE;
    const ADMIN_EMAIL = 'marivetteromero.1603@gmail.com';
    let pedidosNormales = [];
    let pedidosPers = [];
    let gastosLista = [];
    let graficaInstancia = null;

    const parsearMonto = (val) => {
        if (typeof val === 'number') return val;
        return parseFloat(String(val || '0').replace(/[^0-9.-]+/g, '')) || 0;
    };

    const formatoMoneda = (num) => '$' + Number(num || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    async function cargarDatosControlVentas() {
        try {
            const [resNorm, resPers, resGastos] = await Promise.all([
                fetch(`${API}/api/pedidos`),
                fetch(`${API}/api/personalizados`),
                fetch(`${API}/api/contabilidad/gastos`)
            ]);
            pedidosNormales = resNorm.ok ? await resNorm.json() : [];
            pedidosPers = resPers.ok ? await resPers.json() : [];
            gastosLista = resGastos.ok ? await resGastos.json() : [];
            actualizarDashboardVentas();
            pintarTarjetasPersonalizados();
            enfocarPersonalizadoDesdeHash();
        } catch (err) {
            mostrarMensajeWeb('❌ Error al cargar datos financieros.', 'error');
        }
    }

    function actualizarDashboardVentas() {
        const { desde, hasta } = obtenerRangoSeleccionado();

        const normFiltrados = pedidosNormales.filter(p => {
            const f = Number(p.fecha !== undefined ? p.fecha : p.Fecha) || 0;
            return f >= desde && f <= hasta;
        });

        const persFiltrados = pedidosPers.filter(p => {
            const f = Number(p.fecha_orden !== undefined ? p.fecha_orden : p.FechaOrden) || 0;
            return f >= desde && f <= hasta;
        });

        const gastosFiltrados = gastosLista.filter(g => {
            const f = Number(g.fecha !== undefined ? g.fecha : g.Fecha) || 0;
            return f >= desde && f <= hasta;
        });

        let ganadosCat = 0, ganadosPers = 0, esperaTotal = 0, porCobrarPers = 0, perdidosTotal = 0, gastosTotal = 0;
        let cantEspera = 0, cantPerdidos = 0, cantCompletados = 0;

        const tipoVista = document.getElementById('filtro-agrupacion-grafica') ? document.getElementById('filtro-agrupacion-grafica').value : 'dias';
        const mapaFechas = new Map();

        const registrarEnPeriodo = (ms, tipo, monto) => {
            const d = new Date(ms);
            let clave = '';
            let ordenKey = ms;

            if (tipoVista === 'meses') {
                const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                clave = `${mesesNombres[d.getMonth()]} ${d.getFullYear()}`;
                ordenKey = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
            } else if (tipoVista === 'anios') {
                clave = `${d.getFullYear()}`;
                ordenKey = new Date(d.getFullYear(), 0, 1).getTime();
            } else {
                clave = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                ordenKey = ms;
            }

            if (!mapaFechas.has(clave)) mapaFechas.set(clave, { ganados: 0, gastos: 0, espera: 0, perdidos: 0, orden: ordenKey });
            mapaFechas.get(clave)[tipo] += monto;
        };

        normFiltrados.forEach(p => {
            const estado = String(p.estado || p.Estado || '').toLowerCase();
            const totalVal = p.total !== undefined ? p.total : p.Total;
            const fechaVal = Number(p.fecha !== undefined ? p.fecha : p.Fecha) || Date.now();
            const m = parsearMonto(totalVal);

            if (estado === 'completado') {
                ganadosCat += m;
                cantCompletados++;
                registrarEnPeriodo(fechaVal, 'ganados', m);
            } else if (estado === 'pendiente' || estado === 'entrega') {
                esperaTotal += m;
                cantEspera++;
                registrarEnPeriodo(fechaVal, 'espera', m);
            } else if (estado === 'cancelado') {
                perdidosTotal += m;
                cantPerdidos++;
                registrarEnPeriodo(fechaVal, 'perdidos', m);
            }
        });

        persFiltrados.forEach(p => {
            const estado = String(p.estado || p.Estado || '').toLowerCase();
            const precioVal = p.precio !== undefined ? p.precio : p.Precio;
            const anticipoVal = p.anticipo !== undefined ? p.anticipo : p.Anticipo;
            const fechaOrdenVal = Number(p.fecha_orden !== undefined ? p.fecha_orden : p.FechaOrden) || Date.now();
            const m = parsearMonto(precioVal);
            const ant = parsearMonto(anticipoVal);

            if (estado === 'completado') {
                ganadosPers += m;
                cantCompletados++;
                registrarEnPeriodo(fechaOrdenVal, 'ganados', m);
            } else if (estado === 'pendiente') {
                esperaTotal += m;
                porCobrarPers += Math.max(0, m - ant);
                cantEspera++;
                registrarEnPeriodo(fechaOrdenVal, 'espera', m);
            } else if (estado === 'cancelado') {
                perdidosTotal += m;
                cantPerdidos++;
                registrarEnPeriodo(fechaOrdenVal, 'perdidos', m);
            }
        });

        gastosFiltrados.forEach(g => {
            const montoVal = g.monto !== undefined ? g.monto : g.Monto;
            const fechaVal = Number(g.fecha !== undefined ? g.fecha : g.Fecha) || Date.now();
            const m = parsearMonto(montoVal);
            gastosTotal += m;
            registrarEnPeriodo(fechaVal, 'gastos', m);
        });

        const totalGanados = ganadosCat + ganadosPers;
        const utilidadNeta = totalGanados - gastosTotal;
        const totalMovimientos = normFiltrados.length + persFiltrados.length + gastosFiltrados.length;
        const diasUnicos = Math.max(1, mapaFechas.size);
        const sumaGlobal = totalGanados + esperaTotal + perdidosTotal;

        document.getElementById('texto-resumen-entradas').innerText = `${totalMovimientos} movimientos contables`;
        document.getElementById('kpi-balance').innerText = formatoMoneda(utilidadNeta);
        document.getElementById('kpi-balance').style.color = utilidadNeta >= 0 ? '#2e8b57' : '#d9534f';
        document.getElementById('kpi-prom-dia').innerText = formatoMoneda(totalGanados / diasUnicos);
        document.getElementById('kpi-ticket').innerText = formatoMoneda(cantCompletados ? totalGanados / cantCompletados : 0);

        document.getElementById('kpi-ganados').innerText = formatoMoneda(totalGanados);
        document.getElementById('kpi-ganados-cat').innerText = formatoMoneda(ganadosCat);
        document.getElementById('kpi-ganados-pers').innerText = formatoMoneda(ganadosPers);

        document.getElementById('kpi-gastos').innerText = formatoMoneda(gastosTotal);
        document.getElementById('kpi-cant-gastos').innerText = gastosFiltrados.length;

        document.getElementById('kpi-espera').innerText = formatoMoneda(esperaTotal);
        document.getElementById('kpi-cant-espera').innerText = cantEspera;
        document.getElementById('kpi-por-cobrar').innerText = formatoMoneda(porCobrarPers);

        document.getElementById('kpi-perdidos').innerText = formatoMoneda(perdidosTotal);
        document.getElementById('kpi-cant-perdidos').innerText = cantPerdidos;
        document.getElementById('kpi-tasa-perdida').innerText = sumaGlobal > 0 ? `${((perdidosTotal / sumaGlobal) * 100).toFixed(1)}%` : '0%';

        renderizarGraficaVentas(mapaFechas);
    }

    function renderizarGraficaVentas(mapaFechas) {
        const ctx = document.getElementById('graficaVentasCanvas');
        if (!ctx || typeof Chart === 'undefined') return;

        const entradasOrdenadas = Array.from(mapaFechas.entries())
            .sort((a, b) => a[1].orden - b[1].orden)
            .slice(-5);

        const etiquetas = entradasOrdenadas.map(e => e[0]);

        if (graficaInstancia) graficaInstancia.destroy();

        graficaInstancia = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: etiquetas.length ? etiquetas : ['Sin datos'],
                datasets: [
                    { label: 'Ingresos ($)', data: entradasOrdenadas.map(e => e[1].ganados), backgroundColor: 'rgba(129, 199, 132, 0.8)', borderColor: '#81c784', borderWidth: 1, borderRadius: 4 },
                    { label: 'Gastos ($)', data: entradasOrdenadas.map(e => e[1].gastos), backgroundColor: 'rgba(255, 183, 77, 0.8)', borderColor: '#ffb74d', borderWidth: 1, borderRadius: 4 },
                    { label: 'En Espera ($)', data: entradasOrdenadas.map(e => e[1].espera), backgroundColor: 'rgba(255, 241, 118, 0.8)', borderColor: '#fff176', borderWidth: 1, borderRadius: 4 },
                    { label: 'Perdidos ($)', data: entradasOrdenadas.map(e => e[1].perdidos), backgroundColor: 'rgba(229, 115, 115, 0.8)', borderColor: '#e57373', borderWidth: 1, borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { font: { family: 'Montserrat', size: 11, weight: '600' }, color: '#5c3d2e', boxWidth: 12, padding: 12 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(92, 61, 46, 0.9)',
                        titleFont: { family: 'Montserrat', size: 12, weight: '700' },
                        bodyFont: { family: 'Montserrat', size: 11 },
                        padding: 10,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Montserrat', size: 11 }, color: '#7d665e' }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(244, 231, 230, 0.5)' },
                        ticks: { font: { family: 'Montserrat', size: 11 }, color: '#7d665e', callback: value => '$' + value.toLocaleString() }
                    }
                }
            }
        });
    }

    function obtenerRangoSeleccionado() {
        const modo = document.getElementById('filtro-periodo-ventas').value;
        const ahora = new Date();
        const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
        const finHoy = inicioHoy + 86400000 - 1;

        if (modo === 'hoy') return { desde: inicioHoy, hasta: finHoy };
        if (modo === 'semana') return { desde: inicioHoy - 6 * 86400000, hasta: finHoy };
        if (modo === 'mes') return { desde: new Date(ahora.getFullYear(), ahora.getMonth(), 1).getTime(), hasta: finHoy };
        if (modo === 'personalizado') {
            const dStr = document.getElementById('fecha-desde').value;
            const hStr = document.getElementById('fecha-hasta').value;
            const desde = dStr ? new Date(dStr + 'T00:00:00').getTime() : 0;
            const hasta = hStr ? new Date(hStr + 'T23:59:59').getTime() : Infinity;
            return { desde, hasta };
        }
        return { desde: 0, hasta: Infinity };
    }

    function pintarTarjetasPersonalizados() {
        const grid = document.getElementById('grid-pedidos-personalizados');
        if (!grid) return;
        const filtroEst = document.getElementById('filtro-estado-pers').value;
        const lista = pedidosPers.filter(p => filtroEst === 'todos' || p.estado === filtroEst);

        if (lista.length === 0) {
            grid.innerHTML = `<p style="color:#888; grid-column:1/-1; text-align:center; padding:25px;">No hay pedidos personalizados en esta categoría.</p>`;
            return;
        }

        grid.innerHTML = lista.map(p => {
            const fechaOrdenStr = new Date(p.fecha_orden).toLocaleDateString('es-MX');
            const restante = Math.max(0, parsearMonto(p.precio) - parsearMonto(p.anticipo));
            const imgHtml = p.foto_referencia
                ? `<img src="${p.foto_referencia}" alt="Referencia ${p.tipo}">`
                : `<div style="height:140px; background:#fff0f6; display:flex; align-items:center; justify-content:center; color:#ff69b4; font-size:12px;"><span class="material-icons" style="margin-right:5px;">cake</span> Sin foto de referencia</div>`;

            return `
                <div class="card-personalizado" id="pers-${p.id}">
                    ${imgHtml}
                    <div class="card-pers-body">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="badge-tipo">${p.tipo}</span>
                            <strong style="color:#5c3d2e; font-size:12px;">${p.folio}</strong>
                        </div>
                        <h4 style="margin:6px 0 2px 0; color:#5c3d2e; font-size:15px;">A nombre de: ${p.cliente}</h4>
                        ${p.telefono ? `<div style="font-size:12px; color:#7d665e;">📞 Tel: <strong>${p.telefono}</strong></div>` : ''}
                        <p style="margin:6px 0; line-height:1.4;">${p.descripcion}</p>
                        <div style="background:#faf4f4; padding:8px 10px; border-radius:8px; font-size:12px; margin-top:auto;">
                            <div>📅 <strong>Ordenado:</strong> ${fechaOrdenStr} | 🚚 <strong>Entrega:</strong> ${p.fecha_entrega}</div>
                            <div style="margin-top:4px;">💰 <strong>Precio:</strong> ${formatoMoneda(p.precio)} | <strong>Anticipo:</strong> ${formatoMoneda(p.anticipo)}</div>
                            <div style="margin-top:2px; color:${restante > 0 && p.estado === 'pendiente' ? '#d9534f' : '#2e8b57'}; font-weight:700;">
                                ${p.estado === 'completado' ? '✅ Pagado al 100%' : `Resta por pagar: ${formatoMoneda(restante)}`}
                            </div>
                        </div>
                        <div style="margin-top:10px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
                            <label style="font-size:11px; font-weight:bold;">Estado:</label>
                            <select class="select-estado-pers" data-id="${p.id}" style="flex:1; padding:6px; border-radius:6px; border:1px solid #ccc; font-family:'Montserrat'; font-size:12px;">
                                <option value="pendiente" ${p.estado === 'pendiente' ? 'selected' : ''}>En espera / Pendiente ⏳</option>
                                <option value="completado" ${p.estado === 'completado' ? 'selected' : ''}>Completado / Entregado ✅</option>
                                <option value="cancelado" ${p.estado === 'cancelado' ? 'selected' : ''}>Cancelado / Perdido ✖</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        grid.querySelectorAll('.select-estado-pers').forEach(sel => {
            sel.onchange = async () => {
                try {
                    const res = await fetch(`${API}/api/personalizados/estado`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: sel.dataset.id, estado: sel.value })
                    });
                    if (res.ok) {
                        mostrarMensajeWeb('🔄 Estado del pedido personalizado actualizado.', 'exito');
                        await cargarDatosControlVentas();
                    }
                } catch (e) {
                    mostrarMensajeWeb('❌ Error al actualizar estado.', 'error');
                }
            };
        });
    }

    function enfocarPersonalizadoDesdeHash() {
        const hash = window.location.hash;
        if (!hash || !hash.startsWith('#pers-')) return;
        const tarjeta = document.querySelector(hash);
        if (tarjeta) {
            setTimeout(() => {
                tarjeta.scrollIntoView({ behavior: 'smooth', block: 'center' });
                tarjeta.style.boxShadow = '0 0 0 4px #C5A447, 0 10px 25px rgba(197, 164, 71, 0.4)';
                tarjeta.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    tarjeta.style.boxShadow = '';
                    tarjeta.style.transform = '';
                }, 2800);
            }, 250);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('graficaVentasCanvas')) return;
        const usuario = JSON.parse(localStorage.getItem('usuarioAlquimia'));

        if (!usuario || usuario.email !== ADMIN_EMAIL) {
            window.location.href = 'Dulce_Alquimia.html';
            return;
        }

        const selPeriodo = document.getElementById('filtro-periodo-ventas');
        const boxCustom = document.getElementById('inputs-rango-custom');
        selPeriodo.onchange = () => {
            boxCustom.style.display = selPeriodo.value === 'personalizado' ? 'flex' : 'none';
            actualizarDashboardVentas();
        };
        document.getElementById('fecha-desde').onchange = actualizarDashboardVentas;
        document.getElementById('fecha-hasta').onchange = actualizarDashboardVentas;
        document.getElementById('filtro-estado-pers').onchange = pintarTarjetasPersonalizados;

        const modal = document.getElementById('modal-nuevo-personalizado');
        const abrirModalPers = () => { modal.style.display = 'flex'; };

        const btnFlotantePers = document.getElementById('btn-abrir-modal-pers');
        if (btnFlotantePers) btnFlotantePers.onclick = abrirModalPers;

        const btnInline = document.getElementById('btn-agregar-pers-inline');
        if (btnInline) btnInline.onclick = abrirModalPers;

        const btnCerrarPers = document.getElementById('btn-cerrar-modal-pers');
        if (btnCerrarPers) btnCerrarPers.onclick = () => { modal.style.display = 'none'; };

        const modalGasto = document.getElementById('modal-nuevo-gasto');
        const btnAbrirGasto = document.getElementById('btn-abrir-modal-gasto');
        if (btnAbrirGasto) btnAbrirGasto.onclick = () => { modalGasto.style.display = 'flex'; };

        const btnCerrarGasto = document.getElementById('btn-cerrar-modal-gasto');
        if (btnCerrarGasto) btnCerrarGasto.onclick = () => { modalGasto.style.display = 'none'; };

        document.getElementById('form-nuevo-gasto').onsubmit = async (e) => {
            e.preventDefault();
            try {
                const res = await fetch(`${API}/api/contabilidad/gastos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        concepto: document.getElementById('gasto-concepto').value.trim(),
                        categoria: document.getElementById('gasto-categoria').value,
                        monto: document.getElementById('gasto-monto').value
                    })
                });
                if (res.ok) {
                    mostrarMensajeWeb('🧾 Gasto registrado en contabilidad.', 'exito');
                    document.getElementById('form-nuevo-gasto').reset();
                    modalGasto.style.display = 'none';
                    await cargarDatosControlVentas();
                }
            } catch (err) {
                mostrarMensajeWeb('❌ Error al guardar gasto.', 'error');
            }
        };

        document.getElementById('form-nuevo-personalizado').onsubmit = (e) => {
            e.preventDefault();
            const guardar = async (fotoBase64) => {
                const payload = {
                    cliente: document.getElementById('pers-cliente').value.trim(),
                    telefono: document.getElementById('pers-telefono').value.trim(),
                    tipo: document.getElementById('pers-tipo').value,
                    descripcion: document.getElementById('pers-descripcion').value.trim(),
                    precio: document.getElementById('pers-precio').value,
                    anticipo: document.getElementById('pers-anticipo').value,
                    fecha_entrega: document.getElementById('pers-fecha-entrega').value,
                    estado: document.getElementById('pers-estado').value,
                    foto_referencia: fotoBase64
                };

                try {
                    const res = await fetch(`${API}/api/personalizados`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (res.ok) {
                        mostrarMensajeWeb('🎂 ¡Pedido personalizado registrado con éxito!', 'exito');
                        document.getElementById('form-nuevo-personalizado').reset();
                        modal.style.display = 'none';
                        await cargarDatosControlVentas();
                    } else {
                        mostrarMensajeWeb('❌ No se pudo guardar el pedido.', 'error');
                    }
                } catch (err) {
                    mostrarMensajeWeb('❌ Error de conexión con el servidor.', 'error');
                }
            };

            const archivo = document.getElementById('pers-foto').files[0];
            if (archivo) {
                const lector = new FileReader();
                lector.onload = (ev) => guardar(ev.target.result);
                lector.readAsDataURL(archivo);
            } else {
                guardar(null);
            }
        };

        const selectAgrupacion = document.getElementById('filtro-agrupacion-grafica');
        if (selectAgrupacion) {
            selectAgrupacion.onchange = actualizarDashboardVentas;
        }

        cargarDatosControlVentas();
    });
})();

setInterval(() => {
    actualizarPuntitosRojosAlerta();
}, 4000);