import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { weddingConfigService } from '../services/weddingConfigService';

interface AudioPlayerProps {
  autoPlayTriggered?: boolean;
}

// Parse input URL to support YouTube, Google Drive, and direct MP3 links
function parseAudioSource(rawUrl: string): { type: 'youtube' | 'direct'; url: string; videoId?: string } {
  if (!rawUrl) return { type: 'direct', url: '' };

  const trimmed = rawUrl.trim();

  // 1. Google Drive link detection
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'direct',
      url: `https://docs.google.com/uc?export=download&id=${driveMatch[1]}`
    };
  }

  // 2. YouTube link detection (watch?v=, youtu.be/, embed/, Shorts)
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      url: trimmed,
      videoId: ytMatch[1]
    };
  }

  // 3. Direct audio URL (MP3, WAV, OGG, etc.)
  return { type: 'direct', url: trimmed };
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ autoPlayTriggered }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioConfig, setAudioConfig] = useState(weddingConfigService.getConfig().audio);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  const parsedSource = parseAudioSource(audioConfig.url);

  // Subscribe to config changes
  useEffect(() => {
    const unsub = weddingConfigService.subscribe(() => {
      const next = weddingConfigService.getConfig().audio;
      setAudioConfig(next);
    });
    return unsub;
  }, []);

  // HTML5 Audio setup for direct links
  useEffect(() => {
    if (parsedSource.type === 'direct' && parsedSource.url) {
      const audio = new Audio(parsedSource.url);
      audio.loop = audioConfig.loop;
      audioRef.current = audio;

      return () => {
        audio.pause();
        audioRef.current = null;
      };
    }
  }, [parsedSource.type, parsedSource.url, audioConfig.loop]);

  // Ambient synth fallback (in case audio source fails or blocked by browser)
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

  const postYouTubeCommand = (command: 'playVideo' | 'pauseVideo') => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: '' }),
        '*'
      );
    }
  };

  const playMusic = () => {
    if (parsedSource.type === 'youtube' && parsedSource.videoId) {
      postYouTubeCommand('playVideo');
      setIsPlaying(true);
    } else if (audioRef.current && parsedSource.url) {
      audioRef.current.loop = audioConfig.loop;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Fallback to synth if direct audio play fails
        startRomanticSynth();
        setIsPlaying(true);
      });
    } else {
      startRomanticSynth();
      setIsPlaying(true);
    }
  };

  const stopMusic = () => {
    if (parsedSource.type === 'youtube') {
      postYouTubeCommand('pauseVideo');
    }
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
      {/* Hidden YouTube Iframe Audio Engine (No video shown, audio only) */}
      {parsedSource.type === 'youtube' && parsedSource.videoId && (
        <iframe
          ref={iframeRef}
          id="yt-audio-engine"
          src={`https://www.youtube-nocookie.com/embed/${parsedSource.videoId}?enablejsapi=1&autoplay=1&loop=${audioConfig.loop ? 1 : 0}&playlist=${parsedSource.videoId}&controls=0`}
          allow="autoplay"
          title="Background Audio Engine"
          className="sr-only opacity-0 pointer-events-none w-0 h-0 border-0 fixed -top-[9999px]"
        />
      )}

      <button
        onClick={toggleMusic}
        id="btn-toggle-music"
        className="group relative flex items-center gap-3 px-4 py-2.5 rounded-full backdrop-blur-xl bg-[var(--color-bg-overlay)] border border-[var(--color-border-soft)] hover:bg-[var(--color-gold)]/20 transition-all duration-300 shadow-2xl text-white cursor-pointer hover:scale-105 active:scale-95"
        title={isPlaying ? "Silenciar música de fondo" : "Activar música de fondo"}
      >
        <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/40 text-[var(--color-gold-light)]">
          {isPlaying ? (
            <Volume2 className="w-3.5 h-3.5 text-[var(--color-gold-light)] animate-pulse" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-white/70" />
          )}
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold text-[var(--color-gold-light)]">
            {isPlaying ? (audioConfig.loop ? "Bucle Activo • On Air" : "Reproduciendo") : "Música"}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 max-w-[160px] truncate">
            <Music className="w-3 h-3 text-[var(--color-gold-light)] shrink-0" />
            {audioConfig.title || "Perfect - Ed Sheeran"}
          </span>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-0.5 h-3 ml-1">
            <span className="w-0.5 h-full bg-[var(--color-gold-light)] animate-bounce rounded-full" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 h-3/4 bg-[var(--color-gold-light)] animate-bounce rounded-full" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 h-full bg-[var(--color-gold-light)] animate-bounce rounded-full" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </button>
    </div>
  );
};
