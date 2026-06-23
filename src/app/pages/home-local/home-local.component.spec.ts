import { ComponentFixture, TestBed } from '@angular/core/testing'

import { HomeLocalComponent } from './home-local.component'
import { RouterTestingModule } from '@angular/router/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

describe('HomeLocalComponent', () => {
  let component: HomeLocalComponent
  let fixture: ComponentFixture<HomeLocalComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeLocalComponent, RouterTestingModule, HttpClientTestingModule, NoopAnimationsModule]
    }).compileComponents()

    fixture = TestBed.createComponent(HomeLocalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
