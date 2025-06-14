
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Dummy data for highlights. Should be replaced with real data later.
const highlights = [
  { id: 1, label: 'Travel', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200&h=200&fit=crop' },
  { id: 2, label: 'Food', image: 'https://images.unsplash.com/photo-1484723050470-264b152abde7?w=200&h=200&fit=crop' },
  { id: 3, label: 'Projects', image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=200&h=200&fit=crop' },
  { id: 4, label: 'Friends', image: 'https://images.unsplash.com/photo-1530541930197-58944de4b33d?w=200&h=200&fit=crop' },
  { id: 5, label: 'Fitness', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop' },
  { id: 6, label: 'Hobbies', image: 'https://images.unsplash.com/photo-1534447677768-64483a0f72d1?w=200&h=200&fit=crop' },
];

export const StoryHighlights = () => (
  <div className="mb-10">
    <div className="flex space-x-6 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
      {highlights.map(highlight => (
        <div key={highlight.id} className="text-center shrink-0 w-20">
          <button className="w-16 h-16 rounded-full bg-muted flex items-center justify-center ring-2 ring-offset-2 ring-offset-background ring-gray-300 dark:ring-gray-700 cursor-pointer focus:outline-none focus:ring-primary">
            <Avatar className="w-[58px] h-[58px]">
              <AvatarImage src={highlight.image} alt={highlight.label} />
              <AvatarFallback>{highlight.label.charAt(0)}</AvatarFallback>
            </Avatar>
          </button>
          <p className="text-xs mt-2 font-medium truncate">{highlight.label}</p>
        </div>
      ))}
    </div>
  </div>
);
