import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { Router, RouterModule } from '@angular/router'
import Swal from 'sweetalert2'

@Component({
  selector: 'app-login-vecino',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login-vecino.component.html',
  styleUrl: './login-vecino.component.scss'
})
export class LoginVecinoComponent {
  hide = true

  form: FormGroup
  username: string = 'greenbin'
  password: string = 'proyectofinal'

  constructor(
    private fb: FormBuilder,
    private route: Router
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
  }

  onSubmit() {
    if (
      this.form.valid &&
      this.username == this.form.get('username')?.value &&
      this.password == this.form.get('password')?.value
    ) {
      this.route.navigateByUrl('/vecino')
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Usuario o contraseña incorrecto'
      })
    }
  }
}
