import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { EntidadDashboardComponent } from './entidad-dashboard.component'

describe('EntidadDashboardComponent', () => {
  let component: EntidadDashboardComponent
  let fixture: ComponentFixture<EntidadDashboardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntidadDashboardComponent, RouterTestingModule, HttpClientTestingModule]
    }).compileComponents()

    fixture = TestBed.createComponent(EntidadDashboardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
