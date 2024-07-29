import { Pipe, PipeTransform } from '@angular/core'
import { Entidad } from '../services/interfaces/entidad'
import { MatTableDataSource } from '@angular/material/table'

@Pipe({
  name: 'entitiesFilter',
  standalone: true
})
export class EntitiesFilterPipe implements PipeTransform {
  transform(value: MatTableDataSource<Entidad>, ...args: unknown[]): Entidad[] {
    return value.data.slice(0, 3)
  }
}
