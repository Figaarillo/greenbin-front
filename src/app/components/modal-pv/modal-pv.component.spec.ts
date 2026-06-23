import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { ModalPvComponent } from './modal-pv.component'

describe('ModalPvComponent', () => {
  let component: ModalPvComponent
  let fixture: ComponentFixture<ModalPvComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPvComponent, RouterTestingModule]
    }).compileComponents()

    fixture = TestBed.createComponent(ModalPvComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
