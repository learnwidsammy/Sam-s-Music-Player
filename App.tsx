import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Track } from './types';
import PlayerControls from './components/PlayerControls';
import ProgressBar from './components/ProgressBar';
import VolumeControl from './components/VolumeControl';
import Playlist from './components/Playlist';
import Search from './components/Search';
import { MusicNoteIcon, SpinnerIcon, EqualizerIcon, LyricsIcon, VisualizerIcon, ShuffleIcon, RepeatIcon, RepeatOneIcon } from './components/icons';
import AudioEffects from './components/AudioEffects';
import LyricsDisplay from './components/LyricsDisplay';
import Visualizer from './components/Visualizer';

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
  const [audioSrc, setAudioSrc] = useState<string | undefined>(undefined);
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [bass, setBass] = useState(0);
  const [lowMid, setLowMid] = useState(0);
  const [mid, setMid] = useState(0);
  const [highMid, setHighMid] = useState(0);
  const [treble, setTreble] = useState(0);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const lowMidFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const highMidFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  // PWA Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
  }, []);

  // Effect to initialize the Web Audio API context and filters (runs once)
  useEffect(() => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 5-Band EQ filters
    const bassFilter = context.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 250;

    const lowMidFilter = context.createBiquadFilter();
    lowMidFilter.type = 'peaking';
    lowMidFilter.frequency.value = 500;
    lowMidFilter.Q.value = 1;

    const midFilter = context.createBiquadFilter();
    midFilter.type = 'peaking';
    midFilter.frequency.value = 1000;
    midFilter.Q.value = 1;

    const highMidFilter = context.createBiquadFilter();
    highMidFilter.type = 'peaking';
    highMidFilter.frequency.value = 2000;
    highMidFilter.Q.value = 1;

    const trebleFilter = context.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 4000;
    
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;

    // Connect the processing graph: filters -> analyser -> destination
    bassFilter.connect(lowMidFilter)
      .connect(midFilter)
      .connect(highMidFilter)
      .connect(trebleFilter)
      .connect(analyser)
      .connect(context.destination);

    // Store nodes in refs
    audioContextRef.current = context;
    bassFilterRef.current = bassFilter;
    lowMidFilterRef.current = lowMidFilter;
    midFilterRef.current = midFilter;
    highMidFilterRef.current = highMidFilter;
    trebleFilterRef.current = trebleFilter;
    analyserRef.current = analyser;

    // Cleanup on component unmount
    return () => {
      context.close().catch(console.error);
    };
  }, []);

  // Effect to connect the audio element to the graph (runs when track changes)
  useEffect(() => {
    const audioEl = audioRef.current;
    const audioCtx = audioContextRef.current;

    if (!audioEl || !audioCtx || !currentTrack) return;

    // If there's an existing source, disconnect it to prepare for the new one
    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect();
    }

    // Create a new source from the audio element
    const source = audioCtx.createMediaElementSource(audioEl);
    audioSourceRef.current = source;
    
    // Connect the new source to the start of our filter chain
    if (bassFilterRef.current) {
      source.connect(bassFilterRef.current);
    }
  }, [currentTrack]);

  useEffect(() => {
    const API_BASE_URL = 'https://invidious.slipfox.xyz/api/v1';
    
    if (!currentTrack) {
      setAudioSrc(undefined);
      return;
    }

    if (currentTrack.source === 'local' && currentTrack.url) {
      setIsTrackLoading(false);
      setAudioSrc(currentTrack.url);
      return;
    }

    if (currentTrack.source === 'remote' && currentTrack.videoId) {
      setIsTrackLoading(true);
      setAudioSrc(undefined);

      fetch(`${API_BASE_URL}/videos/${currentTrack.videoId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch video info');
          return res.json();
        })
        .then(data => {
          const audioStream = 
            data.adaptiveFormats.find((f: any) => f.type === 'audio/mp4; codecs="mp4a.40.2"') ||
            data.adaptiveFormats.filter((f: any) => f.type.startsWith('audio/mp4')).sort((a: any, b: any) => b.bitrate - a.bitrate)[0] ||
            data.adaptiveFormats.filter((f: any) => f.type.startsWith('audio/')).sort((a: any, b: any) => b.bitrate - a.bitrate)[0];

          if (!audioStream || !audioStream.url) {
            throw new Error('No compatible audio stream found for this video.');
          }
          
          setAudioSrc(audioStream.url);
        })
        .catch(error => {
          console.error("Error fetching audio stream:", error);
          alert(`Could not play "${currentTrack.name}". The streaming source may be unavailable or the video may be region-locked.`);
          handleNext();
        })
        .finally(() => {
          setIsTrackLoading(false);
        });
    }
  }, [currentTrack]);
  
  // Fetch lyrics
  useEffect(() => {
    if (currentTrack && currentTrack.artist && currentTrack.name) {
      setIsLyricsLoading(true);
      setLyrics(null);
      fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(currentTrack.artist)}/${encodeURIComponent(currentTrack.name)}`)
        .then(res => res.json())
        .then(data => {
            if (data.lyrics) {
                setLyrics(data.lyrics);
            } else {
                setLyrics("No lyrics found for this song.");
            }
        })
        .catch(() => {
            setLyrics("Could not fetch lyrics.");
        })
        .finally(() => {
            setIsLyricsLoading(false);
        });
    } else {
        setLyrics(null);
    }
  }, [currentTrack]);


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

  const handleCanPlay = useCallback(() => {
    if (isPlaying && audioRef.current && audioSrc) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback error on track load:", error);
          setIsPlaying(false);
        });
      }
    }
  }, [isPlaying, audioSrc]);

  const handleTrackEnded = useCallback(() => {
    if (currentTrackIndex === null || !audioRef.current) return;

    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    const fadeOut = setInterval(() => {
      if (audioRef.current && audioRef.current.volume > 0.1) {
        audioRef.current.volume -= 0.1;
      } else {
        clearInterval(fadeOut);
        if (audioRef.current) audioRef.current.volume = 0; // Mute before switching
        
        const isLastTrack = currentTrackIndex === tracks.length - 1;
        if (isLastTrack) {
          if (repeatMode === 'all') {
            setCurrentTrackIndex(0);
          } else {
            setIsPlaying(false);
          }
        } else {
          setCurrentTrackIndex(currentTrackIndex + 1);
        }
      }
    }, 50); // Fade out over 500ms
  }, [currentTrackIndex, tracks.length, repeatMode]);
  
  // Fade in for new track
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.volume = 0;
      let currentVolume = 0;
      const fadeIn = setInterval(() => {
        if (audioRef.current && currentVolume < (isMuted ? 0 : volume) - 0.1) {
          currentVolume += 0.1;
          audioRef.current.volume = currentVolume;
        } else {
          clearInterval(fadeIn);
          if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
        }
      }, 50);
    }
  }, [audioSrc, isPlaying]); // Trigger on new source and when play starts

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        if (audioRef.current.readyState === 0 || !audioSrc) return;

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Playback error:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioSrc]);

  useEffect(() => {
    if (audioRef.current) { setProgress(0); }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) { audioRef.current.volume = isMuted ? 0 : volume; }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) { audioRef.current.playbackRate = playbackRate; }
  }, [playbackRate]);

  useEffect(() => {
    if (bassFilterRef.current) { bassFilterRef.current.gain.value = bass; }
  }, [bass]);

  useEffect(() => {
    if (lowMidFilterRef.current) { lowMidFilterRef.current.gain.value = lowMid; }
  }, [lowMid]);
  
  useEffect(() => {
    if (midFilterRef.current) { midFilterRef.current.gain.value = mid; }
  }, [mid]);

  useEffect(() => {
    if (highMidFilterRef.current) { highMidFilterRef.current.gain.value = highMid; }
  }, [highMid]);

  useEffect(() => {
    if (trebleFilterRef.current) { trebleFilterRef.current.gain.value = treble; }
  }, [treble]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newTracks: Track[] = Array.from(files)
        .filter(file => file.type.startsWith('audio/'))
        .map((file, index) => ({
          id: `${Date.now()}-${index}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          url: URL.createObjectURL(file),
          artist: 'Local File',
          source: 'local',
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
        setIsPlaying(true);
      }
    }
  };

  const handleAddRemoteTrack = (trackToAdd: Track, playImmediately = false) => {
    const existingIndex = tracks.findIndex(t => t.id === trackToAdd.id);
    if (existingIndex !== -1) {
      if (playImmediately) { handleTrackSelect(existingIndex); }
      return;
    }

    const newOriginalTracks = [...originalTracks, trackToAdd];
    const newTracks = [...tracks, trackToAdd];
    const newTrackIndex = newTracks.length - 1;

    setOriginalTracks(newOriginalTracks);
    setTracks(newTracks);

    if (playImmediately || currentTrackIndex === null) {
      setCurrentTrackIndex(newTrackIndex);
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => {
    if (tracks.length === 0 || isTrackLoading) return;

    // Resume AudioContext on user interaction
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

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
    if (isMuted && newVolume > 0) { setIsMuted(false); } 
    else if (!isMuted && newVolume === 0) { setIsMuted(true); }
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
  const repeatTitle = `Repeat: ${repeatMode.charAt(0).toUpperCase() + repeatMode.slice(1)}`;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/1600/900?blur=5')" }}>
      <div className="w-full max-w-lg bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 space-y-4 relative">
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
           <button onClick={() => setShowLyrics(true)} disabled={!currentTrack} className="text-slate-400 hover:text-white transition-colors p-1 disabled:text-slate-600" title="Show Lyrics"><LyricsIcon className="w-6 h-6"/></button>
          <button onClick={() => setShowEffects(true)} className="text-slate-400 hover:text-white transition-colors p-1" title="Audio Effects"><EqualizerIcon className="w-6 h-6"/></button>
        </div>

        <header className="text-center pt-4">
          <h1 className="text-3xl font-bold text-sky-400">Music Player</h1>
          <p className="text-slate-400">Your personal soundscape</p>
        </header>

        <div className="relative flex flex-col items-center justify-center bg-slate-900/50 rounded-lg p-6 space-y-3 min-h-[280px]">
          {currentTrack && (
            <button onClick={() => setShowVisualizer(!showVisualizer)} className="absolute top-4 right-4 bg-slate-900/50 rounded-full p-1.5 text-slate-300 hover:text-white transition-opacity z-10" title={showVisualizer ? "Show Album Art" : "Show Visualizer"}>
              <VisualizerIcon className="w-5 h-5" />
            </button>
          )}
          {isTrackLoading ? (
            <div className="flex flex-col items-center justify-center text-center text-slate-400">
                <SpinnerIcon className="w-16 h-16 animate-spin" />
                <p className="mt-4 text-slate-300">Loading track...</p>
            </div>
          ) : currentTrack ? (
              <div className="w-40 h-40 rounded-lg shadow-2xl overflow-hidden relative">
                {showVisualizer && isPlaying ? (
                    <Visualizer analyserNode={analyserRef.current} isPlaying={isPlaying} />
                ) : currentTrack.albumArtUrl ? (
                  <img src={currentTrack.albumArtUrl} alt={currentTrack.name} className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                    <MusicNoteIcon className="w-20 h-20 text-slate-500" />
                  </div>
                )}
              </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-slate-500">
              <MusicNoteIcon className="w-20 h-20" />
              <p className="mt-4 text-slate-400">Add or search for songs to start</p>
            </div>
          )}
        </div>
        
        {/* Control Deck */}
        <div className="space-y-4 px-1">
          {currentTrack ? (
            <div className="text-center h-[52px]">
              <p className="text-xl font-semibold text-center truncate w-full" title={currentTrack.name}>
                {currentTrack.name}
              </p>
              <p className="text-sm text-slate-400 text-center truncate w-full" title={currentTrack.artist}>
                {currentTrack.artist}
              </p>
            </div>
          ) : (
            <div className="text-center h-[52px] flex items-center justify-center">
              <p className="text-slate-500">No track selected</p>
            </div>
          )}

          <ProgressBar progress={progress} duration={duration} onSeek={handleSeek} />
          
          <div className="flex justify-between items-center text-slate-400">
            {/* Left side: Shuffle & Repeat */}
            <div className="w-28 flex items-center space-x-3">
               <button
                  onClick={toggleShuffle}
                  className={`${isShuffleActive ? 'text-sky-500' : 'text-slate-400'} hover:text-white transition-colors duration-200`}
                  aria-label="Shuffle"
                  title={isShuffleActive ? 'Disable Shuffle' : 'Enable Shuffle'}
                >
                  <ShuffleIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={toggleRepeat}
                  className={`${repeatMode !== 'none' ? 'text-sky-500' : 'text-slate-400'} hover:text-white transition-colors duration-200`}
                  aria-label="Repeat"
                  title={repeatTitle}
                >
                  {repeatMode === 'one' ? <RepeatOneIcon className="w-6 h-6" /> : <RepeatIcon className="w-6 h-6" />}
                </button>
            </div>

            {/* Center: Core Player Controls */}
            <PlayerControls
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause} 
              onNext={handleNext} 
              onPrev={handlePrev} 
              onStop={handleStop} 
              onRewind={handleRewind} 
              onFastForward={handleFastForward}
              isPrevDisabled={isPlaybackDisabled || (repeatMode !== 'all' && currentTrackIndex === 0)}
              isNextDisabled={isPlaybackDisabled || (repeatMode !== 'all' && currentTrackIndex === tracks.length - 1)}
              isPlaybackDisabled={isPlaybackDisabled || isTrackLoading}
            />

            {/* Right side: Volume Control */}
            <div className="w-28 flex justify-end">
              <VolumeControl volume={volume} onVolumeChange={handleVolumeChange} isMuted={isMuted} onMuteToggle={toggleMute} />
            </div>
          </div>
        </div>


        {showEffects && (
          <AudioEffects
            playbackRate={playbackRate} onPlaybackRateChange={setPlaybackRate}
            bass={bass} onBassChange={setBass}
            lowMid={lowMid} onLowMidChange={setLowMid}
            mid={mid} onMidChange={setMid}
            highMid={highMid} onHighMidChange={setHighMid}
            treble={treble} onTrebleChange={setTreble}
            isDisabled={!currentTrack}
            onClose={() => setShowEffects(false)}
          />
        )}
        
        {showLyrics && (
            <LyricsDisplay
                lyrics={lyrics}
                isLoading={isLyricsLoading}
                trackName={currentTrack?.name || "No track selected"}
                onClose={() => setShowLyrics(false)}
            />
        )}

        <Search onAddTrack={handleAddRemoteTrack} playlist={tracks} />
        <Playlist tracks={tracks} currentTrackIndex={currentTrackIndex} onTrackSelect={handleTrackSelect} />

        <div>
          <input type="file" multiple accept="audio/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300" title="Add audio files from your computer">
            Add Music From Device
          </button>
        </div>

        <audio ref={audioRef} src={audioSrc} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleTrackEnded} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onCanPlay={handleCanPlay} crossOrigin="anonymous" />
      </div>
    </div>
  );
};

export default App;