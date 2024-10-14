import { Component } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { MatDividerModule } from '@angular/material/divider'
import { MatChipsModule } from '@angular/material/chips'
import { MatSelectModule } from '@angular/material/select'

@Component({
  selector: 'app-entrega-residuos',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    NavbarComponent,
    ReactiveFormsModule,
    MatChipsModule,
    MatDividerModule,
    MatSelectModule
  ],
  templateUrl: './entrega-residuos.component.html',
  styleUrl: './entrega-residuos.component.scss'
})
export class EntregaResiduosComponent {
  categorias: any[] = [
    {
      id: '1',
      name: 'carton',
      points: 500
    },
    {
      id: '2',
      name: 'vidrio',
      points: 3000
    },
    {
      id: '3',
      name: 'plástico',
      points: 1500
    },
    {
      id: '4',
      name: 'metal',
      points: 5000
    }
  ]
  form!: FormGroup

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      dni: ['', [Validators.required]],
      categoria: [{}],
      kilos: ['']
    })
  }

  onSubmit() {}
}
