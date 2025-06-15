
import type { Channel } from "@/components/channels/ChannelCard";

export const channelsData: Channel[] = [
  {
    id: 1,
    name: 'Philosophy Circle',
    description: 'Deep discussions on consciousness, ethics, and the nature of reality. All perspectives...',
    isPopular: true,
    memberCount: 128,
    type: 'Public',
    tags: ['Philosophy', 'Ethics', 'Debate'],
    members: Array.from({ length: 125 }, (_, i) => ({
      avatarUrl: `https://i.pravatar.cc/40?u=a${i}`,
      name: `User ${i + 1}`,
    })),
    status: 'New channel',
    logoLetter: 'D',
  },
  {
    id: 2,
    name: 'Climate Action Network',
    description: 'Connecting people passionate about climate solutions. Discussion, action plans, and local...',
    isPopular: true,
    memberCount: 256,
    type: 'Public',
    tags: ['Climate', 'Environment', 'Action'],
    members: Array.from({ length: 253 }, (_, i) => ({
      avatarUrl: `https://i.pravatar.cc/40?u=b${i}`,
      name: `User ${i + 1}`,
    })),
    status: 'New channel',
    logoLetter: 'C',
  },
  {
    id: 3,
    name: 'Weekend Basketball',
    description: 'Organizing regular basketball games in different cities. Players of all levels welcome.',
    isPopular: true,
    memberCount: 89,
    type: 'Public',
    tags: ['Sports', 'Basketball', 'Fitness'],
    members: Array.from({ length: 86 }, (_, i) => ({
      avatarUrl: `https://i.pravatar.cc/40?u=c${i}`,
      name: `User ${i + 1}`,
    })),
    status: 'New channel',
    logoLetter: 'W',
  },
];
