import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    key="modal-wrapper"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    {/* Hardware-accelerated fading backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-[#DCDFE2]/85 dark:bg-[#0B0C10]/85 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Spring-simulated elastic modal window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                        className={cn(
                            "glass-panel p-5 sm:p-8 w-full max-w-md relative z-10 shadow-2xl",
                            "max-h-[calc(100dvh-2rem)] overflow-y-auto hide-scrollbar",
                            "border-slate-200/50 dark:border-white/10",
                            className
                        )}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
