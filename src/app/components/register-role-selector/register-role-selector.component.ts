import { Component } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router'

@Component({
  selector: 'app-register-role-selector',
  standalone: true,
  imports: [MatIconModule, RouterModule],
  templateUrl: './register-role-selector.component.html',
  styleUrl: './register-role-selector.component.scss'
})
export class RegisterRoleSelectorComponent {}
