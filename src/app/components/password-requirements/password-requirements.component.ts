import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'

export interface PasswordRequirement {
  label: string
  test: (value: string) => boolean
}

@Component({
  selector: 'app-password-requirements',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './password-requirements.component.html',
  styleUrl: './password-requirements.component.scss'
})
export class PasswordRequirementsComponent {
  @Input() password = ''
  @Input() requirements: PasswordRequirement[] = []
}
