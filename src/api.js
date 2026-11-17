const BASE = 'https://www.dnd5eapi.co'

export async function api(path) {
  const res = await fetch(path.startsWith('http') ? path : BASE + path)
  if (!res.ok) throw new Error(`Error ${res.status} al consultar la API`)
  return res.json()
}

// Algunas versiones devuelven armor_class como número y otras como arreglo
export function getAC(m) {
  return Array.isArray(m.armor_class) ? m.armor_class[0]?.value : m.armor_class
}

export function formatCR(cr) {
  if (cr === 0.125) return '1/8'
  if (cr === 0.25) return '1/4'
  if (cr === 0.5) return '1/2'
  return String(cr)
}
