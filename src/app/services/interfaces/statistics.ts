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
