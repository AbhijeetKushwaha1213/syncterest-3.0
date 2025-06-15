
export type Channel = {
  id: number;
  name: string;
  description: string;
  logoLetter: string;
  memberCount: number;
  tags: string[];
  color: string;
};

export const channelsData: Channel[] = [
  {
    id: 1,
    name: 'Philosophy Circle',
    description: 'Deep discussions on consciousness, ethics, and the nature of reality. All perspectives...',
    logoLetter: 'P',
    memberCount: 1250,
    tags: ['philosophy', 'ethics', 'deep-thoughts'],
    color: 'bg-purple-500',
  },
  {
    id: 2,
    name: 'Climate Action Network',
    description: 'Connecting people passionate about climate solutions. Discussion, action plans, and local...',
    logoLetter: 'C',
    memberCount: 840,
    tags: ['climate', 'activism', 'environment'],
    color: 'bg-green-500',
  },
  {
    id: 3,
    name: 'Weekend Basketball',
    description: 'Organizing regular basketball games in different cities. Players of all levels welcome.',
    logoLetter: 'W',
    memberCount: 320,
    tags: ['sports', 'basketball', 'local'],
    color: 'bg-orange-500',
  },
  {
    id: 4,
    name: 'Indie Game Devs',
    description: 'A community for indie game developers to share progress, get feedback, and collaborate.',
    logoLetter: 'I',
    memberCount: 2100,
    tags: ['gamedev', 'design', 'programming'],
    color: 'bg-red-500',
  },
  {
    id: 5,
    name: 'Urban Gardeners',
    description: 'Sharing tips and tricks for gardening in urban spaces. From balconies to rooftops.',
    logoLetter: 'U',
    memberCount: 670,
    tags: ['gardening', 'urban', 'diy'],
    color: 'bg-teal-500',
  },
  {
    id: 6,
    name: 'AI & The Future',
    description: 'Exploring the impact of artificial intelligence on society, work, and our future.',
    logoLetter: 'A',
    memberCount: 5300,
    tags: ['ai', 'technology', 'future'],
    color: 'bg-blue-500',
  },
];
