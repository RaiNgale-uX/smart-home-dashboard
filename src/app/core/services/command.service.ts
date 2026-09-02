import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { API_BASE_URL, COMMAND_LOG_STORAGE_KEY, CONTROL_STATE_STORAGE_KEY } from '../config';
import { CommandLogEntry, MqttTopic } from '../models/command.model';
import { SystemMode } from '../models/dashboard.model';

interface ControlState {
  mode: SystemMode;
  exteriorLamp: boolean;
  interiorLamp: boolean;
  ac: boolean;
}

const DEFAULT_STATE: ControlState = {
  mode: 'AUTO',
  exteriorLamp: false,
  interiorLamp: false,
  ac: false
};

/**
 * A API documentada não expõe um endpoint REST para publicar comandos MQTT
 * (apenas os tópicos que o ESP32 escuta). Este serviço mantém a intenção do
 * utilizador localmente e tenta despachá-la para /api/v1/commands — a única
 * rota plausível caso um gateway REST→MQTT seja adicionado ao backend.
 * Quando o endpoint não existe, o comando fica registado como "sem_endpoint",
 * de forma transparente, em vez de simular uma confirmação falsa.
 */
@Injectable({ providedIn: 'root' })
export class CommandService {
  private readonly http = inject(HttpClient);

  readonly mode = signal<SystemMode>(this.loadState().mode);
  readonly exteriorLamp = signal<boolean>(this.loadState().exteriorLamp);
  readonly interiorLamp = signal<boolean>(this.loadState().interiorLamp);
  readonly ac = signal<boolean>(this.loadState().ac);
  readonly log = signal<CommandLogEntry[]>(this.loadLog());

  setMode(mode: SystemMode) {
    this.mode.set(mode);
    this.persistState();
    this.dispatch('casa/cmd/modo', mode);
  }

  setExteriorLamp(on: boolean) {
    this.exteriorLamp.set(on);
    this.persistState();
    this.dispatch('casa/cmd/iluminacao', on ? 'ON' : 'OFF');
  }

  setInteriorLamp(on: boolean) {
    this.interiorLamp.set(on);
    this.persistState();
    this.dispatch('casa/cmd/luz_interior', on ? 'ON' : 'OFF');
  }

  setAC(on: boolean) {
  this.ac.set(on);
  this.persistState();
  this.dispatch('casa/cmd/ar', on ? 'ON' : 'OFF');
}

  private dispatch(topic: MqttTopic, payload: string) {
    const entry: CommandLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      topic,
      payload,
      sentAt: new Date().toISOString(),
      status: 'pendente'
    };
    this.log.update((l) => [entry, ...l].slice(0, 40));
    this.persistLog();

    this.http
      .post(`${API_BASE_URL}/api/v1/commands`, { topic, payload })
      .pipe(
        catchError(() => {
          this.updateEntryStatus(entry.id, 'sem_endpoint');
          return of(null);
        })
      )
      .subscribe((res) => {
        if (res !== null) this.updateEntryStatus(entry.id, 'pendente');
      });
  }

  private updateEntryStatus(id: string, status: CommandLogEntry['status']) {
    this.log.update((l) => l.map((e) => (e.id === id ? { ...e, status } : e)));
    this.persistLog();
  }

  private persistState() {
  const state: ControlState = {
    mode: this.mode(),
    exteriorLamp: this.exteriorLamp(),
    interiorLamp: this.interiorLamp(),
    ac: this.ac()
  };

  try {
    localStorage.setItem(
      CONTROL_STATE_STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch {
    /* noop */
  }
}

  private persistLog() {
    try {
      localStorage.setItem(COMMAND_LOG_STORAGE_KEY, JSON.stringify(this.log()));
    } catch { /* noop */ }
  }

  private loadState(): ControlState {
    try {
      const raw = localStorage.getItem(CONTROL_STATE_STORAGE_KEY);
      return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  }

  private loadLog(): CommandLogEntry[] {
    try {
      const raw = localStorage.getItem(COMMAND_LOG_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CommandLogEntry[]) : [];
    } catch {
      return [];
    }
  }
}
