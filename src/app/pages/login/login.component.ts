import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { Router, RouterModule } from '@angular/router'
import Swal from 'sweetalert2'
import { MatTabsModule } from '@angular/material/tabs'
import { VecinoService } from '../../services/vecino/vecino.service'
import { Login } from '../../services/interfaces/login'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { ResponsableService } from '../../services/responsable/responsable.service'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginAs = 0
  userRole: string[] = ['VECINO', 'LOCAL ADHERIDO', 'RESPONSABLE']

  hide = true

  form: FormGroup

  constructor(
    private fb: FormBuilder,
    private neighborService: VecinoService,
    private businessService: LocalAdheridoService,
    private responsibleService: ResponsableService
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
  }

  onSubmit() {
    if (this.form.valid) {
      const login = this.setLoginObject()
      switch (this.loginAs) {
        case 1: //neighbor
          this.loginAsNeighbor(login)
          break
        case 2: //local
          this.loginAsNeighbor(login)
          break
        case 3: //responsable
          this.loginAsNeighbor(login)
          break
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Campos inválidos'
      })
    }
  }

  setLoginObject(): Login {
    const emailControl = new FormControl(this.form.get('username')?.value, [Validators.email])
    if (emailControl.valid) {
      return {
        username: undefined,
        email: this.form.get('username')?.value,
        password: this.form.get('password')?.value
      }
    }
    return {
      email: undefined,
      username: this.form.get('username')?.value,
      password: this.form.get('password')?.value
    }
  }

  loginAsNeighbor(login: Login) {
    this.neighborService.login(login).subscribe(obj => {
      console.log(obj)
    })
  }
  loginAsBusiness(login: Login) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Todavía no esta implementado'
    }) /*
    this.businessService.login(login).subscribe(obj => {
      console.log(obj)
    })*/
  }
  loginAsResponsible(login: Login) {
    this.responsibleService.login(login).subscribe(obj => {
      console.log(obj)
    })
  }
}
