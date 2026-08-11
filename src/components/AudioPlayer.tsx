import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

interface AudioPlayerProps {
  autoPlayTriggered?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ autoPlayTriggered }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Soft romantic ambient chord synthesizer (Cmaj7 -> Am7 -> Fmaj7 -> G7)
  const startRomanticSynth = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23]  // G7
    ];

    let chordIdx = 0;

    const playChord = () => {
      if (!ctx || ctx.state === 'closed') return;
      const currentChord = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      currentChord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + i * 0.15;
        const duration = 3.5;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.02, startTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    };

    playChord();
    intervalRef.current = window.setInterval(playChord, 3800);
  };

  const stopRomanticSynth = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      audioCtxRef.current.suspend();
    }
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopRomanticSynth();
      setIsPlaying(false);
    } else {
      startRomanticSynth();
      setIsPlaying(false);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (autoPlayTriggered && !isPlaying) {
      startRomanticSynth();
      setIsPlaying(true);
    }
  }, [autoPlayTriggered]);

  useEffect(() => {
    return () => {
      stopRomanticSynth();
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleMusic}
        id="btn-toggle-music"
        className="group relative flex items-center gap-3 px-4 py-2.5 rounded-full backdrop-blur-xl bg-black/60 border border-white/20 hover:bg-white/10 transition-all duration-300 shadow-2xl text-white cursor-pointer hover:scale-105 active:scale-95"
        title={isPlaying ? "Silenciar música de fondo" : "Activar música de fondo"}
      >
        <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-300">
          {isPlaying ? (
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-white/70" />
          )}
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold text-orange-300">
            {isPlaying ? "On Air" : "Música"}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Music className="w-3 h-3 text-orange-400" />
            Vivaldi & Canon Ambient
          </span>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-0.5 h-3 ml-1">
            <span className="w-0.5 h-full bg-orange-400 animate-bounce rounded-full" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 h-3/4 bg-orange-400 animate-bounce rounded-full" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 h-full bg-orange-400 animate-bounce rounded-full" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </button>
    </div>
  );
};
