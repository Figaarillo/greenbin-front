import { Component, viewChild } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router'
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component'

@Component({
  selector: 'app-register-role-selector',
  standalone: true,
  imports: [MatIconModule, RouterModule, BottomSheetComponent],
  templateUrl: './register-role-selector.component.html',
  styleUrl: './register-role-selector.component.scss'
})
export class RegisterRoleSelectorComponent {
  private readonly sheet = viewChild.required(BottomSheetComponent)

  open(): void {
    this.sheet().open()
  }
}
