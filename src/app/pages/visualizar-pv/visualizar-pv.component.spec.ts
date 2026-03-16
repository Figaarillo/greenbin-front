import { ComponentFixture, TestBed } from '@angular/core/testing'

import { VisualizarPvComponent } from './visualizar-pv.component'

describe('VisualizarPvComponent', () => {
  let component: VisualizarPvComponent
  let fixture: ComponentFixture<VisualizarPvComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizarPvComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(VisualizarPvComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
