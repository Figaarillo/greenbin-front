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
}
