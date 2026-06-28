import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule, ActivatedRoute, Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'

@Component({
  selector: 'app-modificar-cupon',
  standalone: true,
  imports: [
    NavbarComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './modificar-cupon.component.html',
  styleUrl: './modificar-cupon.component.scss'
})
export class ModificarCuponComponent implements OnInit {
  form!: FormGroup
  couponId: string = ''

  constructor(
    private fb: FormBuilder,
    private service: LocalAdheridoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.couponId = this.route.snapshot.paramMap.get('id') ?? ''
    this.service.getCupon(this.couponId).subscribe((res: any) => {
      const c = res.data
      this.form = this.fb.group({
        title: [c.title, [Validators.required]],
        description: [c.description, [Validators.required]],
        discount: [c.discount, [Validators.required, Validators.min(1), Validators.max(100)]],
        costInPoints: [c.costInPoints, [Validators.required, Validators.min(1)]],
        validDays: [c.validDays, [Validators.required, Validators.min(1)]]
      })
    })
  }

  onSubmit() {
    if (this.form.valid) {
      this.service.updateCupon(this.form.value, this.couponId).subscribe(() => {
        this.router.navigate(['/cupones-ofrecidos'])
      })
    }
  }
}
