import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Track } from './types';
import PlayerControls from './components/PlayerControls';
import ProgressBar from './components/ProgressBar';
import VolumeControl from './components/VolumeControl';
import Playlist from './components/Playlist';
import { MusicNoteIcon } from './components/icons';

type RepeatMode = 'none' | 'one' | 'all';

const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [originalTracks, setOriginalTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffleActive, setIsShuffleActive] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isMuted, setIsMuted] = useState(false);
  const [volumeBeforeMute, setVolumeBeforeMute] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleTrackEnded = useCallback(() => {
    if (currentTrackIndex === null) return;

    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    const isLastTrack = currentTrackIndex === tracks.length - 1;

    if (isLastTrack) {
      if (repeatMode === 'all') {
        setCurrentTrackIndex(0);
      } else { // repeatMode is 'none'
        setIsPlaying(false);
        setCurrentTrackIndex(0);
        setProgress(0);
      }
    } else {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  }, [currentTrackIndex, tracks.length, repeatMode]);


  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleTrackEnded);
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleTrackEnded);
      };
    }
  }, [handleTimeUpdate, handleLoadedMetadata, handleTrackEnded]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      setProgress(0);
      if (isPlaying) {
        audioRef.current.play().catch(error => console.error("Playback error:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newTracks: Track[] = Array.from(files)
        .filter(file => file.type.startsWith('audio/'))
        .map((file, index) => ({
          id: `${Date.now()}-${index}`,
          name: file.name,
          url: URL.createObjectURL(file),
        }));

      const updatedOriginalTracks = [...originalTracks, ...newTracks];
      setOriginalTracks(updatedOriginalTracks);
      
      if (isShuffleActive) {
        const shuffled = [...updatedOriginalTracks].sort(() => Math.random() - 0.5);
        setTracks(shuffled);
      } else {
        setTracks(updatedOriginalTracks);
      }
      
      if (currentTrackIndex === null && newTracks.length > 0) {
        setCurrentTrackIndex(0);
      }
    }
  };

  const handlePlayPause = () => {
    if (tracks.length === 0) return;
    if (currentTrackIndex === null) {
      setCurrentTrackIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentTrackIndex === null) return;
    const isLastTrack = currentTrackIndex === tracks.length - 1;
    if (isLastTrack && repeatMode === 'all') {
      setCurrentTrackIndex(0);
    } else if (!isLastTrack) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentTrackIndex === null) return;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const isFirstTrack = currentTrackIndex === 0;
    if (isFirstTrack && repeatMode === 'all') {
      setCurrentTrackIndex(tracks.length - 1);
    } else if (!isFirstTrack) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    } else if (!isMuted && newVolume === 0) {
      setIsMuted(true);
    }
    setVolume(newVolume);
  };

  const toggleShuffle = () => {
    if (originalTracks.length < 2) return;
    const newShuffleState = !isShuffleActive;
    setIsShuffleActive(newShuffleState);

    const currentTrackId = currentTrack?.id;

    if (newShuffleState) {
      const shuffled = [...originalTracks].sort(() => Math.random() - 0.5);
      setTracks(shuffled);
      if (currentTrackId) {
        const newIndex = shuffled.findIndex(t => t.id === currentTrackId);
        setCurrentTrackIndex(newIndex !== -1 ? newIndex : 0);
      }
    } else {
      setTracks(originalTracks);
      if (currentTrackId) {
        const newIndex = originalTracks.findIndex(t => t.id === currentTrackId);
        setCurrentTrackIndex(newIndex !== -1 ? newIndex : 0);
      }
    }
  };

  const toggleRepeat = () => {
    const modes: RepeatMode[] = ['all', 'one', 'none'];
    const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const handleStop = () => {
    if (audioRef.current) {
      setIsPlaying(false);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const handleFastForward = () => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(volumeBeforeMute > 0 ? volumeBeforeMute : 0.5);
    } else {
      setVolumeBeforeMute(volume);
      setIsMuted(true);
      setVolume(0);
    }
  };

  const isPlaybackDisabled = currentTrackIndex === null;
  
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/1600/900?blur=5')" }}>
      <div className="w-full max-w-lg bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-sky-400">Music Player</h1>
          <p className="text-slate-400">Your personal soundscape</p>
        </header>

        <div className="flex flex-col items-center justify-center bg-slate-900/50 rounded-lg p-6 space-y-4 min-h-[280px]">
          {currentTrack ? (
            <>
              <div className="w-40 h-40 rounded-lg shadow-2xl mb-4 overflow-hidden">
                {currentTrack.albumArtUrl ? (
                  <img
                    src={currentTrack.albumArtUrl}
                    alt={currentTrack.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                    <MusicNoteIcon className="w-20 h-20 text-slate-500" />
                  </div>
                )}
              </div>
              <p className="text-xl font-semibold text-center truncate w-full" title={currentTrack.name}>
                {currentTrack.name}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-slate-500">
              <MusicNoteIcon className="w-20 h-20" />
              <p className="mt-4 text-slate-400">Add songs to start listening</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ProgressBar progress={progress} duration={duration} onSeek={handleSeek} />
          <div className="flex justify-between items-center">
            <div className="w-32">
              <VolumeControl 
                volume={volume} 
                onVolumeChange={handleVolumeChange}
                isMuted={isMuted}
                onMuteToggle={toggleMute}
              />
            </div>
            <PlayerControls
              isPlaying={isPlaying}
              isShuffleActive={isShuffleActive}
              repeatMode={repeatMode}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrev={handlePrev}
              onShuffle={toggleShuffle}
              onRepeat={toggleRepeat}
              onStop={handleStop}
              onRewind={handleRewind}
              onFastForward={handleFastForward}
              isPrevDisabled={isPlaybackDisabled || (repeatMode !== 'all' && currentTrackIndex === 0)}
              isNextDisabled={isPlaybackDisabled || (repeatMode !== 'all' && currentTrackIndex === tracks.length - 1)}
              isPlaybackDisabled={isPlaybackDisabled}
            />
            <div className="w-32" />
          </div>
        </div>

        <Playlist tracks={tracks} currentTrackIndex={currentTrackIndex} onTrackSelect={handleTrackSelect} />

        <div>
          <input
            type="file"
            multiple
            accept="audio/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
            title="Add audio files from your computer"
          >
            Add Music
          </button>
        </div>

        <audio ref={audioRef} src={currentTrack?.url} />

      </div>
    </div>
  );
};

export default App;