import { Component, OnInit, inject } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { RouterModule, ActivatedRoute, Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { WasteCategoryService } from '../../services/wasteCategory/waste-category.service'

@Component({
  selector: 'app-modificar-categoria',
  standalone: true,
  imports: [
    NavbarComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './modificar-categoria.component.html',
  styleUrl: './modificar-categoria.component.scss'
})
export class ModificarCategoriaComponent implements OnInit {
  form!: FormGroup
  categoriaId: string = ''

  private fb = inject(FormBuilder)
  private service = inject(WasteCategoryService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)

  ngOnInit(): void {
    this.categoriaId = this.route.snapshot.paramMap.get('id') ?? ''
    this.service.getById(this.categoriaId).subscribe((res: any) => {
      const c = res.data
      this.form = this.fb.group({
        name: [c.name, [Validators.required]],
        description: [c.description, [Validators.required]],
        pointsPerWeight: [c.pointsPerWeight, [Validators.required, Validators.min(1)]],
        co2: [c.co2, [Validators.required, Validators.min(0)]]
      })
    })
  }

  onSubmit() {
    if (this.form.valid) {
      this.service.update(this.form.value, this.categoriaId).subscribe(() => {
        this.router.navigate(['/consultar-categorias'])
      })
    }
  }
}
