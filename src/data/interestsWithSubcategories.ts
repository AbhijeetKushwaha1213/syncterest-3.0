
export type SubcategoryConfig = {
  type: "multiselect" | "text";
  label: string;
  options?: string[];
  placeholder?: string;
};

export const interestsWithSubcategories: {
  id: string;
  label: string;
  subcategories: SubcategoryConfig;
}[] = [
  {
    id: "sports",
    label: "Sports",
    subcategories: {
      type: "multiselect",
      label: "Your favorite sports",
      options: ["Football", "Basketball", "Tennis", "Cricket", "Baseball", "Running", "Swimming", "Badminton", "Volleyball", "Hockey", "Yoga", "Gym"],
    },
  },
  {
    id: "music",
    label: "Music",
    subcategories: {
        type: 'text',
        label: 'Your favorite music',
        placeholder: 'Tell us about your taste in music, e.g. artists, genres, songs...'
    }
  },
  {
    id: "coding",
    label: "Coding",
    subcategories: {
        type: 'multiselect',
        label: 'Your coding interests',
        options: ["Web Development", "Mobile Development", "Data Science", "Game Development", "AI/ML", "Cybersecurity", "DevOps", "Blockchain"],
    }
  },
  {
    id: "discussions",
    label: "Discussions",
    subcategories: {
        type: 'multiselect',
        label: 'Topics you like to discuss',
        options: ["Politics", "Philosophy", "Technology", "Science", "Culture", "Current Events", "History", "Books"],
    }
  },
  {
    id: "art",
    label: "Art",
    subcategories: {
        type: 'multiselect',
        label: 'Art forms you enjoy',
        options: ["Painting", "Drawing", "Sculpture", "Photography", "Digital Art", "Street Art", "Film", "Architecture"],
    }
  },
  {
    id: "reading",
    label: "Reading",
    subcategories: {
        type: 'text',
        label: 'Your favorite reading material',
        placeholder: 'e.g. favorite books, authors, genres...'
    }
  },
  {
    id: "collaboration",
    label: "Collaborative Work",
    subcategories: {
        type: 'multiselect',
        label: 'Types of collaboration you\'re interested in',
        options: ["Open Source", "Startups", "Hackathons", "Study Groups", "Creative Projects", "Research"],
    },
  },
];
