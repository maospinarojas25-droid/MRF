const numeroWhatsApp = '573224228633'

function WhatsAppButton({ producto }) {
  const agotada = producto.tipo === 'Disponible' && Number(producto.stockQuantity) <= 0
  const estado = agotada ? 'Agotada' : producto.tipo === 'Disponible' ? 'En stock' : producto.tipo
  const detalles = [producto.nombre, producto.color && `color ${producto.color}`, `estado: ${estado}`]
    .filter(Boolean)
    .join(' · ')
  const mensaje = `Hola, quisiera más información sobre esta gorra: ${detalles}. ¿Me pueden ayudar?`

  const enlace = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`

  return (
    <a
      className="producto-whatsapp"
      href={enlace}
      target="_blank"
      rel="noreferrer"
    >
      Consultar por WhatsApp <span aria-hidden="true">↗︎</span>
    </a>
  )
}

export default WhatsAppButton
