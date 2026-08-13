import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { weddingConfigService } from '../services/weddingConfigService';

interface AudioPlayerProps {
  autoPlayTriggered?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ autoPlayTriggered }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioConfig, setAudioConfig] = useState(weddingConfigService.getConfig().audio);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const unsub = weddingConfigService.subscribe(() => {
      const next = weddingConfigService.getConfig().audio;
      setAudioConfig(next);
      if (audioRef.current && audioRef.current.src !== next.url) {
        audioRef.current.src = next.url;
        audioRef.current.loop = next.loop;
        if (isPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }
    });
    return unsub;
  }, [isPlaying]);

  // Audio element setup for custom files/links
  useEffect(() => {
    if (typeof window !== 'undefined' && audioConfig.url) {
      const audio = new Audio(audioConfig.url);
      audio.loop = audioConfig.loop;
      audioRef.current = audio;

      return () => {
        audio.pause();
        audioRef.current = null;
      };
    }
  }, []);

  // Ambient synth fallback
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

  const playMusic = () => {
    if (audioRef.current && audioConfig.url) {
      audioRef.current.loop = audioConfig.loop;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Fallback to synth if audio play fails
        startRomanticSynth();
        setIsPlaying(true);
      });
    } else {
      startRomanticSynth();
      setIsPlaying(true);
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopRomanticSynth();
    setIsPlaying(false);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      playMusic();
    }
  };

  useEffect(() => {
    if (autoPlayTriggered && !isPlaying) {
      playMusic();
    }
  }, [autoPlayTriggered]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleMusic}
        id="btn-toggle-music"
        className="group relative flex items-center gap-3 px-4 py-2.5 rounded-full backdrop-blur-xl bg-black/70 border border-white/20 hover:bg-white/10 transition-all duration-300 shadow-2xl text-white cursor-pointer hover:scale-105 active:scale-95"
        title={isPlaying ? "Silenciar música de fondo" : "Activar música de fondo"}
      >
        <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300">
          {isPlaying ? (
            <Volume2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-white/70" />
          )}
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold text-amber-300">
            {isPlaying ? (audioConfig.loop ? "Bucle Activo • On Air" : "Reproduciendo") : "Música"}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 max-w-[160px] truncate">
            <Music className="w-3 h-3 text-amber-400 shrink-0" />
            {audioConfig.title || "Vals Nupcial"}
          </span>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-0.5 h-3 ml-1">
            <span className="w-0.5 h-full bg-amber-400 animate-bounce rounded-full" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 h-3/4 bg-amber-400 animate-bounce rounded-full" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 h-full bg-amber-400 animate-bounce rounded-full" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </button>
    </div>
  );
};
