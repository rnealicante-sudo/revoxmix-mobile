
export interface QualityOption {
  label: string;
  url: string;
  bitrate?: string;
}

export interface StereoAnalysers {
  left: AnalyserNode;
  right: AnalyserNode;
}

export interface RadioStation {
  id: string;
  name: string;
  url: string;
  bitrate?: string;
  description: string;
  color: string;
  image: string;
  qualities?: QualityOption[];
}

export interface FavoriteStation extends RadioStation {
  customName?: string;
  category?: string;
}

export enum PlayerState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR'
}

export enum VisualizerType {
  LED_BAR = 'LED_BAR',
  SPECTRUM = 'SPECTRUM',
  ANALOG = 'ANALOG',
  OSCILLOSCOPE = 'OSCILLOSCOPE'
}
