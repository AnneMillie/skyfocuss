
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Airport, FocusMode, SnackPreference, PomodoroState, FlightContext } from './types';
import SidePanel from './components/SidePanel';
import MapContainer from './components/MapContainer';
import SeatSelector from './components/SeatSelector';
import FlightOverlay from './components/FlightOverlay';
import Notification from './components/Notification';
import { playChime } from './utils/audioUtils';

const App: React.FC = () => {
  const [mode, setMode] = useState<FocusMode>('IDLE');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [context, setContext] = useState<FlightContext>({
    from: null,
    to: null,
    seat: null,
    snackPreference: null,
    estimatedFlightTime: 0
  });
  
  const [pomodoro, setPomodoro] = useState<PomodoroState>('WORK');
  const [pomodoroSeconds, setPomodoroSeconds] = useState(1800);
  const [remainingFlightSeconds, setRemainingFlightSeconds] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Fetch airports once at root
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/mwgg/Airports/master/airports.json')
      .then(res => res.json())
      .then(data => {
        const filtered = Object.values(data as any)
          .filter((ap: any) => ap.iata && ap.iata.length === 3)
          .map((ap: any) => ({
            iata: ap.iata,
            name: ap.name,
            city: ap.city,
            lat: Number(ap.lat),
            lon: Number(ap.lon)
          }));
        setAirports(filtered);
      });
  }, []);

  const terminateFlight = useCallback(() => {
    setMode('IDLE');
    setContext({
      from: null,
      to: null,
      seat: null,
      snackPreference: null,
      estimatedFlightTime: 0
    });
    setPomodoroSeconds(1800);
    setRemainingFlightSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startFlight = useCallback((pref: SnackPreference) => {
    const flightTime = context.estimatedFlightTime;
    const initialFocusTime = Math.min(1800, flightTime);
    
    setContext(prev => ({ ...prev, snackPreference: pref }));
    setMode('FLYING');
    setPomodoro('WORK');
    setPomodoroSeconds(initialFocusTime);
    setRemainingFlightSeconds(flightTime);
  }, [context.estimatedFlightTime]);

  // Handle countdown logic
  useEffect(() => {
    if (mode === 'FLYING') {
      timerRef.current = window.setInterval(() => {
        setPomodoroSeconds(prev => {
          if (prev <= 1 && prev !== -1) return -1; 
          return prev - 1;
        });
        setRemainingFlightSeconds(prev => {
          if (prev <= 1) {
            // Once the count is over, go back to homepage
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode, pomodoro]);

  // Auto-terminate when flight ends
  useEffect(() => {
    if (mode === 'FLYING' && remainingFlightSeconds === 0) {
      terminateFlight();
    }
  }, [remainingFlightSeconds, mode, terminateFlight]);

  // Pomodoro switching logic
  useEffect(() => {
    if (pomodoroSeconds === -1) {
      if (pomodoro === 'BREAK') {
        const nextWork = Math.min(1800, remainingFlightSeconds);
        setPomodoro('WORK');
        setPomodoroSeconds(nextWork > 0 ? nextWork : 0);
      } else {
        const nextBreak = Math.min(300, remainingFlightSeconds);
        if (context.snackPreference === 'SNACKS') {
          setShowNotification(true);
          playChime();
          setTimeout(() => setShowNotification(false), 8000);
        }
        setPomodoro('BREAK');
        setPomodoroSeconds(nextBreak > 0 ? nextBreak : 0);
      }
    }
  }, [pomodoroSeconds, remainingFlightSeconds, pomodoro, context.snackPreference]);

  const handleAirportSelect = (ap: Airport) => {
    if (mode !== 'IDLE') return;
    setContext(prev => {
      if (!prev.from) return { ...prev, from: ap };
      if (!prev.to && prev.from.iata !== ap.iata) return { ...prev, to: ap };
      return { ...prev, from: ap, to: null };
    });
  };

  const handleStartBoarding = (from: Airport, to: Airport, time: number) => {
    setContext(prev => ({ ...prev, from, to, estimatedFlightTime: time }));
    setMode('BOARDING');
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden text-white">
      <MapContainer 
        from={context.from} 
        to={context.to} 
        isFlying={mode === 'FLYING'}
        airports={airports}
        onAirportClick={handleAirportSelect}
      />

      {mode === 'IDLE' && (
        <SidePanel 
          airports={airports}
          selectedFrom={context.from}
          selectedTo={context.to}
          onSetFrom={(ap) => setContext(c => ({...c, from: ap}))}
          onSetTo={(ap) => setContext(c => ({...c, to: ap}))}
          onStartBoarding={handleStartBoarding}
        />
      )}

      {mode === 'BOARDING' && (
        <SeatSelector 
          from={context.from!} 
          to={context.to!} 
          onCancel={() => setMode('IDLE')}
          onConfirm={startFlight}
          onSeatSelect={(s) => setContext(c => ({...c, seat: s}))}
          selectedSeat={context.seat}
        />
      )}

      {mode === 'FLYING' && (
        <FlightOverlay 
          context={context} 
          pomodoro={pomodoro}
          pomodoroSeconds={pomodoroSeconds < 0 ? 0 : pomodoroSeconds}
          remainingFlightSeconds={remainingFlightSeconds}
          onAbort={terminateFlight}
        />
      )}

      {showNotification && (
        <Notification message="SNACK TIME - UNFASTEN UR SEATS" />
      )}
    </div>
  );
};

export default App;
