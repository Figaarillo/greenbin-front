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
import { ResponsableService } from '../../services/responsable/responsable.service'

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
  dniValidated = false
  totalPuntos = 0
  fechaActual: string = ''
  route = inject(Router)
  responsibleServ = inject(ResponsableService)
  categorias: any[] = [
    {
      id: '1',
      name: 'CARTÓN',
      points: 100,
      disabled: false
    },
    {
      id: '2',
      name: 'VIDRIO',
      points: 150,
      disabled: false
    },
    {
      id: '3',
      name: 'PLÁSTICO',
      points: 120,
      disabled: false
    },
    {
      id: '4',
      name: 'LATA',
      points: 100,
      disabled: false
    },
    {
      id: '5',
      name: 'PAPEL',
      points: 80,
      disabled: false
    }
  ]

  form!: FormGroup
  dniValidator!: FormGroup
  detalle: { puntos: number; cantidad: number; residuo: string }[] = []
  idVeci = ''
  nombreVecino = ''
  constructor(
    private fb: FormBuilder,
    private vecinoService: VecinoService
  ) {
    this.fechaActual = new Date().toISOString().split('T')[0]
    this.dniValidator = this.fb.group({
      dni: ['', [Validators.required]]
    })
    this.form = this.fb.group({
      categoria: [{}, [Validators.required]],
      kilos: ['', [Validators.required]],
      fechaEntrega: [{ value: this.fechaActual, disabled: true }],
      vecino: [{ value: this.nombreVecino, disabled: true }]
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
      Swal.fire({
        title: 'Cargando',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false
      })

      Swal.showLoading()
      this.vecinoService.get(this.idVeci).subscribe((resp: any) => {
        const vecino = {
          firstname: resp.data.firstname,
          lastname: resp.data.lastname,
          username: resp.data.username,
          email: resp.data.email,
          phoneNumber: resp.data.phoneNumber,
          points: resp.data.points + this.totalPuntos
        }
        console.log('vecinoocc')
        console.log(vecino)
        this.vecinoService.update(vecino, this.idVeci).subscribe(
          (updateResp: any) => {
            console.log('Actualización exitosa', updateResp)

            emailjs
              .send(
                'service_8zvqn0h',
                'template_scqxmg9',
                {
                  puntos_asignados: this.totalPuntos,
                  email: resp.data.email
                },
                'ERADTS6Ll5n_u1NKh'
              )
              .then(
                result => {
                  console.log('Correo enviado con éxito:', result.text)
                },
                error => {
                  console.error('Error al enviar el correo:', error)
                }
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
          (error: any) => {
            console.error('Error en la actualización', error)
            Swal.close()

            swalWithBootstrapButtons.fire({
              title: 'Error al registrar la entrega.',
              icon: 'error'
            })
          }
        )
      })
    } else {
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
          this.nombreVecino = resp.data.firstname + ' ' + resp.data.lastname
          this.form.patchValue({ vecino: this.nombreVecino })
          console.log('nombre')
          console.log(this.nombreVecino)
        },
        error => {
          Swal.close()
          this.dniValidated = false
          swalWithBootstrapButtons.fire({
            title: 'El usuario no existe.',
            icon: 'error'
          })
        }
      )

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
