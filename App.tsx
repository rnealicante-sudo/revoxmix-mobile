
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PlayerState, RadioStation, StereoAnalysers, FavoriteStation } from './types';
import { STATIONS } from './constants';
import AudioEngine, { AudioEngineHandle } from './components/AudioEngine';
import { favoritesService } from './services/favoritesService';
import { Star, Heart, Settings, Clock, RefreshCw, Play, Pause, Square, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DigitalVUMeter: React.FC<{ analysers: StereoAnalysers | null; isPlaying: boolean }> = ({ analysers, isPlaying }) => {
  const [levels, setLevels] = useState({ left: 0, right: 0 });
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!analysers || !isPlaying) {
      setLevels({ left: 0, right: 0 });
      return;
    }

    const dataArrayL = new Uint8Array(analysers.left.frequencyBinCount);
    const dataArrayR = new Uint8Array(analysers.right.frequencyBinCount);

    const update = () => {
      analysers.left.getByteFrequencyData(dataArrayL);
      analysers.right.getByteFrequencyData(dataArrayR);
      
      let leftSum = 0;
      let rightSum = 0;
      
      for (let i = 0; i < dataArrayL.length; i++) leftSum += dataArrayL[i];
      for (let i = 0; i < dataArrayR.length; i++) rightSum += dataArrayR[i];
      
      const leftLevel = (leftSum / dataArrayL.length) / 255;
      const rightLevel = (rightSum / dataArrayR.length) / 255;
      
      setLevels({ 
        left: Math.min(1, leftLevel * 2.5), 
        right: Math.min(1, rightLevel * 2.5) 
      });
      animationRef.current = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationRef.current);
  }, [analysers, isPlaying]);

  const renderBar = (level: number) => {
    const segments = 32;
    return (
      <div className="flex gap-[1px] h-2.5 w-full bg-[#020617] p-[1px] border border-slate-900/50 rounded-sm overflow-hidden">
        {Array.from({ length: segments }).map((_, i) => {
          const isActive = (i / segments) < level;
          let colorClass = "bg-[#050a1f]";
          if (isActive) {
            if (i > segments * 0.85) colorClass = "bg-red-500 shadow-[0_0_8px_#ef4444]";
            else if (i > segments * 0.6) colorClass = "bg-yellow-400 shadow-[0_0_8px_#facc15]";
            else colorClass = "bg-emerald-500 shadow-[0_0_8px_#10b981]";
          }
          return <div key={i} className={`flex-1 h-full transition-colors duration-75 ${colorClass}`} />;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-1.5">
        <span className="text-[7px] font-mono text-gray-600 font-bold w-3">L</span>
        {renderBar(levels.left)}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[7px] font-mono text-gray-600 font-bold w-3">R</span>
        {renderBar(levels.right)}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentStation, setCurrentStation] = useState<RadioStation>(STATIONS[0]);
  const [selectedUrl, setSelectedUrl] = useState<string>(STATIONS[0].url);
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.IDLE);
  const [volume, setVolume] = useState(0.8);
  const [isDragging, setIsDragging] = useState(false);
  const [analysers, setAnalysers] = useState<StereoAnalysers | null>(null);
  
  // Favorites State
  const [favorites, setFavorites] = useState<FavoriteStation[]>(favoritesService.getFavorites());
  const [showFavorites, setShowFavorites] = useState(false);
  const [editingStation, setEditingStation] = useState<FavoriteStation | null>(null);

  // Sleep Timer State
  const [sleepTimer, setSleepTimer] = useState<number | null>(null); // minutes remaining
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const sleepTimerIntervalRef = useRef<number | null>(null);

  const audioEngineRef = useRef<AudioEngineHandle>(null);

  useEffect(() => {
    if (sleepTimer !== null && sleepTimer > 0) {
      sleepTimerIntervalRef.current = window.setInterval(() => {
        setSleepTimer(prev => {
          if (prev === null || prev <= 1) {
            if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
            audioEngineRef.current?.pause();
            return null;
          }
          return prev - 1;
        });
      }, 60000);
    } else {
      if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
    }
    return () => {
      if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
    };
  }, [sleepTimer]);

  const toggleFavorite = (station: RadioStation) => {
    if (favoritesService.isFavorite(station.id)) {
      favoritesService.removeFavorite(station.id);
    } else {
      favoritesService.addFavorite(station);
    }
    setFavorites(favoritesService.getFavorites());
  };

  const handleUpdateFavorite = (id: string, updates: Partial<FavoriteStation>) => {
    favoritesService.updateFavorite(id, updates);
    setFavorites(favoritesService.getFavorites());
    setEditingStation(null);
  };

  const handleStationClick = (station: RadioStation) => {
    setCurrentStation(station);
    const defaultUrl = station.qualities && station.qualities.length > 0 
      ? station.qualities[0].url 
      : station.url;
    
    setSelectedUrl(defaultUrl);
    setTimeout(() => {
      audioEngineRef.current?.play();
    }, 100);
  };

  const handleQualityChange = (url: string) => {
    if (url === selectedUrl) return;
    setSelectedUrl(url);
    setTimeout(() => {
      audioEngineRef.current?.play();
    }, 100);
  };

  const handleTogglePlay = useCallback(() => {
    audioEngineRef.current?.toggle();
  }, []);

  const isPlaying = playerState === PlayerState.PLAYING;
  const isLoading = playerState === PlayerState.LOADING;

  const currentQuality = currentStation.qualities?.find(q => q.url === selectedUrl);
  const currentBitrate = currentQuality?.bitrate || currentStation.bitrate || '128kbps';

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#334155] overflow-hidden select-none">
      <div className="safe-top bg-[#1e293b]"></div>

      <div className="p-2 space-y-2 max-w-md mx-auto w-full flex-1 flex flex-col overflow-hidden">
        {/* MASTER RACK WINDOW */}
        <div className="winamp-window flex flex-col shrink-0">
          <div className="winamp-title-bar flex justify-between">
             <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rotate-45"></div>
                <span className="truncate tracking-widest uppercase">REVOXMIX v5.8 - COMPACT MASTER</span>
             </div>
             <div className="flex gap-2">
                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest font-mono">CH-{(STATIONS.findIndex(s => s.id === currentStation.id) + 1).toString().padStart(2, '0')}</span>
                <div className="w-2.5 h-2.5 bg-[#ccc] border border-black/20"></div>
             </div>
          </div>

          <div className="p-2 space-y-2">
            {/* LCD PANEL - COMPACT VERSION */}
            <div className="winamp-lcd p-3 flex flex-col relative h-[185px] overflow-hidden bg-[#020617] border-2 border-slate-800 rounded-sm shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]">
               
               {/* 1. VU METER AT THE VERY TOP */}
               <div className="mb-3 bg-black/20 p-1.5 border border-slate-900/50 rounded-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[6px] text-gray-700 font-bold uppercase tracking-[0.3em]">Stereo Signal Monitor</span>
                    <div className="flex items-center gap-1.5">
                       <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#00ff00] shadow-[0_0_5px_#00ff00]' : 'bg-gray-800'}`}></div>
                       <span className="text-[6px] text-[#00ff00]/40 font-mono">PEAK-LVL</span>
                    </div>
                  </div>
                  <DigitalVUMeter analysers={analysers} isPlaying={isPlaying} />
               </div>

               {/* 2. MAIN STATION INFO */}
               <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="mb-0.5 text-[6px] text-gray-700 font-bold uppercase tracking-widest opacity-60">Receiving:</div>
                      <h1 className="text-3xl font-bold tracking-tighter text-[#00ff00] truncate font-mono uppercase leading-tight mb-2 drop-shadow-[0_0_6px_rgba(0,255,0,0.4)]">
                        {currentStation.name}
                      </h1>
                    </div>
                    <button 
                      onClick={() => toggleFavorite(currentStation)}
                      className={`mt-1 p-1.5 rounded-sm border ${favoritesService.isFavorite(currentStation.id) ? 'bg-[#00ff00]/10 border-[#00ff00] text-[#00ff00]' : 'border-gray-800 text-gray-700'}`}
                    >
                      <Star size={14} fill={favoritesService.isFavorite(currentStation.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  
                  {/* TECHNICAL INFO GRID */}
                  <div className="grid grid-cols-2 gap-2 border-t border-gray-900 pt-2 mb-2">
                    <div className="flex flex-col">
                      <span className="text-[6px] text-gray-700 font-bold uppercase tracking-widest mb-0.5">Bitrate/Codec</span>
                      <div className="flex items-center gap-1.5">
                         <span className="text-[8px] text-[#ffff00] font-mono">{selectedUrl.includes('m3u8') ? 'HLS' : 'PCM'}</span>
                         <span className="text-[8px] text-[#00ff00] font-mono">{currentBitrate.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[6px] text-gray-700 font-bold uppercase tracking-widest mb-0.5">Stream Quality</span>
                      {currentStation.qualities && currentStation.qualities.length > 1 ? (
                        <select 
                          value={selectedUrl}
                          onChange={(e) => handleQualityChange(e.target.value)}
                          className="bg-black border border-[#003300] text-[#00ff00] text-[8px] font-mono outline-none py-0 px-1 uppercase"
                        >
                          {currentStation.qualities.map((q) => (
                            <option key={q.url} value={q.url}>{q.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[8px] text-gray-600 font-mono uppercase">Standard</span>
                      )}
                    </div>
                  </div>

                  {/* 3. DESCRIPTION AT THE BOTTOM */}
                  <div className="mt-auto pt-2 border-t border-gray-900 opacity-60">
                    <p className="text-[9px] text-[#00ff00] font-mono leading-none italic uppercase truncate">
                      {currentStation.description}
                    </p>
                  </div>
               </div>

               {/* LOADING OVERLAY */}
               {isLoading && (
                 <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-20">
                    <div className="w-8 h-8 border-[2px] border-t-[#00ff00] border-gray-900 rounded-full animate-spin mb-3 shadow-[0_0_10px_rgba(0,255,0,0.2)]"></div>
                    <span className="text-[8px] font-mono tracking-[0.4em] text-[#00ff00] animate-pulse uppercase">Syncing Stream...</span>
                 </div>
               )}
            </div>

            {/* MARQUEE STATUS */}
            <div className="bg-[#1e293b] border border-slate-600 h-5 flex items-center px-2 overflow-hidden rounded-sm">
               <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] text-[9px] text-[#00ff00] font-mono uppercase tracking-[0.2em] opacity-80">
                  {currentStation.name} • {currentBitrate} • {currentStation.description} • HI-FIDELITY AUDIO FLOW • 
               </div>
            </div>

            {/* FADER CONTROLS */}
            <div className="flex flex-col gap-2 bg-[#334155] p-2 rounded-sm border border-slate-600 shadow-inner">
               <div className="flex items-center gap-3">
                  <div className="flex flex-col flex-1 gap-1">
                     <div className="flex justify-between text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                        <span>Main Gain</span>
                        <span className="text-[#00ff00] font-mono">{(volume * 100).toFixed(0)}%</span>
                     </div>
                     <input 
                       type="range" 
                       min="0" max="1" step="0.01" 
                       value={volume} 
                       onChange={(e) => setVolume(parseFloat(e.target.value))}
                       onMouseDown={() => setIsDragging(true)}
                       onMouseUp={() => setIsDragging(false)}
                       onTouchStart={() => setIsDragging(true)}
                       onTouchEnd={() => setIsDragging(false)}
                       className="winamp-slider w-full"
                     />
                  </div>
                  <button onClick={() => window.location.reload()} className="winamp-btn w-10 h-8 flex items-center justify-center text-[#00ff00] transition-colors hover:bg-black/20">
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  </button>
               </div>
               
               <div className="flex gap-1">
                  <button 
                    onClick={() => setShowFavorites(!showFavorites)} 
                    className={`winamp-btn flex-1 py-1.5 text-[8px] font-bold flex items-center justify-center gap-1.5 transition-all ${showFavorites ? 'bg-[#000080] text-[#00ff00] border-[#00ff00]' : ''}`}
                  >
                    <Heart size={10} fill={showFavorites ? "currentColor" : "none"} />
                    {showFavorites ? 'ALL STATIONS' : 'FAVORITES'}
                  </button>
                  <button 
                    onClick={() => setShowSleepTimerModal(true)} 
                    className={`winamp-btn flex-1 py-1.5 text-[8px] font-bold flex items-center justify-center gap-1.5 transition-all ${sleepTimer ? 'text-[#ffff00] border-[#ffff00]' : ''}`}
                  >
                    <Clock size={10} />
                    TIMER {sleepTimer ? `(${sleepTimer}m)` : ''}
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* PLAYLIST REPOSITORY */}
        <div className="winamp-window flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="winamp-title-bar flex justify-between items-center">
            <span>{showFavorites ? 'FAVORITE CHANNELS' : 'AVAILABLE CHANNELS REPOSITORY'}</span>
            {showFavorites && <span className="text-[7px] opacity-50">TAP TO EDIT</span>}
          </div>
          <div className="flex-1 overflow-y-auto p-1 hide-scrollbar bg-[#1e293b]">
             <div className="flex flex-col gap-[1px]">
                {(showFavorites ? favorites : STATIONS).map((station, index) => {
                  const isActive = currentStation.id === station.id;
                  const isFav = favoritesService.isFavorite(station.id);
                  const favData = favorites.find(f => f.id === station.id);
                  const displayName = favData?.customName || station.name;
                  
                  return (
                    <div 
                      key={station.id}
                      className={`flex items-center h-11 cursor-pointer border-y px-3 gap-3 transition-all ${
                        isActive 
                          ? 'bg-[#000080] border-[#00ff00] text-[#00ff00] z-10 shadow-[inset_0_0_10px_rgba(0,255,0,0.1)]' 
                          : `bg-[#334155] border-transparent hover:bg-[#475569] text-slate-200`
                      }`}
                    >
                      <span 
                        onClick={() => handleStationClick(station)}
                        className={`text-[10px] font-mono w-5 ${isActive ? 'opacity-100 font-bold' : 'opacity-50'}`}
                      >
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <div 
                        onClick={() => handleStationClick(station)}
                        className="flex-1 flex flex-col justify-center overflow-hidden"
                      >
                        <div className="flex justify-between items-center mr-2">
                          <span className="text-xs font-bold truncate tracking-wide uppercase font-mono">
                            {displayName}
                            {favData?.category && <span className="ml-2 text-[7px] text-[#ffff00] opacity-60">[{favData.category}]</span>}
                          </span>
                        </div>
                        <span className={`text-[8px] truncate italic uppercase opacity-40`}>
                          {station.description}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {showFavorites && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingStation(favData || null); }}
                            className="p-1 text-gray-500 hover:text-white transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(station); }}
                          className={`p-1.5 rounded-sm transition-all ${isFav ? 'text-yellow-400' : 'text-gray-700 opacity-30 hover:opacity-100'}`}
                        >
                          <Star size={16} fill={isFav ? "currentColor" : "none"} />
                        </button>
                      </div>

                      {isActive && isPlaying && (
                        <div className="flex gap-[1.5px] items-end h-3 pr-1">
                          <div className="w-1 bg-[#00ff00] h-full animate-[bounce_0.4s_infinite]"></div>
                          <div className="w-1 bg-[#00ff00] h-2/3 animate-[bounce_0.6s_infinite]"></div>
                          <div className="w-1 bg-[#00ff00] h-full animate-[bounce_0.3s_infinite]"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {showFavorites && favorites.length === 0 && (
                  <div className="p-8 text-center text-[10px] text-gray-600 uppercase font-mono tracking-widest">
                    No favorites saved yet
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* MASTER TRANSPORT BAR */}
        <div className="winamp-window p-2 flex justify-between items-center safe-bottom shrink-0">
           <div className="flex gap-1.5">
              <button 
                onClick={handleTogglePlay} 
                className={`winamp-btn px-8 py-2 font-bold text-[10px] flex items-center gap-2 transition-all ${isPlaying ? 'bg-[#004400] text-[#00ff00] border-[#00ff00]' : 'border-gray-500'}`}
              >
                 {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                 {isPlaying ? 'PAUSE' : 'PLAY'}
              </button>
              <button 
                onClick={() => audioEngineRef.current?.pause()} 
                className="winamp-btn px-4 py-2 text-[10px] flex items-center gap-2 border-gray-500 hover:bg-red-900/20 transition-colors"
              >
                <Square size={12} fill="currentColor" />
                STOP
              </button>
           </div>
           <div className="flex flex-col items-end leading-none">
              <span className="text-[6px] text-gray-500 font-bold uppercase tracking-tighter">Logic</span>
              <div className="text-[9px] text-[#00ff00] font-bold font-mono tracking-widest">32-BIT</div>
           </div>
        </div>
      </div>

      <AudioEngine
        ref={audioEngineRef}
        url={selectedUrl}
        volume={volume}
        isMuted={false}
        onStateChange={setPlayerState}
        onAnalyserCreated={setAnalysers}
      />

      {/* SLEEP TIMER MODAL */}
      {showSleepTimerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="winamp-window w-full max-w-xs p-4 space-y-4">
            <div className="winamp-title-bar flex justify-between">
              <span>SLEEP TIMER CONFIG</span>
              <button onClick={() => setShowSleepTimerModal(false)} className="text-[8px]">X</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[15, 30, 45, 60, 90, 120].map(mins => (
                <button 
                  key={mins}
                  onClick={() => { setSleepTimer(mins); setShowSleepTimerModal(false); }}
                  className="winamp-btn py-2 text-[10px] font-bold"
                >
                  {mins} MINS
                </button>
              ))}
            </div>
            <button 
              onClick={() => { setSleepTimer(null); setShowSleepTimerModal(false); }}
              className="winamp-btn w-full py-2 text-[10px] font-bold text-red-400"
            >
              DISABLE TIMER
            </button>
          </div>
        </div>
      )}

      {/* EDIT FAVORITE MODAL */}
      {editingStation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="winamp-window w-full max-w-xs p-4 space-y-4">
            <div className="winamp-title-bar flex justify-between">
              <span>EDIT FAVORITE</span>
              <button onClick={() => setEditingStation(null)} className="text-[8px]">X</button>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-gray-500 uppercase font-bold">Custom Name</label>
                <input 
                  type="text" 
                  defaultValue={editingStation.customName || editingStation.name}
                  onBlur={(e) => handleUpdateFavorite(editingStation.id, { customName: e.target.value })}
                  className="bg-black border border-gray-700 text-[#00ff00] text-xs p-2 outline-none font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-gray-500 uppercase font-bold">Category</label>
                <input 
                  type="text" 
                  defaultValue={editingStation.category || ''}
                  placeholder="e.g. News, Music..."
                  onBlur={(e) => handleUpdateFavorite(editingStation.id, { category: e.target.value })}
                  className="bg-black border border-gray-700 text-[#00ff00] text-xs p-2 outline-none font-mono"
                />
              </div>
            </div>
            <button 
              onClick={() => setEditingStation(null)}
              className="winamp-btn w-full py-2 text-[10px] font-bold"
            >
              DONE
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-200%); } }
        @keyframes bounce { 0%, 100% { height: 3px; } 50% { height: 10px; } }
        input[type=range]::-webkit-slider-runnable-track { cursor: pointer; }
        select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
      `}</style>
    </div>
  );
};

export default App;
