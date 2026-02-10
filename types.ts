
export interface Airport {
  iata: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
}

export type FocusMode = 'IDLE' | 'BOARDING' | 'FLYING';
export type SnackPreference = 'SNACKS' | 'NO_SNACKS' | null;
export type PomodoroState = 'WORK' | 'BREAK';

export interface FlightContext {
  from: Airport | null;
  to: Airport | null;
  seat: string | null;
  snackPreference: SnackPreference;
  estimatedFlightTime: number; // in seconds
}