export type MqttTopic =
  | 'casa/cmd/iluminacao'
  | 'casa/cmd/luz_interior'
  | 'casa/cmd/alarme'
  | 'casa/cmd/ar'
  | 'casa/cmd/modo'
  | 'casa/cmd/lampada_sala'
  | 'casa/cmd/lampada_quarto'

export type CommandStatus = 'pendente' | 'sem_endpoint' | 'erro';

export interface CommandLogEntry {
  id: string;
  topic: MqttTopic;
  payload: string;
  sentAt: string;
  status: CommandStatus;
}
