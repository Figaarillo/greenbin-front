import { Component, inject, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatToolbarModule } from '@angular/material/toolbar'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { VecinoService } from '../../services/vecino/vecino.service'
import { SafeUrlPipe } from '../../safe-url.pipe'

@Component({
  selector: 'app-mis-reciclados',
  standalone: true,
  imports: [MatListModule, MatToolbarModule, MatIconModule, NavbarComponent, SafeUrlPipe],
  templateUrl: './mis-reciclados.component.html',
  styleUrl: './mis-reciclados.component.scss'
})
export class MisRecicladosComponent implements OnInit {
  vecinoServ = inject(VecinoService)
  iframeUrl: string = ''
  id: string = ''
  ngOnInit(): void {
    const info = localStorage.getItem('usuarioInfo') || ''
    const userInfo = JSON.parse(info)
    this.id = userInfo.id
    console.log(this.id)
    this.loadIframeUrl(this.id)
  }

  loadIframeUrl(id: string): void {
    this.vecinoServ.getMetabaseIframeUrl(id).subscribe({
      next: response => {
        this.iframeUrl = response.iframeUrl
      },
      error: err => {
        console.error('Error al obtener el iframe URL:', err)
      }
    })
  }
}
