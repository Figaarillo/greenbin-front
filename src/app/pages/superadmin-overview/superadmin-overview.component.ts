import { Component, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatRippleModule } from '@angular/material/core'
import { RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common'
import { EntidadService } from '../../services/entidad/entidad.service'

@Component({
  selector: 'app-superadmin-overview',
  standalone: true,
  imports: [MatIconModule, MatRippleModule, RouterModule, CommonModule],
  templateUrl: './superadmin-overview.component.html',
  styleUrl: './superadmin-overview.component.scss'
})
export class SuperadminOverviewComponent implements OnInit {
  totalEntidades = 0

  constructor(private entidadService: EntidadService) {}

  ngOnInit(): void {
    this.entidadService.list(0, 1000).subscribe({
      next: (data: any) => {
        this.totalEntidades = data.length
      }
    })
  }
}
