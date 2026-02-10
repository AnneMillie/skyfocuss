import React, { useState, useEffect, useRef } from 'react';
import { Airport, SnackPreference } from '../types';

interface SeatSelectorProps {
  from: Airport;
  to: Airport;
  selectedSeat: string | null;
  onSeatSelect: (seat: string) => void;
  onConfirm: (pref: SnackPreference) => void;
  onCancel: () => void;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({ from, to, selectedSeat, onSeatSelect, onConfirm, onCancel }) => {
  const [cursor, setCursor] = useState({ row: 0, col: 0 }); 
  const [activePreference, setActivePreference] = useState<'SNACKS' | 'NO_SNACKS' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seatsRef = useRef<(HTMLDivElement | null)[][]>([]);

  useEffect(() => {
    seatsRef.current = Array.from({ length: 12 }, () => Array(4).fill(null));
  }, []);

  const cols = ['A', 'B', 'C', 'D'];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (activePreference) {
      if (e.key === 'ArrowLeft') setActivePreference('SNACKS');
      if (e.key === 'ArrowRight') setActivePreference('NO_SNACKS');
      if (e.key === 'Enter') onConfirm(activePreference);
      if (e.key === 'Escape') {
        setActivePreference(null);
        onSeatSelect('');
      }
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setCursor(prev => ({ ...prev, row: Math.max(0, prev.row - 1) }));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setCursor(prev => ({ ...prev, row: Math.min(11, prev.row + 1) }));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setCursor(prev => ({ ...prev, col: Math.min(3, prev.col + 1) }));
        break;
      case 'Enter':
        e.preventDefault();
        const seatId = `${cursor.row + 1}${cols[cursor.col]}`;
        const isTaken = (cursor.row + cols[cursor.col].charCodeAt(0)) % 7 === 0;
        if (!isTaken) {
          onSeatSelect(seatId);
          setActivePreference('SNACKS');
        }
        break;
      case 'Escape':
        onCancel();
        break;
    }
  };

  useEffect(() => {
    const target = seatsRef.current[cursor.row]?.[cursor.col];
    if (target && scrollRef.current) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [cursor]);

  return (
    <div 
      className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-2xl flex flex-col items-center outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      autoFocus
    >
      <div className="w-full flex justify-between items-center px-12 py-8 z-10">
        <div className="flex flex-col">
          <div className="text-yellow-400 font-black text-6xl tracking-tighter drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]">
            {from.iata} <span className="opacity-20">→</span> {to.iata}
          </div>
          <div className="text-yellow-400/50 font-bold uppercase tracking-[0.4em] text-[0.6rem] mt-2">
            Cabin Configuration: 2-2 • Select Seat to Board
          </div>
        </div>
        <button onClick={onCancel} className="text-yellow-400/30 hover:text-yellow-400 transition-all hover:scale-110 p-4">
          <i className="fa-solid fa-xmark text-4xl"></i>
        </button>
      </div>

      <div className="airplane-scroll-container w-full" ref={scrollRef}>
        <div className="airplane-silhouette">
          <div className="plane-nose flex items-center justify-center">
            <div className="w-48 h-10 bg-black/40 rounded-full border border-yellow-400/20 flex gap-6 p-2">
               <div className="flex-1 bg-yellow-400/10 rounded-full shadow-inner"></div>
               <div className="flex-1 bg-yellow-400/10 rounded-full shadow-inner"></div>
            </div>
          </div>

          <div className="cabin-section py-12">
            <div className="grid grid-cols-4 gap-6 max-w-[280px] mx-auto">
              {cols.map(l => (
                <div key={l} className="text-center text-yellow-400/30 font-black mb-3 text-sm">{l}</div>
              ))}
              
              {Array.from({length: 12}).map((_, row) => (
                cols.map((col, colIdx) => {
                  const id = `${row + 1}${col}`;
                  const isSelected = selectedSeat === id;
                  const isCursor = cursor.row === row && cursor.col === colIdx;
                  const isTaken = (row + col.charCodeAt(0)) % 7 === 0;

                  return (
                    <div 
                      key={id}
                      ref={el => { if (seatsRef.current[row]) seatsRef.current[row][colIdx] = el; }}
                      className={`h-14 rounded-xl flex items-center justify-center cursor-pointer transition-all border-2 relative text-sm
                        ${isTaken ? 'bg-black/40 border-yellow-400/5 text-yellow-400/5 cursor-not-allowed opacity-20' : ''}
                        ${isSelected 
                          ? 'bg-yellow-400 text-black border-white shadow-[0_0_30px_rgba(251,191,36,0.8)] font-black scale-110 z-10' 
                          : 'bg-yellow-400/5 border-yellow-400/10 text-yellow-400/40 hover:bg-yellow-400/10'}
                        ${isCursor && !isSelected ? 'ring-2 ring-yellow-400 ring-offset-4 ring-offset-black' : ''}
                      `}
                      onClick={() => !isTaken && onSeatSelect(id)}
                    >
                      {isTaken ? <i className="fa-solid fa-lock text-[10px]"></i> : id}
                    </div>
                  );
                })
              ))}
            </div>
          </div>
          <div className="plane-tail"></div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black via-black/95 to-transparent flex flex-col items-center justify-center pb-12 px-8 text-center">
        {!selectedSeat ? (
          <div className="text-yellow-400/40 font-black tracking-[0.5em] text-[0.8rem] uppercase animate-pulse">
            Awaiting Seat Assignment
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="text-yellow-400/80 font-black tracking-[0.2em] text-[0.7rem] uppercase">
              SEAT <span className="text-yellow-400 text-4xl ml-3 tracking-tighter drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">{selectedSeat}</span> RESERVED. 
              <br/>CHOOSE YOUR FOCUS STRATEGY:
            </div>
            
            <div className="flex gap-6">
              <button 
                onClick={() => onConfirm('SNACKS')}
                onMouseEnter={() => setActivePreference('SNACKS')}
                className={`px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-2
                  ${activePreference === 'SNACKS' 
                    ? 'bg-yellow-400 text-black border-white shadow-[0_0_40px_rgba(251,191,36,0.7)] scale-105' 
                    : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30 opacity-50'}`}
              >
                <i className="fa-solid fa-cookie-bite mr-3"></i> SNACKS (POMODORO)
              </button>
              
              <button 
                onClick={() => onConfirm('NO_SNACKS')}
                onMouseEnter={() => setActivePreference('NO_SNACKS')}
                className={`px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-2
                  ${activePreference === 'NO_SNACKS' 
                    ? 'bg-yellow-400 text-black border-white shadow-[0_0_40px_rgba(251,191,36,0.7)] scale-105' 
                    : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30 opacity-50'}`}
              >
                <i className="fa-solid fa-ban mr-3"></i> NO SNACKS (RAW FOCUS)
              </button>
            </div>
            <div className="text-yellow-400/20 text-[0.6rem] font-bold tracking-[0.3em] uppercase">
               [Arrows to choose • Enter to start flight]
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelector;