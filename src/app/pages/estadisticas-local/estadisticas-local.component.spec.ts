import { TestBed } from '@angular/core/testing'
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing'
import { provideHttpClient } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
import { provideRouter } from '@angular/router'
import { EstadisticasLocalComponent } from './estadisticas-local.component'
import { API_BASE_URL } from '../../config/api.config'
import { StorageService } from '../../services/storage/storage.service'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { SwPush } from '@angular/service-worker'
import { EMPTY } from 'rxjs'

const API = 'http://test'
const LOCAL_ID = 'local-1'

/** Id que devuelve la ruta. `null` = el local mirando su propio retorno. */
let routeId: string | null = LOCAL_ID

class StorageStub {
  // Cuando la ruta no trae :id, el componente resuelve el local desde el perfil
  // guardado en 'usuarioInfo' — asi es como entra el propio local.
  getItem(key: string): string | null {
    return key === 'usuarioInfo' ? JSON.stringify({ id: LOCAL_ID }) : null
  }
  setItem(): void {}
  removeItem(): void {}
  clear(): void {}
}

/** Payload representativo del endpoint de stats del local. */
const STATS = {
  totalAdquirido: 19,
  totalUsado: 41,
  totalExpirado: 8,
  totalPuntos: 3400,
  uniqueNeighbors: 34,
  newNeighbors: 12,
  avgVisitsPerNeighbor: 1.2,
  discountRanges: { lt25: 30, from25to50: 8, from50to75: 2, gt75: 1 },
  byCoupon: [
    {
      couponId: 'c1',
      title: '10% en compras superiores a $8.000',
      total: 38,
      redemptions: 25,
      uniqueNeighbors: 20,
      newNeighbors: 9,
      pointsSpent: 1900
    },
    {
      couponId: 'c2',
      title: '15% en bebidas',
      total: 12,
      redemptions: 5,
      uniqueNeighbors: 5,
      newNeighbors: 1,
      pointsSpent: 600
    }
  ]
}

