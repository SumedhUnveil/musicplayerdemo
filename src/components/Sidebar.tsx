import React from 'react';
import { ArrowUp, ArrowDown, PlayCircle } from 'lucide-react';
import type { DeezerTrack } from '../lib/fetchLofiTracks';

interface SidebarProps {
  tracks: DeezerTrack[];
  selected: number;
  setSelected: (idx: number) => void;
  setTracks: (tracks: DeezerTrack[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tracks, selected, setSelected, setTracks }) => {
  const moveTrack = (from: number, to: number) => {
    if (to < 0 || to >= tracks.length) return;
    const newTracks = [...tracks];
    const [moved] = newTracks.splice(from, 1);
    newTracks.splice(to, 0, moved);
    setTracks(newTracks);
    if (selected === from) setSelected(to);
    else if (selected === to) setSelected(from);
  };

  return (
    <aside className="w-80 max-w-full bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-2 overflow-y-auto h-full">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Track List</h2>
      <ul className="flex flex-col gap-2">
        {tracks.map((track, i) => (
          <li
            key={track.id}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition border ${selected === i ? 'bg-blue-50 border-blue-400' : 'hover:bg-gray-100 border-transparent'}`}
            onClick={() => setSelected(i)}
          >
            <img src={track.cover} alt={track.title} className="w-12 h-12 rounded shadow object-cover" />
            <div className="flex-1 min-w-0">
              <div className="truncate font-semibold text-gray-900">{track.title}</div>
              <div className="truncate text-xs text-gray-500">{track.artist} &ndash; {track.album}</div>
            </div>
            <div className="flex flex-col gap-1 ml-2">
              <button
                className="p-1 rounded hover:bg-blue-100 disabled:opacity-30"
                onClick={e => { e.stopPropagation(); moveTrack(i, i - 1); }}
                disabled={i === 0}
                aria-label="Move Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                className="p-1 rounded hover:bg-blue-100 disabled:opacity-30"
                onClick={e => { e.stopPropagation(); moveTrack(i, i + 1); }}
                disabled={i === tracks.length - 1}
                aria-label="Move Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            {selected === i && <PlayCircle className="w-6 h-6 text-blue-500 ml-2" />}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar; 