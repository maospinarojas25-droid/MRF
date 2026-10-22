const numeroWhatsApp = '573224228633'

function WhatsAppButton({ producto }) {
  const agotada = producto.tipo === 'Disponible' && Number(producto.stockQuantity) <= 0
  const modalidad = producto.tipo === 'Disponible' ? 'en stock en físico' : 'del catálogo'
  const mensaje = agotada
    ? 'Hola, estoy interesado/a en ' + producto.nombre + ', que aparece sin unidades. ¿Saben cuándo volverá a estar disponible?'
    : 'Hola, estoy interesado/a en ' + producto.nombre + ' (' + modalidad + '). ¿Me pueden dar información?'

  const enlace = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`

  return (
    <a
      className="producto-whatsapp"
      href={enlace}
      target="_blank"
      rel="noreferrer"
    >
      Consultar por WhatsApp <span aria-hidden="true">↗</span>
    </a>
  )
}

export default WhatsAppButton
