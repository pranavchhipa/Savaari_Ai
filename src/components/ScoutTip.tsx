'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ScoutTipProps {
    tip: string;
    type?: 'info' | 'warning' | 'success';
}

export default function ScoutTip({ tip, type = 'info' }: ScoutTipProps) {
    const bgColors = {
        info: 'from-slate-50 to-blue-50/50',
        warning: 'from-amber-50 to-orange-50',
        success: 'from-emerald-50 to-green-50/50',
    };

    const borderColors = {
        info: 'border-slate-200',
        warning: 'border-amber-200',
        success: 'border-emerald-200',
    };

    const iconBgColors = {
        info: 'from-[#2563EB] to-[#1E40AF]',
        warning: 'from-amber-500 to-orange-500',
        success: 'from-emerald-500 to-green-500',
    };

    const textColors = {
        info: 'text-slate-700',
        warning: 'text-amber-800',
        success: 'text-emerald-700',
    };

    const titleColors = {
        info: 'text-slate-800',
        warning: 'text-amber-800',
        success: 'text-emerald-800',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl bg-gradient-to-r ${bgColors[type]} border ${borderColors[type]}`}
        >
            <div className="flex items-start gap-3">
                {/* Sarathi Logo/Icon */}
                <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${iconBgColors[type]} flex items-center justify-center shadow-md`}
                >
                    {type === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-white" />
                    ) : (
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                        </svg>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${titleColors[type]}`}>
                            Sarathi™ Suggests
                        </h4>
                    </div>
                    <p className={`text-sm ${textColors[type]} leading-relaxed`}>{tip}</p>
                </div>
            </div>
        </motion.div>
    );
}
