'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const showToast = React.useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md min-w-[300px]
                                ${toast.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800' : ''}
                                ${toast.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' : ''}
                                ${toast.type === 'info' ? 'bg-blue-50/90 border-blue-200 text-blue-800' : ''}
                            `}>
                                {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                                {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}

                                <p className="flex-1 text-sm font-medium">{toast.message}</p>

                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="p-1 hover:bg-black/5 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 opacity-50" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
