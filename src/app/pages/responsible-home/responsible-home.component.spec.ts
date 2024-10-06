import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ResponsibleHomeComponent } from './responsible-home.component'

describe('ResponsibleHomeComponent', () => {
  let component: ResponsibleHomeComponent
  let fixture: ComponentFixture<ResponsibleHomeComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponsibleHomeComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(ResponsibleHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
