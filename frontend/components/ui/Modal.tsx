'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdrop, modalContent } from '@/lib/animations';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        variants={modalBackdrop}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        variants={modalContent}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10"
                    >
                        {/* Header */}
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                        </div>

                        {/* Content */}
                        <div className="mb-6 text-gray-700">{children}</div>

                        {/* Footer */}
                        {footer && <div className="flex gap-3 justify-end">{footer}</div>}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
