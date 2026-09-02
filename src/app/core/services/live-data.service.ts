import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { catchError, of, timer, switchMap } from 'rxjs';
import { DashboardApiService } from './dashboard-api.service';
import { DashboardSnapshot, HistoryPoint, SeverityLevel } from '../models/dashboard.model';
import { HISTORY_MAX_POINTS, HISTORY_STORAGE_KEY, POLL_INTERVAL_MS } from '../config';

/**
 * Sondagem periódica do endpoint /api/v1/dashboard.
 * O backend não expõe histórico — por isso mantemos aqui uma série
 * temporal local (memória + localStorage) construída a partir de cada
 * leitura recebida durante a sessão.
 */
@Injectable({ providedIn: 'root' })
export class LiveDataService {
  private readonly api = inject(DashboardApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly snapshot = signal<DashboardSnapshot | null>(null);
  readonly isOnline = signal(false);
  readonly isLoading = signal(true);
  readonly lastError = signal<string | null>(null);
  readonly lastUpdated = signal<Date | null>(null);
  readonly history = signal<HistoryPoint[]>(this.loadHistory());

  readonly sessionStart = new Date();

  constructor() {
    const poll$ = timer(0, POLL_INTERVAL_MS).pipe(
      switchMap(() =>
        this.api.getDashboard().pipe(
          catchError((err) => {
            this.isOnline.set(false);
            this.lastError.set(this.describeError(err));
            return of(null);
          })
        )
      )
    );

    const sub = poll$.subscribe((snap) => {
      this.isLoading.set(false);
      if (!snap) return;
      this.snapshot.set(snap);
      this.isOnline.set(true);
      this.lastError.set(null);
      this.lastUpdated.set(new Date());
      this.pushHistory(snap);
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  private describeError(err: unknown): string {
    if (err && typeof err === 'object' && 'status' in err) {
      const status = (err as { status: number }).status;
      if (status === 0) return 'Sem resposta do servidor (rede ou CORS)';
      return `Erro HTTP ${status}`;
    }
    return 'Falha desconhecida ao contactar a API';
  }

  private pushHistory(snap: DashboardSnapshot) {
    const point: HistoryPoint = {
      t: Date.now(),
      temperature: snap.temperature,
      humidity: snap.humidity,
      pressure: snap.pressure,
      lux: snap.lux,
      gasValue: snap.gasValue
    };
    const next = [...this.history(), point].slice(-HISTORY_MAX_POINTS);
    this.history.set(next);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* armazenamento indisponível — segue apenas em memória */
    }
  }

  private loadHistory(): HistoryPoint[] {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as HistoryPoint[]) : [];
    } catch {
      return [];
    }
  }

  clearHistory() {
    this.history.set([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      /* noop */
    }
  }
}

export function gasSeverity(gasValue: number | undefined, gasAlarm: boolean | undefined): SeverityLevel {
  if (gasValue === undefined) return 'offline';
  if (gasAlarm) return 'perigo';
  if (gasValue >= 500) return 'atencao';
  return 'normal';
}

export function severityLabel(level: SeverityLevel): string {
  switch (level) {
    case 'normal': return 'Normal';
    case 'atencao': return 'Atenção';
    case 'perigo': return 'Perigo';
    case 'offline': return 'Offline';
  }
}
