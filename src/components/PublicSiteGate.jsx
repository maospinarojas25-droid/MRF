import { useEffect, useState } from 'react'
import { cargarMantenimientoPublico } from '../data/catalogApi'
import MaintenanceScreen from './MaintenanceScreen'

function PublicSiteGate({ children }) {
  const [mantenimiento, setMantenimiento] = useState(null)

  useEffect(() => {
    let activo = true

    async function revisarMantenimiento() {
      try {
        const activoAhora = await cargarMantenimientoPublico()
        if (activo) setMantenimiento(activoAhora)
      } catch {
        if (activo) setMantenimiento(false)
      }
    }

    revisarMantenimiento()
    const intervalo = window.setInterval(revisarMantenimiento, 30000)

    return () => {
      activo = false
      window.clearInterval(intervalo)
    }
  }, [])

  if (mantenimiento === null) {
    return <main className="mantenimiento-cargando" aria-label="Cargando MRF"><span>MRF</span></main>
  }

  return mantenimiento ? <MaintenanceScreen /> : children
}

export default PublicSiteGate
