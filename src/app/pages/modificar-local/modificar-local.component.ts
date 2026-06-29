import { Component } from '@angular/core'
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
        this.router.navigateByUrl('/local')
      })
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
