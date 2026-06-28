import { StorageService } from '../../services/storage/storage.service'
import { Component, inject } from '@angular/core'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButton } from '@angular/material/button'
import { MatInput } from '@angular/material/input'
import { MatCardModule } from '@angular/material/card'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { Coupon } from '../../services/interfaces/coupon'
@Component({
  selector: 'app-registrar-cupon',
  standalone: true,
  imports: [NavbarComponent, MatFormFieldModule, MatButton, MatInput, MatCardModule, ReactiveFormsModule],
  templateUrl: './registrar-cupon.component.html',
  styleUrl: './registrar-cupon.component.scss'
})
export class RegistrarCuponComponent {
  private storage = inject(StorageService)
  private readonly formBuilder = inject(FormBuilder)
  private localServ = inject(LocalAdheridoService)
  formGroup = this.formBuilder.group({
    titulo: ['', Validators.required],
    description: ['', Validators.required],
    descuento: ['', Validators.required],
    costo: ['', Validators.required],
    diasVigente: ['', Validators.required]
  })

  registrarCupon() {
    if (this.formGroup.valid) {
      console.log(this.formGroup.value)
      const info = this.storage.getItem('usuarioInfo') || ''
      const userInfo = JSON.parse(info)
      const id = userInfo.id
      const cupon = {
        title: this.formGroup.get('titulo')?.value,
        description: this.formGroup.get('description')?.value,
        discount: this.formGroup.get('descuento')?.value,
        costInPoints: this.formGroup.get('costo')?.value,
        validDays: this.formGroup.get('diasVigente')?.value,
        isAvailable: true,
        rewardPartnerId: id
      }
      this.localServ.createCupon(cupon).subscribe(resp => {
        console.log(resp)
      })
    }
  }
}
