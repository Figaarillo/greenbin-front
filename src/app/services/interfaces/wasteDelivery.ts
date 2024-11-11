export interface WasteDelivery {
  responsible: string
  neighbor: string
  greenPoint: string
  wastes: { category: string; weight: number }[]
}
