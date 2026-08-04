import { Component, OnInit, ViewChild, inject } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { RouterModule, ActivatedRoute, Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import Swal from 'sweetalert2'
import { MapInputComponent } from '../../components/map-input/map-input.component'
import { StorageService } from '../../services/storage/storage.service'
import { PuntoVerdeService } from '../../services/punto-verde/punto-verde.service'

@Component({
  selector: 'app-modificar-punto-verde',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    MapInputComponent
  ],
  templateUrl: './modificar-punto-verde.component.html',
  styleUrl: './modificar-punto-verde.component.scss'
})
export class ModificarPuntoVerdeComponent implements OnInit {
  @ViewChild(MapInputComponent) mapComponent?: MapInputComponent

  form!: FormGroup
  puntoVerdeId: string = ''
  saving = false

  /** Centro inicial del mapa: la posición guardada del punto verde. */
  initialCenter: google.maps.LatLngLiteral | null = null
  city = ', Argentina'

  private fb = inject(FormBuilder)
  private service = inject(PuntoVerdeService)
  private storage = inject(StorageService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)

  ngOnInit(): void {
    this.puntoVerdeId = this.route.snapshot.paramMap.get('id') ?? ''

    const entidadInfo = JSON.parse(this.storage.getItem('entidadInfo') || '{}')
    if (entidadInfo?.city) this.city = `, ${entidadInfo.city}, Argentina`

    this.service.getById(this.puntoVerdeId).subscribe({
      next: (res: any) => {
        const p = res.data
        this.form = this.fb.group({
          name: [p.name, [Validators.required]],
          email: [p.email, [Validators.required, Validators.email]],
          phoneNumber: [p.phoneNumber, [Validators.required]],
          description: [p.description, [Validators.required]],
          address: [p.address, [Validators.required]],
          latitude: [p.coordinates?.latitude ?? '', [Validators.required]],
          longitude: [p.coordinates?.longitude ?? '', [Validators.required]]
        })

        // El mapa recién se monta cuando hay centro, así no arranca en el
        // medio del país y después salta al punto real.
        if (p.coordinates?.latitude != null && p.coordinates?.longitude != null) {
          this.initialCenter = { lat: p.coordinates.latitude, lng: p.coordinates.longitude }
        }
      },
      error: () => {
        Swal.fire({ title: 'No pudimos cargar el punto verde', icon: 'error' }).then(() =>
          this.router.navigate(['/entidad/consultar-puntos-verdes'])
        )
      }
    })
  }

  /** Centra el mapa en la dirección escrita, sin pisar lo que el usuario ya eligió. */
  coordsByAddress(): void {
    this.mapComponent?.getByAddress(this.form.get('address')?.value)
  }

  getCoordinates(coordinates: google.maps.LatLngLiteral): void {
    this.form.get('latitude')?.setValue(coordinates.lat)
    this.form.get('longitude')?.setValue(coordinates.lng)
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched()
      Swal.fire({
        title: 'Revisá los datos',
        text: 'Faltan campos obligatorios. La posición en el mapa también es necesaria.',
        icon: 'error'
      })
      return
    }

    const { latitude, longitude, ...rest } = this.form.value
    const payload = {
      ...rest,
      coordinates: { latitude: Number(latitude), longitude: Number(longitude) }
    }

    this.saving = true
    this.service.update(payload, this.puntoVerdeId).subscribe({
      next: () => {
        this.saving = false
        Swal.fire({ title: 'Punto verde actualizado', icon: 'success' }).then(() =>
          this.router.navigate(['/entidad/consultar-puntos-verdes'])
        )
      },
      // Sin esto un 409 por coordenadas repetidas no mostraba nada.
      error: (err: { error?: { message?: string } }) => {
        this.saving = false
        Swal.fire({
          title: 'No se pudo guardar',
          text: err?.error?.message ?? 'Revisá los datos e intentá de nuevo.',
          icon: 'error'
        })
      }
    })
  }
}
