import { Link } from 'react-router'
import WhatsAppButton from './WhatsAppButton'

function ProductCard({ producto, catalogoState }) {
  const estadoDetalle = { categoria: producto.categoria, catalogoState }

  return (
    <article className="producto-tarjeta">
      <Link
        className="producto-link"
        to={'/producto/' + producto.id}
        state={estadoDetalle}
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
          <Link className="producto-titulo-link" to={'/producto/' + producto.id} state={estadoDetalle}>
            {producto.nombre}
          </Link>
        </h3>
        <div className="producto-detalles">
          <span>{producto.color}</span>
          {producto.tipo === 'Disponible' && producto.talla && <span>Talla {producto.talla}</span>}
          {producto.estiloVisera && <span>Visera {producto.estiloVisera.toLowerCase()}</span>}
        </div>
        {producto.descripcion && <p className="producto-descripcion">{producto.descripcion}</p>}
        <Link className="producto-ver-detalles" to={'/producto/' + producto.id} state={estadoDetalle}>
          Ver detalles ↗︎
        </Link>
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
