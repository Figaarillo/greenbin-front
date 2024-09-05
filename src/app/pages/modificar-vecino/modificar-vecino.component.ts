import { Component } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { VecinoService } from '../../services/vecino/vecino.service'

@Component({
  selector: 'app-modificar-vecino',
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
  templateUrl: './modificar-vecino.component.html',
  styleUrl: './modificar-vecino.component.scss'
})
export class ModificarVecinoComponent {
  form!: FormGroup
  id: string | null = null
  constructor(
    private fb: FormBuilder,
    private service: VecinoService,
    private route: ActivatedRoute
  ) {
    this.id = this.route.snapshot.paramMap.get('id')
    this.service.get(this.id!).subscribe((obj: any) => {
      //console.log(obj.data)
      this.form = this.fb.group({
        firstname: [obj.data.firstname, [Validators.required, Validators.minLength(2)]],
        lastname: [obj.data.lastname, [Validators.required, Validators.minLength(2)]],
        username: [obj.data.username, [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
        email: [obj.data.email, [Validators.required, Validators.email]],
        phoneNumber: [obj.data.phoneNumber, [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
      })
    })
  }

  onSubmit() {}
}
