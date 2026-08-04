import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { Column } from '../../services/interfaces/columns'
import { SkeletonComponent } from '../skeleton/skeleton.component'

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SkeletonComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnChanges {
  nPage = 1
  cant = 15
  selectedFilter = ''
  search = ''
  sortKey: string | null = null
  sortDir: 'asc' | 'desc' = 'asc'

  @Input() tableData: any[] = []
  @Input() title: String = ''
  @Input() subtitle = ''
  @Input() createLabel = ''
  @Input() createRoute = ''
  @Input() loading = false

  // Acciones configurables. Los defaults reproducen el comportamiento previo
  // (editar + eliminar) para no tocar las pantallas que ya funcionaban; una
  // pantalla que no puede mutar la fila apaga el botón que corresponda.
  @Input() showEdit = true
  @Input() showDelete = true
  @Input() editIcon = 'edit'
  @Input() editLabel = 'Editar'
  @Input() deleteIcon = 'delete'
  @Input() deleteLabel = 'Eliminar'

  tableColumns: Column[] = []

  @Input() set columns(columns: Column[]) {
    this.tableColumns = columns
    const first = this.getFilteredColumns()[0]
    if (!this.selectedFilter && first) this.selectedFilter = first.key
  }

  @Output() delete = new EventEmitter<any>()
  @Output() edit = new EventEmitter<any>()
  @Output() filter = new EventEmitter<any>()

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableData']) this.nPage = 1
  }

  get firstColumnKey(): string {
    return this.tableColumns[0]?.key ?? ''
  }

  get filtered(): any[] {
    const query = this.search.trim().toLowerCase()
    const base = !query
      ? this.tableData
      : this.tableData.filter(row => {
          const value = row[this.selectedFilter]
          const valueAsString = value != null ? value.toString() : ''
          return valueAsString.toLowerCase().includes(query)
        })

    if (!this.sortKey) return base

    const key = this.sortKey
    const dir = this.sortDir === 'asc' ? 1 : -1
    return [...base].sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      if (av == null && bv == null) return 0
      if (av == null) return -1 * dir
      if (bv == null) return 1 * dir
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      // localeCompare con numeric:true ordena fechas ISO cronologicamente
      // (orden lexicografico == orden cronologico) sin parsear Date aparte.
      return String(av).localeCompare(String(bv), 'es', { numeric: true, sensitivity: 'base' }) * dir
    })
  }

  toggleSort(column: Column): void {
    if (column.key === 'actions') return
    if (this.sortKey === column.key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      this.sortKey = column.key
      this.sortDir = 'asc'
    }
    this.nPage = 1
  }

  get paged(): any[] {
    const start = (this.nPage - 1) * this.cant
    return this.filtered.slice(start, start + this.cant)
  }

  get hasNext(): boolean {
    return this.nPage * this.cant < this.filtered.length
  }

  onSearchChange() {
    this.nPage = 1
  }

  onPageSizeChange() {
    this.nPage = 1
  }

  nextPage() {
    if (this.hasNext) this.nPage += 1
  }

  prevPage() {
    if (this.nPage > 1) this.nPage -= 1
  }

  deleteAction(item: string) {
    this.delete.emit(item)
  }

  editAction(item: string) {
    this.edit.emit(item)
  }

  getFilteredColumns(): Column[] {
    return this.tableColumns.filter(column => column.key !== 'actions')
  }
}
