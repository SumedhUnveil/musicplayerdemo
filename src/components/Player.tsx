import React, { useState, useRef, useEffect } from 'react';
import rainSound from '../assets/rain.mp3';
import { Play, Pause, SkipBack, SkipForward, Volume2, CloudRain, Image as ImageIcon, AudioWaveform } from 'lucide-react';
import { fetchLofiTracks, type DeezerTrack } from '../lib/fetchLofiTracks';
import AudioSpectrum from 'react-audio-spectrum';
import Sidebar from './Sidebar';

const Player: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rainOn, setRainOn] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tracks, setTracks] = useState<DeezerTrack[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rainRef = useRef<HTMLAudioElement | null>(null);
  const AUDIO_ID = 'audio-element';

  useEffect(() => {
    setLoading(true);
    fetchLofiTracks(10)
      .then((data) => {
        setTracks(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Error fetching tracks');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [selected]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (audioRef.current) {
        if (next) audioRef.current.play();
        else audioRef.current.pause();
      }
      return next;
    });
  };

  const handleRainToggle = () => {
    setRainOn((v) => {
      const next = !v;
      if (rainRef.current) {
        if (next) {
          rainRef.current.volume = 0.3;
          rainRef.current.loop = true;
          rainRef.current.play().catch(() => {});
        } else {
          rainRef.current.pause();
          rainRef.current.currentTime = 0;
        }
      }
      return next;
    });
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setProgress(value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <span className="text-gray-500 text-lg">Loading tracks...</span>
      </div>
    );
  }

  if (error || tracks.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <span className="text-red-500 text-lg">{error || 'No tracks found.'}</span>
      </div>
    );
  }

  const track = tracks[selected];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 bg-transparent">
      {/* Sidebar (desktop) */}
      <div className="hidden md:block w-80 shrink-0">
        <Sidebar tracks={tracks} selected={selected} setSelected={setSelected} setTracks={setTracks} />
      </div>
      {/* Main Player */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Track Info & Visualizer Toggle */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex justify-end w-full mb-2">
              <button
                className={`p-2 rounded-full transition ${showVisualizer ? 'bg-blue-100' : 'bg-gray-100'} hover:bg-blue-200 mr-2`}
                onClick={() => setShowVisualizer(false)}
                aria-label="Show Album Art"
              >
                <ImageIcon className={`w-5 h-5 ${!showVisualizer ? 'text-blue-500' : 'text-gray-700'}`} />
              </button>
              <button
                className={`p-2 rounded-full transition ${showVisualizer ? 'bg-blue-100' : 'bg-gray-100'} hover:bg-blue-200`}
                onClick={() => setShowVisualizer(true)}
                aria-label="Show Visualizer"
              >
                <AudioWaveform className={`w-5 h-5 ${showVisualizer ? 'text-blue-500' : 'text-gray-700'}`} />
              </button>
            </div>
            {showVisualizer ? (
              <div className="w-full flex justify-center items-center">
                <AudioSpectrum
                  id="audio-spectrum"
                  height={120}
                  width={320}
                  audioId={AUDIO_ID}
                  capColor={'#fff'}
                  capHeight={2}
                  meterWidth={6}
                  meterCount={48}
                  meterColor={[
                    { stop: 0, color: '#60a5fa' },
                    { stop: 0.5, color: '#818cf8' },
                    { stop: 1, color: '#a78bfa' },
                  ]}
                  gap={4}
                />
              </div>
            ) : (
              <img src={track.cover} alt="cover" className="w-40 h-40 rounded-2xl shadow-lg object-cover" />
            )}
            <div className="mt-2 flex flex-col items-center w-full">
              <span className="text-base font-medium text-gray-500 tracking-wide">Now Playing</span>
              <div className="text-2xl font-bold text-gray-900 mt-1">{track.title}</div>
              <div className="text-sm text-gray-400 font-medium mt-1">{track.artist} &ndash; {track.album}</div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full flex flex-col items-center">
            <input
              type="range"
              min={0}
              max={track.duration}
              value={progress}
              onChange={handleProgressChange}
              className="w-full accent-blue-500 h-2 rounded-lg"
            />
            <div className="flex justify-between w-full text-xs text-gray-400 mt-1">
              <span>{Math.floor(progress / 60)}:{(Math.floor(progress) % 60).toString().padStart(2, '0')}</span>
              <span>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
          {/* Controls */}
          <div className="flex items-center justify-center gap-8 mt-2 w-full">
            <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition" aria-label="Previous" disabled={selected === 0} onClick={() => setSelected((i) => Math.max(0, i - 1))}>
              <SkipBack className="w-6 h-6 text-gray-700" />
            </button>
            <button
              className="p-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition"
              onClick={handlePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </button>
            <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition" aria-label="Next" disabled={selected === tracks.length - 1} onClick={() => setSelected((i) => Math.min(tracks.length - 1, i + 1))}>
              <SkipForward className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          {/* Bottom Controls */}
          <div className="flex items-center justify-between w-full mt-4">
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition" aria-label="Volume">
              <Volume2 className="w-5 h-5 text-gray-700" />
            </button>
            <button
              className={`p-2 rounded-full transition flex items-center gap-2 ${rainOn ? 'bg-blue-100' : 'bg-gray-100'} hover:bg-blue-200`}
              onClick={handleRainToggle}
              aria-label="Rain Toggle"
            >
              <CloudRain className={`w-5 h-5 ${rainOn ? 'text-blue-500' : 'text-gray-700'}`} />
              <span className={`text-xs font-medium ${rainOn ? 'text-blue-500' : 'text-gray-700'}`}>Rain</span>
            </button>
          </div>
          {/* Audio Elements */}
          <audio
            id={AUDIO_ID}
            ref={audioRef}
            src={track.preview}
            preload="auto"
            className="hidden"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setSelected((i) => (i + 1) % tracks.length)}
            crossOrigin="anonymous"
          />
          <audio ref={rainRef} src={rainSound} preload="auto" className="hidden" loop />
        </div>
      </div>
    </div>
  );
};

export default Player; 