import React from 'react';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, StopIcon, RewindIcon, FastForwardIcon } from './icons';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onStop: () => void;
  onRewind: () => void;
  onFastForward: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  isPlaybackDisabled: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onStop,
  onRewind,
  onFastForward,
  isPrevDisabled,
  isNextDisabled,
  isPlaybackDisabled,
}) => {

  return (
    <div className="flex items-center justify-center space-x-2 md:space-x-3 flex-shrink-0">
      <button
        onClick={onRewind}
        disabled={isPlaybackDisabled}
        className="text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
        aria-label="Rewind"
        title="Rewind 10s"
      >
        <RewindIcon className="w-6 h-6" />
      </button>
      <button
        onClick={onPrev}
        disabled={isPrevDisabled}
        className="text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
        aria-label="Previous Track"
        title="Previous Track"
      >
        <PrevIcon className="w-8 h-8" />
      </button>
      <button
        onClick={onPlayPause}
        className="bg-sky-500 text-white rounded-full p-4 hover:bg-sky-400 transition-colors duration-200 shadow-lg"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
      </button>
       <button
        onClick={onStop}
        disabled={isPlaybackDisabled}
        className="text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
        aria-label="Stop"
        title="Stop"
      >
        <StopIcon className="w-6 h-6" />
      </button>
      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className="text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
        aria-label="Next Track"
        title="Next Track"
      >
        <NextIcon className="w-8 h-8" />
      </button>
      <button
        onClick={onFastForward}
        disabled={isPlaybackDisabled}
        className="text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
        aria-label="Fast Forward"
        title="Fast Forward 10s"
      >
        <FastForwardIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default PlayerControls;