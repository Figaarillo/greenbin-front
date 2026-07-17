import type { CampoOrdenCupon, Coupon } from './coupon'

// Único lugar que sabe comparar cupones por campo: 'createdAt' es una fecha
// (string ISO) y el resto son numéricos, así que no se puede restar
// directamente como los otros campos. Compartido entre catálogo (vecino) y
// mis-cupones (local) para que ordenar signifique lo mismo en las dos.
export function ordenarCupones<T extends Coupon>(items: T[], field: CampoOrdenCupon, dir: 'asc' | 'desc'): T[] {
  const factor = dir === 'desc' ? -1 : 1

  return [...items].sort((a, b) => {
    if (field === 'createdAt') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * factor
    }
    return (a[field] - b[field]) * factor
  })
}
