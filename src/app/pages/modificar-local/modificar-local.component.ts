import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { Router, RouterModule } from '@angular/router'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { CommonModule } from '@angular/common'
import { SesionService } from '../../services/sesion/sesion.service'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import Swal from 'sweetalert2'

@Component({
  selector: 'app-modificar-local',
  standalone: true,
  imports: [
    PageHeaderComponent,
    MatToolbarModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    CommonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './modificar-local.component.html',
  styleUrl: './modificar-local.component.scss'
})
export class ModificarLocalComponent {
  /** Cuando es true, se renderiza compacto dentro del sheet de opciones (sin chrome de página). */
  @Input() embedded = false
  @Output() saved = new EventEmitter<void>()

  form!: FormGroup

  constructor(
    private fb: FormBuilder,
    private service: LocalAdheridoService,
    private sesionService: SesionService,
    private router: Router
  ) {
    this.service.get(this.sesionService.getUserId()).subscribe((obj: any) => {
      this.form = this.fb.group({
        name: [obj.data.name, [Validators.required, Validators.minLength(2)]],
        address: [obj.data.address, [Validators.required, Validators.minLength(4)]],
        email: [obj.data.email, [Validators.required, Validators.email]],
        phoneNumber: [obj.data.phoneNumber, [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
      })
    })
  }

  onSubmit() {
    if (this.form.valid) {
      this.service.update(this.form.value, this.sesionService.getUserId()).subscribe(() => {
        if (this.embedded) {
          this.saved.emit()
        } else {
          this.router.navigateByUrl('/local')
        }
      })
    }
  }

  onDelete() {
    Swal.fire({
      title: '¿Eliminar tu cuenta?',
      text: 'Esta acción no se puede deshacer. Vas a perder tus cupones y el historial del local.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e5484d'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.delete(this.sesionService.getUserId()).subscribe(() => {
          this.sesionService.logout()
        })
      }
    })
  }
}
