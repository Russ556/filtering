import React from 'react';
import { KPIItem } from '../../app/types/dashboard';

interface KPIGridProps {
    kpis: KPIItem[];
}

export default function KPIGrid({ kpis }: KPIGridProps) {
    if (!kpis || kpis.length === 0) return null;

    return (
        <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {kpis.map((kpi) => (
                <article
                    key={kpi.id}
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all min-h-[120px]"
                >
                    <h4 className="text-gray-500 font-bold text-sm uppercase tracking-wide mb-3 line-clamp-1" title={kpi.label}>
                        {kpi.label}
                    </h4>
                    <div className="flex items-baseline gap-1 mt-auto">
                        <span className="text-3xl font-extrabold text-gray-900 tabular-nums tracking-tight">
                            {kpi.value}
                        </span>
                        {kpi.unit && (
                            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-1">
                                {kpi.unit}
                            </span>
                        )}
                    </div>
                </article>
            ))}
        </section>
    );
}
