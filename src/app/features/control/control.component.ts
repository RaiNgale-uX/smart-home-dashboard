
import { Component, computed, inject } from '@angular/core';

import { CommandService } from '../../core/services/command.service';
import { LiveDataService } from '../../core/services/live-data.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SystemMode } from '../../core/models/dashboard.model';
import { formatTime } from '../../shared/format';
import { CommandStatus } from '../../core/models/command.model';

const STATUS_LABEL: Record<CommandStatus, string> = {
  pendente: 'Enviado',
  sem_endpoint: 'Sem endpoint no backend',
  erro: 'Erro'
};

@Component({
  selector: 'app-control',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './control.component.html',
  styleUrl: './control.component.scss'
})
export class ControlComponent {

  readonly cmd = inject(CommandService);
  readonly live = inject(LiveDataService);

  readonly reportedMode = computed(
    () => this.live.snapshot()?.mode ?? '—'
  );

  readonly isManual = computed(
    () => this.cmd.mode() === 'MANUAL'
  );

  // =========================================
  // MODO DE OPERACAO
  // =========================================

  setMode(mode: SystemMode) {
    this.cmd.setMode(mode);
  }

  // =========================================
  // ILUMINACAO EXISTENTE
  // =========================================

  toggleExterior() {
    if (!this.isManual()) return;

    this.cmd.setExteriorLamp(
      !this.cmd.exteriorLamp()
    );
  }

  toggleInterior() {
    if (!this.isManual()) return;

    this.cmd.setInteriorLamp(
      !this.cmd.interiorLamp()
    );
  }

  // =========================================
  // ILUMINACAO DO PROTOTIPO
  // ESP32-S3: GPIO41 E GPIO42
  // =========================================

  togglePrototypeSala(): void {
    if (!this.isManual()) return;

    this.cmd.setPrototypeSala(
      !this.cmd.prototypeSala()
    );
  }

  togglePrototypeQuarto(): void {
    if (!this.isManual()) return;

    this.cmd.setPrototypeQuarto(
      !this.cmd.prototypeQuarto()
    );
  }

  // =========================================
  // CLIMATIZACAO
  // =========================================

  toggleAC() {
    if (!this.isManual()) return;

    this.cmd.setAC(!this.cmd.ac());
  }

  // =========================================
  // REGISTO DE COMANDOS
  // =========================================

  statusLabel(s: CommandStatus): string {
    return STATUS_LABEL[s];
  }

  time(iso: string): string {
    return formatTime(iso);
  }
}
