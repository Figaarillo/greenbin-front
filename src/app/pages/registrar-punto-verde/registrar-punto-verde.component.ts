import { Component } from '@angular/core'
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { RouterModule } from '@angular/router'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { VecinoService } from '../../services/vecino/vecino.service'

@Component({
  selector: 'app-registrar-punto-verde',
  standalone: true,
  imports: [
    NavbarComponent,
    MatToolbarModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './registrar-punto-verde.component.html',
  styleUrl: './registrar-punto-verde.component.scss'
})
export class RegistrarPuntoVerdeComponent {
  form: FormGroup
  hidePassword = true

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      coordinates: [''],
      description: ['']
    })
  }

  onSubmit() {
    console.log(this.form.value)
  }
}
