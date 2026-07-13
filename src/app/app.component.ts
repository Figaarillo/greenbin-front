import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { LoaderComponent } from './components/loader/loader.component'
import { ThemeService } from './services/theme/theme.service'
import { TextSizeService } from './services/text-size/text-size.service'
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'greenbin-front'

  constructor(themeService: ThemeService, textSizeService: TextSizeService) {
    // Aplica la preferencia persistida antes del primer render en el cliente,
    // para no mostrar el tema/tamaño equivocado un instante al recargar.
    themeService.apply()
    textSizeService.apply()
  }
}
