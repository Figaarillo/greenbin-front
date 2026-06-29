import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { NavbarComponent } from './components/navbar/navbar.component'
import { LoaderComponent } from './components/loader/loader.component'
import { routeAnimations } from './animations/route-animations'
NavbarComponent
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [routeAnimations]
})
export class AppComponent {
  title = 'greenbin-front'

  getAnimationState(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation']
  }
}
