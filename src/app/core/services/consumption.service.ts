import { Injectable, computed, signal } from '@angular/core';
import { CONSUMPTION_STORAGE_KEY } from '../config';
import { ConsumptionEntry, ConsumptionPeriod } from '../models/consumption.model';

/**
 * A especificação pede um registo de consumo semanal/mensal, mas a API
 * documentada não tem endpoint para isto. Persistimos localmente (localStorage)
 * até existir uma rota dedicada — a UI deixa isso explícito para o utilizador.
 */
@Injectable({ providedIn: 'root' })
export class ConsumptionService {
  readonly entries = signal<ConsumptionEntry[]>(this.load());

  readonly latestWeekly = computed(() => this.latestOf('semanal'));
  readonly latestMonthly = computed(() => this.latestOf('mensal'));

  record(period: ConsumptionPeriod, kwh: number) {
    const entry: ConsumptionEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      period,
      kwh,
      recordedAt: new Date().toISOString()
    };
    this.entries.update((e) => [entry, ...e].slice(0, 100));
    this.persist();
  }

  remove(id: string) {
    this.entries.update((e) => e.filter((x) => x.id !== id));
    this.persist();
  }

  private latestOf(period: ConsumptionPeriod): ConsumptionEntry | null {
    return this.entries().find((e) => e.period === period) ?? null;
  }

  private persist() {
    try {
      localStorage.setItem(CONSUMPTION_STORAGE_KEY, JSON.stringify(this.entries()));
    } catch { /* noop */ }
  }

  private load(): ConsumptionEntry[] {
    try {
      const raw = localStorage.getItem(CONSUMPTION_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ConsumptionEntry[]) : [];
    } catch {
      return [];
    }
  }
}
