import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { Track } from '../types';
import { AddIcon, SearchIcon } from './icons';

const API_BASE_URL = 'https://invidious.slipfox.xyz/api/v1';

interface SearchProps {
  onAddTrack: (track: Track, playImmediately?: boolean) => void;
  playlist: Track[];
}

const Search: React.FC<SearchProps> = ({ onAddTrack, playlist }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Track[]>([]);
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setError(null);
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=video`, { signal });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        const fetchedTracks: Track[] = data.map((video: any): Track => ({
          id: video.videoId,
          videoId: video.videoId,
          name: video.title,
          artist: video.author,
          albumArtUrl: video.videoThumbnails?.find((t: any) => t.quality === 'mqdefault')?.url,
          source: 'remote',
        }));
        
        setSuggestions(fetchedTracks.slice(0, 5));
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error("Failed to fetch suggestions:", error);
          setError("Could not fetch suggestions.");
        }
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setResults([]);
    setSearchPerformed(true);
    
    fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(searchTerm)}&type=video`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        const searchResults: Track[] = data.map((video: any): Track => ({
          id: video.videoId,
          videoId: video.videoId,
          name: video.title,
          artist: video.author,
          albumArtUrl: video.videoThumbnails?.find((t: any) => t.quality === 'mqdefault')?.url,
          source: 'remote',
        }));
        setResults(searchResults);
      })
      .catch(error => {
        console.error("Search failed:", error);
        setError("Search failed. The service may be unavailable. Please try again later.");
        setResults([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (track: Track) => {
    setQuery('');
    setSuggestions([]);
    onAddTrack(track, true);
  };

  const playlistIds = useMemo(() => new Set(playlist.map(t => t.id)), [playlist]);

  return (
    <div className="w-full my-4">
      <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for music on YouTube..."
            className="w-full bg-slate-700/50 text-white rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-slate-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((track) => (
                <li
                  key={track.id}
                  onClick={() => handleSuggestionClick(track)}
                  className="flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors duration-200 hover:bg-slate-700/50"
                  title={`Play: ${track.name}`}
                >
                  <div>
                    <p className="font-semibold truncate text-white">{track.name}</p>
                    <p className="text-sm text-slate-400 truncate">{track.artist}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-slate-600"
          title="Search"
        >
          {isLoading ? '...' : <SearchIcon className="w-5 h-5" />}
        </button>
      </form>

      {error && <p className="text-red-400 text-center p-2 mt-2 bg-red-900/20 rounded-lg">{error}</p>}

      {(isLoading || (searchPerformed && !isLoading && !error)) && (
        <div className="mt-2 max-h-40 overflow-y-auto bg-slate-800/70 rounded-lg p-2">
          {isLoading ? (
            <p className="text-slate-500 text-center p-2">Searching...</p>
          ) : results.length > 0 ? (
            <ul>
              {results.map((track) => {
                const isAdded = playlistIds.has(track.id);
                return (
                  <li key={track.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-700/50">
                    <div>
                      <p className="font-semibold text-white">{track.name}</p>
                      <p className="text-sm text-slate-400">{track.artist}</p>
                    </div>
                    <button
                      onClick={() => onAddTrack(track, false)}
                      disabled={isAdded}
                      className="text-sky-400 hover:text-white disabled:text-slate-500 disabled:cursor-not-allowed transition-colors p-1"
                      title={isAdded ? 'Already in playlist' : 'Add to playlist'}
                    >
                      <AddIcon className="w-6 h-6" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-slate-500 text-center p-2">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;