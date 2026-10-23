import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../supabase'
import { cargarMantenimientoPublico, comprobarAdmin } from '../data/catalogApi'
import MaintenanceScreen from './MaintenanceScreen'

function PublicSiteGate({ children }) {
  const [mantenimiento, setMantenimiento] = useState(null)
  const [vistaPreviaAdmin, setVistaPreviaAdmin] = useState(false)

  useEffect(() => {
    let activo = true

    async function revisarMantenimiento() {
      try {
        const activoAhora = await cargarMantenimientoPublico()
        let esAdmin = false

        if (activoAhora) {
          const { data, error } = await supabase.auth.getUser()
          if (!error && data.user) esAdmin = await comprobarAdmin(data.user.id)
        }

        if (activo) {
          setMantenimiento(activoAhora)
          setVistaPreviaAdmin(activoAhora && esAdmin)
        }
      } catch {
        if (activo) {
          setMantenimiento(true)
          setVistaPreviaAdmin(false)
        }
      }
    }

    revisarMantenimiento()
    const intervalo = window.setInterval(revisarMantenimiento, 30000)
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(revisarMantenimiento, 0)
    })

    return () => {
      activo = false
      window.clearInterval(intervalo)
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (mantenimiento === null) {
    return <main className="mantenimiento-cargando" aria-label="Cargando MRF"><span>MRF</span></main>
  }

  if (mantenimiento && !vistaPreviaAdmin) return <MaintenanceScreen />

  return (
    <>
      {mantenimiento && vistaPreviaAdmin && (
        <aside className="mrf-vista-previa-aviso">
          <span><strong>VISTA PREVIA</strong> · Solo tú puedes ver el sitio mientras está en mantenimiento.</span>
          <Link to="/admin">Volver a administración <span aria-hidden="true">↗︎</span></Link>
        </aside>
      )}
      {children}
    </>
  )
}

export default PublicSiteGate
