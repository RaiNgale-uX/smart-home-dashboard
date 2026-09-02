export type SystemMode = 'AUTO' | 'MANUAL';

export type SeverityLevel = 'normal' | 'atencao' | 'perigo' | 'offline';

/** Resposta de GET /api/v1/dashboard */
export interface DashboardSnapshot {
  mode: SystemMode | string;
  online: boolean;
  temperature: number;
  humidity: number;
  pressure: number;
  lux: number;
  gasValue: number;
  gasAlarm: boolean;
  roomOccupied: boolean;
  coolingDemand: boolean;
  timestamp: string;
}

/** Corpo de POST /api/v1/sensors */
export interface SensorReadingPayload {
  temperature: number;
  humidity: number;
  pressure: number;
  lux: number;
  gasValue: number;
  gasAlarm: boolean;
  roomOccupied: boolean;
  coolingDemand: boolean;
}

/** Resposta de GET /api/v1/db-test */
export interface DbTestResponse {
  database: string;
  time: string;
}

export interface HistoryPoint {
  t: number;
  temperature: number;
  humidity: number;
  pressure: number;
  lux: number;
  gasValue: number;
}
