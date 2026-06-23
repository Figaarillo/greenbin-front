import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { RegistrarCuponComponent } from './registrar-cupon.component'

describe('RegistrarCuponComponent', () => {
  let component: RegistrarCuponComponent
  let fixture: ComponentFixture<RegistrarCuponComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarCuponComponent, RouterTestingModule, HttpClientTestingModule, NoopAnimationsModule]
    }).compileComponents()

    fixture = TestBed.createComponent(RegistrarCuponComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
