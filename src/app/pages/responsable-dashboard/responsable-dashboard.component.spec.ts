import { TestBed } from '@angular/core/testing'
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing'
import { provideHttpClient } from '@angular/common/http'
import { ResponsableDashboardComponent } from './responsable-dashboard.component'
import { API_BASE_URL } from '../../config/api.config'
import { StorageService } from '../../services/storage/storage.service'
import { SwPush } from '@angular/service-worker'
import { EMPTY } from 'rxjs'

const API = 'http://test'
const ENTIDAD_ID = 'ent-1'

class StorageStub {
  private data: Record<string, string> = {
    // El responsable guarda su perfil bajo 'usuarioInfo' y la entidad viene
    // como string crudo en 'entity'.
    usuarioInfo: JSON.stringify({ id: 'resp-1', entity: ENTIDAD_ID })
  }
  getItem(key: string): string | null {
    return this.data[key] ?? null
  }
  setItem(key: string, value: string): void {
    this.data[key] = value
  }
  removeItem(): void {}
  clear(): void {}
}

describe('ResponsableDashboardComponent', () => {
  let component: ResponsableDashboardComponent
  let httpMock: HttpTestingController

  const statsUrl = (path: string): string => `${API}/api/statistics/entity/${ENTIDAD_ID}/${path}`
  const matchStats = (path: string): TestRequest[] => httpMock.match(req => req.url === statsUrl(path))

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: API },
        { provide: StorageService, useClass: StorageStub },
        // La campana de notificaciones del template cuelga de SwPush, que sólo
        // existe con el service worker registrado. En tests no aporta nada.
        { provide: SwPush, useValue: { isEnabled: false, messages: EMPTY, notificationClicks: EMPTY } }
      ]
    })

    httpMock = TestBed.inject(HttpTestingController)
    component = TestBed.runInInjectionContext(() => new ResponsableDashboardComponent())
  })

  afterEach(() => {
    httpMock.verify()
  })

  /** Responde todo lo pendiente; itera porque los totales disparan la tendencia. */
  const drenarPendientes = (): void => {
    for (let pasada = 0; pasada < 5; pasada++) {
      const pendientes = httpMock.match(() => true)
      if (pendientes.length === 0) return
      pendientes.forEach(req => {
        if (req.cancelled) return
        const esObjeto = req.request.url.endsWith('total-recycled')
        req.flush({ data: esObjeto ? { totalWeight: 0, totalPoints: 0, totalTransactions: 0 } : [] })
      })
    }
  }

  it('resuelve la entidad desde usuarioInfo.entity', () => {
    component.ngOnInit()
    expect(component.entidadId).toBe(ENTIDAD_ID)
    drenarPendientes()
  })

  describe('filtro de período', () => {
    it('manda la fecha del calendario local, no la de UTC', () => {
      // 23:30 del 31/01 local: `toISOString()` en UTC-3 daría '2026-02-01'.
      const hoy = new Date()
      component.ngOnInit()

      const esperado = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(
        hoy.getDate()
      ).padStart(2, '0')}`

      for (const path of ['total-recycled', 'green-points-ranking', 'waste-by-category', 'waste-by-period']) {
        const req = matchStats(path)
        expect(req.length).withContext(path).toBe(1)
        expect(req[0].request.params.get('to')).withContext(path).toBe(esperado)
      }
      drenarPendientes()
    })

    it('acota el ranking con un limit', () => {
      component.ngOnInit()
      expect(matchStats('green-points-ranking')[0].request.params.get('limit')).toBe('10')
      drenarPendientes()
    })

    it('cambiar de rango cancela el request anterior', () => {
      component.ngOnInit()
      const primero = matchStats('total-recycled')
      expect(primero.length).toBe(1)

      component.setRange('7d')
      expect(primero[0].cancelled).toBe(true)

      const segundo = matchStats('total-recycled')
      segundo[0].flush({ data: { totalWeight: 42, totalPoints: 10, totalTransactions: 2 } })
      expect(component.totalWeight).toBe(42)
      drenarPendientes()
    })
  })

  describe('manejo de errores', () => {
    it('un 500 en los totales corta el loading y avisa', () => {
      component.ngOnInit()
      matchStats('total-recycled')[0].flush('boom', { status: 500, statusText: 'Server Error' })

      expect(component.loading).toBe(false)
      expect(component.errorTotals).toBe(true)
      drenarPendientes()
    })

    it('un 500 en categorías no tumba los KPIs', () => {
      component.ngOnInit()
      matchStats('waste-by-category')[0].flush('boom', { status: 500, statusText: 'Server Error' })
      expect(component.errorCategory).toBe(true)

      matchStats('total-recycled')[0].flush({ data: { totalWeight: 9, totalPoints: 3, totalTransactions: 1 } })
      expect(component.totalWeight).toBe(9)
      drenarPendientes()
    })

    it('marca error del ranking y de la serie por separado', () => {
      component.ngOnInit()
      matchStats('green-points-ranking')[0].flush('boom', { status: 500, statusText: 'Server Error' })
      matchStats('waste-by-period')[0].flush('boom', { status: 500, statusText: 'Server Error' })

      expect(component.errorRanking).toBe(true)
      expect(component.errorPeriod).toBe(true)
      expect(component.errorCategory).toBe(false)
      drenarPendientes()
    })
  })

  describe('top categorías', () => {
    it('calcula el porcentaje sobre el total, no sobre el máximo', () => {
      component.ngOnInit()
      matchStats('waste-by-category')[0].flush({
        data: [
          { categoryName: 'Vidrio', totalWeight: 60 },
          { categoryName: 'Plástico', totalWeight: 40 }
        ]
      })

      expect(component.topCategories.map(c => c.pct)).toEqual([60, 40])
      drenarPendientes()
    })
  })

  describe('template', () => {
    it('renderiza el estado vacío de cada tarjeta', () => {
      const fixture = TestBed.createComponent(ResponsableDashboardComponent)
      fixture.detectChanges()

      matchStats('total-recycled')[0].flush({ data: { totalWeight: 0, totalPoints: 0, totalTransactions: 0 } })
      matchStats('waste-by-category')[0].flush('boom', { status: 500, statusText: 'Server Error' })
      drenarPendientes()
      fixture.detectChanges()

      const text = (fixture.nativeElement as HTMLElement).textContent ?? ''
      expect(text).toContain('No pudimos cargar las categorías')
      expect(text).toContain('Ningún punto verde registró entregas en este período')

      fixture.destroy()
    })
  })
})
