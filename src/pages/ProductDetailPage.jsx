import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import { productosEjemplo } from '../data/products'
import { cargarProducto } from '../data/catalogApi'

function ProductDetailPage() {
  const { id } = useParams()
  const [productoRemoto, setProductoRemoto] = useState(undefined)
  const [cargandoRemoto, setCargandoRemoto] = useState(true)
  const productoLocal = productosEjemplo.find((item) => item.id === id)
  const [guiaTallasAbierta, setGuiaTallasAbierta] = useState(false)

  useEffect(() => {
    let activo = true
    setProductoRemoto(undefined)
    setCargandoRemoto(true)
    cargarProducto(id)
      .then((producto) => { if (activo) setProductoRemoto(producto) })
      .catch(() => { if (activo) setProductoRemoto(undefined) })
      .finally(() => { if (activo) setCargandoRemoto(false) })
    return () => { activo = false }
  }, [id])

  useEffect(() => {
    if (!guiaTallasAbierta) return undefined
    const cerrarConEscape = (evento) => {
      if (evento.key === 'Escape') setGuiaTallasAbierta(false)
    }
    window.addEventListener('keydown', cerrarConEscape)
    return () => window.removeEventListener('keydown', cerrarConEscape)
  }, [guiaTallasAbierta])
  const producto = productoRemoto || productoLocal
  const estadoStock = producto?.tipo === 'Disponible'
    ? Number(producto.stockQuantity) > 0 ? 'En stock' : 'Agotada'
    : 'Catálogo internacional'

  if (!producto && cargandoRemoto) {
    return <main className="detalle-no-encontrado"><p>Cargando gorra…</p></main>
  }

  if (!producto) {
    return (
      <>
        <Header />
        <main className="detalle-no-encontrado">
          <p className="etiqueta etiqueta-clara">CATÁLOGO MRF</p>
          <h1>Esta gorra no está disponible.</h1>
          <Link className="volver-opciones" to="/gorras">Volver al catálogo</Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="detalle-producto">
        <Link className="detalle-volver" to="/gorras">← Volver al catálogo</Link>
        <div className="detalle-contenido">
          <div className="detalle-foto">
            {producto.imagen ? (
              <img src={producto.imagen} alt={producto.nombre} />
            ) : (
              <div className="detalle-foto-pendiente"><span>FOTO DEL PRODUCTO<br />PENDIENTE</span></div>
            )}
          </div>
          <section className="detalle-informacion">
            <p className={producto.tipo === 'Disponible' && Number(producto.stockQuantity) <= 0 ? 'etiqueta etiqueta-clara etiqueta-agotada' : 'etiqueta etiqueta-clara'}>{estadoStock}</p>
            {producto.categoria === 'Accesorio' && <p className="detalle-categoria">ACCESORIO MRF</p>}
            <h1>{producto.nombre}</h1>
            <p className="detalle-descripcion">
              {producto.descripcion || 'Consulta por WhatsApp para conocer más detalles de este producto.'}
            </p>
            <dl className="detalle-datos">
              <div><dt>Disponibilidad</dt><dd>{estadoStock}</dd></div>
              <div><dt>Color</dt><dd>{producto.color}</dd></div>
              {producto.tipo === 'Disponible' && producto.talla && <div><dt>Talla</dt><dd>{producto.talla}</dd></div>}
              {producto.estiloVisera && <div><dt>Visera</dt><dd>{producto.estiloVisera.toLowerCase()}</dd></div>}
            </dl>
            <p className={producto.tipo === 'Disponible' ? 'detalle-aviso-stock' : 'detalle-aviso-catalogo'}>
              {producto.tipo === 'Disponible'
                ? (Number(producto.stockQuantity) > 0 ? 'En stock: disponible físicamente en Colombia.' : 'Agotada por ahora. Escríbenos para consultar próximas unidades.')
                : 'Bajo pedido internacional. Tiempo estimado de llegada: 2 a 3 semanas.'}
            </p>
            {producto.categoria !== 'Accesorio' && (
              <button type="button" className="detalle-guia-tallas" onClick={() => setGuiaTallasAbierta(true)}>
                ¿No sabes qué talla elegir? <strong>Ver guía de tallas</strong><span aria-hidden="true">↗</span>
              </button>
            )}
            {producto.caracteristicas?.length > 0 && (
              <ul className="detalle-caracteristicas">
                {producto.caracteristicas.map((caracteristica) => <li key={caracteristica}>{caracteristica}</li>)}
              </ul>
            )}
            <WhatsAppButton producto={producto} />
          </section>
        </div>
        {guiaTallasAbierta && (
          <div className="guia-modal-fondo" role="presentation" onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) setGuiaTallasAbierta(false)
          }}>
            <section className="guia-modal" role="dialog" aria-modal="true" aria-labelledby="detalle-guia-titulo">
              <button type="button" className="guia-cerrar" onClick={() => setGuiaTallasAbierta(false)} aria-label="Cerrar guía">×</button>
              <p className="etiqueta etiqueta-clara">AJUSTE Y MEDIDAS</p>
              <h2 id="detalle-guia-titulo">Guía de tallas</h2>
              <p className="guia-modal-texto">Mide el contorno de tu cabeza en centímetros y compáralo con la tabla. Si tienes dudas entre dos tallas, consúltanos antes de pedir.</p>
              <div className="guia-imagen-marco">
                <img src="/guias/guia-tallas.png" alt="Guía de tallas MRF" />
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

export default ProductDetailPage
