import { Component, Inject, inject } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { MatDividerModule } from '@angular/material/divider'
import { MatChipsModule } from '@angular/material/chips'
import { MatSelectModule } from '@angular/material/select'
import { MatTableModule } from '@angular/material/table'
import { VecinoService } from '../../services/vecino/vecino.service'
import { CommonModule } from '@angular/common'
import Swal from 'sweetalert2'
import { Router, RouterModule } from '@angular/router'
import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser'
import { WasteCategoryService } from '../../services/wasteCategory/waste-category.service'

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
    MatSelectModule,
    MatTableModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './entrega-residuos.component.html',
  styleUrl: './entrega-residuos.component.scss'
})
export class EntregaResiduosComponent {
  dniValidated = true
  totalPuntos = 0
  fechaActual: string = ''
  route = inject(Router)
  categories: any[] = []
  categorias: any[] = [
    {
      id: '1',
      name: 'carton',
      points: 500,
      disabled: false
    },
    {
      id: '2',
      name: 'vidrio',
      points: 3000,
      disabled: false
    },
    {
      id: '3',
      name: 'plástico',
      points: 1500,
      disabled: false
    },
    {
      id: '4',
      name: 'metal',
      points: 5000,
      disabled: false
    }
  ]
  form!: FormGroup
  dniValidator!: FormGroup
  detalle: { puntos: number; cantidad: number; residuo: string }[] = []

  constructor(
    private fb: FormBuilder,
    private vecinoService: VecinoService,
    private wasteCatServ: WasteCategoryService
  ) {
    this.wasteCatServ.list(0, 100).subscribe(resp => {
      this.categories = resp.map((category: any) => ({
        ...category,
        disabled: false
      }))
      console.log(this.categories)
    })
    this.fechaActual = new Date().toISOString().split('T')[0]
    this.dniValidator = this.fb.group({
      dni: ['', [Validators.required]]
    })
    this.form = this.fb.group({
      categoria: [{}, [Validators.required]],
      kilos: ['', [Validators.required]],
      fechaEntrega: [{ value: this.fechaActual, disabled: true }],
      vecino: [{ value: 'Santiago Giordano', disabled: true }]
    })
  }

  onSubmit(form: any) {
    console.log(form)
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ',
        cancelButton: 'btn btn-danger'
      }
    })

    if (this.form.valid) {
      console.log('detalle')
      console.log(this.detalle)
      let usuariopts = localStorage.getItem('usuariopts')
      if (!usuariopts) {
        usuariopts = '0'
      }
      const nuevosPuntos = parseInt(usuariopts) + this.totalPuntos
      console.log(nuevosPuntos)
      localStorage.setItem('usuariopts', nuevosPuntos.toString())

      swalWithBootstrapButtons
        .fire({
          text: 'Entrega registrada con éxito!.',
          icon: 'success'
        })
        .then(() => {
          this.route.navigateByUrl('/responsable')
        })
    } else {
      console.log('entra else')
      setTimeout(() => {
        Swal.close()

        swalWithBootstrapButtons.fire({
          title: 'Error al registrar la entrega.',
          icon: 'error'
        })
      }, 1000)
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
      if (dni == '42337809') {
        setTimeout(() => {
          Swal.close()
          this.dniValidated = true
        }, 1000)
      } else {
        setTimeout(() => {
          Swal.close()
          this.dniValidated = false
          swalWithBootstrapButtons.fire({
            title: 'El usuario no existe.',
            icon: 'error'
          })
        }, 1000)
      }
      // this.vecinoService.validateDni(dni).subscribe(
      //   res => {
      //     Swal.close()
      //     this.dniValidated = true
      //   },
      //   err => {
      //     Swal.close()
      //     swalWithBootstrapButtons.fire({
      //       title: 'El usuario no existe.',
      //       icon: 'error'
      //     })
      //   }
      // )
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
    const residuoFiltrado = this.categorias.filter(resp => {
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
      console.log('entra')
      this.categorias = this.categorias.map(categoria => {
        if (categoria.name === residuo) {
          return { ...categoria, disabled: true }
        }
        return categoria
      })
      console.log(this.categorias)
      const puntos = residuoFiltrado[0].points
      this.totalPuntos = this.totalPuntos + residuoFiltrado[0].points * cantidad
      console.log(this.form)
      this.detalle.push({ puntos, cantidad, residuo })
    }
  }

  delete(item: any) {
    this.detalle = this.detalle.filter(detalle => detalle.residuo !== item.residuo)
    this.totalPuntos = this.totalPuntos - item.cantidad * item.puntos
    this.categorias = this.categorias.map(categoria => {
      if (categoria.name === item.residuo) {
        return { ...categoria, disabled: false }
      }
      return categoria
    })
  }
}
