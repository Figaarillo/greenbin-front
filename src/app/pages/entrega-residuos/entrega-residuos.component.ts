import { StorageService } from '../../services/storage/storage.service'
import { Component, inject } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'
import { MatSelectModule } from '@angular/material/select'
import { VecinoService } from '../../services/vecino/vecino.service'
import { CommonModule } from '@angular/common'
import Swal from 'sweetalert2'
import { Router, RouterModule } from '@angular/router'
import emailjs from '@emailjs/browser'
import { WasteCategoryService } from '../../services/wasteCategory/waste-category.service'
import { PuntoVerdeService } from '../../services/punto-verde/punto-verde.service'
import { WasteDeliveryService } from '../../services/WasteDelivery/waste-delivery.service'
import { WasteDelivery } from '../../services/interfaces/wasteDelivery'
import { PuntoVerde } from '../../services/interfaces/punto-verde'
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component'
import { NotificationPanelComponent } from '../../components/notification-panel/notification-panel.component'

@Component({
  selector: 'app-entrega-residuos',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    PageHeaderComponent,
    ReactiveFormsModule,
    MatSelectModule,
    CommonModule,
    RouterModule,
    NotificationBellComponent,
    NotificationPanelComponent
  ],
  templateUrl: './entrega-residuos.component.html',
  styleUrl: './entrega-residuos.component.scss'
})
export class EntregaResiduosComponent {
  private storage = inject(StorageService)

  /** Paso 0 (elegir punto verde) se salta solo si ya hay uno guardado de una entrega anterior. */
  pvSelected = false
  dniValidated = false

  totalPuntos = 0
  fechaActual: string = ''
  categories: any[] = []
  puntosVerdes: PuntoVerde[] = []
  currentPvName = ''

  form!: FormGroup
  dniValidator!: FormGroup
  pvForm!: FormGroup
  detalle: { puntos: number; cantidad: number; residuo: string; id: string; puntosItem: number }[] = []
  idVeci = ''
  emailVecino = ''
  nombreVecino = ''

  constructor(
    private fb: FormBuilder,
    private route: Router,
    private vecinoService: VecinoService,
    private wasteCatServ: WasteCategoryService,
    private wasteDelServ: WasteDeliveryService,
    private pvService: PuntoVerdeService
  ) {
    this.wasteCatServ.list(0, 100).subscribe(resp => {
      this.categories = (resp ?? []).map((category: any) => ({
        ...category,
        disabled: false
      }))
    })
    this.fechaActual = new Date().toISOString().split('T')[0]

    this.pvForm = this.fb.group({ puntoVerdeId: ['', Validators.required] })
    this.dniValidator = this.fb.group({
      dni: ['', [Validators.required]]
    })
    this.form = this.fb.group({
      categoria: [{}, [Validators.required]],
      kilos: ['', [Validators.required]],
      fechaEntrega: [{ value: this.fechaActual, disabled: true }],
      vecino: [{ value: this.nombreVecino, disabled: true }]
    })

    const pvGuardado = this.storage.getItem('puntoVerde') || ''
    this.pvSelected = !!pvGuardado

    const entidadInfo = JSON.parse(this.storage.getItem('entidadInfo') || '{}')
    this.pvService.list(entidadInfo.id).subscribe((res: any) => {
      this.puntosVerdes = res ?? []
      const actual = this.puntosVerdes.find(p => p.id === pvGuardado)
      this.currentPvName = actual?.name ?? ''
    })
  }

  confirmarPuntoVerde() {
    if (this.pvForm.invalid) return
    const id = this.pvForm.value.puntoVerdeId
    this.storage.setItem('puntoVerde', id)
    this.currentPvName = this.puntosVerdes.find(p => p.id === id)?.name ?? ''
    this.pvSelected = true
  }

