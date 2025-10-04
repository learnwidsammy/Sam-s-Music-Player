
import React from 'react';

interface ProgressBarProps {
  progress: number;
  duration: number;
  onSeek: (time: number) => void;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, duration, onSeek }) => {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value));
  };

  return (
    <div className="flex items-center space-x-3 w-full">
      <span className="text-slate-400 text-sm w-12 text-center" title="Current Time">{formatTime(progress)}</span>
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={progress}
        onChange={handleSeek}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
        title="Seek"
      />
      <span className="text-slate-400 text-sm w-12 text-center" title="Track Duration">{formatTime(duration)}</span>
    </div>
  );
};

export default ProgressBar;
