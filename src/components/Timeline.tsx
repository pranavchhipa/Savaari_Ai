'use client';

import { Stop } from '@/types';
import TimelineItem from './TimelineItem';

interface TimelineProps {
    stops: Stop[];
    selectedStops: Stop[];
    onToggleStop: (stopId: string) => void;
    onFocusStop: (stopId: string) => void;
    showNightHaltAfter?: string; // stopId after which to show night halt
}

export default function Timeline({
    stops,
    selectedStops,
    onToggleStop,
    onFocusStop,
    showNightHaltAfter,
}: TimelineProps) {
    const isStopSelected = (stopId: string) =>
        selectedStops.some((s) => s.id === stopId);

    return (
        <div className="py-4">
            {stops.map((stop, index) => (
                <TimelineItem
                    key={stop.id}
                    stop={stop}
                    isSelected={isStopSelected(stop.id)}
                    onToggle={() => onToggleStop(stop.id)}
                    onFocus={() => onFocusStop(stop.id)}
                    showNightHalt={showNightHaltAfter === stop.id}
                    isLast={index === stops.length - 1}
                />
            ))}
        </div>
    );
}
