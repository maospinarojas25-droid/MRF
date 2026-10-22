import { useState } from 'react'
import { Link } from 'react-router'

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  function cerrarMenu() {
    setMenuAbierto(false)
  }

  return (
    <>
      <div className="barra-anuncio" role="note">
        <span>BAJO PEDIDO</span>
        <b aria-hidden="true">·</b>
        <span>ENVÍO INCLUIDO A TODA COLOMBIA</span>
      </div>
      <header className="encabezado">
      <Link className="marca" to="/" aria-label="MRF, inicio" onClick={cerrarMenu}>
        <img className="logo-imagen" src="/mrf-logo.jpg" alt="Logo MRF" />
      </Link>

      <nav
        className={menuAbierto ? 'menu menu-abierto' : 'menu'}
        aria-label="Navegación principal"
      >
        <Link to="/" onClick={cerrarMenu}>Inicio</Link>
        <Link to="/gorras" onClick={cerrarMenu}>Gorras</Link>
      </nav>

      <div className="encabezado-acciones">
        <Link className="enlace-admin" to="/admin/login">Administración <span aria-hidden="true">↗</span></Link>
        <Link className="enlace-catalogo" to="/gorras">
          Explorar <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <button
        className="boton-menu"
        type="button"
        aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuAbierto}
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        <span />
        <span />
      </button>
      </header>
    </>
  )
}

export default Header
