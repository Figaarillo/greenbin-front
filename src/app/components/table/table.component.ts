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

  @Input() tableData: any[] = []
  @Input() title: String = ''
  @Input() subtitle = ''
  @Input() createLabel = ''
  @Input() createRoute = ''
  @Input() loading = false

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
    if (!query) return this.tableData
    return this.tableData.filter(row => {
      const value = row[this.selectedFilter]
      const valueAsString = value != null ? value.toString() : ''
      return valueAsString.toLowerCase().includes(query)
    })
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
