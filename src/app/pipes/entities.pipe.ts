import { Pipe, PipeTransform } from '@angular/core'
import { Entidad } from '../services/interfaces/entidad'
import { arrayBuffer } from 'stream/consumers'

@Pipe({
  name: 'entities',
  standalone: true
})
export class EntitiesPipe implements PipeTransform {
  transform(values: any[], ...args: string[]): any[] {
    if (!Array.isArray(values)) {
      return values
    }
    const [query, ...properties]: string[] = args
    if (query === '') return values

    const lowerQuery = query.toLowerCase()

    return values.filter((item: any) => {
      return properties.some((property: string) => {
        const value = item[property]
        const valueAsString = value != null ? value.toString() : ''

        return valueAsString.toLowerCase().includes(lowerQuery)
      })
    })
  }
}
