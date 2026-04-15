'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, IndianRupee, Loader2 } from 'lucide-react';
import type { PaceLevel, BudgetLevel } from '@/types';

interface RefinementBarProps {
    pace: PaceLevel;
    budget: BudgetLevel;
    onPaceChange: (next: PaceLevel) => void;
    onBudgetChange: (next: BudgetLevel) => void;
    isBusy?: boolean; // shows a subtle spinner while re-rank runs
    stopCount?: number; // optional count badge for live feedback
}

interface PaceOption {
    value: PaceLevel;
    label: string;
    hint: string;
}

interface BudgetOption {
    value: BudgetLevel;
    label: string;
    hint: string;
    rupee: string;
}

const PACE_OPTIONS: PaceOption[] = [
    { value: 'relaxed', label: 'Relaxed', hint: '3–5 stops' },
    { value: 'balanced', label: 'Balanced', hint: '5–7 stops' },
    { value: 'packed', label: 'Packed', hint: '8–12 stops' },
];

const BUDGET_OPTIONS: BudgetOption[] = [
    { value: 'budget', label: 'Budget', hint: '≤ ₹100 / stop', rupee: '₹' },
    { value: 'standard', label: 'Standard', hint: '≤ ₹500 / stop', rupee: '₹₹' },
    { value: 'premium', label: 'Premium', hint: 'No cap', rupee: '₹₹₹' },
];

export default function RefinementBar({
    pace,
    budget,
    onPaceChange,
    onBudgetChange,
    isBusy,
    stopCount,
}: RefinementBarProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="sticky top-2 z-20 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-[0_4px_16px_-6px_rgba(15,23,42,0.12)] px-4 md:px-5 py-3"
        >
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                {/* Pace group */}
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Gauge className="w-3.5 h-3.5 text-[#2563EB]" />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                            Pace
                        </span>
                    </div>
                    <SegmentedControl
                        options={PACE_OPTIONS}
                        value={pace}
                        onChange={onPaceChange}
                        activeColor="text-[#2563EB]"
                        layoutId="pace-pill"
                    />
                </div>

                {/* Divider */}
                <div className="w-px h-7 bg-gray-200 hidden md:block" />

                {/* Budget group */}
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                            <IndianRupee className="w-3.5 h-3.5 text-[#F97316]" />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                            Budget
                        </span>
                    </div>
                    <SegmentedControl
                        options={BUDGET_OPTIONS}
                        value={budget}
                        onChange={onBudgetChange}
                        activeColor="text-[#F97316]"
                        layoutId="budget-pill"
                    />
                </div>

                {/* Right side: stop count + busy */}
                <div className="ml-auto flex items-center gap-3">
                    <AnimatePresence mode="wait">
                        {typeof stopCount === 'number' && !isBusy && (
                            <motion.span
                                key={`count-${stopCount}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full"
                            >
                                <span className="text-gray-900 font-semibold">{stopCount}</span>
                                <span className="text-gray-500">{stopCount === 1 ? 'stop' : 'stops'}</span>
                            </motion.span>
                        )}
                        {isBusy && (
                            <motion.div
                                key="busy"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-1.5 text-xs text-gray-500"
                            >
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />
                                Updating…
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Active hint row — only on larger screens to keep the bar compact */}
            <div className="hidden lg:flex items-center gap-4 mt-2 pl-9 text-[11px] text-gray-400">
                <span>
                    {PACE_OPTIONS.find((o) => o.value === pace)?.hint}
                </span>
                <span className="text-gray-300">•</span>
                <span>
                    {BUDGET_OPTIONS.find((o) => o.value === budget)?.hint}
                </span>
            </div>
        </motion.div>
    );
}

/* ------------------------ Segmented Control ------------------------ */

interface SegmentedControlProps<T extends string> {
    options: Array<{ value: T; label: string; hint?: string; rupee?: string }>;
    value: T;
    onChange: (next: T) => void;
    activeColor: string; // tailwind text color for active label
    layoutId: string;
}

function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    activeColor,
    layoutId,
}: SegmentedControlProps<T>) {
    return (
        <div className="relative inline-flex bg-gray-100 rounded-xl p-1">
            {options.map((opt) => {
                const isActive = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        title={opt.hint}
                        className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors z-10 ${
                            isActive ? activeColor : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        {isActive && (
                            <motion.span
                                layoutId={layoutId}
                                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                className="absolute inset-0 bg-white rounded-lg shadow-sm shadow-slate-200/80 -z-10"
                            />
                        )}
                        <span className="relative flex items-center gap-1">
                            {opt.rupee && (
                                <span
                                    className={`text-[10px] ${isActive ? 'opacity-100' : 'opacity-50'}`}
                                >
                                    {opt.rupee}
                                </span>
                            )}
                            {opt.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
