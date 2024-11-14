import { Component } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { ActivatedRoute, RouterModule, Router } from '@angular/router'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {}
