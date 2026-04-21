import React, { useState, useRef, useEffect } from 'react';
import { Track, TRACKS } from '../constants';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MusicPlayer: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnded = () => {
    nextTrack();
  };

  return (
    <div className="w-full max-w-[400px] glass-panel rounded-3xl p-6 relative overflow-hidden">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnded}
      />
      
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-neon-cyan/10 rounded-full blur-[80px]" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-neon-magenta/10 rounded-full blur-[80px]" />

      <div className="flex items-center gap-6 relative z-10">
        <motion.div
           key={currentTrack.id}
           initial={{ rotate: -10, scale: 0.9, opacity: 0 }}
           animate={{ rotate: 0, scale: 1, opacity: 1 }}
           className="relative group"
        >
          <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/20 neon-glow-magenta">
            <img 
              src={currentTrack.cover} 
              alt={currentTrack.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {isPlaying && (
            <div className="absolute -right-2 -bottom-2 w-8 h-8 bg-black border border-neon-magenta rounded-full flex items-center justify-center animate-spin-slow">
               <Music2 className="w-4 h-4 text-neon-magenta" />
            </div>
          )}
        </motion.div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTrack.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="mb-1"
            >
              <h3 className="text-lg font-bold truncate text-white uppercase tracking-tight">{currentTrack.title}</h3>
              <p className="text-xs text-neon-cyan font-mono uppercase tracking-widest opacity-80">{currentTrack.artist}</p>
            </motion.div>
          </AnimatePresence>
          
          <div className="mt-4 flex items-center gap-3">
            <button onClick={prevTrack} className="text-white/40 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
            </button>
            <button onClick={nextTrack} className="text-white/40 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-neon-magenta to-neon-cyan" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 font-mono text-[9px] text-white/40 uppercase tracking-widest">
           <span>{currentTrack.duration}</span>
           <div className="flex items-center gap-1">
             <Volume2 className="w-2.5 h-2.5" />
             <span>High Def</span>
           </div>
        </div>
      </div>
    </div>
  );
};
