// Campos de orden compartidos por toda pantalla que liste cupones "crudos"
// (catálogo del vecino, cupones propios del local) — mantenerlos unificados
// para que la experiencia de ordenar sea la misma sin importar el rol.
export type CampoOrdenCupon = 'discount' | 'costInPoints' | 'validDays' | 'createdAt'

export interface Coupon {
  id: string
  title: string
  description: string
  discount: number
  isAvailable: boolean
  validDays: number
  costInPoints: number
  rewardPartner?: string
  rewardPartnerId?: string
  createdAt: string
  /**
   * Solo en el catálogo del vecino: lo resuelve la policy de canje del backend.
   * El front NO deduce la regla — la muestra. Si mañana el local puede
   * configurar cuántas veces se canjea un cupón, esto no cambia.
   */
  redeemable?: boolean
  /** Motivo por el que no se puede canjear, listo para mostrar (ej: "Ya canjeado"). */
  reason?: string
}

export interface CouponTransaction {
  id: string
  code: string
  status: string
  adquisitionDate?: string
  redeemDate?: string
  expirationDate: string
  costInPoints: number
  coupon: Coupon
  neighbor?: string
  rewardPartner?: string
}
