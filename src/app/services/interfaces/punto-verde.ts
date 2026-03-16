export interface PuntoVerde {
  id?: string
  name: string
  email: string
  phoneNumber: string
  description: string
  address: string
  entityId?: string
  coordinates: {
    latitude: number
    longitude: number
  }
}
