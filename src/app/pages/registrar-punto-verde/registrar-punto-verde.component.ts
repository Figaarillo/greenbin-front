import { Component } from '@angular/core'
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { RouterModule } from '@angular/router'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { MapInputComponent } from '../../components/map-input/map-input.component'
import { PuntoVerde } from '../../services/interfaces/punto-verde'
import { PuntoVerdeService } from '../../services/punto-verde/punto-verde.service'

@Component({
  selector: 'app-registrar-punto-verde',
  standalone: true,
  imports: [
    NavbarComponent,
    MatToolbarModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MapInputComponent
  ],
  templateUrl: './registrar-punto-verde.component.html',
  styleUrl: './registrar-punto-verde.component.scss'
})
export class RegistrarPuntoVerdeComponent {
  form: FormGroup

  constructor(
    private fb: FormBuilder,
    private service: PuntoVerdeService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      description: ['']
    })
  }

  getCoordinates(coordinates: google.maps.LatLngLiteral) {
    this.form.get('latitude')?.setValue(coordinates.lat)
    this.form.get('longitude')?.setValue(coordinates.lng)
  }

  onSubmit() {
    if (this.form.valid) {
      const pv: PuntoVerde = {
        name: this.form.get('name')?.value,
        description: this.form.get('description')?.value,
        address: this.form.get('address')?.value,
        coordinates: {
          latitude: this.form.get('latitude')?.value,
          longitude: this.form.get('longitude')?.value
        }
      }
      console.log(<PuntoVerde>pv)
      this.service.create(<PuntoVerde>pv).subscribe()
    }
    //console.log(this.form.value)
  }
}
