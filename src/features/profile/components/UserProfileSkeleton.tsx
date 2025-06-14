
import { Skeleton } from "@/components/ui/skeleton";

export const UserProfileSkeleton = () => (
  <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
    <Skeleton className="h-8 w-24 mb-6" />
    <header className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-8">
      <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full shrink-0" />
      <div className="flex flex-col gap-4 w-full items-center md:items-start">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-8 mt-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </header>
    <div className="mb-8 space-y-2 text-center md:text-left">
      <Skeleton className="h-6 w-32 mx-auto md:mx-0" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <hr className="my-8" />
    <div>
      <Skeleton className="h-6 w-24 mx-auto mb-4" />
      <div className="flex flex-wrap gap-2 justify-center">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  </div>
);
