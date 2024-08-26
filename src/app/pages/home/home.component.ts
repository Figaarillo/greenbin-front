import { Component } from '@angular/core'
import { ActivatedRoute, RouterModule, Router } from '@angular/router'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {}
