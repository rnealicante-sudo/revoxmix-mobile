
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { PlayerState, StereoAnalysers } from '../types';

declare const Hls: any;

interface AudioEngineProps {
  url: string;
  volume: number;
  isMuted: boolean;
  onStateChange: (state: PlayerState) => void;
  onAnalyserCreated: (analysers: StereoAnalysers | null) => void;
}

export interface AudioEngineHandle {
  play: () => void;
  pause: () => void;
  toggle: () => void;
}

const AudioEngine = forwardRef<AudioEngineHandle, AudioEngineProps>(({
  url,
  volume,
  isMuted,
  onStateChange,
  onAnalyserCreated
}, ref) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const splitterRef = useRef<ChannelSplitterNode | null>(null);
  const analysersRef = useRef<StereoAnalysers | null>(null);

  const initAudioContext = () => {
    if (!audioContextRef.current && audioRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      
      // Create two separate analysers for L and R
      const analyserL = ctx.createAnalyser();
      const analyserR = ctx.createAnalyser();
      analyserL.fftSize = 256;
      analyserR.fftSize = 256;
      
      // Create splitter to extract actual channels
      const splitter = ctx.createChannelSplitter(2);
      const source = ctx.createMediaElementSource(audioRef.current);
      
      // Routing: Source -> Splitter -> Analysers
      source.connect(splitter);
      splitter.connect(analyserL, 0); // Port 0 is Left
      splitter.connect(analyserR, 1); // Port 1 is Right
      
      // Routing: Source -> Destination (so we can still hear it)
      source.connect(ctx.destination);
      
      audioContextRef.current = ctx;
      sourceRef.current = source;
      splitterRef.current = splitter;
      
      const stereoAnalysers = { left: analyserL, right: analyserR };
      analysersRef.current = stereoAnalysers;
      onAnalyserCreated(stereoAnalysers);
    }
    
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  useImperativeHandle(ref, () => ({
    play: () => {
      initAudioContext();
      audioRef.current?.play().catch(e => console.warn("Interaction required for audio:", e));
    },
    pause: () => audioRef.current?.pause(),
    toggle: () => {
      initAudioContext();
      if (audioRef.current?.paused) {
        audioRef.current.play().catch(e => console.warn("Interaction required for audio:", e));
      } else {
        audioRef.current?.pause();
      }
    }
  }));

  useEffect(() => {
    if (!audioRef.current) return;
    onStateChange(PlayerState.LOADING);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    audioRef.current.pause();
    audioRef.current.removeAttribute('src');
    audioRef.current.load();

    const isHls = url.toLowerCase().includes('.m3u8') || url.toLowerCase().includes('master');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false, // Disable low latency for better stability/caching
        maxBufferLength: 60, // Increase buffer length to 60 seconds
        maxMaxBufferLength: 120,
        maxBufferSize: 60 * 1000 * 1000, // 60MB buffer
        backBufferLength: 30,
        liveSyncDurationCount: 5, // Keep 5 segments buffered
        liveMaxLatencyDurationCount: 10,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(audioRef.current);
      hls.on(Hls.Events.ERROR, (_: any, data: any) => {
        if (data.fatal) onStateChange(PlayerState.ERROR);
      });
    } else {
      audioRef.current.src = url;
    }
  }, [url, onStateChange]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  return (
    <audio
      ref={audioRef}
      onPlay={() => onStateChange(PlayerState.PLAYING)}
      onPause={() => onStateChange(PlayerState.PAUSED)}
      onWaiting={() => onStateChange(PlayerState.LOADING)}
      onPlaying={() => onStateChange(PlayerState.PLAYING)}
      onError={() => onStateChange(PlayerState.ERROR)}
      crossOrigin="anonymous"
      preload="auto"
    />
  );
});

AudioEngine.displayName = 'AudioEngine';
export default AudioEngine;
