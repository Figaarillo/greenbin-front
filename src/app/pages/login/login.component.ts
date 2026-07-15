import { StorageService } from '../../services/storage/storage.service'
import { Component, inject, Inject, ViewChild } from '@angular/core'

import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { Router, RouterModule } from '@angular/router'
import Swal from 'sweetalert2'
import { MatTabsModule } from '@angular/material/tabs'
import { VecinoService } from '../../services/vecino/vecino.service'
import { Login } from '../../services/interfaces/login'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { ResponsableService } from '../../services/responsable/responsable.service'
import { EntidadService } from '../../services/entidad/entidad.service'
import { CommonModule } from '@angular/common'
import { SesionService } from '../../services/sesion/sesion.service'
import { ThemeService } from '../../services/theme/theme.service'
import { AuthService } from '../../services/auth/auth.service'
import { UnifiedLoginResponse } from '../../services/interfaces/login-response'
import { Role } from '../../services/interfaces/role'
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha'
import { RECAPTCHA_SITE_KEY } from '../../config/api.config'
import { RegisterRoleSelectorComponent } from '../../components/register-role-selector/register-role-selector.component'

type Module = 'neighbor' | 'reward-partner' | 'responsible' | 'entity'

interface RoleConfig {
  module: Module
  route: string
  fetchProfile: boolean
  profileStorageKey: 'usuarioInfo' | 'entidadInfo' | null
  setProfileFields: boolean
}

const ROLE_CONFIG: Record<Role, RoleConfig> = {
  neighbor: {
    module: 'neighbor',
    route: '/vecino',
    fetchProfile: true,
    profileStorageKey: 'usuarioInfo',
    setProfileFields: true
  },
  rewardPartner: {
    module: 'reward-partner',
    route: '/local',
    fetchProfile: true,
    profileStorageKey: 'usuarioInfo',
    setProfileFields: true
  },
  responsible: {
    module: 'responsible',
    route: '/responsable',
    fetchProfile: true,
    profileStorageKey: 'usuarioInfo',
    setProfileFields: true
  },
  entity: {
    module: 'entity',
    route: '/entidad',
    fetchProfile: true,
    profileStorageKey: 'entidadInfo',
    setProfileFields: false
  },
  admin: {
    // El JWT lleva role=admin, pero el guard/URL de refresh sigue siendo el
    // segmento 'responsible' (admin es una fila de responsible con role=ADMIN).
    module: 'responsible',
    route: '/superadmin/dashboard',
    fetchProfile: false,
    profileStorageKey: null,
    setProfileFields: false
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    RegisterRoleSelectorComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private storage = inject(StorageService)
  private themeService = inject(ThemeService)
  router = inject(Router)
  hide = true
  recaptchaToken = ''
  recaptchaSiteKey: string

  @ViewChild(RegisterRoleSelectorComponent) registerSelector?: RegisterRoleSelectorComponent

  form: FormGroup

  constructor(
    @Inject(RECAPTCHA_SITE_KEY) recaptchaSiteKey: string,
    private fb: FormBuilder,
    private authService: AuthService,
    private neighborService: VecinoService,
    private businessService: LocalAdheridoService,
    private responsibleService: ResponsableService,
    private entidadService: EntidadService,
    private sesionService: SesionService
  ) {
    this.recaptchaSiteKey = recaptchaSiteKey
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
  }

  onCaptchaResolved(token: string | null): void {
    this.recaptchaToken = token ?? ''
  }

  onSubmit() {
    if (!this.recaptchaToken) {
      Swal.fire({ icon: 'warning', title: 'reCAPTCHA', text: 'Por favor, completá el reCAPTCHA' })
      return
    }
    if (this.form.invalid) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Campos inválidos' })
      return
    }

    this.authService.login(this.setLoginObject()).subscribe({
      next: response => this.handleLoginSuccess(response.data),
      error: () => Swal.fire({ icon: 'error', title: 'Error de acceso', text: 'Credenciales inválidas' })
    })
  }

  setLoginObject(): Login {
    const emailControl = new FormControl(this.form.get('username')?.value, [Validators.email])
    if (emailControl.valid) {
      return {
        username: undefined,
        email: this.form.get('username')?.value,
        password: this.form.get('password')?.value,
        recaptchaToken: this.recaptchaToken
      }
    }
    return {
      email: undefined,
      username: this.form.get('username')?.value,
      password: this.form.get('password')?.value,
      recaptchaToken: this.recaptchaToken
    }
  }

  private handleLoginSuccess(data: UnifiedLoginResponse) {
    // Pizarra limpia: cualquier sesión previa en este dispositivo se descarta
    // ANTES de armar la nueva. Nunca confiar en pisar claves una por una.
    this.storage.clear()
    // clear() borra tambien la clave del tema; re-sincronizamos el DOM (que
    // no se toca solo) para que no quede "pegado" al valor anterior.
    this.themeService.apply()

    const config = ROLE_CONFIG[data.role]
    this.sesionService.setLoginData(data, config.module)

    if (!config.fetchProfile) {
      // admin: GET /api/responsible/:id está protegido con
      // protect(Roles.ENTITY, Roles.RESPONSIBLE) — SIN Roles.ADMIN — así que
      // fetchear perfil acá rompería con 403. Se navega directo.
      this.router.navigateByUrl(config.route)
      return
    }

    const profileService = this.profileServiceFor(config.module)

    // Fetcheamos el perfil completo antes de navegar para que el sidenav
    // tenga todos los datos disponibles desde el primer render.
    profileService.get(data.id).subscribe({
      next: (resp: any) => {
        const profile = resp.data
        if (config.profileStorageKey) {
          this.storage.setItem(config.profileStorageKey, JSON.stringify(profile))
        }
        if (config.setProfileFields) {
          this.sesionService.setUsername(profile.username ?? '')
          // name cubre el caso de local adherido que usa razón social en lugar de firstname
          this.sesionService.setFirstname(profile.firstname ?? profile.name ?? '')
          this.sesionService.setLastname(profile.lastname ?? '')
          this.sesionService.setDni(profile.dni ?? '')
          this.sesionService.setPoints(profile.points ?? '')
        }
        this.router.navigateByUrl(config.route)
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo obtener la información del usuario' })
      }
    })
  }

  private profileServiceFor(module: Module) {
    const serviceMap: Record<Module, { get(id: string): any }> = {
      neighbor: this.neighborService,
      'reward-partner': this.businessService,
      responsible: this.responsibleService,
      entity: this.entidadService
    }
    return serviceMap[module]
  }
}
