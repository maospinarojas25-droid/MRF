import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { controlCatalogo as ajustesLocales, productosEjemplo } from '../data/products'
import { cargarCatalogoPublico } from '../data/catalogApi'
import ProductCard from './ProductCard'

const estados = ['Todos', 'En stock', 'Catálogo']
const equiposDestacados = [
  { codigo: 'LA', nombre: 'LA', numero: '01' },
  { codigo: 'NY YANKEES', nombre: 'NY Yankees', numero: '02' },
  { codigo: 'SOX', nombre: 'SOX', numero: '03' },
]
const codigosDestacados = new Set(equiposDestacados.map((equipo) => equipo.codigo))

function normalizarEquipo(equipo = '') {
  const nombre = equipo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase().replace(/\s+/g, ' ')
  if (['NY', 'YANKEES', 'NEW YORK', 'NEW YORK YANKEES', 'NY YANKEES'].includes(nombre)) return 'NY YANKEES'
  if (['SOX', 'WHITE SOX', 'CHICAGO SOX', 'CHICAGO WHITE SOX'].includes(nombre)) return 'SOX'
  if (['LA', 'LOS ANGELES', 'DODGERS', 'LA DODGERS', 'LOS ANGELES DODGERS'].includes(nombre)) return 'LA'
  return nombre
}

function normalizarTextoCatalogo(texto = '') {
  return String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es')
}

const familiasColorCatalogo = [
  { clave: 'negro', nombre: 'Negro', terminos: ['negro', 'negra', 'negr', 'black'] },
  { clave: 'azul', nombre: 'Azul', terminos: ['azul', 'azules', 'navy', 'blue'] },
  { clave: 'verde', nombre: 'Verde', terminos: ['verde', 'verdes', 'green'] },
  { clave: 'rojo', nombre: 'Rojo', terminos: ['rojo', 'roja', 'red'] },
  { clave: 'blanco', nombre: 'Blanco', terminos: ['blanco', 'blanca', 'white'] },
  { clave: 'crema', nombre: 'Crema', terminos: ['crema', 'beige', 'hueso', 'ivory'] },
  { clave: 'gris', nombre: 'Gris', terminos: ['gris', 'gray', 'grey'] },
  { clave: 'cafe', nombre: 'Café', terminos: ['cafe', 'marron', 'brown'] },
  { clave: 'rosado', nombre: 'Rosado', terminos: ['rosado', 'rosa', 'pink'] },
  { clave: 'amarillo', nombre: 'Amarillo', terminos: ['amarillo', 'amarilla', 'yellow'] },
]

function familiaDeColor(color = '') {
  const normalizado = normalizarTextoCatalogo(color)
  return familiasColorCatalogo.find((familia) => familia.terminos.some((termino) => normalizado === termino || normalizado.startsWith(termino + ' ')))
}

const guias = {
  tallas: {
    etiqueta: 'AJUSTE Y MEDIDAS',
    titulo: 'Guía de tallas',
    texto: 'Mide el contorno de tu cabeza en centímetros y compáralo con la tabla. Si tienes dudas entre dos tallas, consúltanos antes de pedir.',
    imagen: '/guias/guia-tallas.png',
    alt: 'Guía de tallas MRF',
  },
  partes: {
    etiqueta: 'DETALLES DEL PRODUCTO',
    titulo: 'Partes de la gorra',
    texto: 'Conoce los detalles de nuestra gorra negra MRF con visera plana.',
    imagen: '/guias/visera-plana.png',
    alt: 'Guía de la gorra negra MRF con visera plana',
    whatsapp: true,
  },
}