describe('EstadisticasLocalComponent', () => {
  let component: EstadisticasLocalComponent
  let httpMock: HttpTestingController

  const statsUrl = `${API}/api/coupon-transaction/reward-partner/${LOCAL_ID}/stats`
  const matchStats = (): TestRequest[] => httpMock.match(req => req.url === statsUrl)

  beforeEach(() => {
    routeId = LOCAL_ID
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: API },
        { provide: StorageService, useClass: StorageStub },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => routeId } } } },
        // Como local, el template monta la campana de notificaciones, que cuelga
        // de SwPush; sólo existe con el service worker registrado.
        { provide: SwPush, useValue: { isEnabled: false, messages: EMPTY, notificationClicks: EMPTY } }
      ]
    })

    httpMock = TestBed.inject(HttpTestingController)
    const localService = TestBed.inject(LocalAdheridoService)
    component = TestBed.runInInjectionContext(() => new EstadisticasLocalComponent(localService))
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('el local ve la pantalla con su propio acento, no el de entidad', () => {
    // Sin :id en la ruta => es el local mirando su propio retorno.
    routeId = null
    const fixture = TestBed.createComponent(EstadisticasLocalComponent)
    fixture.detectChanges()
    matchStats()[0].flush({ data: STATS })
    fixture.detectChanges()

    const root = (fixture.nativeElement as HTMLElement).querySelector('.roi')!
    expect(root.getAttribute('data-role')).toBe('local')
    expect(fixture.componentInstance.viewingAsEntity).toBe(false)
    expect(fixture.componentInstance.navTitle).toBe('Mi retorno')

    // La campana de notificaciones pide su contador al montarse.
    httpMock.match(() => true).forEach(r => !r.cancelled && r.flush({ data: 0 }))
    fixture.destroy()
  })

  it('entrando por la ruta de entidad se muestra como Panel de ROI', () => {
    component.ngOnInit()
    expect(component.viewingAsEntity).toBe(true)
    expect(component.navTitle).toBe('Panel de ROI')
    expect(component.navBackRoute).toBe('/entidad/consultar-locales')
    matchStats()[0].flush({ data: STATS })
  })

  describe('embudo', () => {
    beforeEach(() => {
      component.ngOnInit()
      matchStats()[0].flush({ data: STATS })
    })

    it('el total canjeado suma los tres estados', () => {
      // 19 sin usar + 41 usados + 8 vencidos
      expect(component.totalCanjeado).toBe(68)
    })

    it('calcula la conversión sobre el total canjeado', () => {
      // 41 / 68 = 60,29% → 60
      expect(component.conversion).toBe(60)
    })

    it('arma las cuatro etapas con su porcentaje', () => {
      expect(component.funnel.map(f => f.key)).toEqual(['canjeados', 'usados', 'sinusar', 'vencidos'])
      expect(component.funnel[0].pct).toBe(100)
      expect(component.funnel[1].pct).toBeCloseTo(60.29, 1)
      expect(component.funnel[2].pct).toBeCloseTo(27.94, 1)
      expect(component.funnel[3].pct).toBeCloseTo(11.76, 1)
    })

    it('el toggle alterna gráfico y tabla', () => {
      expect(component.showFunnelTable).toBe(false)
      component.toggleFunnelTable()
      expect(component.showFunnelTable).toBe(true)
    })
  })

  describe('vecinos', () => {
    beforeEach(() => {
      component.ngOnInit()
      matchStats()[0].flush({ data: STATS })
    })

    it('deriva los recurrentes de los únicos menos los nuevos', () => {
      expect(component.recurringNeighbors).toBe(22)
    })

    it('calcula el porcentaje de vecinos nuevos', () => {
      // 12 / 34 = 35,3% → 35
      expect(component.newNeighborsPct).toBe(35)
    })
  })

  describe('rendimiento por cupón', () => {
    beforeEach(() => {
      component.ngOnInit()
      matchStats()[0].flush({ data: STATS })
    })

    it('calcula la conversión de cada cupón sobre sus canjes totales', () => {
      expect(component.byCoupon[0].conversion).toBe(66) // 25 / 38
      expect(component.byCoupon[1].conversion).toBe(42) // 5 / 12
    })

    it('clasifica la conversión en un semáforo', () => {
      expect(component.conversionClass(66)).toBe('good')
      expect(component.conversionClass(50)).toBe('mid')
      expect(component.conversionClass(42)).toBe('low')
    })
  })

  describe('descuentos', () => {
    it('usa la rampa secuencial en orden y escala contra el máximo', () => {
      component.ngOnInit()
      matchStats()[0].flush({ data: STATS })

      expect(component.hasDiscounts).toBe(true)
      expect(component.discountRows.map(r => r.value)).toEqual([30, 8, 2, 1])
      expect(component.discountRows[0].pct).toBe(100)
      // Un solo tono, de más claro a más oscuro. Es azul y no verde para no
      // confundirse con el estado "usados" del embudo.
      expect(component.discountRows.map(r => r.color)).toEqual(['#e4e8f4', '#b0bfe0', '#6c81b0', '#3b4d76'])
    })

    it('marca que no hay descuentos cuando todos los rangos están en cero', () => {
      component.ngOnInit()
      matchStats()[0].flush({
        data: { ...STATS, discountRanges: { lt25: 0, from25to50: 0, from50to75: 0, gt75: 0 } }
      })
      expect(component.hasDiscounts).toBe(false)
    })
  })

  describe('estados', () => {
    it('sin canjes no hay datos que mostrar', () => {
      component.ngOnInit()
      matchStats()[0].flush({
        data: { ...STATS, totalAdquirido: 0, totalUsado: 0, totalExpirado: 0 }
      })
      expect(component.hasData).toBe(false)
    })

    it('un fallo del endpoint corta el loading y marca error', () => {
      component.ngOnInit()
      matchStats()[0].flush('boom', { status: 500, statusText: 'Server Error' })
      expect(component.loading).toBe(false)
      expect(component.error).toBe(true)
    })
  })

  describe('template', () => {
    // Los demás tests instancian la clase suelta y nunca compilan el HTML. Este
    // renderiza de verdad para que un error de sintaxis no llegue al build.
    it('renderiza el embudo, la tabla por cupón y la escala de descuentos', () => {
      const fixture = TestBed.createComponent(EstadisticasLocalComponent)
      fixture.detectChanges()
      matchStats()[0].flush({ data: STATS })
      fixture.detectChanges()

      const text = (fixture.nativeElement as HTMLElement).textContent ?? ''
      expect(text).toContain('Embudo de cupones')
      expect(text).toContain('60% llegó a usarse en el local')
      expect(text).toContain('Rendimiento por cupón')
      expect(text).toContain('10% en compras superiores a $8.000')
      expect(text).toContain('Menor descuento')
      expect(text).toContain('35%')

      fixture.destroy()
    })

    it('la entidad ve la pantalla con el acento de entidad', () => {
      const fixture = TestBed.createComponent(EstadisticasLocalComponent)
      fixture.detectChanges()
      matchStats()[0].flush({ data: STATS })
      fixture.detectChanges()

      const root = (fixture.nativeElement as HTMLElement).querySelector('.roi')!
      expect(root.getAttribute('data-role')).toBe('entidad')

      fixture.destroy()
    })

    it('explica la sigla ROI y no repite el título del navbar', () => {
      const fixture = TestBed.createComponent(EstadisticasLocalComponent)
      fixture.detectChanges()
      matchStats()[0].flush({ data: STATS })
      fixture.detectChanges()

      const el = fixture.nativeElement as HTMLElement
      expect(el.textContent).toContain('retorno de la inversión')

      // El navbar ya pone "Panel de ROI"; el cuerpo de la pantalla no lo repite.
      const body = el.querySelector('.roi')!
      const headings = Array.from(body.querySelectorAll('h1')).map(h => h.textContent?.trim())
      expect(headings).not.toContain('Panel de ROI')
      expect(headings.length).toBe(0)

      fixture.destroy()
    })

    it('los títulos de tarjeta usan tamaño propio y no el de Bootstrap', () => {
      const fixture = TestBed.createComponent(EstadisticasLocalComponent)
      fixture.detectChanges()
      matchStats()[0].flush({ data: STATS })
      fixture.detectChanges()

      const el = fixture.nativeElement as HTMLElement

      // Karma carga styles.scss (que importa Bootstrap entero), así que esto
      // corre contra la cascada real. Bootstrap resuelve h3 con
      // `calc(1.3rem + .6vw)` — crece con el viewport — y .card con radio 6px.
      expect(getComputedStyle(el.querySelector('.card-head h3')!).fontSize).toBe('16px')
      expect(getComputedStyle(el.querySelector('.card')!).borderRadius).toBe('18px')

      fixture.destroy()
    })

    it('muestra el estado vacío cuando no hay canjes', () => {
      const fixture = TestBed.createComponent(EstadisticasLocalComponent)
      fixture.detectChanges()
      matchStats()[0].flush({
        data: { ...STATS, totalAdquirido: 0, totalUsado: 0, totalExpirado: 0 }
      })
      fixture.detectChanges()

      const text = (fixture.nativeElement as HTMLElement).textContent ?? ''
      expect(text).toContain('Todavía no hay cupones canjeados en este período')

      fixture.destroy()
    })
  })

  describe('filtro de período', () => {
    it('manda instantes ISO que cubren el día completo', () => {
      component.ngOnInit()
      const req = matchStats()[0]

      const from = new Date(req.request.params.get('from')!)
      const to = new Date(req.request.params.get('to')!)

      // Resueltos en hora LOCAL: arranca a las 00:00 y termina a las 23:59:59.999.
      expect(from.getHours()).toBe(0)
      expect(from.getMinutes()).toBe(0)
      expect(to.getHours()).toBe(23)
      expect(to.getMinutes()).toBe(59)
      expect(to.getSeconds()).toBe(59)

      req.flush({ data: STATS })
    })

    it('cambiar de rango vuelve a pedir los datos', () => {
      component.ngOnInit()
      matchStats()[0].flush({ data: STATS })

      component.setRange('7d')
      const req = matchStats()
      expect(req.length).toBe(1)
      req[0].flush({ data: STATS })
      expect(component.selectedRange).toBe('7d')
    })

    it('el rango personalizado no dispara pedido hasta aplicarlo', () => {
      component.ngOnInit()
      matchStats()[0].flush({ data: STATS })

      component.setRange('custom')
      expect(matchStats().length).toBe(0)

      component.dateFrom = '2026-03-01'
      component.dateTo = '2026-03-31'
      component.applyCustomRange()

      const req = matchStats()
      expect(req.length).toBe(1)
      expect(new Date(req[0].request.params.get('to')!).getDate()).toBe(31)
      req[0].flush({ data: STATS })
    })
  })
})
