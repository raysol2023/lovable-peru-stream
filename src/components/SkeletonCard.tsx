import { Skeleton } from '@/components/ui/skeleton';

const SkeletonCard = () => {
  return (
    <div className="space-y-2">
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-secondary via-secondary/50 to-secondary animate-shimmer bg-[length:200%_100%]">
        <Skeleton className="w-full h-full" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
};

export default SkeletonCard;
