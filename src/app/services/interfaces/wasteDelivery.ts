export interface WasteDelivery {
  responsibleId: string
  neighborId: string
  greenPointId: string
  wastes: { categoryId: string; weight: number }[]
}
