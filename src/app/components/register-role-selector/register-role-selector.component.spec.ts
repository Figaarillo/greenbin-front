import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { provideRouter } from '@angular/router'
import { RegisterRoleSelectorComponent } from './register-role-selector.component'

describe('RegisterRoleSelectorComponent', () => {
  let fixture: ComponentFixture<RegisterRoleSelectorComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegisterRoleSelectorComponent],
      providers: [provideRouter([])]
    })

    fixture = TestBed.createComponent(RegisterRoleSelectorComponent)
    fixture.detectChanges()
  })

  it('renders exactly 2 role options', () => {
    const roles = fixture.debugElement.queryAll(By.css('.role'))
    expect(roles.length).toBe(2)
  })

  it('does not mention responsable, admin, entidad or entity anywhere in the rendered DOM', () => {
    const text = (fixture.nativeElement.textContent as string).toLowerCase()
    expect(text).not.toContain('responsable')
    expect(text).not.toContain('admin')
    expect(text).not.toContain('entidad')
    expect(text).not.toContain('entity')
  })

  it('routes the vecino option to /registrar-vecino', () => {
    const vecino = fixture.debugElement.query(By.css('.role.r-vec'))
    expect(vecino.nativeElement.getAttribute('href')).toBe('/registrar-vecino')
  })

  it('routes the local option to /registrar-local', () => {
    const local = fixture.debugElement.query(By.css('.role.r-loc'))
    expect(local.nativeElement.getAttribute('href')).toBe('/registrar-local')
  })
})
