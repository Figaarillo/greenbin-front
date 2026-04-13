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
