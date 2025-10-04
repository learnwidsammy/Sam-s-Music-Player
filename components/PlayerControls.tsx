import React from 'react';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, ShuffleIcon, RepeatIcon, RepeatOneIcon, StopIcon, RewindIcon, FastForwardIcon } from './icons';

type RepeatMode = 'none' | 'one' | 'all';

interface PlayerControlsProps {
  isPlaying: boolean;
  isShuffleActive: boolean;
  repeatMode: RepeatMode;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
  onStop: () => void;
  onRewind: () => void;
  onFastForward: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  isPlaybackDisabled: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  isShuffleActive,
  repeatMode,
  onPlayPause,
  onNext,
  onPrev,
  onShuffle,
  onRepeat,
  onStop,
  onRewind,
  onFastForward,
  isPrevDisabled,
  isNextDisabled,
  isPlaybackDisabled,
}) => {
  const RepeatButtonIcon = repeatMode === 'one' ? RepeatOneIcon : RepeatIcon;
  const repeatTitle = `Repeat: ${repeatMode.charAt(0).toUpperCase() + repeatMode.slice(1)}`;

  return (
    <div className="flex items-center justify-center space-x-2 md:space-x-3">
      <button
        onClick={onShuffle}
        className={`${isShuffleActive ? 'text-sky-500' : 'text-slate-400'} hover:text-white transition-colors duration-200`}
        aria-label="Shuffle"
        title={isShuffleActive ? 'Disable Shuffle' : 'Enable Shuffle'}
      >
        <ShuffleIcon className="w-6 h-6" />
      </button>
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
      <button
        onClick={onRepeat}
        className={`${repeatMode !== 'none' ? 'text-sky-500' : 'text-slate-400'} hover:text-white transition-colors duration-200`}
        aria-label="Repeat"
        title={repeatTitle}
      >
        <RepeatButtonIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default PlayerControls;