import { trigger, transition, style, query, animate, keyframes } from '@angular/animations'

export const routeAnimations = trigger('routeAnimations', [
  transition('loginPage <=> *', [
    query(':enter, :leave', [style({ position: 'absolute', width: '100%' })], { optional: true }),
    query(
      ':enter',
      [
        animate(
          '300ms cubic-bezier(0.22, 1, 0.36, 1)',
          keyframes([
            style({ opacity: 0, transform: 'translateY(30px)', offset: 0 }),
            style({ opacity: 1, transform: 'translateY(0)', offset: 1 })
          ])
        )
      ],
      { optional: true }
    ),
    query(
      ':leave',
      [
        animate(
          '300ms cubic-bezier(0.22, 1, 0.36, 1)',
          keyframes([
            style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
            style({ opacity: 0, transform: 'translateY(30px)', offset: 1 })
          ])
        )
      ],
      { optional: true }
    )
  ]),
  transition('* <=> *', [])
])
