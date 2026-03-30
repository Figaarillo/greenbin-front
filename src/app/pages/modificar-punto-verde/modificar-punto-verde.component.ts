import { Component, OnInit, inject } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { RouterModule, ActivatedRoute, Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { PuntoVerdeService } from '../../services/punto-verde/punto-verde.service'

@Component({
  selector: 'app-modificar-punto-verde',
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
  templateUrl: './modificar-punto-verde.component.html',
  styleUrl: './modificar-punto-verde.component.scss'
})
export class ModificarPuntoVerdeComponent implements OnInit {
  form!: FormGroup
  puntoVerdeId: string = ''

  private fb = inject(FormBuilder)
  private service = inject(PuntoVerdeService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)

  ngOnInit(): void {
    this.puntoVerdeId = this.route.snapshot.paramMap.get('id') ?? ''
    this.service.getById(this.puntoVerdeId).subscribe((res: any) => {
      const p = res.data
      this.form = this.fb.group({
        name: [p.name, [Validators.required]],
        email: [p.email, [Validators.required, Validators.email]],
        phoneNumber: [p.phoneNumber, [Validators.required]],
        description: [p.description, [Validators.required]],
        address: [p.address, [Validators.required]]
      })
    })
  }

  onSubmit() {
    if (this.form.valid) {
      this.service.update(this.form.value, this.puntoVerdeId).subscribe(() => {
        this.router.navigate(['/consultar-puntos-verdes'])
      })
    }
  }
}
