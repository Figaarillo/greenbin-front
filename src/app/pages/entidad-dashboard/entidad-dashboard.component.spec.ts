import { TestBed } from '@angular/core/testing'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { provideHttpClient } from '@angular/common/http'
import { TestRequest } from '@angular/common/http/testing'
import { EntidadDashboardComponent } from './entidad-dashboard.component'
import { API_BASE_URL } from '../../config/api.config'
import { StorageService } from '../../services/storage/storage.service'

const API = 'http://test'
const ENTIDAD_ID = 'ent-1'

class StorageStub {
  getItem(key: string): string | null {
    if (key === 'entidadInfo') {
      return JSON.stringify({ id: ENTIDAD_ID, name: 'Municipio Test', email: 'muni@test.com' })
    }
    return null
  }
}

describe('EntidadDashboardComponent', () => {
  let component: EntidadDashboardComponent
  let httpMock: HttpTestingController

  const statsUrl = (path: string): string => `${API}/api/statistics/entity/${ENTIDAD_ID}/${path}`

  /** Todos los requests pendientes de un endpoint, sin exigir el query string. */
  const matchStats = (path: string): TestRequest[] => httpMock.match(req => req.url === statsUrl(path))

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: API },
        { provide: StorageService, useClass: StorageStub }
      ]
    })

    httpMock = TestBed.inject(HttpTestingController)
    component = TestBed.runInInjectionContext(() => new EntidadDashboardComponent())
  })

  afterEach(() => {
    httpMock.verify()
  })

  /**
   * Responde todo lo que quedó colgado para que `httpMock.verify()` no se queje.
   * Itera porque flushear `total-recycled` dispara el request de tendencia:
   * una sola pasada dejaría ese segundo pedido abierto.
   */
  const drenarPendientes = (): void => {
    for (let pasada = 0; pasada < 5; pasada++) {
      const pendientes = httpMock.match(() => true)
      if (pendientes.length === 0) return
      pendientes.forEach(req => {
        if (req.cancelled) return
        // Los endpoints de listas devuelven array; los agregados, objeto.
        const esObjeto = req.request.url.endsWith('total-recycled') || req.request.url.endsWith('counts')
        req.flush({ data: esObjeto ? { totalWeight: 0, totalPoints: 0, totalTransactions: 0 } : [] })
      })
    }
  }

  describe('toLocalIso', () => {
    it('usa la fecha del calendario local, no la de UTC', () => {
      // 23:30 del 31/01 en horario local. `toISOString()` en UTC-3 devolvería
      // '2026-02-01' y correría el rango un día entero.
      const nocheDeFinDeMes = new Date(2026, 0, 31, 23, 30, 0)
      expect(component.toLocalIso(nocheDeFinDeMes)).toBe('2026-01-31')
    })

    it('rellena mes y día con cero a la izquierda', () => {
      expect(component.toLocalIso(new Date(2026, 2, 5, 10, 0, 0))).toBe('2026-03-05')
    })
  })

  describe('fillPeriodGaps', () => {
    it('inserta ceros en los días sin entregas', () => {
      const filled = component.fillPeriodGaps(
        [
          { period: '2026-03-01', totalWeight: 5 },
          { period: '2026-03-04', totalWeight: 8 }
        ],
        'day',
        '2026-03-01',
        '2026-03-04'
      )

      expect(filled.map(p => p.totalWeight)).toEqual([5, 0, 0, 8])
    })

    it('deja la serie intacta cuando no hay huecos', () => {
      const filled = component.fillPeriodGaps(
        [
          { period: '2026-03-01', totalWeight: 5 },
          { period: '2026-03-02', totalWeight: 8 }
        ],
        'day',
        '2026-03-01',
        '2026-03-02'
      )

      expect(filled.map(p => p.totalWeight)).toEqual([5, 8])
    })

    it('devuelve la serie sin tocar si falta el rango', () => {
      const rows = [{ period: '2026-03-01', totalWeight: 5 }]
      expect(component.fillPeriodGaps(rows, 'day', undefined, undefined)).toEqual(rows)
    })
  })

  describe('carga inicial', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('pide los contadores al endpoint de counts en vez de bajar las listas completas', () => {
      const req = matchStats('counts')
      expect(req.length).toBe(1)

      req[0].flush({ data: { greenPoints: 3, responsibles: 4, neighbors: 120, rewardPartners: 7 } })

      expect(component.countPuntosVerdes).toBe(3)
      expect(component.countResponsables).toBe(4)
      expect(component.countVecinos).toBe(120)
      expect(component.countLocales).toBe(7)
      drenarPendientes()
    })

    it('acota el ranking de puntos verdes con un limit', () => {
      const req = matchStats('green-points-ranking')
      expect(req.length).toBe(1)
      expect(req[0].request.params.get('limit')).toBe('10')
      drenarPendientes()
    })

    it('manda from/to como fecha local en todos los endpoints del período', () => {
      const hoy = component.toLocalIso(new Date())
      for (const path of ['total-recycled', 'green-points-ranking', 'waste-by-category', 'waste-by-period']) {
        const req = matchStats(path)
        expect(req.length).withContext(path).toBe(1)
        expect(req[0].request.params.get('to')).withContext(path).toBe(hoy)
      }
      drenarPendientes()
    })
  })

  describe('topCategories', () => {
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

    it('no divide por cero cuando todo el período está en cero', () => {
      component.ngOnInit()

      matchStats('waste-by-category')[0].flush({
        data: [{ categoryName: 'Vidrio', totalWeight: 0 }]
      })

      expect(component.topCategories[0].pct).toBe(0)
      drenarPendientes()
    })
  })

  describe('cambio de rango', () => {
    it('cancela el request anterior en vez de aplicar datos viejos', () => {
      component.ngOnInit()
      const primero = matchStats('total-recycled')
      expect(primero.length).toBe(1)

      component.setRange('7d')

      // El switchMap tiene que haber abortado el request de la carga inicial.
      expect(primero[0].cancelled).toBe(true)

      const segundo = matchStats('total-recycled')
      expect(segundo.length).toBe(1)
      segundo[0].flush({ data: { totalWeight: 42, totalPoints: 10, totalTransactions: 2 } })

      expect(component.totalWeight).toBe(42)
      drenarPendientes()
    })
  })

  describe('gestión de puntos', () => {
    it('expone otorgados, canjeados y en circulación', () => {
      component.ngOnInit()

      const req = matchStats('points-balance')
      expect(req.length).toBe(1)
      req[0].flush({ data: { granted: 12000, spent: 4500, outstanding: 7500, neighborsWithBalance: 63 } })

      expect(component.pointsGranted).toBe(12000)
      expect(component.pointsSpent).toBe(4500)
      expect(component.pointsOutstanding).toBe(7500)
      expect(component.neighborsWithBalance).toBe(63)
      drenarPendientes()
    })

    it('calcula qué porcentaje de lo otorgado ya se canjeó', () => {
      component.ngOnInit()
      matchStats('points-balance')[0].flush({
        data: { granted: 1000, spent: 250, outstanding: 750, neighborsWithBalance: 5 }
      })

      expect(component.pointsSpentPct).toBe(25)
      expect(component.pointsOutstandingPct).toBe(75)
      drenarPendientes()
    })

    it('no divide por cero cuando todavía no se otorgó nada', () => {
      component.ngOnInit()
      matchStats('points-balance')[0].flush({
        data: { granted: 0, spent: 0, outstanding: 0, neighborsWithBalance: 0 }
      })

      expect(component.pointsSpentPct).toBe(0)
      expect(component.hasPoints).toBe(false)
      drenarPendientes()
    })

    it('no se recarga al cambiar el rango: es un saldo acumulado, no del período', () => {
      component.ngOnInit()
      matchStats('points-balance')[0].flush({
        data: { granted: 100, spent: 10, outstanding: 90, neighborsWithBalance: 2 }
      })

      component.setRange('7d')
      expect(matchStats('points-balance').length).toBe(0)
      drenarPendientes()
    })

    it('marca error sin tumbar el resto del dashboard', () => {
      component.ngOnInit()
      matchStats('points-balance')[0].flush('boom', { status: 500, statusText: 'Server Error' })

      expect(component.errorPoints).toBe(true)
      matchStats('total-recycled')[0].flush({ data: { totalWeight: 9, totalPoints: 3, totalTransactions: 1 } })
      expect(component.totalWeight).toBe(9)
      drenarPendientes()
    })
  })

  describe('CO2 evitado', () => {
    it('expone el total y el desglose por categoría', () => {
      component.ngOnInit()

      const req = matchStats('co2-avoided')
      expect(req.length).toBe(1)

      req[0].flush({
        data: {
          totalCo2: 12.5,
          byCategory: [
            { categoryName: 'Vidrio', totalWeight: 10, co2: 8 },
            { categoryName: 'Plástico', totalWeight: 5, co2: 4.5 }
          ]
        }
      })

      expect(component.totalCo2).toBe(12.5)
      expect(component.co2Data.labels).toEqual(['Vidrio', 'Plástico'])
      expect(component.co2Data.datasets[0].data).toEqual([8, 4.5])
      expect(component.hasCo2).toBe(true)
      drenarPendientes()
    })

    it('traduce el CO2 a un equivalente entendible en árboles', () => {
      component.ngOnInit()
      matchStats('co2-avoided')[0].flush({ data: { totalCo2: 42, byCategory: [] } })

      // 42 kg / 21 kg por árbol-año = 2 árboles
      expect(component.co2Trees).toBe(2)
      drenarPendientes()
    })

    it('arranca con el detalle de equivalencias cerrado', () => {
      expect(component.co2DetailOpen).toBe(false)
    })

    it('abre y cierra el detalle al togglear', () => {
      component.toggleCo2Detail()
      expect(component.co2DetailOpen).toBe(true)
      component.toggleCo2Detail()
      expect(component.co2DetailOpen).toBe(false)
    })

    it('calcula cada equivalencia dividiendo por su factor', () => {
      component.ngOnInit()
      matchStats('co2-avoided')[0].flush({ data: { totalCo2: 42, byCategory: [] } })

      const equivalencias = component.co2Equivalences
      expect(equivalencias.length).toBeGreaterThan(1)

      const arboles = equivalencias.find(e => e.unit === 'árboles')
      expect(arboles!.value).toBeCloseTo(2, 5)

      // Toda fila declara el factor usado: la tabla tiene que ser auditable.
      for (const e of equivalencias) {
        expect(e.value).toBeCloseTo(42 / e.kgPerUnit, 5)
        expect(e.note.length).toBeGreaterThan(0)
      }
      drenarPendientes()
    })

    it('marca error sin tumbar el resto del dashboard', () => {
      component.ngOnInit()
      matchStats('co2-avoided')[0].flush('boom', { status: 500, statusText: 'Server Error' })

      expect(component.errorCo2).toBe(true)
      matchStats('total-recycled')[0].flush({ data: { totalWeight: 9, totalPoints: 3, totalTransactions: 1 } })
      expect(component.totalWeight).toBe(9)
      drenarPendientes()
    })
  })

  describe('ranking de locales', () => {
    it('arma el gráfico apilado con usados, adquiridos y vencidos', () => {
      component.ngOnInit()

      const req = matchStats('reward-partners-ranking')
      expect(req.length).toBe(1)
      expect(req[0].request.params.get('limit')).toBe('10')

      req[0].flush({
        data: [
          { rewardPartnerId: 'a', name: 'Local A', used: 5, acquired: 2, expired: 1, pointsSpent: 250 },
          { rewardPartnerId: 'b', name: 'Local B', used: 3, acquired: 0, expired: 4, pointsSpent: 90 }
        ]
      })

      expect(component.partnersData.labels).toEqual(['Local A', 'Local B'])
      expect(component.partnersData.datasets.length).toBe(3)
      expect(component.partnersData.datasets[0].data).toEqual([5, 3])
      expect(component.hasPartners).toBe(true)
      drenarPendientes()
    })

    it('marca el estado vacío cuando la entidad no tiene locales', () => {
      component.ngOnInit()
      matchStats('reward-partners-ranking')[0].flush({ data: [] })

      expect(component.hasPartners).toBe(false)
      drenarPendientes()
    })

    it('marca error sin tumbar el resto del dashboard', () => {
      component.ngOnInit()
      matchStats('reward-partners-ranking')[0].flush('boom', { status: 500, statusText: 'Server Error' })

      expect(component.errorPartners).toBe(true)
      matchStats('total-recycled')[0].flush({ data: { totalWeight: 9, totalPoints: 3, totalTransactions: 1 } })
      expect(component.totalWeight).toBe(9)
      drenarPendientes()
    })
  })

  describe('template', () => {
    // Los demás tests instancian la clase suelta, así que nunca compilan el
    // HTML. Este renderiza de verdad para que un error de sintaxis en el
    // template no llegue al build.
    it('renderiza el estado vacío y el mensaje de error de cada tarjeta', () => {
      const fixture = TestBed.createComponent(EntidadDashboardComponent)
      fixture.detectChanges()

      matchStats('total-recycled')[0].flush({ data: { totalWeight: 0, totalPoints: 0, totalTransactions: 0 } })
      matchStats('waste-by-category')[0].flush('boom', { status: 500, statusText: 'Server Error' })
      drenarPendientes()
      fixture.detectChanges()

      const html = (fixture.nativeElement as HTMLElement).textContent ?? ''
      expect(html).toContain('No pudimos cargar las categorías')
      expect(html).toContain('Ningún punto verde registró entregas en este período')
      expect(html).toContain('no filtrado por período')

      fixture.destroy()
    })
  })

  describe('manejo de errores', () => {
    it('marca error y corta el loading cuando falla total-recycled', () => {
      component.ngOnInit()
      matchStats('total-recycled')[0].flush('boom', { status: 500, statusText: 'Server Error' })

      expect(component.loading).toBe(false)
      expect(component.errorTotals).toBe(true)
      drenarPendientes()
    })

    it('marca error del donut sin tumbar el resto del dashboard', () => {
      component.ngOnInit()
      matchStats('waste-by-category')[0].flush('boom', { status: 500, statusText: 'Server Error' })

      expect(component.errorCategory).toBe(true)

      matchStats('total-recycled')[0].flush({ data: { totalWeight: 9, totalPoints: 3, totalTransactions: 1 } })
      expect(component.totalWeight).toBe(9)
      drenarPendientes()
    })

    it('sigue funcionando si falla el endpoint de counts', () => {
      component.ngOnInit()
      matchStats('counts')[0].flush('boom', { status: 500, statusText: 'Server Error' })

      expect(component.countPuntosVerdes).toBeNull()
      drenarPendientes()
    })
  })
})
