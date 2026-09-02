import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConsumptionService } from '../../core/services/consumption.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConsumptionPeriod } from '../../core/models/consumption.model';
import { formatDateTime, formatNumber } from '../../shared/format';

@Component({
  selector: 'app-consumption',
  standalone: true,
  imports: [PageHeaderComponent, FormsModule],
  templateUrl: './consumption.component.html',
  styleUrl: './consumption.component.scss'
})
export class ConsumptionComponent {
  readonly consumption = inject(ConsumptionService);

  readonly period = signal<ConsumptionPeriod>('semanal');
  readonly kwh = signal<number | null>(null);
  readonly formError = signal<string | null>(null);

  readonly weeklyLabel = () => {
    const e = this.consumption.latestWeekly();
    return e ? `${formatNumber(e.kwh, 2)} kWh` : '—';
  };

  readonly weeklyDate = () => {
    const e = this.consumption.latestWeekly();
    return e ? formatDateTime(e.recordedAt) : 'sem registos';
  };

  readonly monthlyLabel = () => {
    const e = this.consumption.latestMonthly();
    return e ? `${formatNumber(e.kwh, 2)} kWh` : '—';
  };

  readonly monthlyDate = () => {
    const e = this.consumption.latestMonthly();
    return e ? formatDateTime(e.recordedAt) : 'sem registos';
  };

  fmt(value: number): string {
    return formatNumber(value, 2);
  }

  date(iso: string): string {
    return formatDateTime(iso);
  }

  submit() {
    const value = this.kwh();
    if (value === null || Number.isNaN(value) || value < 0) {
      this.formError.set('Indique um valor de consumo válido, em kWh.');
      return;
    }
    this.formError.set(null);
    this.consumption.record(this.period(), value);
    this.kwh.set(null);
  }

  remove(id: string) {
    this.consumption.remove(id);
  }
}
