import { ComponentFixture, TestBed } from '@angular/core/testing'

import { RegistrarLocalComponent } from './registrar-local.component'

describe('RegistrarLocalComponent', () => {
  let component: RegistrarLocalComponent
  let fixture: ComponentFixture<RegistrarLocalComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarLocalComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(RegistrarLocalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
