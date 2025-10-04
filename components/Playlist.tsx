
import React from 'react';
import { Track } from '../types';
import { MusicNoteIcon } from './icons';

interface PlaylistProps {
  tracks: Track[];
  currentTrackIndex: number | null;
  onTrackSelect: (index: number) => void;
}

const Playlist: React.FC<PlaylistProps> = ({ tracks, currentTrackIndex, onTrackSelect }) => {
  if (tracks.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-h-60 overflow-y-auto mt-8 rounded-lg bg-slate-800/50 p-2">
      <h2 className="text-xl font-bold text-white px-3 py-2">Playlist</h2>
      <ul>
        {tracks.map((track, index) => (
          <li
            key={track.id}
            onClick={() => onTrackSelect(index)}
            className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors duration-200 ${
              index === currentTrackIndex
                ? 'bg-sky-500/30 text-sky-300'
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
            title={`Click to play: ${track.name}`}
          >
            <MusicNoteIcon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{track.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Playlist;