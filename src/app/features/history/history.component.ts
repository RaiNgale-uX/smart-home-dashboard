import { Component, computed, inject, signal } from '@angular/core';
import { LiveDataService } from '../../core/services/live-data.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LineChartComponent } from '../../shared/components/line-chart/line-chart.component';
import { formatNumber, formatTime } from '../../shared/format';

type RangeKey = '15m' | '30m' | 'all';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [PageHeaderComponent, LineChartComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  readonly live = inject(LiveDataService);

  readonly range = signal<RangeKey>('all');

  readonly ranges: { key: RangeKey; label: string }[] = [
    { key: '15m', label: '15 min' },
    { key: '30m', label: '30 min' },
    { key: 'all', label: 'Tudo' }
  ];

  readonly sessionStartLabel = formatTime(this.live.sessionStart.toISOString());

  readonly filteredHistory = computed(() => {
    const all = this.live.history();
    const r = this.range();
    if (r === 'all') return all;
    const windowMs = r === '15m' ? 15 * 60_000 : 30 * 60_000;
    const cutoff = Date.now() - windowMs;
    return all.filter((p) => p.t >= cutoff);
  });

  readonly temperatureSeries = computed(() => this.filteredHistory().map((p) => p.temperature));
  readonly luxSeries = computed(() => this.filteredHistory().map((p) => p.lux));
  readonly gasSeries = computed(() => this.filteredHistory().map((p) => p.gasValue));
  readonly humiditySeries = computed(() => this.filteredHistory().map((p) => p.humidity));

  readonly latestTemp = computed(() => formatNumber(this.lastOf(this.temperatureSeries()), 1));
  readonly latestLux = computed(() => formatNumber(this.lastOf(this.luxSeries()), 0));
  readonly latestGas = computed(() => formatNumber(this.lastOf(this.gasSeries()), 0));
  readonly latestHumidity = computed(() => formatNumber(this.lastOf(this.humiditySeries()), 0));

  readonly pointCount = computed(() => this.filteredHistory().length);

  private lastOf(arr: number[]): number | undefined {
    return arr.length ? arr[arr.length - 1] : undefined;
  }

  clearHistory() {
    this.live.clearHistory();
  }
}
