import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { cargarCatalogoPublico } from '../data/catalogApi'

const portadaBase = {
  src: '/mrf-hero.png',
  alt: 'Imagen principal de la marca MRF',
  referencia: 'MRF / 001',
  esGorra: false,
}

function mezclar(lista) {
  const resultado = [...lista]
  for (let indice = resultado.length - 1; indice > 0; indice -= 1) {
    const aleatorio = Math.floor(Math.random() * (indice + 1))
    ;[resultado[indice], resultado[aleatorio]] = [resultado[aleatorio], resultado[indice]]
  }
  return resultado
}

const textoPortada = {
  etiqueta: 'GORRAS · COLOMBIA · MRF',
  primeraLinea: 'Lleva tu estilo',
  palabraResaltada: 'a otro',
  ultimaLinea: 'nivel.',
  descripcion:
    'Encuentra la gorra que va contigo. Explora la colección y consúltanos directamente por WhatsApp.',
  textoBoton: 'Ver gorras',
}

function Hero() {
  const [indice, setIndice] = useState(0)
  const [imagenesPortada, setImagenesPortada] = useState([portadaBase])
  const [inicioToque, setInicioToque] = useState(null)
  const [pausada, setPausada] = useState(false)
  const foto = imagenesPortada[indice]

  useEffect(() => {
    let activo = true
    cargarCatalogoPublico()
      .then(({ productos }) => {
        if (!activo) return
        const fotos = mezclar(productos.filter((producto) => producto.publicado && producto.imagen && producto.categoria !== 'Accesorio'))
          .map((producto, posicion) => ({
            src: producto.imagen,
            alt: producto.nombre,
            referencia: `MRF / ${String(posicion + 1).padStart(3, '0')}`,
            esGorra: true,
          }))
        if (!fotos.length) return
        const galeria = [portadaBase, ...fotos]
        setImagenesPortada(galeria)
        setIndice(1 + Math.floor(Math.random() * fotos.length))
      })
      .catch(() => {
        // La portada de marca se mantiene visible si no hay conexión o fotos publicadas.
      })
    return () => { activo = false }
  }, [])

  useEffect(() => {
    if (pausada || imagenesPortada.length < 2) return undefined
    const temporizador = window.setTimeout(() => {
      setIndice((actual) => (actual + 1) % imagenesPortada.length)
    }, 3000)
    return () => window.clearTimeout(temporizador)
  }, [indice, imagenesPortada.length, pausada])

  function mover(direccion) {
    setIndice((actual) => (actual + direccion + imagenesPortada.length) % imagenesPortada.length)
  }

  function terminarDeslizamiento(evento) {
    if (inicioToque === null) return
    const distancia = inicioToque - evento.changedTouches[0].clientX
    if (Math.abs(distancia) > 45 && imagenesPortada.length > 1) mover(distancia > 0 ? 1 : -1)
    setInicioToque(null)
  }

  return (
    <section
      className={foto.esGorra ? 'portada portada-con-gorra' : 'portada'}
      id="inicio"
      onMouseEnter={() => setPausada(true)}
      onMouseLeave={() => setPausada(false)}
      onTouchStart={(evento) => setInicioToque(evento.touches[0].clientX)}
      onTouchEnd={terminarDeslizamiento}
    >
      <div className="portada-visual">
        {foto.esGorra && <img className="foto-portada-fondo" src={foto.src} alt="" aria-hidden="true" />}
        <img key={foto.src} className={foto.esGorra ? 'foto-portada foto-portada-gorra' : 'foto-portada'} src={foto.src} alt={foto.alt} />
        <div className="capa-foto" />
        <span className="referencia">{foto.referencia}</span>
        <span className="leyenda-visual">{textoPortada.fraseFoto}</span>
      </div>

      <div className="portada-texto">
        <p className="etiqueta">{textoPortada.etiqueta}</p>
        <h1>
          {textoPortada.primeraLinea}<br />
          <span>{textoPortada.palabraResaltada}</span><br />
          {textoPortada.ultimaLinea}
        </h1>
        <p className="descripcion">{textoPortada.descripcion}</p>
        <Link className="boton" to="/gorras">
          {textoPortada.textoBoton} <span aria-hidden="true">↗︎</span>
        </Link>
      </div>


      <div className="portada-controles" aria-label="Galería principal">
        <span className="portada-contador">{String(indice + 1).padStart(2, '0')} / {String(imagenesPortada.length).padStart(2, '0')}</span>
        <button type="button" onClick={() => mover(-1)} disabled={imagenesPortada.length < 2} aria-label="Imagen anterior">←</button>
        <button type="button" onClick={() => mover(1)} disabled={imagenesPortada.length < 2} aria-label="Imagen siguiente">→</button>
      </div>
    </section>
  )
}

export default Hero





