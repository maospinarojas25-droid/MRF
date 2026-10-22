import { Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductDetailPage from './pages/ProductDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import PublicSiteGate from './components/PublicSiteGate'
import { lazy, Suspense } from 'react'

const AdminLogin = lazy(() => import('./admin/AdminLogin'))
const AdminRoute = lazy(() => import('./admin/AdminRoute'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))
const AdminPreviewRedirect = lazy(() => import('./admin/AdminPreviewRedirect'))

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSiteGate><HomePage /></PublicSiteGate>} />
      <Route path="/gorras" element={<PublicSiteGate><CatalogPage /></PublicSiteGate>} />
      <Route path="/producto/:id" element={<PublicSiteGate><ProductDetailPage /></PublicSiteGate>} />
      <Route path="/admin/login" element={<Suspense fallback={<main className="admin-cargando">Cargando acceso…</main>}><AdminLogin /></Suspense>} />
      <Route path="/admin" element={<Suspense fallback={<main className="admin-cargando">Cargando panel…</main>}><AdminRoute><AdminDashboard /></AdminRoute></Suspense>} />
      <Route path="/admin/vista-previa" element={<Suspense fallback={<main className="admin-cargando">Preparando vista previa…</main>}><AdminRoute><AdminPreviewRedirect /></AdminRoute></Suspense>} />
      <Route path="*" element={<PublicSiteGate><NotFoundPage /></PublicSiteGate>} />
    </Routes>
  )
}

export default App



