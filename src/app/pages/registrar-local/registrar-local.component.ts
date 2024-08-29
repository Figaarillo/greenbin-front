import { Component } from '@angular/core'
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms'
import { MatButton } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatInput } from '@angular/material/input'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { MatToolbar } from '@angular/material/toolbar'
@Component({
  selector: 'app-registrar-local',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButton,
    MatFormFieldModule,
    MatIcon,
    MatInput,
    NavbarComponent,
    MatToolbar
  ],
  templateUrl: './registrar-local.component.html',
  styleUrl: './registrar-local.component.scss'
})
export class RegistrarLocalComponent {}
