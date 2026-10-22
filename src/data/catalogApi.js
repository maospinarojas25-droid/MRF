import { supabase } from '../supabase'

export const ajustesIniciales = {
  disponiblesHabilitados: true,
  encargosHabilitados: true,
  mantenimientoHabilitado: false,
  mensajeSinDisponibles: 'No hay gorras disponibles en físico. ¡Explora el catálogo y encarga la tuya!.',
  mensajeSinEncargos: 'Por ahora no hay modelos en el catálogo. Consulta las gorras disponibles en físico.',
}

const mensajeAnteriorSinCatalogo = 'Por ahora no estamos recibiendo pedidos por encargo. Consulta las gorras disponibles.'
const mensajeAnteriorSinDisponibles = 'Por ahora no hay gorras disponibles. Puedes consultar por WhatsApp para pedir una por encargo.'

function convertirProducto(fila) {
  const imagen = fila.image_path
    ? (fila.image_path.startsWith('http')
      ? fila.image_path
      : supabase.storage.from('mrf-products').getPublicUrl(fila.image_path).data.publicUrl)
    : ''

  return {
    id: fila.id,
    categoria: fila.product_category === 'accessory' ? 'Accesorio' : 'Gorra',
    estiloVisera: fila.visor_style === 'flat' ? 'Plana' : fila.visor_style === 'curved' ? 'Curva' : '',
    nombre: fila.name,
    descripcion: fila.description || '',
    ciudad: fila.city || '',
    color: fila.color || '',
    talla: fila.size || '',
    stockQuantity: Number(fila.stock_quantity ?? 1),
    tipo: fila.availability === 'available' ? 'Disponible' : 'Catálogo',
    imagen,
    publicado: fila.is_published,
    _imagePath: fila.image_path || '',
  }
}

function convertirAjustes(fila) {
  if (!fila) return ajustesIniciales
  return {
    disponiblesHabilitados: fila.show_available,
    encargosHabilitados: fila.show_made_to_order,
    mantenimientoHabilitado: Boolean(fila.maintenance_mode),
    mensajeSinDisponibles: fila.message_no_available === mensajeAnteriorSinDisponibles
      ? ajustesIniciales.mensajeSinDisponibles
      : fila.message_no_available,
    mensajeSinEncargos: fila.message_no_made_to_order === mensajeAnteriorSinCatalogo
      ? ajustesIniciales.mensajeSinEncargos
      : fila.message_no_made_to_order,
  }
}

export async function cargarMantenimientoPublico() {
  const { data, error } = await supabase.from('mrf_catalog_settings').select('maintenance_mode').eq('id', true).maybeSingle()
  if (error) throw error
  return Boolean(data?.maintenance_mode)
}

export async function cargarCatalogoPublico() {
  const [productosResult, ajustesResult] = await Promise.all([
    supabase.from('mrf_products').select('*').eq('is_published', true).order('created_at'),
    supabase.from('mrf_catalog_settings').select('*').eq('id', true).maybeSingle(),
  ])

  if (productosResult.error) throw productosResult.error
  if (ajustesResult.error) throw ajustesResult.error

  return {
    productos: (productosResult.data || []).map(convertirProducto),
    ajustes: convertirAjustes(ajustesResult.data),
  }
}

export async function cargarProducto(id) {
  const { data, error } = await supabase
    .from('mrf_products')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()

  if (error) throw error
  return data ? convertirProducto(data) : null
}

export async function comprobarAdmin(userId) {
  const { data, error } = await supabase
    .from('mrf_admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}

export async function cargarProductosAdmin() {
  const { data, error } = await supabase.from('mrf_products').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(convertirProducto)
}

export async function cargarAjustesAdmin() {
  const { data, error } = await supabase
    .from('mrf_catalog_settings')
    .select('*')
    .eq('id', true)
    .maybeSingle()
  if (error) throw error
  return convertirAjustes(data)
}

export async function guardarProducto(producto) {
  const registro = {
    name: producto.nombre.trim(),
    product_category: producto.categoria === 'Accesorio' ? 'accessory' : 'cap',
    visor_style: producto.categoria === 'Accesorio' ? null : producto.estiloVisera === 'Plana' ? 'flat' : producto.estiloVisera === 'Curva' ? 'curved' : null,
    description: producto.descripcion.trim(),
    city: producto.ciudad.trim(),
    color: producto.color.trim(),
    size: producto.talla.trim(),
    stock_quantity: producto.tipo === 'Disponible' ? Math.max(0, Math.floor(Number(producto.stockQuantity) || 0)) : 0,
    availability: producto.tipo === 'Disponible' ? 'available' : 'made_to_order',
    is_published: producto.publicado,
    image_path: producto._imagePath || null,
  }

  const query = producto.id
    ? supabase.from('mrf_products').update(registro).eq('id', producto.id)
    : supabase.from('mrf_products').insert(registro)
  const { error } = await query
  if (error) throw error
}

export async function eliminarProducto(id) {
  const { error } = await supabase.from('mrf_products').delete().eq('id', id)
  if (error) throw error
}

export async function cargarImagen(file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const nombre = Date.now() + '-' + crypto.randomUUID() + '.' + extension
  const { data, error } = await supabase.storage.from('mrf-products').upload(nombre, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error
  return data.path
}

export async function guardarAjustes(ajustes) {
  const registro = {
    show_available: ajustes.disponiblesHabilitados,
    show_made_to_order: ajustes.encargosHabilitados,
    maintenance_mode: Boolean(ajustes.mantenimientoHabilitado),
    message_no_available: ajustes.mensajeSinDisponibles.trim(),
    message_no_made_to_order: ajustes.mensajeSinEncargos.trim(),
  }
  const { error } = await supabase.from('mrf_catalog_settings').update(registro).eq('id', true)
  if (error) throw error
}

