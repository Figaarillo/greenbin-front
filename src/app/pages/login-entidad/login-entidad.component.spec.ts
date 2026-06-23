import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { LoginEntidadComponent } from './login-entidad.component'

describe('LoginEntidadComponent', () => {
  let component: LoginEntidadComponent
  let fixture: ComponentFixture<LoginEntidadComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginEntidadComponent, RouterTestingModule, HttpClientTestingModule, NoopAnimationsModule]
    }).compileComponents()

    fixture = TestBed.createComponent(LoginEntidadComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