function Catalog() {
  const location = useLocation()
  const catalogoInicial = location.state?.catalogoState || {}
  const [productosCatalogo, setProductosCatalogo] = useState(productosEjemplo)
  const [control, setControl] = useState(ajustesLocales)
  const [modoVista, setModoVista] = useState(catalogoInicial.modoVista || '')
  const [equiposAbiertos, setEquiposAbiertos] = useState(Boolean(catalogoInicial.equiposAbiertos))
  const [coleccionElegida, setColeccionElegida] = useState(catalogoInicial.coleccionElegida || '')
  const [estadoElegido, setEstadoElegido] = useState(catalogoInicial.estadoElegido || 'Todos')
  const [busqueda, setBusqueda] = useState(catalogoInicial.busqueda || '')
  const [colorElegido, setColorElegido] = useState(catalogoInicial.colorElegido || '')
  const [tallaElegida, setTallaElegida] = useState(catalogoInicial.tallaElegida || '')
  const [estiloViseraElegido, setEstiloViseraElegido] = useState(catalogoInicial.estiloViseraElegido || '')
  const [guiaAbierta, setGuiaAbierta] = useState(null)

  useEffect(() => {
    let activo = true
    cargarCatalogoPublico()
      .then((catalogo) => {
        if (!activo) return
        setProductosCatalogo(catalogo.productos)
        setControl(catalogo.ajustes)
      })
      .catch(() => {
        // Si todavía no se ejecutó el SQL de configuración, el catálogo conserva su vista de ejemplo.
      })
    return () => { activo = false }
  }, [])

  const productosColeccion = useMemo(
    () => productosCatalogo.filter((producto) => {
      if (modoVista === 'accesorios') return producto.categoria === 'Accesorio'
      if (modoVista === 'todas') return producto.categoria !== 'Accesorio'
      if (!coleccionElegida) return true
      if (producto.categoria === 'Accesorio') return false
      const codigoEquipo = normalizarEquipo(producto.ciudad)
      if (coleccionElegida === 'VARIEDADES') return Boolean(codigoEquipo) && !codigosDestacados.has(codigoEquipo)
      return codigoEquipo === normalizarEquipo(coleccionElegida)
    }),
    [productosCatalogo, modoVista, coleccionElegida]
  )
  const disponibles = productosColeccion.filter((producto) => producto.tipo === 'Disponible')
  const modelosCatalogo = productosColeccion.filter((producto) => producto.tipo === 'Catálogo')
  const enStock = disponibles.filter((producto) => Number(producto.stockQuantity) > 0)
  const hayDisponibles = control.disponiblesHabilitados && enStock.length > 0
  const hayCatalogo = control.encargosHabilitados && modelosCatalogo.length > 0
  const opcionesColor = [...new Map(productosColeccion
    .map((producto) => String(producto.color || '').trim())
    .filter(Boolean)
    .map((color) => {
      const familia = familiaDeColor(color)
      const normalizado = normalizarTextoCatalogo(color)
      return familia
        ? [`familia:${familia.clave}`, { valor: `familia:${familia.clave}`, etiqueta: familia.nombre }]
        : [`color:${normalizado}`, { valor: `color:${normalizado}`, etiqueta: color }]
    }))].map(([, opcion]) => opcion).sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, 'es'))
  const tallas = [...new Map(productosColeccion
    .filter((producto) => producto.tipo === 'Disponible' && producto.talla)
    .map((producto) => String(producto.talla).trim())
    .filter(Boolean)
    .map((talla) => [normalizarTextoCatalogo(talla), talla]))].map(([, talla]) => talla)
  const termino = normalizarTextoCatalogo(busqueda)
  const familiaBusqueda = familiasColorCatalogo.find((familia) => familia.terminos.includes(termino))

  const productosFiltrados = productosColeccion.filter((producto) => {
    const tipoEstaVisible =
      (producto.tipo !== 'Disponible' || control.disponiblesHabilitados) &&
      (producto.tipo !== 'Catálogo' || control.encargosHabilitados)
    const coincideEstado =
      estadoElegido === 'Todos' ||
      (estadoElegido === 'En stock' && producto.tipo === 'Disponible' && Number(producto.stockQuantity) > 0) ||
      (estadoElegido === 'Catálogo' && producto.tipo === 'Catálogo')
    const textoProducto = normalizarTextoCatalogo(`${producto.nombre} ${producto.color} ${producto.ciudad}`)
    const familiaProducto = familiaDeColor(producto.color)
    const coincideBusqueda = textoProducto.includes(termino) || (familiaBusqueda && familiaProducto?.clave === familiaBusqueda.clave)
    const coincideColor = !colorElegido || (colorElegido.startsWith('familia:')
      ? familiaProducto?.clave === colorElegido.slice('familia:'.length)
      : normalizarTextoCatalogo(producto.color) === colorElegido.slice('color:'.length))
    const coincideTalla = !tallaElegida || producto.talla === tallaElegida
    const coincideVisera = !estiloViseraElegido || producto.estiloVisera === estiloViseraElegido

    return tipoEstaVisible && coincideEstado && coincideBusqueda && coincideColor && coincideTalla && coincideVisera
  })

  function seleccionarTodas() {
    setModoVista('todas')
    setColeccionElegida('')
    setEstadoElegido('Todos')
    setBusqueda('')
    setColorElegido('')
    setTallaElegida('')
    setEstiloViseraElegido('')
  }

  function seleccionarAccesorios() {
    setModoVista('accesorios')
    setColeccionElegida('')
    setEstadoElegido('Todos')
    setBusqueda('')
    setColorElegido('')
    setTallaElegida('')
    setEstiloViseraElegido('')
  }

  function seleccionarEquipo(codigo) {
    setModoVista('equipos')
    setColeccionElegida(codigo)
    setEstadoElegido('Todos')
    setBusqueda('')
    setColorElegido('')
    setTallaElegida('')
    setEstiloViseraElegido('')
  }

  function volverASeleccion() {
    const volverAEquipos = modoVista === 'equipos'
    setModoVista('')
    setColeccionElegida('')
    setEquiposAbiertos(volverAEquipos)
    setEstiloViseraElegido('')
    setEstadoElegido('Todos')
    setBusqueda('')
    setColorElegido('')
    setTallaElegida('')
  }

  function limpiarFiltros() {
    setBusqueda('')
    setEstadoElegido('Todos')
    setColorElegido('')
    setTallaElegida('')
    setEstiloViseraElegido('')
  }

  const guiaSeleccionada = guiaAbierta ? guias[guiaAbierta] : null
  const tituloListado = modoVista === 'accesorios'
    ? 'Accesorios'
    : modoVista === 'todas'
      ? 'Todas las gorras'
      : coleccionElegida === 'VARIEDADES'
        ? 'Más variedades'
        : equiposDestacados.find((equipo) => equipo.codigo === normalizarEquipo(coleccionElegida))?.nombre || coleccionElegida

  return (
    <section className="catalogo catalogo-mrf" id="catalogo">
      <div className="catalogo-intro">
        <p className="etiqueta etiqueta-clara">{modoVista === 'accesorios' ? 'COMPLEMENTOS MRF' : 'CATÁLOGO · EQUIPOS'}</p>
        <div className="catalogo-intro-contenido">
          <div>
            <h2>{modoVista ? tituloListado : equiposAbiertos ? 'Elige tu estilo.' : 'Encuentra tu estilo.'}</h2>
            <p className="catalogo-intro-texto">
              {modoVista
                ? modoVista === 'accesorios'
                  ? 'Encuentra complementos para tu estilo y consulta su disponibilidad con MRF.'
                  : 'Explora los modelos y consulta su disponibilidad directamente con MRF.'
                : equiposAbiertos
                  ? 'Explora nuestros equipos destacados o descubre más variedades.'
                  : 'Elige cómo quieres explorar el catálogo.'}
            </p>
          </div>
        </div>
      </div>

      {!modoVista && !equiposAbiertos ? (
        <div className="selector-principal-catalogo">
          <button className="opcion-principal" type="button" onClick={seleccionarTodas}>
            <span className="opcion-principal-numero">01</span>
            <span className="opcion-principal-etiqueta">CATÁLOGO COMPLETO</span>
            <strong>Todas las gorras</strong>
            <span className="opcion-principal-pie">Ver todos los modelos <b>↗︎</b></span>
          </button>

          <button
            className={`opcion-principal opcion-equipos ${equiposAbiertos ? 'seleccionada' : ''}`}
            type="button"
            onClick={() => setEquiposAbiertos(true)}
            aria-expanded={equiposAbiertos}
          >
            <span className="opcion-principal-numero">02</span>
            <span className="opcion-principal-etiqueta">EQUIPOS</span>
            <strong>Equipos</strong>
            <span className="opcion-principal-pie">
              {equiposAbiertos ? 'Elige un equipo' : 'Explorar por equipo'}
              <b>{equiposAbiertos ? '⌄' : '↗︎'}</b>
            </span>
          </button>
          <button className="opcion-principal opcion-accesorios" type="button" onClick={seleccionarAccesorios}>
            <span className="opcion-principal-numero">03</span>
            <span className="opcion-principal-etiqueta">COMPLEMENTOS</span>
            <strong>Accesorios</strong>
            <span className="opcion-principal-pie">Explorar accesorios <b>↗︎</b></span>
          </button>

        </div>
      ) : (
        <button className="volver-opciones" type="button" onClick={volverASeleccion}>
          <span className="volver-opciones-icono" aria-hidden="true">←</span>
          <span>{modoVista === 'equipos' ? 'Cambiar equipo' : 'Cambiar selección'}</span>
        </button>
      )}

      {!modoVista && equiposAbiertos && (
        <div className="subselector-equipos selector-equipos-pantalla" aria-label="Seleccionar equipo">
          <div className="subselector-intro">
            <div>
              <p className="etiqueta etiqueta-clara">SELECCIÓN ESPECIAL</p>
              <h3>Equipos más destacados</h3>
            </div>
            <span>Selecciona un equipo para ver sus gorras.</span>
          </div>
          <button className="volver-selector-equipos" type="button" onClick={() => setEquiposAbiertos(false)}>
            ← Volver a las opciones
          </button>
          <div className="subselector-lista">
            {equiposDestacados.map((equipo) => (
              <button
                className="subselector-equipo"
                key={equipo.codigo}
                type="button"
                onClick={() => seleccionarEquipo(equipo.codigo)}
              >
                <span>EQUIPO / {equipo.numero}</span>
                <strong>{equipo.nombre}</strong>
                <b aria-hidden="true">↗︎</b>
              </button>
            ))}
          </div>
          <button className="subselector-variedades" type="button" onClick={() => seleccionarEquipo('VARIEDADES')}>
            <span><strong>Más variedades</strong><small>Explora gorras de cualquier otro equipo</small></span>
            <b aria-hidden="true">↗︎</b>
          </button>
        </div>
      )}

      {!modoVista && !equiposAbiertos && <div className="guias-catalogo" aria-label="Guías para elegir tu gorra">
        <article className="guia-teaser">
          <span className="guia-icono" aria-hidden="true">↔</span>
          <div>
            <p className="guia-etiqueta">ENCUENTRA TU AJUSTE</p>
            <h3>Guía de tallas</h3>
            <p>Elige el ajuste ideal para ti.</p>
          </div>
          <button type="button" onClick={() => setGuiaAbierta('tallas')}>
            Ver guía <span aria-hidden="true">↗︎</span>
          </button>
        </article>
        <article className="guia-teaser">
          <span className="guia-icono guia-icono-detalle" aria-hidden="true">MRF</span>
          <div>
            <p className="guia-etiqueta">DETALLES MRF</p>
            <h3>Conoce la gorra</h3>
            <p>Identifica cada parte y acabado.</p>
          </div>
          <button type="button" onClick={() => setGuiaAbierta('partes')}>
            Ver detalles <span aria-hidden="true">↗︎</span>
          </button>
        </article>
      </div>}

      {modoVista && (
        <div className="catalogo-listado">
          <div className="catalogo-listado-cabecera">
            <div>
              <p className="etiqueta etiqueta-clara">
                {modoVista === 'accesorios' ? 'COMPLEMENTOS MRF' : coleccionElegida ? `EQUIPO · ${tituloListado}` : 'CATÁLOGO COMPLETO'}
              </p>
              <h2>{tituloListado}</h2>
            </div>
          </div>

          {(!hayDisponibles || (coleccionElegida && disponibles.length === 0)) && (
            <aside className="aviso-inventario" aria-live="polite">
              <span className="aviso-inventario-icono" aria-hidden="true">i</span>
              <div>
              <strong>{modoVista === 'accesorios' ? 'No hay accesorios en stock físico por ahora. Revisa los modelos por encargo.' : control.mensajeSinDisponibles}</strong>
                {hayCatalogo && <span>Explora los modelos del catálogo y escríbenos para encargar el tuyo.</span>}
              </div>
              {hayCatalogo && (
                <button type="button" onClick={() => setEstadoElegido('Catálogo')}>
                  Ver catálogo <span aria-hidden="true">↗︎</span>
                </button>
              )}
            </aside>
          )}

          <aside className="catalogo-aclaracion" aria-label="Tiempos y disponibilidad">
            <span><strong>EN STOCK</strong> · Lo tenemos físicamente.</span>
            <span><strong>CATÁLOGO</strong> · Tiempo estimado de llegada: 2 a 3 semanas.</span>
          </aside>

          <div className="estado-filtros" role="group" aria-label="Filtrar por disponibilidad">
            {estados.map((estado) => {
              const deshabilitado =
                (estado === 'En stock' && !hayDisponibles) ||
            (estado === 'Catálogo' && !hayCatalogo)
              const cantidad = estado === 'En stock'
                ? enStock.length
                : estado === 'Catálogo' ? modelosCatalogo.length : productosColeccion.length

              return (
                <button
                  key={estado}
                  className={estadoElegido === estado ? 'estado-filtro activo' : 'estado-filtro'}
                  type="button"
                  disabled={deshabilitado}
                  onClick={() => setEstadoElegido(estado)}
                  aria-pressed={estadoElegido === estado}
                >
                  {estado === 'En stock' && cantidad === 0 ? 'Sin stock' : estado === 'Catálogo' ? 'Catálogo' : estado} <span>{cantidad}</span>
                </button>
              )
            })}
          </div>

          <div className="filtros-catalogo">
            <div className="busqueda-catalogo-campo">
              <input
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder={modoVista === 'accesorios' ? 'Búsqueda' : 'Buscar por gorra, color o equipo'}
                aria-label={modoVista === 'accesorios' ? 'Búsqueda de accesorios' : 'Buscar gorras por nombre, color o equipo'}
              />
            </div>
            {modoVista !== 'accesorios' && (
              <>
                <div className="filtro-catalogo-con-limpiar">
                  <select value={estiloViseraElegido} onChange={(evento) => setEstiloViseraElegido(evento.target.value)} aria-label="Filtrar por tipo de visera">
                    <option value="">Todas las viseras</option>
                    <option value="Plana">Visera plana</option>
                    <option value="Curva">Visera curva</option>
                  </select>
                  {estiloViseraElegido && <button className="filtro-catalogo-quitar" type="button" onClick={() => setEstiloViseraElegido('')} aria-label="Quitar filtro de visera" title="Quitar filtro de visera">×</button>}
                </div>
                <div className="filtro-catalogo-con-limpiar">
                  <select value={colorElegido} onChange={(evento) => setColorElegido(evento.target.value)} aria-label="Filtrar por familia de color">
                    <option value="">Todos los colores</option>
                    {opcionesColor.map((color) => <option key={color.valor} value={color.valor}>{color.etiqueta}</option>)}
                  </select>
                  {colorElegido && <button className="filtro-catalogo-quitar" type="button" onClick={() => setColorElegido('')} aria-label="Quitar filtro de color" title="Quitar filtro de color">×</button>}
                </div>
                <div className="filtro-catalogo-con-limpiar">
                  <select value={tallaElegida} onChange={(evento) => setTallaElegida(evento.target.value)} aria-label="Filtrar por talla">
                    <option value="">Todas las tallas</option>
                    {tallas.map((talla) => <option key={talla} value={talla}>{talla}</option>)}
                  </select>
                  {tallaElegida && <button className="filtro-catalogo-quitar" type="button" onClick={() => setTallaElegida('')} aria-label="Quitar filtro de talla" title="Quitar filtro de talla">×</button>}
                </div>
              </>
            )}
            <button className="limpiar-filtros" type="button" onClick={limpiarFiltros}>Limpiar filtros</button>
          </div>

          <p className="resultado-filtros" aria-live="polite">
            {productosFiltrados.length} {productosFiltrados.length === 1 ? 'modelo' : 'modelos'}
          </p>

          {productosFiltrados.length ? (
            <div className="productos-grid">
              {productosFiltrados.map((producto) => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  catalogoState={{
                    modoVista,
                    equiposAbiertos,
                    coleccionElegida,
                    estadoElegido,
                    busqueda,
                    colorElegido,
                    tallaElegida,
                    estiloViseraElegido,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="sin-resultados">
              <h3>No hay modelos con esta selección.</h3>
              <p>Prueba otra opción o limpia los filtros para ver más productos.</p>
              <button type="button" className="limpiar-filtros" onClick={limpiarFiltros}>Ver todos los modelos</button>
            </div>
          )}
        </div>
      )}

      {guiaSeleccionada && (
        <div className="guia-modal-fondo" role="presentation" onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget) setGuiaAbierta(null)
        }}>
          <section className={`guia-modal ${guiaAbierta === 'partes' ? 'guia-modal-partes' : ''}`} role="dialog" aria-modal="true" aria-labelledby="guia-titulo">
            <button type="button" className="guia-cerrar" onClick={() => setGuiaAbierta(null)} aria-label="Cerrar guía">×</button>
            <p className="etiqueta etiqueta-clara">{guiaSeleccionada.etiqueta}</p>
            <h2 id="guia-titulo">{guiaSeleccionada.titulo}</h2>
            <p className="guia-modal-texto">{guiaSeleccionada.texto}</p>
            {guiaSeleccionada.imagenes ? (
              <div className="guia-opciones-visera">
                {guiaSeleccionada.imagenes.map((opcion) => (
                  <figure className="guia-opcion-visera" key={opcion.titulo}>
                    <div className="guia-opcion-imagen">
                      <img src={opcion.src} alt={opcion.alt} />
                    </div>
                    <figcaption>
                      <strong>{opcion.titulo}</strong>
                      <span>{opcion.termino}</span>
                    </figcaption>
                    {opcion.titulo === 'Visera plana' && (
                      <a className="visera-curvado-cta" href="https://wa.me/573224228633?text=Hola%2C%20me%20interesa%20una%20gorra%20de%20visera%20plana%2C%20pero%20quisiera%20saber%20si%20se%20puede%20curvar." target="_blank" rel="noreferrer">
                        ¿La prefieres curva? Nosotros le damos forma. <strong>Cuéntanos por WhatsApp ↗︎</strong>
                      </a>
                    )}
                  </figure>
                ))}
              </div>
            ) : (
              <>
                <div className="guia-imagen-marco guia-imagen-marco-partes">
                  <img src={guiaSeleccionada.imagen} alt={guiaSeleccionada.alt} onError={(evento) => {
                    evento.currentTarget.style.display = 'none';
                    const respaldo = evento.currentTarget.parentElement?.querySelector('.guia-imagen-vacia');
                    if (respaldo) respaldo.style.display = 'flex';
                  }} />
                  <div className="guia-imagen-vacia">
                    <strong>No se pudo cargar la guía.</strong>
                    <span>Intenta recargar la página.</span>
                  </div>
                </div>
                {guiaSeleccionada.whatsapp && (
                  <a className="visera-curvado-cta" href="https://wa.me/573224228633?text=Hola%2C%20me%20interesa%20una%20gorra%20de%20visera%20plana%2C%20pero%20quisiera%20saber%20si%20se%20puede%20curvar." target="_blank" rel="noreferrer">
                    ¿La prefieres curva? Nosotros le damos forma. <strong>Cuéntanos por WhatsApp ↗︎</strong>
                  </a>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </section>
  )
}

export default Catalog








