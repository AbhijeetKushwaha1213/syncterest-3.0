
import {
  Gamepad,
  Volleyball,
  Music,
  Book,
  Film,
  Palette,
  Camera,
  Earth,
  Brain,
  Yoga,
  Laptop,
  FlaskConical,
  Microscope,
  LucideProps,
} from 'lucide-react';

type IconComponent = React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;

export type SubGroup = {
  type: 'multiselect' | 'text';
  label: string;
  options?: string[];
  placeholder?: string;
  description?: string;
};

export const interestsWithSubcategories: {
  id: string;
  label: string;
  icon: IconComponent;
  subgroups: SubGroup[];
}[] = [
    {
      id: 'gaming',
      label: 'Gaming',
      icon: Gamepad,
      subgroups: [
        {
          type: 'multiselect',
          label: 'Favorite Genres',
          options: ['Action', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Indie', 'MMO'],
        },
        {
          type: 'text',
          label: 'Favorite Games',
          placeholder: 'e.g., The Witcher 3, Stardew Valley...',
        },
      ],
    },
    {
        id: "sports",
        label: "Sports",
        icon: Volleyball,
        subgroups: [{
            type: "multiselect",
            label: "Sports you play or follow",
            options: ["Cricket", "Badminton", "Football", "Tennis", "Basketball", "Swimming", "Track & Field"],
        },
        {
            type: 'text',
            label: 'Other sports you are interested in',
            placeholder: 'Mention any other sports here'
        }],
    },
    {
        id: "music",
        label: "Music",
        icon: Music,
        subgroups: [{
            type: "multiselect",
            label: "Genres",
            options: ["Jazz", "Pop", "Rock", "Indie", "Classical", "Lofi", "Techno", "Instrumental"],
        }, {
            type: "multiselect",
            label: "Roles",
            options: ["Singer", "Instrumentalist", "DJ", "Producer", "Listener"],
        },
        {
            type: 'text',
            label: 'Favorite Artists/Bands',
            placeholder: 'e.g., Arijit Singh, Imagine Dragons...'
        }],
    },
    {
        id: "reading",
        label: "Reading",
        icon: Book,
        subgroups: [{
            type: 'multiselect',
            label: 'Genres',
            options: ['Fiction', 'Sci-Fi', 'Non-fiction', 'Biography', 'Self-help', 'Mystery', 'Poetry']
        },
        {
            type: 'text',
            label: 'Favorite Authors',
            placeholder: 'e.g., J.K. Rowling, Haruki Murakami...'
        },
        {
            type: 'text',
            label: 'Favorite Books',
            placeholder: 'e.g., To Kill a Mockingbird, Sapiens...'
        }]
    },
    {
        id: "movies_series",
        label: "Movies/Series",
        icon: Film,
        subgroups: [{
            type: 'multiselect',
            label: 'Genres',
            options: ['Drama', 'Comedy', 'Thriller', 'Action', 'Sci-Fi', 'Romance', 'Anime']
        },
        {
            type: 'multiselect',
            label: 'Platforms',
            options: ['Netflix', 'Prime Video', 'Hotstar', 'YouTube', 'Hulu']
        },
        {
            type: 'text',
            label: 'Favorite Titles',
            placeholder: 'e.g., Interstellar, Breaking Bad...'
        }]
    },
    {
        id: 'art_design',
        label: 'Art & Design',
        icon: Palette,
        subgroups: [
          {
            type: 'multiselect',
            label: 'Interests',
            options: ['Painting', 'Drawing', 'Sculpture', 'Photography', 'Digital Art', 'UI/UX', 'Fashion'],
          },
        ],
    },
    {
        id: 'content_creation',
        label: 'Content Creation',
        icon: Camera,
        subgroups: [
          {
            type: 'multiselect',
            label: 'Platforms',
            options: ['YouTube', 'Instagram', 'TikTok', 'Twitch', 'Blogging'],
          },
          {
            type: 'text',
            label: 'Your Content Niche',
            placeholder: 'e.g., Tech reviews, Travel vlogs...'
          }
        ],
    },
    {
        id: 'travel',
        label: 'Travel',
        icon: Earth,
        subgroups: [
          {
            type: 'multiselect',
            label: 'Travel Style',
            options: ['Backpacking', 'Luxury', 'Adventure', 'Cultural', 'Solo Travel'],
          },
          {
            type: 'text',
            label: 'Favorite Destinations',
            placeholder: 'e.g., Japan, Italy, New Zealand...'
          }
        ],
    },
    {
        id: 'philosophy',
        label: 'Philosophy/Personality',
        icon: Brain,
        subgroups: [
          {
            type: 'multiselect',
            label: 'Perspective',
            options: ['Thinker', 'Dreamer', 'Realist', 'Hustler'],
          },
          {
            type: 'multiselect',
            label: 'Beliefs',
            options: ['Spiritual', 'Agnostic', 'Rationalist', 'Curious'],
          },
          {
            type: 'multiselect',
            label: 'Interaction Style',
            options: ['Deep talker', 'Listener', 'Motivator', 'Humorist'],
          },
        ],
    },
    {
        id: 'lifestyle_wellness',
        label: 'Lifestyle/Wellness',
        icon: Yoga,
        subgroups: [
          {
            type: 'multiselect',
            label: 'Activities',
            options: ['Yoga', 'Meditation', 'Fitness', 'Healthy Eating', 'Mindfulness'],
          },
        ],
    },
    {
        id: 'tech',
        label: 'Tech',
        icon: Laptop,
        subgroups: [
          {
            type: 'multiselect',
            label: 'Interests',
            options: ['Web Development', 'Mobile Development', 'AI/ML', 'Cybersecurity', 'Gadgets', 'Startups'],
          },
        ],
    },
    {
        id: 'science',
        label: 'Science',
        icon: FlaskConical,
        subgroups: [
          {
            type: 'multiselect',
            label: 'Fields',
            options: ['Physics', 'Biology', 'Chemistry', 'Astronomy', 'Psychology'],
          },
        ],
    },
    {
        id: 'research_projects',
        label: 'Research & Projects',
        icon: Microscope,
        subgroups: [
          {
            type: 'multiselect',
            label: 'Collaboration Type',
            options: ['Open Source', 'Academic Research', 'Startup Idea', 'Creative Project'],
          },
          {
            type: 'text',
            label: 'Current Project/Field of Study',
            placeholder: 'e.g., Building a web app with React, Studying quantum mechanics...'
          }
        ],
    },
];
