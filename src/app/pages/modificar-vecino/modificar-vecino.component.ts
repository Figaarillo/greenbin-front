import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'
import { VecinoService } from '../../services/vecino/vecino.service'
import { Vecino } from '../../services/interfaces/vecino'
import { CommonModule } from '@angular/common'
import { SesionService } from '../../services/sesion/sesion.service'
import { MatIconModule } from '@angular/material/icon'
import Swal from 'sweetalert2'

@Component({
  selector: 'app-modificar-vecino',
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
    MatIconModule
  ],
  templateUrl: './modificar-vecino.component.html',
  styleUrl: './modificar-vecino.component.scss'
})
export class ModificarVecinoComponent {
  /** Cuando es true, se renderiza compacto dentro del sheet de opciones (sin chrome de página). */
  @Input() embedded = false
  @Output() saved = new EventEmitter<void>()

  form!: FormGroup
  constructor(
    private fb: FormBuilder,
    private service: VecinoService,
    private route: ActivatedRoute,
    private sesionService: SesionService
  ) {
    this.service.get(this.sesionService.getUserId()).subscribe((obj: any) => {
      // El backend ahora puebla 'entity', así que la ciudad viene directo con el vecino.
      // 'city' puede estar vacío en algunas entidades; caemos al 'name' para no dejarlo en blanco.
      const entidad = obj.data.entity
      this.form = this.fb.group({
        firstname: [obj.data.firstname, [Validators.required, Validators.minLength(2)]],
        lastname: [obj.data.lastname, [Validators.required, Validators.minLength(2)]],
        username: [obj.data.username, [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
        email: [obj.data.email, [Validators.required, Validators.email]],
        phoneNumber: [obj.data.phoneNumber, [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
        // Ciudad elegida al registrarse: solo lectura. Al estar disabled, no se envía en el update.
        ciudad: [{ value: entidad?.city || entidad?.name || '', disabled: true }]
      })
    })
  }

  onSubmit() {
    if (this.form.valid) {
      this.service.update(<Vecino>this.form.value, this.sesionService.getUserId()).subscribe(() => {
        if (this.embedded) this.saved.emit()
      })
    }
  }

  onDelete() {
    Swal.fire({
      title: '¿Eliminar tu cuenta?',
      text: 'Esta acción no se puede deshacer. Vas a perder tu historial de reciclados y cupones.',
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
