import { Component } from '@angular/core'
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
  form!: FormGroup
  constructor(
    private fb: FormBuilder,
    private service: VecinoService,
    private route: ActivatedRoute,
    private sesionService: SesionService
  ) {
    this.service.get(this.sesionService.getUserId()).subscribe((obj: any) => {
      this.form = this.fb.group({
        firstname: [obj.data.firstname, [Validators.required, Validators.minLength(2)]],
        lastname: [obj.data.lastname, [Validators.required, Validators.minLength(2)]],
        username: [obj.data.username, [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
        email: [obj.data.email, [Validators.required, Validators.email]],
        phoneNumber: [obj.data.phoneNumber, [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
      })
    })
  }

  onSubmit() {
    if (this.form.valid) {
      this.service.update(<Vecino>this.form.value, this.sesionService.getUserId()).subscribe()
    }
  }

  onDelete() {
    if (confirm('¿Estás seguro que querés eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      this.service.delete(this.sesionService.getUserId()).subscribe(() => {
        this.sesionService.logout()
      })
    }
  }
}
