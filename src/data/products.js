export const colecciones = [
  {
    codigo: 'LA',
    nombre: 'Equipo LA',
    ciudad: 'Los Angeles',
    descripcion: 'Una línea de inspiración urbana y espíritu californiano.',
    numero: '01',
  },
  {
    codigo: 'NY',
    nombre: 'Equipo NY',
    ciudad: 'New York',
    descripcion: 'Una colección con carácter, contraste y energía de ciudad.',
    numero: '02',
  },
]

// Clasifica cada modelo como "Disponible" (en físico) o "Catálogo" (se solicita bajo encargo).
export const productosEjemplo = [
  {
    id: 'gorra-001',
    nombre: 'MRF LA Classic',
    color: 'Negro',
    tipo: 'Catálogo',
    ciudad: 'LA',
    descripcion: 'Una silueta clásica de la línea LA, pensada para combinar con todo.',
  },
  {
    id: 'gorra-002',
    nombre: 'MRF LA Urban',
    color: 'Beige',
    tipo: 'Catálogo',
    ciudad: 'LA',
    descripcion: 'Diseño urbano en tonos neutros, perteneciente a la línea LA.',
  },
  {
    id: 'gorra-003',
    nombre: 'MRF NY Sport',
    color: 'Azul',
    tipo: 'Catálogo',
    ciudad: 'NY',
    descripcion: 'Una propuesta deportiva de la línea NY.',
  },
  {
    id: 'gorra-004',
    nombre: 'MRF NY Black',
    color: 'Negro',
    talla: 'Ajustable',
    stockQuantity: 1,
    tipo: 'Disponible',
    ciudad: 'NY',
    descripcion: 'Modelo negro de la línea NY, marcado como disponible para consulta.',
  },
  {
    id: 'gorra-005',
    nombre: 'MRF LA Sand',
    color: 'Beige',
    talla: 'Única',
    stockQuantity: 1,
    tipo: 'Disponible',
    ciudad: 'LA',
    descripcion: 'Modelo beige de la línea LA, marcado como disponible para consulta.',
  },
]

// Controles manuales de publicación. Al poner una opción en false, se desactiva
// su filtro y el catálogo informa al cliente que consulte la otra modalidad.
export const controlCatalogo = {
  disponiblesHabilitados: true,
  encargosHabilitados: true,
  mensajeSinDisponibles:
    'Por ahora no hay gorras disponibles en físico. Explora los modelos disponibles en el catálogo.',
  mensajeSinEncargos:
    'Por ahora no hay modelos disponibles en el catálogo. Consulta las gorras disponibles en físico.',
}
