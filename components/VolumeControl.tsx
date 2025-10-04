import React from 'react';
import { VolumeUpIcon, VolumeOffIcon } from './icons';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ volume, isMuted, onVolumeChange, onMuteToggle }) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number(e.target.value));
  };
  
  const Icon = isMuted || volume === 0 ? VolumeOffIcon : VolumeUpIcon;

  return (
    <div className="flex items-center space-x-2 w-32">
      <button onClick={onMuteToggle} className="text-slate-400 hover:text-white transition-colors duration-200" aria-label={isMuted ? 'Unmute' : 'Mute'} title={isMuted ? 'Unmute' : 'Mute'}>
        <Icon className="w-6 h-6"/>
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={isMuted ? 0 : volume}
        onChange={handleVolumeChange}
        className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-sky-400"
        aria-label="Volume"
        title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
      />
    </div>
  );
};

export default VolumeControl;