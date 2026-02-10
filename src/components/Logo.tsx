'use client';

import { Car } from 'lucide-react';

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <div className={`relative ${className} flex items-center justify-center`}>
            {/* Main Circle - Light Blue */}
            <div className="absolute inset-0 bg-[#3B82F6] rounded-full shadow-lg shadow-blue-500/20" />

            {/* Dashed Border - Inside */}
            <div className="absolute inset-[3px] rounded-full border-[1.5px] border-dashed border-white/40" />

            {/* Letter 'S' */}
            <div className="relative z-10 flex items-center justify-center pb-1">
                <span className="text-white font-black text-2xl font-sans" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>S</span>
            </div>

            {/* Car Icon - Positioned on right edge */}
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 bg-white rounded-full p-[3px] shadow-sm z-20">
                <Car className="w-3 h-3 text-[#3B82F6] fill-[#3B82F6]" />
            </div>
        </div>
    );
}
