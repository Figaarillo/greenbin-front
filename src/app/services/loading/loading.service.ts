import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false)
  public loading$ = this.loadingSubject.asObservable()

  showLoading() {
    console.log('cargando')
    this.loadingSubject.next(true)
  }

  hideLoading() {
    console.log('listo')
    this.loadingSubject.next(false)
  }
}
