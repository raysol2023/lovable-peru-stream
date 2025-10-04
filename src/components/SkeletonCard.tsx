import { Skeleton } from '@/components/ui/skeleton';

const SkeletonCard = () => {
  return (
    <div className="space-y-2 animate-pulse">
      <Skeleton className="w-full aspect-[2/3] rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
};

export default SkeletonCard;
