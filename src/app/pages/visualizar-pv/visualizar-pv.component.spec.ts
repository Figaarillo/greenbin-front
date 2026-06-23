import { ComponentFixture, TestBed } from '@angular/core/testing'

import { VisualizarPvComponent } from './visualizar-pv.component'
import { RouterTestingModule } from '@angular/router/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

describe('VisualizarPvComponent', () => {
  let component: VisualizarPvComponent
  let fixture: ComponentFixture<VisualizarPvComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizarPvComponent, RouterTestingModule, HttpClientTestingModule]
    }).compileComponents()

    // Stub google maps global used by @angular/google-maps
    ;(window as any).google = { maps: { Map: class {}, LatLng: class {}, LatLngBounds: class {} } }

    fixture = TestBed.createComponent(VisualizarPvComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
