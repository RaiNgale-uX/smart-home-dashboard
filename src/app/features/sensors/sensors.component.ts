import { Component, computed, inject, signal } from '@angular/core';
import { LiveDataService, gasSeverity } from '../../core/services/live-data.service';
import { DashboardApiService } from '../../core/services/dashboard-api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SeverityLevel } from '../../core/models/dashboard.model';
import { formatNumber, formatTime } from '../../shared/format';

interface SensorRow {
  name: string;
  model: string;
  value: string;
  unit: string;
  level: SeverityLevel;
  note?: string;
}

type DiagnosticState = 'idle' | 'loading' | 'ok' | 'error';

@Component({
  selector: 'app-sensors',
  standalone: true,
  imports: [PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './sensors.component.html',
  styleUrl: './sensors.component.scss'
})
export class SensorsComponent {
  private readonly live = inject(LiveDataService);
  private readonly api = inject(DashboardApiService);

  readonly lastUpdateTime = computed(() => formatTime(this.live.lastUpdated()?.toISOString()));

  readonly diagnosticState = signal<DiagnosticState>('idle');
  readonly diagnosticMessage = signal('');

  readonly rows = computed<SensorRow[]>(() => {
    const s = this.live.snapshot();
    const online = this.live.isOnline();
    const lvl = (): SeverityLevel => (online ? 'normal' : 'offline');

    return [
      {
        name: 'Luminosidade',
        model: 'BH1750',
        value: formatNumber(s?.lux, 0),
        unit: 'lux',
        level: lvl()
      },
      {
        name: 'Gás inflamável',
        model: 'MQ-6',
        value: formatNumber(s?.gasValue, 0),
        unit: 'un.',
        level: gasSeverity(s?.gasValue, s?.gasAlarm),
        note: 'Indica nível/risco de gás — não representa consumo'
      },
      {
        name: 'Fluxo de água',
        model: 'Sensor de fluxo',
        value: '—',
        unit: 'L/min',
        level: 'offline',
        note: 'Fora do payload actual de /api/v1/dashboard'
      },
      {
        name: 'Temperatura',
        model: 'BME280',
        value: formatNumber(s?.temperature, 1),
        unit: '°C',
        level: lvl()
      },
      {
        name: 'Humidade',
        model: 'BME280',
        value: formatNumber(s?.humidity, 0),
        unit: '%',
        level: lvl()
      },
      {
        name: 'Pressão atmosférica',
        model: 'BME280',
        value: formatNumber(s?.pressure, 0),
        unit: 'hPa',
        level: lvl()
      },
      {
        name: 'Presença / Movimento',
        model: 'PIR · HLK-LD2410',
        value: s?.roomOccupied ? 'Detectado' : 'Não detectado',
        unit: '',
        level: lvl()
      }
    ];
  });

  runDiagnostic() {
    this.diagnosticState.set('loading');
    this.diagnosticMessage.set('');
    this.api.testConnection().subscribe({
      next: (res) => {
        this.diagnosticState.set('ok');
        this.diagnosticMessage.set(`Base de dados "${res.database}" · ${formatTime(res.time)}`);
      },
      error: () => {
        this.diagnosticState.set('error');
        this.diagnosticMessage.set('Falha ao contactar /api/v1/db-test');
      }
    });
  }
}
