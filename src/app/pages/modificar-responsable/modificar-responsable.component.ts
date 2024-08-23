import { Component } from '@angular/core'
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { ResponsableService } from '../../services/responsable/responsable.service'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { Responsable } from '../../services/interfaces/responsable'

@Component({
  selector: 'app-modificar-responsable',
  standalone: true,
  imports: [
    NavbarComponent,
    MatToolbarModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './modificar-responsable.component.html',
  styleUrl: './modificar-responsable.component.scss'
})
export class ModificarResponsableComponent {
  form!: FormGroup
  id: string | null = null

  constructor(
    private fb: FormBuilder,
    private service: ResponsableService,
    private route: ActivatedRoute
  ) {
    this.id = this.route.snapshot.paramMap.get('id')
    this.service.get(this.id!).subscribe(obj => {
      this.form = this.fb.group({
        firstname: [obj.firstname, [Validators.required, Validators.minLength(2)]],
        lastname: [obj.lastname, [Validators.required, Validators.minLength(2)]],
        username: [obj.username, [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
        email: [obj.email, [Validators.required, Validators.email]],
        password: [obj.password, [Validators.required, Validators.minLength(8)]],
        dni: [obj.dni, [Validators.required, Validators.pattern('^[0-9]{8,12}$')]],
        phoneNumber: [obj.phoneNumber, [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
      })
      this.form.get('dni')?.disable()
    })
  }

  onSubmit(): void {
    if (this.form.valid && this.id) {
      this.service.update(<Responsable>this.form.value, this.id)
    } else {
      console.log('Form is invalid')
    }
  }
}
