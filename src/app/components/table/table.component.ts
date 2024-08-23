import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { MatTableDataSource, MatTableModule } from '@angular/material/table'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIcon } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator'
import { Column } from '../../services/interfaces/columns'
import { CommonModule } from '@angular/common'
import { EntitiesFilterPipe } from '../../pipes/entities-filter.pipe'
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    NavbarComponent,
    MatTableModule,
    MatToolbarModule,
    MatIcon,
    MatTooltipModule,
    MatPaginatorModule,
    CommonModule,
    EntitiesFilterPipe
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnChanges {
  dataSource: any = []
  page: number = 0
  nPage: number = 1
  cant: number = 5
  @Input() tableData: any[] = []

  @Input() title: String = ''
  displayedColumns: string[] = []
  tableColumns: Column[] = []

  @Input() set columns(columns: Column[]) {
    this.tableColumns = columns
    console.log(this.tableColumns)
    this.displayedColumns = this.tableColumns.map(col => col.key)
  }

  @Output() delete = new EventEmitter<any>()
  @Output() edit = new EventEmitter<any>()

  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource = new MatTableDataSource([])
    console.log('###########')
    console.log('cambios')
    console.log('###########')
    this.dataSource.data = this.tableData
    console.log(this.dataSource)
  }
  onSelectChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement
    this.cant = Number(selectElement.value)
  }

  nextPage() {
    console.log('entra')
    this.nPage += 1
    this.page += this.cant
  }

  prevPage() {
    if (this.page > 0) {
      this.nPage -= 1
      this.page -= this.cant
    }
  }

  deleteAction(item: string) {
    this.delete.emit(item)
  }
  editAction(item: string) {
    this.edit.emit(item)
  }
}
