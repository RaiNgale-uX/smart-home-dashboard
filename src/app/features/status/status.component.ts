import { Component, computed, inject } from '@angular/core';
import { LiveDataService, gasSeverity } from '../../core/services/live-data.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SeverityLevel } from '../../core/models/dashboard.model';
import { formatNumber, formatTime, isStale } from '../../shared/format';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './status.component.html',
  styleUrl: './status.component.scss'
})
export class StatusComponent {
  readonly live = inject(LiveDataService);

  readonly snapshot = this.live.snapshot;

  readonly modeLabel = computed(() => {
    const m = this.snapshot()?.mode;
    if (m === 'MANUAL') return 'Manual';
    if (m === 'AUTO') return 'Automático';
    return '—';
  });

  readonly connectionLevel = computed<SeverityLevel>(() => (this.live.isOnline() ? 'normal' : 'offline'));
  readonly connectionLabel = computed(() => (this.live.isOnline() ? 'Ligado' : 'Sem ligação'));

  readonly lastUpdateTime = computed(() => formatTime(this.live.lastUpdated()?.toISOString()));
  readonly dataIsStale = computed(() => isStale(this.live.lastUpdated()?.toISOString(), 25000));

  readonly presenceLevel = computed<SeverityLevel>(() => (this.live.isOnline() ? 'normal' : 'offline'));
  readonly presenceText = computed(() => (this.snapshot()?.roomOccupied ? 'Detectado' : 'Não detectado'));

  readonly lightLevel = computed<SeverityLevel>(() => (this.live.isOnline() ? 'normal' : 'offline'));
  readonly luxValue = computed(() => formatNumber(this.snapshot()?.lux, 0));

  readonly gasLevel = computed<SeverityLevel>(() => gasSeverity(this.snapshot()?.gasValue, this.snapshot()?.gasAlarm));
  readonly gasValue = computed(() => formatNumber(this.snapshot()?.gasValue, 0));

  readonly tempLevel = computed<SeverityLevel>(() => (this.live.isOnline() ? 'normal' : 'offline'));
  readonly tempValue = computed(() => formatNumber(this.snapshot()?.temperature, 1));
  readonly humidityValue = computed(() => formatNumber(this.snapshot()?.humidity, 0));
  readonly pressureValue = computed(() => formatNumber(this.snapshot()?.pressure, 0));

  readonly coolingLabel = computed(() => (this.snapshot()?.coolingDemand ? 'Ativa' : 'Inativa'));
}
