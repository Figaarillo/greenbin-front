import { StorageService } from '../../services/storage/storage.service'
import { Component, OnInit, inject } from '@angular/core'
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router'
import { BreakpointObserver } from '@angular/cdk/layout'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { SesionService } from '../../services/sesion/sesion.service'
import Swal from 'sweetalert2'
import { MatIconModule } from '@angular/material/icon'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-role-layout',
  standalone: true,
  imports: [RouterModule, RouterOutlet, SidenavComponent, CommonModule, MatIconModule],
  templateUrl: './role-layout.component.html',
  styleUrl: './role-layout.component.scss'
})
export class RoleLayoutComponent implements OnInit {
  private storage = inject(StorageService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private breakpointObserver = inject(BreakpointObserver)
  private sesionService = inject(SesionService)

  role = 'vecino'
  isMobile = false
  userId = ''

  ngOnInit(): void {
    this.role = this.route.snapshot.data['role'] || 'vecino'
    this.userId = this.sesionService.getUserId()

    this.breakpointObserver.observe('(max-width: 959px)').subscribe(result => {
      this.isMobile = result.matches
    })
  }

  goEntrega(): void {
    const pvSelec = this.storage.getItem('puntoVerde') || ''
    if (pvSelec) {
      this.router.navigate(['/entrega'])
    } else {
      Swal.fire({ title: 'Tienes que seleccionar un punto verde.', icon: 'error' })
    }
  }
}
