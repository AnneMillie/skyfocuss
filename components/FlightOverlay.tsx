
import React from 'react';
import { FlightContext, PomodoroState } from '../types';

interface FlightOverlayProps {
  context: FlightContext;
  pomodoro: PomodoroState;
  pomodoroSeconds: number;
  remainingFlightSeconds: number;
  onAbort: () => void;
}

const FlightOverlay: React.FC<FlightOverlayProps> = ({ 
  context, 
  pomodoro, 
  pomodoroSeconds, 
  remainingFlightSeconds, 
  onAbort 
}) => {
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-x-0 bottom-8 z-[1500] pointer-events-none flex flex-col items-center gap-3 px-4">
      
      {/* 1. FOCUS TIMER (COMPACT) */}
      <div className="glass-yellow border border-yellow-400/30 rounded-full px-4 py-1.5 pointer-events-auto shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(251,191,36,0.1)] flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in scale-90">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${pomodoro === 'WORK' ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
          <div className="text-[0.5rem] text-yellow-400/60 tracking-[0.2em] font-black uppercase">
            {pomodoro === 'WORK' ? 'FOCUS' : 'BREAK'}
          </div>
        </div>
        <div className="w-px h-3 bg-yellow-400/20"></div>
        <div className="text-sm font-black text-yellow-400 tabular-nums">
          {formatTime(pomodoroSeconds)}
        </div>
      </div>

      {/* 2. TOTAL FLIGHT TIMER (COMPACT) */}
      <div className="glass-yellow border border-yellow-400/40 rounded-[30px] px-8 py-4 pointer-events-auto flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(251,191,36,0.15)] max-w-sm w-full relative">
        
        <div className="flex gap-4 mb-3 items-center w-full justify-center">
          <div className="text-[0.9rem] font-black text-yellow-400 tracking-tighter">{context.from?.iata}</div>
          <div className="flex-1 flex items-center gap-1 opacity-20">
             <div className="h-px flex-1 bg-yellow-400"></div>
             <i className="fa-solid fa-plane text-[8px] text-yellow-400"></i>
             <div className="h-px flex-1 bg-yellow-400"></div>
          </div>
          <div className="text-[0.9rem] font-black text-yellow-400 tracking-tighter">{context.to?.iata}</div>
        </div>

        <div className="text-center mb-4">
           <div className="text-[0.5rem] text-yellow-400/40 tracking-[0.3em] font-black uppercase mb-1">REMAINING FLIGHT</div>
           <div className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)] tabular-nums tracking-tighter">
             {formatTime(remainingFlightSeconds)}
           </div>
        </div>

        <div className="w-full flex justify-between items-center border-t border-yellow-400/10 pt-3">
          <div className="text-[0.5rem] font-black text-yellow-400/60 uppercase tracking-widest">SEAT {context.seat}</div>
          
          <button 
            onClick={onAbort}
            className="group flex items-center gap-2 text-red-500/80 text-[0.5rem] font-black uppercase tracking-[0.1em] hover:text-red-400 transition-all"
          >
            <i className="fa-solid fa-power-off"></i>
            ABORT
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightOverlay;
