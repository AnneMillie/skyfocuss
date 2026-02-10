
export function playChime() {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playTone = (freq: number, start: number, duration: number) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(start);
    osc.stop(start + duration);
  };

  // Classical Boeing/Airbus chime (High-Low)
  const now = audioCtx.currentTime;
  playTone(880, now, 0.8); // A5
  playTone(698.46, now + 0.4, 1.2); // F5
}
