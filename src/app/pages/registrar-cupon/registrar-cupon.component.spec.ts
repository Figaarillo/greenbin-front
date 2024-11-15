import { ComponentFixture, TestBed } from '@angular/core/testing'

import { RegistrarCuponComponent } from './registrar-cupon.component'

describe('RegistrarCuponComponent', () => {
  let component: RegistrarCuponComponent
  let fixture: ComponentFixture<RegistrarCuponComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarCuponComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(RegistrarCuponComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
