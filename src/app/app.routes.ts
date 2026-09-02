import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'estado', pathMatch: 'full' },
      {
        path: 'estado',
        loadComponent: () => import('./features/status/status.component').then((m) => m.StatusComponent)
      },
      {
        path: 'sensores',
        loadComponent: () => import('./features/sensors/sensors.component').then((m) => m.SensorsComponent)
      },
      {
        path: 'historico',
        loadComponent: () => import('./features/history/history.component').then((m) => m.HistoryComponent)
      },
      {
        path: 'controlo',
        loadComponent: () => import('./features/control/control.component').then((m) => m.ControlComponent)
      },
      {
        path: 'consumo',
        loadComponent: () => import('./features/consumption/consumption.component').then((m) => m.ConsumptionComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'estado' }
];
