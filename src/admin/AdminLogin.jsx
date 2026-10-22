import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../supabase'
import { comprobarAdmin } from '../data/catalogApi'
import './admin.css'

function AdminLogin() {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function iniciarSesion(evento) {
    evento.preventDefault()
    setCargando(true)
    setError('')
    const ventanaTienda = window.open('about:blank', '_blank')

    const { data, error: errorLogin } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: contrasena,
    })

    if (errorLogin) {
      ventanaTienda?.close()
      setError('No pudimos iniciar sesión. Revisa tu correo y contraseña.')
      setCargando(false)
      return
    }

    try {
      const autorizado = await comprobarAdmin(data.user.id)
      if (!autorizado) {
        ventanaTienda?.close()
        await supabase.auth.signOut()
        setError('Esta cuenta todavía no tiene permiso de administración.')
      } else {
        if (ventanaTienda) {
          ventanaTienda.location.replace('/admin/vista-previa')
          ventanaTienda.focus()
        }
        navigate('/admin', { replace: true })
      }
    } catch {
      ventanaTienda?.close()
      await supabase.auth.signOut()
      setError('No se pudo validar el acceso. Revisa la configuración inicial de Supabase.')
    }
    setCargando(false)
  }

  return (
    <main className="admin-login-fondo">
      <section className="admin-login-tarjeta">
        <Link className="admin-volver" to="/">← Volver al catálogo</Link>
        <p className="admin-etiqueta">MRF · ACCESO PRIVADO</p>
        <h1>Administrar catálogo.</h1>
        <p className="admin-login-descripcion">Ingresa con una cuenta autorizada por MRF para actualizar productos y disponibilidad.</p>
        <form className="admin-formulario-login" onSubmit={iniciarSesion}>
          <label htmlFor="admin-correo">Correo</label>
          <input id="admin-correo" type="email" autoComplete="username" required value={correo} onChange={(evento) => setCorreo(evento.target.value)} />
          <label htmlFor="admin-contrasena">Contraseña</label>
          <input id="admin-contrasena" type="password" autoComplete="current-password" required value={contrasena} onChange={(evento) => setContrasena(evento.target.value)} />
          {error && <p className="admin-mensaje admin-mensaje-error" role="alert">{error}</p>}
          <button className="admin-boton-principal" type="submit" disabled={cargando}>
            {cargando ? 'Verificando…' : 'Entrar al administrador'}
          </button>
        </form>
        <p className="admin-login-nota">Al entrar, se abrirá la tienda en otra pestaña para que puedas revisar los cambios.</p>
      </section>
    </main>
  )
}

export default AdminLogin
