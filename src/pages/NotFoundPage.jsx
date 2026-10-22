import { Link } from 'react-router'
import Header from '../components/Header'
import Footer from '../components/Footer'

function NotFoundPage() {
  return (
    <>
      <Header />
      <main className="detalle-no-encontrado">
        <p className="etiqueta etiqueta-clara">MRF</p>
        <h1>Esta página no existe.</h1>
        <Link className="volver-opciones" to="/">
          Ir al inicio
        </Link>
      </main>
      <Footer />
    </>
  )
}

export default NotFoundPage
