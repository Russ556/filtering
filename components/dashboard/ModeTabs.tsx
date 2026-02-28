import React from 'react';

interface ModeTabsProps {
    activeMode: 'auto' | 'custom';
    onChangeMode?: (mode: 'auto' | 'custom') => void;
}

export default function ModeTabs({ activeMode, onChangeMode }: ModeTabsProps) {
    return (
        <div
            className="flex space-x-2 bg-gray-200/60 p-1.5 rounded-xl inline-flex mb-8 shadow-inner"
            role="tablist"
            aria-label="Dashboard mode selection"
        >
            <button
                type="button"
                role="tab"
                aria-selected={activeMode === 'auto'}
                onClick={() => onChangeMode?.('auto')}
                className={`px-8 py-2.5 text-sm font-bold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 ${activeMode === 'auto'
                        ? 'bg-white text-blue-700 shadow-sm ring-1 ring-gray-900/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/80'
                    }`}
            >
                Auto Dashboard
            </button>
            <button
                type="button"
                role="tab"
                aria-selected={activeMode === 'custom'}
                onClick={() => onChangeMode?.('custom')}
                className={`px-8 py-2.5 text-sm font-bold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 ${activeMode === 'custom'
                        ? 'bg-white text-blue-700 shadow-sm ring-1 ring-gray-900/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/80'
                    }`}
            >
                Custom Dashboard
            </button>
        </div>
    );
}
