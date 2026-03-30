import { ComponentFixture, TestBed } from '@angular/core/testing'

import { LoginEntidadComponent } from './login-entidad.component'

describe('LoginEntidadComponent', () => {
  let component: LoginEntidadComponent
  let fixture: ComponentFixture<LoginEntidadComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginEntidadComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(LoginEntidadComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
