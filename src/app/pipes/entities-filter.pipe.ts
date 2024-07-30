import { Pipe, PipeTransform } from '@angular/core'
import { Entidad } from '../services/interfaces/entidad'
import { MatTableDataSource } from '@angular/material/table'

@Pipe({
  name: 'entitiesFilter',
  standalone: true
})
export class EntitiesFilterPipe implements PipeTransform {
  transform(value: MatTableDataSource<any>, page: number = 0, cant: number = 5): Entidad[] {
    return value.data.slice(page, page + cant)
  }
}
