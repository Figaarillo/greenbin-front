import { Component, viewChild } from '@angular/core'
import { DatePipe, DecimalPipe } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component'

/** Una fila del desglose por categoría de residuo. */
export interface TransactionDetailRow {
  categoria: string
  peso: number
  puntos: number
}

/**
 * Ítem del historial tal como lo arman las landings, más la transacción cruda
 * que devuelve el backend (`raw`), de donde sale todo el detalle.
 */
export interface TransactionItem {
  tipo?: 'residuo' | 'cupon'
  descripcion: string
  puntos: number
  fecha: string
  raw?: any
}

/**
 * Detalle de una transacción del historial. Se abre al tocar un ítem, tanto en
 * la landing del vecino como en la del responsable.
 *
 * No hace ninguna llamada extra: el endpoint del historial ya popula
 * `transactionDetails.waste.category`, `greenPoint`, `responsible` y `neighbor`
 * (ver waste-transaction.mikroorm.repository). Antes ese detalle se descartaba
 * en el `.map()` de cada landing.
 */
@Component({
  selector: 'app-transaction-sheet',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatIconModule, BottomSheetComponent],
  templateUrl: './transaction-sheet.component.html',
  styleUrl: './transaction-sheet.component.scss'
})
export class TransactionSheetComponent {
  private readonly sheet = viewChild.required(BottomSheetComponent)

  item: TransactionItem | null = null

  /** 'vecino' muestra quién recibió; 'responsable' muestra de quién fue la entrega. */
  perspectiva: 'vecino' | 'responsable' = 'vecino'

  open(item: TransactionItem, perspectiva: 'vecino' | 'responsable' = 'vecino'): void {
    this.item = item
    this.perspectiva = perspectiva
    this.sheet().open()
  }

  cerrar(): void {
    this.sheet().closeSheet()
  }

  get esCupon(): boolean {
    return this.item?.tipo === 'cupon'
  }

  get detalles(): TransactionDetailRow[] {
    const rows = this.item?.raw?.transactionDetails
    if (!Array.isArray(rows)) return []

    return rows.map((d: any) => ({
      categoria: d?.waste?.category?.name ?? 'Sin categoría',
      peso: d?.weight ?? 0,
      puntos: d?.points ?? 0
    }))
  }

  get pesoTotal(): number {
    return this.detalles.reduce((sum, d) => sum + d.peso, 0)
  }

  get puntoVerde(): string | null {
    return this.item?.raw?.greenPoint?.name ?? null
  }

  /** Responsable que recibió la entrega (se muestra en la vista del vecino). */
  get recibio(): string | null {
    const r = this.item?.raw?.responsible
    if (r?.firstname == null) return null

    return `${r.firstname} ${r.lastname ?? ''}`.trim()
  }

  /** Vecino que entregó (se muestra en la vista del responsable). */
  get vecino(): string | null {
    const n = this.item?.raw?.neighbor
    if (n?.firstname == null) return null

    return `${n.firstname} ${n.lastname ?? ''}`.trim()
  }

  get cuponTitulo(): string | null {
    return this.item?.raw?.coupon?.title ?? null
  }

  get cuponLocal(): string | null {
    return this.item?.raw?.coupon?.localAdherido?.name ?? this.item?.raw?.coupon?.local?.name ?? null
  }

  get cuponDescuento(): number | null {
    return this.item?.raw?.coupon?.discount ?? null
  }

  get cuponCodigo(): string | null {
    return this.item?.raw?.code ?? null
  }

  get cuponVence(): string | null {
    return this.item?.raw?.expirationDate ?? this.item?.raw?.dueDate ?? null
  }

  get idCorto(): string | null {
    const id = this.item?.raw?.id
    return typeof id === 'string' ? id.slice(0, 6) : null
  }
}
