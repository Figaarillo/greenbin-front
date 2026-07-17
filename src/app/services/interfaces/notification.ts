export type NotificationCategory =
  | 'COUPON_PURCHASED'
  | 'COUPON_REDEEMED'
  | 'COUPON_CREATED'
  | 'POINTS_DELIVERED'
  | 'COUPON_EXPIRING_SOON'

export interface Notification {
  id: string
  category: NotificationCategory
  title: string
  body: string
  readAt: string | null
  createdAt: string
}

export interface NotificationPreference {
  couponPurchased: boolean
  couponRedeemed: boolean
  couponCreated: boolean
  pointsDelivered: boolean
  couponExpiringSoon: boolean
  /** Switch maestro: independiente de las categorías de arriba. */
  emailEnabled: boolean
}

export type NotificationPreferencePatch = Partial<NotificationPreference>
