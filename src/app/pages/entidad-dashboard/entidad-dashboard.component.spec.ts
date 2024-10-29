import { ComponentFixture, TestBed } from '@angular/core/testing'

import { EntidadDashboardComponent } from './entidad-dashboard.component'

describe('EntidadDashboardComponent', () => {
  let component: EntidadDashboardComponent
  let fixture: ComponentFixture<EntidadDashboardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntidadDashboardComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(EntidadDashboardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
