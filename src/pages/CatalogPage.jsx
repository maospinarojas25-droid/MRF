import Header from '../components/Header'
import Catalog from '../components/Catalog'
import Footer from '../components/Footer'

function CatalogPage() {
  return (
    <>
      <Header />
      <main className="pagina-catalogo">
        <Catalog />
      </main>
      <Footer />
    </>
  )
}

export default CatalogPage
