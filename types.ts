
export interface LapData {
  lapNumber: number;
  lapTime: number;
  sector1: number;
  sector2: number;
  sector3: number;
  compound: string;
  driver: string;
}

export interface TelemetryPoint {
  distance: number;
  speed: number;
  throttle: number;
  brake: number;
  gear: number;
  rpm: number;
}

export interface MLResult {
  hypothesis: string;
  conclusion: string;
  confidence: number;
  metrics: {
    accuracy?: number;
    correlation?: number;
    featureImportance?: { [key: string]: number };
  };
  visualizationData: any[];
  visualizationType: 'line' | 'bar' | 'scatter';
}

export interface AnalysisState {
  season: string;
  grandPrix: string;
  driver1: string;
  driver2: string;
  sessionType: string;
  pythonCode: string;
  loading: boolean;
  results: MLResult | null;
  error: string | null;
}
