import { Component } from '@angular/core'
import { LoadingService } from '../../services/loading/loading.service'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  isLoading = this.loadingService.loading$

  constructor(private loadingService: LoadingService) {}
}
