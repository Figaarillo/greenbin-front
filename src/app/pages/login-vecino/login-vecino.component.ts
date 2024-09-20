import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { FormsModule } from '@angular/forms'
import { MatCheckboxModule } from '@angular/material/checkbox'

@Component({
  selector: 'app-login-vecino',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, FormsModule, MatCheckboxModule],
  templateUrl: './login-vecino.component.html',
  styleUrl: './login-vecino.component.scss'
})
export class LoginVecinoComponent {}
