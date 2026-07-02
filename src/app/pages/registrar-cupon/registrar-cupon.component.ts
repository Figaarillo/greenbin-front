import { StorageService } from '../../services/storage/storage.service'
import { Component, inject } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButton } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInput } from '@angular/material/input'
import { Router } from '@angular/router'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
@Component({
  selector: 'app-registrar-cupon',
  standalone: true,
  imports: [PageHeaderComponent, MatFormFieldModule, MatButton, MatInput, MatIconModule, ReactiveFormsModule],
  templateUrl: './registrar-cupon.component.html',
  styleUrl: './registrar-cupon.component.scss'
})
export class RegistrarCuponComponent {
  private storage = inject(StorageService)
  private readonly formBuilder = inject(FormBuilder)
  private localServ = inject(LocalAdheridoService)
  private router = inject(Router)
  formGroup = this.formBuilder.group({
    titulo: ['', Validators.required],
    description: ['', Validators.required],
    descuento: ['', Validators.required],
    costo: ['', Validators.required],
    diasVigente: ['', Validators.required]
  })

  registrarCupon() {
    if (this.formGroup.valid) {
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
      this.localServ.createCupon(cupon).subscribe(() => {
        this.router.navigateByUrl('/local/cupones-ofrecidos')
      })
    }
  }
}
