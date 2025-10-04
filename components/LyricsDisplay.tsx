import React from 'react';
import { CloseIcon, SpinnerIcon } from './icons';

interface LyricsDisplayProps {
  lyrics: string | null;
  isLoading: boolean;
  trackName: string;
  onClose: () => void;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ lyrics, isLoading, trackName, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white truncate pr-4">Lyrics for {trackName}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-slate-400">
                <SpinnerIcon className="w-10 h-10 animate-spin" />
                <p className="mt-2">Loading lyrics...</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-slate-300 text-sm md:text-base font-sans leading-relaxed">
                {lyrics || "Lyrics are not available for this song."}
            </pre>
          )}
        </main>
      </div>
    </div>
  );
};

export default LyricsDisplay;
