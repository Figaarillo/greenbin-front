import { HttpContextToken } from '@angular/common/http'

export const IS_REFRESH_TOKEN_REQUEST = new HttpContextToken<boolean>(() => false)
