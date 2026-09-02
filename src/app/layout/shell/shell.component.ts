import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LiveDataService } from '../../core/services/live-data.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  readonly live = inject(LiveDataService);

  readonly navItems: NavItem[] = [
    { path: 'estado', label: 'Estado do Sistema', icon: 'pulse' },
    { path: 'sensores', label: 'Sensores', icon: 'radar' },
    { path: 'historico', label: 'Histórico', icon: 'chart' },
    { path: 'controlo', label: 'Controlo', icon: 'sliders' },
    { path: 'consumo', label: 'Consumo Elétrico', icon: 'bolt' }
  ];

  readonly statusLabel = computed(() => (this.live.isOnline() ? 'Sistema ligado' : 'Sem ligação'));

  readonly lastUpdatedLabel = computed(() => {
    const d = this.live.lastUpdated();
    if (!d) return '—';
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });
}
