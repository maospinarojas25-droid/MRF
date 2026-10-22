import Header from '../components/Header'
import Hero from '../components/Hero'
import Catalog from '../components/Catalog'
import Footer from '../components/Footer'

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Catalog />
      </main>
      <Footer />
    </>
  )
}

export default HomePage
