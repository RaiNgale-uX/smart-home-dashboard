export type ConsumptionPeriod = 'semanal' | 'mensal';

export interface ConsumptionEntry {
  id: string;
  period: ConsumptionPeriod;
  kwh: number;
  recordedAt: string;
}
