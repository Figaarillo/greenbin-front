import { Pipe, PipeTransform } from '@angular/core'
import { Entidad } from '../services/interfaces/entidad'
import { MatTableDataSource } from '@angular/material/table'

@Pipe({
  name: 'entitiesFilter',
  standalone: true
})
export class EntitiesFilterPipe implements PipeTransform {
  transform(value: MatTableDataSource<any> | null | undefined, page: number = 0, cant: number = 15): any[] {
    if (!value || !value.data) return []
    return value.data.slice(page, page + cant)
  }
}
