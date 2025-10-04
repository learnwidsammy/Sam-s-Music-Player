import React from 'react';
import { CloseIcon } from './icons';

interface AudioEffectsProps {
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  bass: number;
  onBassChange: (gain: number) => void;
  lowMid: number;
  onLowMidChange: (gain: number) => void;
  mid: number;
  onMidChange: (gain: number) => void;
  highMid: number;
  onHighMidChange: (gain: number) => void;
  treble: number;
  onTrebleChange: (gain: number) => void;
  isDisabled: boolean;
  onClose: () => void;
}

const AudioEffects: React.FC<AudioEffectsProps> = ({
  playbackRate,
  onPlaybackRateChange,
  bass,
  onBassChange,
  lowMid,
  onLowMidChange,
  mid,
  onMidChange,
  highMid,
  onHighMidChange,
  treble,
  onTrebleChange,
  isDisabled,
  onClose,
}) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-sm flex flex-col p-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Audio Effects</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <div className="space-y-3">
          {/* Playback Speed */}
          <div className="flex flex-col">
            <label htmlFor="playbackRate" className="text-sm text-slate-300 mb-1">
              Speed: {playbackRate.toFixed(2)}x
            </label>
            <input
              id="playbackRate"
              type="range"
              min="0.5"
              max="2"
              step="0.05"
              value={playbackRate}
              onChange={(e) => onPlaybackRateChange(Number(e.target.value))}
              disabled={isDisabled}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-50"
            />
          </div>
          {/* Bass */}
          <div className="flex flex-col">
            <label htmlFor="bass" className="text-sm text-slate-300 mb-1">
              Bass: {bass > 0 ? '+' : ''}{bass.toFixed(1)} dB
            </label>
            <input
              id="bass"
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={bass}
              onChange={(e) => onBassChange(Number(e.target.value))}
              disabled={isDisabled}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-50"
            />
          </div>
           {/* Low-Mid */}
          <div className="flex flex-col">
            <label htmlFor="lowMid" className="text-sm text-slate-300 mb-1">
              Low-Mid: {lowMid > 0 ? '+' : ''}{lowMid.toFixed(1)} dB
            </label>
            <input
              id="lowMid"
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={lowMid}
              onChange={(e) => onLowMidChange(Number(e.target.value))}
              disabled={isDisabled}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-50"
            />
          </div>
           {/* Mid */}
           <div className="flex flex-col">
            <label htmlFor="mid" className="text-sm text-slate-300 mb-1">
              Mid: {mid > 0 ? '+' : ''}{mid.toFixed(1)} dB
            </label>
            <input
              id="mid"
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={mid}
              onChange={(e) => onMidChange(Number(e.target.value))}
              disabled={isDisabled}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-50"
            />
          </div>
           {/* High-Mid */}
           <div className="flex flex-col">
            <label htmlFor="highMid" className="text-sm text-slate-300 mb-1">
              High-Mid: {highMid > 0 ? '+' : ''}{highMid.toFixed(1)} dB
            </label>
            <input
              id="highMid"
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={highMid}
              onChange={(e) => onHighMidChange(Number(e.target.value))}
              disabled={isDisabled}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-50"
            />
          </div>
          {/* Treble */}
          <div className="flex flex-col">
            <label htmlFor="treble" className="text-sm text-slate-300 mb-1">
              Treble: {treble > 0 ? '+' : ''}{treble.toFixed(1)} dB
            </label>
            <input
              id="treble"
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={treble}
              onChange={(e) => onTrebleChange(Number(e.target.value))}
              disabled={isDisabled}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioEffects;