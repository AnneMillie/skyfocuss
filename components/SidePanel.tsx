
import React, { useState, useRef } from 'react';
import { Airport } from '../types';
import { getDistance } from '../utils/geoUtils';

interface SidePanelProps {
  airports: Airport[];
  selectedFrom: Airport | null;
  selectedTo: Airport | null;
  onSetFrom: (ap: Airport | null) => void;
  onSetTo: (ap: Airport | null) => void;
  onStartBoarding: (from: Airport, to: Airport, time: number) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ 
  airports, 
  selectedFrom, 
  selectedTo, 
  onSetFrom, 
  onSetTo, 
  onStartBoarding 
}) => {
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const toInputRef = useRef<HTMLInputElement>(null);

  const search = (q: string) => {
    if (q.length < 2) return [];
    return airports.filter(ap => 
      ap.city.toLowerCase().includes(q.toLowerCase()) || 
      ap.iata.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 5);
  };

  const resultsFrom = search(fromQuery);
  const resultsTo = search(toQuery);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getEstTime = () => {
    if (!selectedFrom || !selectedTo) return 0;
    const dist = getDistance(selectedFrom.lat, selectedFrom.lon, selectedTo.lat, selectedTo.lon);
    return Math.floor((dist / 850) * 3600);
  };

  const estTime = getEstTime();
  const isInvalid = selectedFrom && selectedTo && selectedFrom.iata === selectedTo.iata;

  const handleFromKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (resultsFrom.length > 0 && !selectedFrom) {
        onSetFrom(resultsFrom[0]);
        setFromQuery('');
      }
      toInputRef.current?.focus();
    }
  };

  const handleToKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (resultsTo.length > 0 && !selectedTo) {
        onSetTo(resultsTo[0]);
        setToQuery('');
      } else if (selectedFrom && selectedTo && !isInvalid) {
        onStartBoarding(selectedFrom, selectedTo, estTime);
      }
    }
  };

  const resetAll = () => {
    onSetFrom(null);
    onSetTo(null);
    setFromQuery('');
    setToQuery('');
  };

  return (
    <div className="absolute top-8 left-8 z-[1000] w-80 glass-yellow rounded-3xl p-6 transition-all duration-500">
      <div className="flex justify-between items-start mb-1">
        <h1 className="text-2xl font-black text-yellow-400 tracking-tighter">SKYFOCUS</h1>
        {(selectedFrom || selectedTo || fromQuery || toQuery) && (
          <button 
            onClick={resetAll}
            className="text-yellow-400/40 hover:text-yellow-400 text-[0.6rem] font-bold tracking-widest uppercase transition-all flex items-center gap-1"
          >
            <i className="fa-solid fa-rotate-right"></i> RESET
          </button>
        )}
      </div>
      <p className="text-yellow-400/60 text-[0.6rem] mb-6 tracking-widest uppercase">Search for Destination Airports</p>

      <div className="space-y-4">
        {/* FROM INPUT */}
        <div className="relative group">
          <input 
            className="w-full bg-black/40 border border-yellow-400/20 rounded-xl p-3 pr-10 text-yellow-400 text-xs placeholder-yellow-400/30 outline-none focus:border-yellow-400/60 transition-all focus:ring-1 focus:ring-yellow-400/40"
            placeholder="FROM"
            value={selectedFrom ? `${selectedFrom.city} (${selectedFrom.iata})` : fromQuery}
            onChange={e => { setFromQuery(e.target.value); if(selectedFrom) onSetFrom(null); }}
            onKeyDown={handleFromKeyDown}
          />
          {(selectedFrom || fromQuery) && (
            <button 
              onClick={() => { onSetFrom(null); setFromQuery(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-400/20 hover:text-yellow-400 transition-all p-1"
            >
              <i className="fa-solid fa-circle-xmark"></i>
            </button>
          )}
          {fromQuery && !selectedFrom && resultsFrom.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-md rounded-xl overflow-hidden z-[1010] border border-yellow-400/20 shadow-2xl">
              {resultsFrom.map(ap => (
                <div 
                  key={ap.iata}
                  className="p-3 hover:bg-yellow-400/20 cursor-pointer text-yellow-400 text-xs border-b border-yellow-400/5 last:border-none"
                  onClick={() => { onSetFrom(ap); setFromQuery(''); }}
                >
                  <span className="font-bold">{ap.iata}</span> — {ap.city}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TO INPUT */}
        <div className="relative group">
          <input 
            ref={toInputRef}
            className={`w-full bg-black/40 border rounded-xl p-3 pr-10 text-yellow-400 text-xs placeholder-yellow-400/30 outline-none transition-all focus:ring-1 ${isInvalid ? 'border-red-500/60 focus:border-red-500/80 focus:ring-red-500/40' : 'border-yellow-400/20 focus:border-yellow-400/60 focus:ring-yellow-400/40'}`}
            placeholder="TO"
            value={selectedTo ? `${selectedTo.city} (${selectedTo.iata})` : toQuery}
            onChange={e => { setToQuery(e.target.value); if(selectedTo) onSetTo(null); }}
            onKeyDown={handleToKeyDown}
          />
          {(selectedTo || toQuery) && (
            <button 
              onClick={() => { onSetTo(null); setToQuery(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-400/20 hover:text-yellow-400 transition-all p-1"
            >
              <i className="fa-solid fa-circle-xmark"></i>
            </button>
          )}
          {toQuery && !selectedTo && resultsTo.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-md rounded-xl overflow-hidden z-[1010] border border-yellow-400/20 shadow-2xl">
              {resultsTo.map(ap => (
                <div 
                  key={ap.iata}
                  className="p-3 hover:bg-yellow-400/20 cursor-pointer text-yellow-400 text-xs border-b border-yellow-400/5 last:border-none"
                  onClick={() => { onSetTo(ap); setToQuery(''); }}
                >
                  <span className="font-bold">{ap.iata}</span> — {ap.city}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedFrom && selectedTo && (
           <div className={`rounded-xl p-3 border text-center animate-in fade-in zoom-in-95 duration-300 ${isInvalid ? 'bg-red-500/10 border-red-500/20' : 'bg-black/20 border-yellow-400/10'}`}>
              <div className={`text-[0.5rem] tracking-[0.3em] font-black uppercase mb-1 ${isInvalid ? 'text-red-400' : 'text-yellow-400/40'}`}>
                {isInvalid ? 'Invalid Selection' : 'Estimated Flight Time'}
              </div>
              <div className={`text-xl font-black tabular-nums tracking-tighter ${isInvalid ? 'text-red-500' : 'text-yellow-400'}`}>
                {isInvalid ? 'SAME DESTINATION' : formatTime(estTime)}
              </div>
           </div>
        )}

        <button 
          disabled={!selectedFrom || !selectedTo || isInvalid}
          onClick={() => onStartBoarding(selectedFrom!, selectedTo!, estTime)}
          className="w-full bg-yellow-400 text-black font-black py-4 rounded-xl shadow-[0_0_30px_rgba(251,191,36,0.3)] disabled:opacity-10 disabled:grayscale disabled:shadow-none hover:shadow-[0_0_40px_rgba(251,191,36,0.5)] hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest outline-none"
        >
          START BOARDING
        </button>
      </div>
    </div>
  );
};

export default SidePanel;
