export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: string;
  cover: string;
}

export type Point = { x: number; y: number };

export const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Cyber Pulse',
    artist: 'AI Synthwave',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '6:12',
    cover: 'https://picsum.photos/seed/cyber/400/400',
  },
  {
    id: '2',
    title: 'Neon Drift',
    artist: 'Digital Echo',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '7:05',
    cover: 'https://picsum.photos/seed/neon/400/400',
  },
  {
    id: '3',
    title: 'Void Runner',
    artist: 'Neural Beats',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: '5:48',
    cover: 'https://picsum.photos/seed/void/400/400',
  },
];
