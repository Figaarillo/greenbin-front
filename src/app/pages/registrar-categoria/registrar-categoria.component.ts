import { Component, inject } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { RouterModule } from '@angular/router'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { WasteCategoryService } from '../../services/wasteCategory/waste-category.service'

@Component({
  selector: 'app-registrar-categoria',
  standalone: true,
  imports: [NavbarComponent, MatFormFieldModule, MatButtonModule, MatInputModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registrar-categoria.component.html',
  styleUrl: './registrar-categoria.component.scss'
})
export class RegistrarCategoriaComponent {
  private fb = inject(FormBuilder)
  private service = inject(WasteCategoryService)

  form = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    pointsPerWeight: [null, [Validators.required, Validators.min(1)]],
    co2: [null, [Validators.required, Validators.min(0)]]
  })

  onSubmit() {
    if (this.form.valid) {
      this.service.create(this.form.value).subscribe()
    }
  }
}
