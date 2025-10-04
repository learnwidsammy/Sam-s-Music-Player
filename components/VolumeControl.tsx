import React, { useState, useRef, useEffect } from 'react';
import { VolumeUpIcon, VolumeOffIcon } from './icons';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ volume, isMuted, onVolumeChange, onMuteToggle }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number(e.target.value));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const Icon = isMuted || volume === 0 ? VolumeOffIcon : VolumeUpIcon;

  return (
    <div className="relative flex items-center" ref={wrapperRef}>
      {isPopupOpen && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-2 flex justify-center items-center h-36 w-12">
           <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
            className="w-2 h-28 appearance-none bg-slate-600 rounded-lg cursor-pointer accent-sky-400"
            aria-label="Volume"
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />
        </div>
      )}
      <button 
        onClick={() => setIsPopupOpen(prev => !prev)} 
        onDoubleClick={onMuteToggle}
        className="text-slate-400 hover:text-white transition-colors duration-200" 
        aria-label={isMuted ? 'Unmute' : 'Mute'} 
        title={isPopupOpen ? "Close Volume" : "Open Volume (Double-click to mute)"}
      >
        <Icon className="w-6 h-6"/>
      </button>
    </div>
  );
};

export default VolumeControl;