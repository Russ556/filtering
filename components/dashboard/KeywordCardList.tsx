import React from 'react';
import { KeywordItem } from '../../app/types/dashboard';

interface KeywordCardListProps {
    keywords: KeywordItem[];
}

export default function KeywordCardList({ keywords }: KeywordCardListProps) {
    if (!keywords || keywords.length === 0) return null;

    return (
        <section aria-labelledby="keywords-heading" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-10 ring-1 ring-gray-900/5">
            <h3 id="keywords-heading" className="text-base font-bold text-gray-800 mb-5 flex items-center">
                <svg className="w-5 h-5 mr-2.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Top Keywords
            </h3>
            <div className="flex flex-wrap gap-3">
                {keywords.map((kw, i) => (
                    <div
                        key={i}
                        className="flex items-center px-4 py-2 bg-blue-50/80 border border-blue-100 hover:border-blue-300 hover:bg-blue-100/50 transition-colors rounded-xl group"
                    >
                        <span className="font-bold text-blue-900 mr-3 text-sm">{kw.text}</span>
                        <span className="bg-white text-blue-700 text-xs font-black px-2.5 py-1 rounded-lg shadow-sm ring-1 ring-blue-900/5">
                            {kw.count}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
