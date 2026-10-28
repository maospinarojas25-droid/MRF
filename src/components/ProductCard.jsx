import { Link, useNavigate } from 'react-router'
import WhatsAppButton from './WhatsAppButton'

function ProductCard({ producto, catalogoState }) {
  const navigate = useNavigate()
  const rutaDetalle = '/producto/' + producto.id

  function abrirDetalle(evento) {
    if (evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return

    evento.preventDefault()
    const tarjeta = evento.currentTarget.closest('.producto-tarjeta')
    navigate(rutaDetalle, {
      state: {
        categoria: producto.categoria,
        catalogoState: {
          ...catalogoState,
          returnPosition: {
            productId: producto.id,
            cardTop: tarjeta?.getBoundingClientRect().top ?? 0,
            scrollY: window.scrollY,
          },
        },
      },
    })
  }

  return (
    <article className="producto-tarjeta" data-product-id={producto.id}>
      <Link
        className="producto-link"
        to={rutaDetalle}
        onClick={abrirDetalle}
        aria-label={'Ver detalles de ' + producto.nombre}
      >
        <div className="producto-foto">
          {producto.imagen ? (
            <img src={producto.imagen} alt={producto.nombre} />
          ) : (
            <span>FOTO DEL PRODUCTO<br />PENDIENTE</span>
          )}
          <span className={producto.tipo === 'Disponible' ? (Number(producto.stockQuantity) > 0 ? 'producto-etiqueta producto-etiqueta-stock' : 'producto-etiqueta producto-etiqueta-agotada') : 'producto-etiqueta'}>{producto.tipo === 'Disponible' ? (Number(producto.stockQuantity) > 0 ? 'En stock' : 'Agotada') : 'Catálogo'}</span>
        </div>
      </Link>

      <div className="producto-info">
        {producto.categoria === 'Accesorio' && <span className="producto-categoria">ACCESORIO</span>}
        <h3>
          <Link className="producto-titulo-link" to={rutaDetalle} onClick={abrirDetalle}>
            {producto.nombre}
          </Link>
        </h3>
        <div className="producto-detalles">
          <span>{producto.color}</span>
          {producto.tipo === 'Disponible' && producto.talla && <span>Talla {producto.talla}</span>}
          {producto.estiloVisera && <span>Visera {producto.estiloVisera.charAt(0).toUpperCase() + producto.estiloVisera.slice(1).toLowerCase()}</span>}
        </div>
        {producto.descripcion && <p className="producto-descripcion">{producto.descripcion}</p>}
      </div>

      <div className="producto-contacto">
        {producto.categoria === 'Accesorio' ? (
          <a className="producto-whatsapp" href="https://www.instagram.com/mrf_dept/" target="_blank" rel="noopener noreferrer">
            Consultar por Instagram <span aria-hidden="true">↗︎</span>
          </a>
        ) : (
          <>
            <WhatsAppButton producto={producto} />
            <a className="producto-instagram" href="https://www.instagram.com/mrf_dept/" target="_blank" rel="noopener noreferrer">
              Consultar por Instagram <span aria-hidden="true">↗︎</span>
            </a>
          </>
        )}
      </div>
    </article>
  )
}

export default ProductCard
