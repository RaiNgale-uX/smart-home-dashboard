import { Component, input, computed } from '@angular/core';
import { SeverityLevel } from '../../../core/models/dashboard.model';

const LABELS: Record<SeverityLevel, string> = {
  normal: 'Normal',
  atencao: 'Atenção',
  perigo: 'Perigo',
  offline: 'Offline'
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="'badge--' + level()">{{ text() }}</span>`
})
export class StatusBadgeComponent {
  level = input.required<SeverityLevel>();
  label = input<string | undefined>(undefined);

  readonly text = computed(() => this.label() ?? LABELS[this.level()]);
}
