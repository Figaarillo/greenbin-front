import { Component } from '@angular/core'

@Component({
  selector: 'app-consultar-entidad',
  standalone: true,
  imports: [],
  templateUrl: './consultar-entidad.component.html',
  styleUrl: './consultar-entidad.component.scss'
})
export class ConsultarEntidadComponent {
  entidades = [
    {
      id: 1,
      razon_social: 'example',
      example: 'example',
      example2: 'example',
      example3: 'example'
    },
    {
      id: 2,
      razon_social: 'example',
      example: 'example',
      example2: 'example',
      example3: 'example'
    },
    {
      id: 3,
      razon_social: 'example',
      example: 'example',
      example2: 'example',
      example3: 'example'
    }
  ]
}
