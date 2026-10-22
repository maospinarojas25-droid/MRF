import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import { supabase } from '../supabase'
import { comprobarAdmin } from '../data/catalogApi'

function AdminRoute({ children }) {
  const [estado, setEstado] = useState('cargando')

  useEffect(() => {
    let activo = true

    async function revisarSesion() {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        if (activo) setEstado('sin-sesion')
        return
      }

      try {
        const autorizado = await comprobarAdmin(data.session.user.id)
        if (activo) setEstado(autorizado ? 'admin' : 'sin-permiso')
      } catch {
        if (activo) setEstado('sin-permiso')
      }
    }

    revisarSesion()
    const { data: listener } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === 'SIGNED_OUT' && activo) setEstado('sin-sesion')
    })

    return () => {
      activo = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (estado === 'cargando') return <main className="admin-cargando">Cargando acceso seguro…</main>
  if (estado !== 'admin') return <Navigate to="/admin/login" replace />
  return children
}

export default AdminRoute
