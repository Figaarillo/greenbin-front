import { StorageService } from '../../services/storage/storage.service'
import { SesionService } from '../../services/sesion/sesion.service'
import { inject, Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { ResponsableService } from '../../services/responsable/responsable.service'
import { ActivatedRoute, RouterModule, Router } from '@angular/router'
import { Responsable } from '../../services/interfaces/responsable'
import Swal from 'sweetalert2'
@Component({
  selector: 'app-modificar-responsable',
  standalone: true,
  imports: [
    MatToolbarModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './modificar-responsable.component.html',
  styleUrl: './modificar-responsable.component.scss'
})
export class ModificarResponsableComponent implements OnInit {
  private storage = inject(StorageService)
  private sesionService = inject(SesionService)

  /** Cuando es true, se renderiza compacto dentro del sheet de opciones (sin chrome de página). */
  @Input() embedded = false
  /** Id a usar en modo embedded, ya que ahí no hay param de ruta disponible. */
  @Input() userIdOverride?: string
  @Output() saved = new EventEmitter<void>()

  form!: FormGroup
  id: string | null = null
  ruta = ''
  constructor(
    private fb: FormBuilder,
    private service: ResponsableService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // La resolución de id se hace acá (no en el constructor) para poder leer
    // @Input() userIdOverride, que Angular recién liga después de construir.
    this.id = this.userIdOverride ?? this.route.snapshot.paramMap.get('id') ?? this.sesionService.getUserId()
    this.service.get(this.id!).subscribe((obj: any) => {
      this.form = this.fb.group({
        firstname: [obj.data.firstname, [Validators.required, Validators.minLength(2)]],
        lastname: [obj.data.lastname, [Validators.required, Validators.minLength(2)]],
        username: [obj.data.username, [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
        dni: [obj.data.dni, [Validators.required, Validators.pattern('^[0-9]{8,12}$')]],
        phoneNumber: [obj.data.phoneNumber, [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
      })
      this.form.get('dni')?.disable()
      this.form.get('lastname')?.disable()
      this.form.get('firstname')?.disable()
    })

    const edit = this.storage.getItem('respoEdit') || ''
    if (edit == 'true') {
      this.ruta = '/entidad'
    } else {
      this.ruta = '/responsable'
    }
  }

  onSubmit() {
    if (this.embedded) {
      // El sheet ya exige un tap explícito en "Guardar": sin confirmación doble de SweetAlert.
      if (this.form.valid && this.id) {
        this.service.update(<Responsable>this.form.value, this.id).subscribe(() => this.saved.emit())
      }
      return
    }

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ',
        cancelButton: 'btn btn-danger'
      }
    })
    swalWithBootstrapButtons
      .fire({
        title: '¿Estas seguro que desea modificar este Usuario?',
        text: 'No podras revertirlo.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
      })
      .then(result => {
        if (result.isConfirmed) {
          if (this.form.valid && this.id) {
            this.service.update(<Responsable>this.form.value, this.id).subscribe(() => {
              swalWithBootstrapButtons
                .fire({
                  title: '¡El Usuario ha sido modificado.!',

                  icon: 'success'
                })
                .then(() => {
                  this.storage.setItem('respoEdit', 'false')
                  this.router.navigate([this.ruta])
                })
            })
          } else {
            swalWithBootstrapButtons
              .fire({
                title: 'Ha ocurrido un error',
                icon: 'error'
              })
              .then(result => {
                if (result.isConfirmed) {
                  this.router.navigate(['/modificar-responsable']) // Navega al home si se cancela
                }
              })
          }
        } else {
          swalWithBootstrapButtons.fire({
            title: 'Cancelado',
            icon: 'error'
          })
        }
      })
  }
}
