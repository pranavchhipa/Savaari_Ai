import { Skeleton } from "@/components/ui/Skeleton";

export default function CarCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
            <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {/* Car Image Skeleton */}
                    <Skeleton className="w-full md:w-48 h-36 md:h-32 rounded-xl" />

                    {/* Content Skeleton */}
                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-8 w-16 rounded-lg" />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>

                        <div className="flex justify-between items-end pt-2">
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-10 w-32 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
