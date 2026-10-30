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
  prototypeSala: boolean;
  prototypeQuarto: boolean;
  ac: boolean;
}

const DEFAULT_STATE: ControlState = {
  mode: 'AUTO',
  exteriorLamp: false,
  interiorLamp: false,
  prototypeSala: false,
  prototypeQuarto: false,
  ac: false
};

/**
 * Guarda a intenção de controlo no navegador e tenta enviá-la à API REST.
 * IMPORTANTE: um HTTP 2xx não confirma que o ESP32 executou o comando.
 * O backend precisa de implementar POST /api/v1/commands para encaminhar ao MQTT.
 */
@Injectable({ providedIn: 'root' })
export class CommandService {
  private readonly http = inject(HttpClient);
  private readonly initial = this.loadState();

  readonly mode = signal<SystemMode>(this.initial.mode);
  readonly exteriorLamp = signal<boolean>(this.initial.exteriorLamp);
  readonly interiorLamp = signal<boolean>(this.initial.interiorLamp);
  readonly prototypeSala = signal<boolean>(this.initial.prototypeSala);
  readonly prototypeQuarto = signal<boolean>(this.initial.prototypeQuarto);
  readonly ac = signal<boolean>(this.initial.ac);
  readonly log = signal<CommandLogEntry[]>(this.loadLog());

  setMode(mode: SystemMode): void {
    this.mode.set(mode);
    this.persistState();
    this.dispatch('casa/cmd/modo', mode);
  }

  setExteriorLamp(on: boolean): void {
    if (this.mode() !== 'MANUAL') return;
    this.exteriorLamp.set(on);
    this.persistState();
    this.dispatch('casa/cmd/iluminacao', on ? 'ON' : 'OFF');
  }

  setInteriorLamp(on: boolean): void {
    if (this.mode() !== 'MANUAL') return;
    this.interiorLamp.set(on);
    this.persistState();
    this.dispatch('casa/cmd/luz_interior', on ? 'ON' : 'OFF');
  }

  setPrototypeSala(on: boolean): void {
    if (this.mode() !== 'MANUAL') return;
    this.prototypeSala.set(on);
    this.persistState();
    this.dispatch('casa/cmd/lampada_sala', on ? 'ON' : 'OFF');
  }

  setPrototypeQuarto(on: boolean): void {
    if (this.mode() !== 'MANUAL') return;
    this.prototypeQuarto.set(on);
    this.persistState();
    this.dispatch('casa/cmd/lampada_quarto', on ? 'ON' : 'OFF');
  }

  setAC(on: boolean): void {
    if (this.mode() !== 'MANUAL') return;
    this.ac.set(on);
    this.persistState();
    this.dispatch('casa/cmd/ar', on ? 'ON' : 'OFF');
  }

  private dispatch(topic: MqttTopic, payload: string): void {
    const entry: CommandLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      topic,
      payload,
      sentAt: new Date().toISOString(),
      status: 'pendente'
    };
    this.log.update((items) => [entry, ...items].slice(0, 40));
    this.persistLog();

    this.http.post(`${API_BASE_URL}/api/v1/commands`, { topic, payload })
      .pipe(catchError((error) => {
        // Um 404/405 costuma significar que a rota REST não existe.
        this.updateEntryStatus(entry.id, error.status === 404 || error.status === 405 ? 'sem_endpoint' : 'erro');
        return of(null);
      }))
      .subscribe(() => {
        // 'pendente' significa apenas pedido enviado, não execução confirmada.
      });
  }

  private updateEntryStatus(id: string, status: CommandLogEntry['status']): void {
    this.log.update((items) => items.map((e) => e.id === id ? { ...e, status } : e));
    this.persistLog();
  }

  private persistState(): void {
    const state: ControlState = {
      mode: this.mode(),
      exteriorLamp: this.exteriorLamp(),
      interiorLamp: this.interiorLamp(),
      prototypeSala: this.prototypeSala(),
      prototypeQuarto: this.prototypeQuarto(),
      ac: this.ac()
    };
    try {
      localStorage.setItem(CONTROL_STATE_STORAGE_KEY, JSON.stringify(state));
    } catch { /* armazenamento indisponível */ }
  }

  private persistLog(): void {
    try {
      localStorage.setItem(COMMAND_LOG_STORAGE_KEY, JSON.stringify(this.log()));
    } catch { /* armazenamento indisponível */ }
  }

  private loadState(): ControlState {
    try {
      const raw = localStorage.getItem(CONTROL_STATE_STORAGE_KEY);
      return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
    } catch {
      return { ...DEFAULT_STATE };
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
