
export type Channel = {
  id: number;
  name: string;
  description: string;
  logoLetter: string;
};

export const channelsData: Channel[] = [
  {
    id: 1,
    name: 'Philosophy Circle',
    description: 'Deep discussions on consciousness, ethics, and the nature of reality. All perspectives...',
    logoLetter: 'P',
  },
  {
    id: 2,
    name: 'Climate Action Network',
    description: 'Connecting people passionate about climate solutions. Discussion, action plans, and local...',
    logoLetter: 'C',
  },
  {
    id: 3,
    name: 'Weekend Basketball',
    description: 'Organizing regular basketball games in different cities. Players of all levels welcome.',
    logoLetter: 'W',
  },
];
