
export interface SnapUser {
  id: string;
  username: string;
  originalText: string;
  timestamp: number;
  aiIntro?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR'
}