  onSubmit(_form: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ',
        cancelButton: 'btn btn-danger'
      }
    })

    if (this.form.valid) {
      Swal.fire({
        title: 'Cargando',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false
      })

      Swal.showLoading()

      const responsibleId = this.storage.getItem('userId') || ''
      const greenPoint = this.storage.getItem('puntoVerde') || ''
      const wasteDelivery: WasteDelivery = {
        responsibleId: responsibleId,
        neighborId: this.idVeci,
        greenPointId: greenPoint,

        wastes: this.detalle.map(detalle => ({
          categoryId: detalle.id,
          weight: detalle.cantidad
        }))
      }

      this.wasteDelServ.create(wasteDelivery).subscribe(
        () => {
          emailjs.send(
            'service_8zvqn0h',
            'template_scqxmg9',
            {
              puntos_asignados: this.totalPuntos,
              email: this.emailVecino,
              nombre: this.nombreVecino
            },
            'ERADTS6Ll5n_u1NKh'
          )
          Swal.close()
          swalWithBootstrapButtons
            .fire({
              text: 'Entrega registrada con éxito!.',
              icon: 'success'
            })
            .then(() => {
              this.route.navigateByUrl('/responsable')
            })
        },
        () => {
          Swal.close()
          swalWithBootstrapButtons.fire({
            title: 'Error al registrar la entrega.',
            icon: 'error'
          })
        }
      )
    }
  }

  validateDni() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ',
        cancelButton: 'btn btn-danger'
      }
    })

    if (this.dniValidator.valid) {
      const dni = this.dniValidator.value.dni
      Swal.fire({
        title: 'Cargando',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false
      })

      Swal.showLoading()
      this.vecinoService.validateDni(dni).subscribe(
        resp => {
          Swal.close()
          this.dniValidated = true
          this.idVeci = resp.data.id
          this.emailVecino = resp.data.email
          this.nombreVecino = resp.data.firstname + ' ' + resp.data.lastname
          this.form.patchValue({ vecino: this.nombreVecino })
        },
        () => {
          Swal.close()
          this.dniValidated = false
          swalWithBootstrapButtons.fire({
            title: 'El usuario no existe.',
            icon: 'error'
          })
        }
      )
    }
  }

  aggResiduo() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ',
        cancelButton: 'btn btn-danger'
      }
    })

    const cantidad = this.form.value.kilos
    const residuoFiltrado = this.categories.filter(resp => {
      return resp.id == this.form.value.categoria
    })
    const residuo = residuoFiltrado[0].name
    if (residuoFiltrado[0].disabled) {
      swalWithBootstrapButtons.fire({
        title: 'Error',
        text: 'Ya registraste este residuo.',
        icon: 'error'
      })
    } else {
      this.categories = this.categories.map(categoria => {
        if (categoria.name === residuo) {
          return { ...categoria, disabled: true }
        }
        return categoria
      })
      const puntos = residuoFiltrado[0].pointsPerWeight
      const id = residuoFiltrado[0].id
      // Redondeado por ítem, igual que el backend (WasteEntity.calculatePoints):
      // así el preview coincide con lo que realmente se guarda al confirmar.
      const puntosItem = Math.round(puntos * cantidad)
      this.totalPuntos = this.totalPuntos + puntosItem
      this.detalle.push({ puntos, cantidad, residuo, id, puntosItem })
    }
  }

  delete(item: any) {
    this.detalle = this.detalle.filter(detalle => detalle.residuo !== item.residuo)
    this.totalPuntos = this.totalPuntos - item.puntosItem
    this.categories = this.categories.map(categoria => {
      if (categoria.name === item.residuo) {
        return { ...categoria, disabled: false }
      }
      return categoria
    })
  }

  cancelarEntrega() {
    Swal.fire({
      title: '¿Cancelar esta entrega?',
      text: 'Vas a perder los residuos que ya cargaste.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Seguir cargando',
      confirmButtonColor: '#e5484d'
    }).then(result => {
      if (result.isConfirmed) {
        this.route.navigateByUrl('/responsable/inicio')
      }
    })
  }
}
