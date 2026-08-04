export interface TotalRecycled {
  totalWeight: number
  totalPoints: number
  totalTransactions: number
}

export interface GreenPointRanking {
  greenPointId: string
  name: string
  totalWeight: number
}

export interface Co2ByCategory {
  categoryName: string
  totalWeight: number
  /** Kg de CO2 evitados: peso reciclado × factor CO2 de la categoría. */
  co2: number
}

export interface Co2Avoided {
  totalCo2: number
  byCategory: Co2ByCategory[]
}

export interface PointsBalance {
  /** Puntos otorgados por entregas de residuos. */
  granted: number
  /** Puntos que los vecinos gastaron canjeando cupones. */
  spent: number
  /** Saldo vigente: lo que los vecinos pueden gastar hoy en los locales. */
  outstanding: number
  neighborsWithBalance: number
}

export interface EntityCounts {
  greenPoints: number
  responsibles: number
  neighbors: number
  rewardPartners: number
}

export interface RewardPartnerRanking {
  rewardPartnerId: string
  name: string
  /** Cupones que el vecino presentó y el local marcó como usados. */
  used: number
  /** Canjeados con puntos pero todavía sin presentar en el local. */
  acquired: number
  expired: number
  pointsSpent: number
}

export interface WasteByCategory {
  categoryName: string
  totalWeight: number
}

export interface WasteByPeriod {
  period: string
  totalWeight: number
}

export interface NeighborDeliveryDetail {
  categoryName: string
  weight: number
  points: number
}

export interface NeighborDelivery {
  transactionId: string
  date: string
  greenPointName: string
  totalPoints: number
  details: NeighborDeliveryDetail[]
}
