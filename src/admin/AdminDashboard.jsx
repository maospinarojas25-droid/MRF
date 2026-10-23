import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../supabase'
import {
  ajustesIniciales,
  cargarAjustesAdmin,
  cargarImagen,
  cargarProductosAdmin,
  eliminarProducto,
  guardarAjustes,
  guardarProducto,
} from '../data/catalogApi'
import './admin.css'

const productoVacio = {
  id: null,
  categoria: 'Gorra',
  estiloVisera: '',
  nombre: '',
  descripcion: '',
  ciudad: '',
  color: '',
  talla: '',
  stockQuantity: 1,
  tipo: 'Catálogo',
  publicado: true,
  imagen: '',
  _imagePath: '',
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [busquedaProductos, setBusquedaProductos] = useState('')
  const [filtroTipoProductos, setFiltroTipoProductos] = useState('Todos')
  const [ajustes, setAjustes] = useState(ajustesIniciales)
  const [formulario, setFormulario] = useState(productoVacio)
  const [archivo, setArchivo] = useState(null)
  const inputImagenRef = useRef(null)
  const [vistaImagen, setVistaImagen] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardandoAjustes, setGuardandoAjustes] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [versionVista, setVersionVista] = useState(0)
  const consultaNormalizada = busquedaProductos.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const productosFiltrados = productos.filter((producto) => {
    const coincideTipo = filtroTipoProductos === 'Todos' || producto.tipo === filtroTipoProductos
    const textoProducto = `${producto.nombre} ${producto.ciudad} ${producto.color} ${producto.tipo} ${producto.categoria}`.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return coincideTipo && textoProducto.includes(consultaNormalizada)
  })

  async function recargar() {
    setCargando(true)
    setError('')
    try {
      const [lista, opciones] = await Promise.all([cargarProductosAdmin(), cargarAjustesAdmin()])
      setProductos(lista)
      setAjustes(opciones)
    } catch (fallo) {
      setError('No se pudo cargar el catálogo. Verifica que ejecutaste database/mrf_schema.sql y database/mrf_catalog_updates.sql en Supabase.')
    }
    setCargando(false)
  }

  useEffect(() => {
    recargar()
  }, [])

  function cambiarCampo(evento) {
    const { name, value, type, checked } = evento.target
    setFormulario((actual) => {
      const fieldValue = type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : Number(value)) : value
      const actualizado = { ...actual, [name]: fieldValue }
      if (name === 'tipo' && value === 'Catálogo') actualizado.talla = ''
      if (name === 'tipo' && value === 'Disponible' && actual.categoria !== 'Accesorio') {
        if (!actual.talla) actualizado.talla = 'Ajustable'
        if (Number(actual.stockQuantity) < 1) actualizado.stockQuantity = 1
      }
      if (name === 'categoria' && value === 'Accesorio') {
        actualizado.talla = ''
        actualizado.estiloVisera = ''
      }
      if (name === 'categoria' && value === 'Gorra' && actual.tipo === 'Disponible' && !actual.talla) actualizado.talla = 'Ajustable'
      return actualizado
    })
  }

  function editar(producto) {
    setFormulario({ ...producto, stockQuantity: Number(producto.stockQuantity ?? 1) })
    setArchivo(null)
    setVistaImagen(producto.imagen || '')
    setMensaje('')
    setError('')
    document.getElementById('admin-producto-formulario')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function nuevoProducto() {
    setFormulario({ ...productoVacio })
    setArchivo(null)
    setVistaImagen('')
    setMensaje('')
    setError('')
    document.getElementById('admin-producto-formulario')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function seleccionarImagen(evento) {
    const file = evento.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Elige una imagen JPG, PNG o WebP.')
      evento.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe pesar menos de 5 MB.')
      evento.target.value = ''
      return
    }
    setError('')
    setArchivo(file)
    setVistaImagen(URL.createObjectURL(file))
  }

  function quitarImagenSeleccionada() {
    setArchivo(null)
    setVistaImagen(formulario.imagen || '')
    setError('')
    if (inputImagenRef.current) inputImagenRef.current.value = ''
  }

  async function enviarProducto(evento) {
    evento.preventDefault()
    setGuardando(true)
    setError('')
    setMensaje('')
    try {
      let imagePath = formulario._imagePath
      if (archivo) imagePath = await cargarImagen(archivo)
      await guardarProducto({ ...formulario, _imagePath: imagePath })
      setVersionVista((version) => version + 1)
      setMensaje(formulario.id ? 'Cambios guardados.' : 'Producto agregado al catálogo.')
      setFormulario(productoVacio)
      setArchivo(null)
      setVistaImagen('')
      await recargar()
    } catch (fallo) {
      setError('No se pudo guardar. Revisa la conexión o los permisos de Supabase e intenta de nuevo.')
    }
    setGuardando(false)
  }

  async function borrarProducto(producto) {
    if (!window.confirm('¿Quieres eliminar «' + producto.nombre + '»? Esta acción no se puede deshacer.')) return
    setError('')
    setMensaje('')
    try {
      await eliminarProducto(producto.id)
      if (formulario.id === producto.id) nuevoProducto()
      setMensaje('Producto eliminado.')
      await recargar()
    } catch {
      setError('No se pudo eliminar la gorra. Revisa los permisos e intenta de nuevo.')
    }
  }

  async function enviarAjustes(evento) {
    evento.preventDefault()
    setGuardandoAjustes(true)
    setError('')
    setMensaje('')
    try {
      await guardarAjustes(ajustes)
      setVersionVista((version) => version + 1)
      setMensaje('Cambios guardados para el catálogo público.')
    } catch {
      setError('No se pudieron guardar las opciones del catálogo.')
    }
    setGuardandoAjustes(false)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="admin-panel">
      <header className="admin-barra">
        <Link className="admin-marca" to="/">MRF <span>ADMINISTRACIÓN</span></Link>
        <div className="admin-barra-acciones">
          <Link to="/admin/vista-previa" target="_blank" rel="noreferrer" className="admin-boton-vista-previa">Vista previa ↗</Link>
          <Link to="/gorras" className="admin-ver-catalogo">Ver catálogo ↗</Link>
          <button type="button" className="admin-salir" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </header>

      <aside className="admin-vista-simultanea" aria-label="Vista previa de la tienda">
        <div className="admin-vista-simultanea-barra">
          <div><p className="admin-etiqueta">VISTA PÚBLICA</p><h2>Así se ve tu página</h2></div>
          <button type="button" className="admin-boton-principal admin-boton-compacto" onClick={() => setVersionVista((version) => version + 1)}>Actualizar</button>
        </div>
        <iframe key={versionVista} src="/" title="Vista previa de la página pública de MRF" />
        <p className="admin-vista-simultanea-ayuda">Al guardar cambios, la vista se actualizará. También puedes pulsar “Actualizar”.</p>
      </aside>

      <section className="admin-cabecera">
        <p className="admin-etiqueta">PANEL PRIVADO · SOLO EQUIPO MRF</p>
        <h1>Tu catálogo,<br /><span>bajo control.</span></h1>
        <p>Agrega gorras, actualiza fotos y controla qué opciones ven las personas que visitan la tienda.</p>
      </section>

      {(mensaje || error) && <div className={error ? 'admin-mensaje admin-mensaje-error' : 'admin-mensaje admin-mensaje-ok'} role="status">{error || mensaje}</div>}

      <section className="admin-seccion admin-inventario">
        <div className="admin-seccion-titulo">
          <div><p className="admin-etiqueta">01 · PRODUCTOS</p><h2>Productos del catálogo</h2></div>
          <button type="button" className="admin-boton-principal admin-boton-compacto" onClick={nuevoProducto}>+ Agregar producto</button>
        </div>
        {cargando ? <p className="admin-cargando">Cargando productos…</p> : productos.length ? (
          <>
            <div className="admin-inventario-filtros">
              <input
                type="search"
                value={busquedaProductos}
                onChange={(evento) => setBusquedaProductos(evento.target.value)}
                placeholder="Buscar por nombre, equipo o color"
                aria-label="Buscar productos del inventario"
              />
              <select value={filtroTipoProductos} onChange={(evento) => setFiltroTipoProductos(evento.target.value)} aria-label="Filtrar por tipo de producto">
                <option value="Todos">Todos los tipos</option>
                <option value="Disponible">Inventario físico</option>
                <option value="Catálogo">Pedido bajo encargo</option>
              </select>
              <span>{productosFiltrados.length} de {productos.length} modelos</span>
            </div>
            {productosFiltrados.length ? (
              <div className="admin-productos-grid">
                {productosFiltrados.map((producto) => (
                  <article className="admin-producto" key={producto.id}>
                    <div className="admin-producto-imagen">
                      {producto.imagen ? <img src={producto.imagen} alt={producto.nombre} /> : <span>FOTO PENDIENTE</span>}
                      <span className={producto.publicado ? 'admin-etiqueta-estado publicado' : 'admin-etiqueta-estado oculto'}>{producto.publicado ? 'Publicado' : 'Oculto'}</span>
                    </div>
                    <div className="admin-producto-datos">
                      <p>{producto.categoria === 'Accesorio' ? 'ACCESORIO' : producto.ciudad || 'MRF'} · {producto.tipo}</p>
                      <h3>{producto.nombre}</h3>
                      <span>{producto.color}{producto.tipo === 'Disponible' && producto.talla ? ` · Talla ${producto.talla}` : ''}</span>
                      {producto.tipo === 'Disponible' && <strong className={Number(producto.stockQuantity) > 0 ? 'admin-stock-estado' : 'admin-stock-estado agotada'}>{Number(producto.stockQuantity) > 0 ? producto.stockQuantity + ' en stock' : 'Agotada'}</strong>}
                    </div>
                    <div className="admin-producto-acciones">
                      <button type="button" onClick={() => editar(producto)}>Editar</button>
                      <button type="button" className="admin-eliminar" onClick={() => borrarProducto(producto)}>Eliminar</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : <div className="admin-vacio admin-inventario-sin-resultados"><strong>No encontramos productos con esos filtros.</strong><span>Prueba con otro nombre, equipo, color o categoría.</span></div>}
          </>
        ) : <div className="admin-vacio"><strong>Aún no hay productos guardados.</strong><span>Agregalas desde el formulario para que aparezcan en el catálogo público.</span></div>}
      </section>

      <section className="admin-seccion admin-dos-columnas">
        <form id="admin-producto-formulario" className="admin-formulario-producto" onSubmit={enviarProducto}>
          <p className="admin-etiqueta">02 · EDITAR CONTENIDO</p>
          <h2>{formulario.id ? 'Editar producto' : 'Agregar un producto'}</h2>
          <label>Categoría<select name="categoria" value={formulario.categoria || 'Gorra'} onChange={cambiarCampo}><option value="Gorra">Gorra</option><option value="Accesorio">Accesorio</option></select></label>
          {formulario.categoria !== 'Accesorio' && <label>Estilo de visera<select name="estiloVisera" required value={formulario.estiloVisera || ''} onChange={cambiarCampo}><option value="">Selecciona: plana o curva</option><option value="Plana">Plana</option><option value="Curva">Curva</option></select></label>}
          <label>Disponibilidad<select name="tipo" value={formulario.tipo} onChange={cambiarCampo}><option value="Disponible">Inventario físico</option><option value="Catálogo">Pedido bajo encargo</option></select></label>
          <label>Nombre<input name="nombre" required maxLength="100" value={formulario.nombre} onChange={cambiarCampo} placeholder="MRF LA Classic" /></label>
          <label>Descripción<textarea name="descripcion" rows="3" maxLength="600" value={formulario.descripcion} onChange={cambiarCampo} placeholder="Describe este producto" /></label>
          <div className="admin-campos-dobles">
            <label>{formulario.categoria === 'Accesorio' ? 'Equipo o línea (opcional)' : 'Equipo'}<input name="ciudad" required={formulario.tipo === 'Disponible' && formulario.categoria !== 'Accesorio'} maxLength="40" value={formulario.ciudad} onChange={cambiarCampo} placeholder={formulario.categoria === 'Accesorio' ? 'MRF, LA u otro' : 'LA, NY Yankees, SOX u otro'} /></label>
            <label>Color<input name="color" required maxLength="40" value={formulario.color} onChange={cambiarCampo} placeholder="Negro" /></label>
          </div>
          <div className="admin-campos-dobles">
            {formulario.tipo === 'Disponible' ? (
              <>
                {formulario.categoria !== 'Accesorio' && <label>Talla<input name="talla" required maxLength="40" value={formulario.talla} onChange={cambiarCampo} placeholder="Ajustable" /></label>}
                <label>Cantidad en stock<input name="stockQuantity" type="number" min="0" step="1" required value={formulario.stockQuantity} onChange={cambiarCampo} /><small>Al llegar a 0 se mostrará como agotado. Al venderlo, puedes eliminarlo desde el inventario.</small></label>
              </>
            ) : (
              <p className="admin-ayuda admin-talla-no-aplica">{formulario.categoria === 'Accesorio' ? 'Los accesorios por encargo no requieren talla.' : 'Las gorras bajo encargo no llevan talla ni control de stock.'}</p>
            )}
          </div>
          <label className="admin-subir-imagen">Foto de la gorra<input ref={inputImagenRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={seleccionarImagen} /><small>JPG, PNG o WebP · máximo 5 MB</small></label>
          {archivo && <button className="admin-quitar-imagen" type="button" onClick={quitarImagenSeleccionada}><span aria-hidden="true">×</span> Quitar archivo seleccionado</button>}
          {vistaImagen && <div className="admin-vista-previa"><img src={vistaImagen} alt="Vista previa de la gorra" /></div>} 
          <label className="admin-check"><input name="publicado" type="checkbox" checked={formulario.publicado} onChange={cambiarCampo} /><span>Mostrar este producto en el catálogo público</span></label>
          <div className="admin-botones-formulario">
            <button className="admin-boton-principal" type="submit" disabled={guardando}>{guardando ? 'Guardando…' : formulario.id ? 'Guardar cambios' : 'Agregar producto'}</button>
            {formulario.id && <button className="admin-boton-secundario" type="button" onClick={nuevoProducto}>Cancelar</button>}
          </div>
        </form>

        <form className="admin-formulario-ajustes" onSubmit={enviarAjustes}>
          <p className="admin-etiqueta">03 · DISPONIBILIDAD GENERAL</p>
          <h2>Opciones para clientes</h2>
          <p className="admin-ayuda">Activa o pausa las modalidades de venta. También puedes ocultar temporalmente toda la página pública cuando hagas mantenimiento.</p>
          <label className="admin-switch admin-switch-mantenimiento"><input type="checkbox" checked={ajustes.mantenimientoHabilitado} onChange={(evento) => setAjustes((actual) => ({ ...actual, mantenimientoHabilitado: evento.target.checked }))} /><span><strong>Poner la página en mantenimiento</strong><small>Los visitantes verán el logo MRF y el aviso de novedades. La administración seguirá disponible.</small></span></label>
          <label className="admin-switch"><input type="checkbox" checked={ajustes.disponiblesHabilitados} onChange={(evento) => setAjustes((actual) => ({ ...actual, disponiblesHabilitados: evento.target.checked }))} /><span><strong>Inventario físico</strong><small>Mostrar las gorras que tenemos en existencia local.</small></span></label>
          <label className="admin-switch"><input type="checkbox" checked={ajustes.encargosHabilitados} onChange={(evento) => setAjustes((actual) => ({ ...actual, encargosHabilitados: evento.target.checked }))} /><span><strong>Pedido bajo encargo</strong><small>Mostrar modelos que el cliente puede solicitar por encargo.</small></span></label>
          <label>Mensaje cuando no hay disponibles<textarea rows="3" value={ajustes.mensajeSinDisponibles} onChange={(evento) => setAjustes((actual) => ({ ...actual, mensajeSinDisponibles: evento.target.value }))} /></label>
          <label>Mensaje cuando no hay modelos de catálogo<textarea rows="3" value={ajustes.mensajeSinEncargos} onChange={(evento) => setAjustes((actual) => ({ ...actual, mensajeSinEncargos: evento.target.value }))} /></label>
          <button className="admin-boton-principal" type="submit" disabled={guardandoAjustes}>{guardandoAjustes ? 'Guardando…' : 'Guardar cambios'}</button>
        </form>
      </section>
      <footer className="admin-pie">Los cambios guardados aquí se reflejan para todos los visitantes de MRF.</footer>
    </main>
  )
}

export default AdminDashboard
