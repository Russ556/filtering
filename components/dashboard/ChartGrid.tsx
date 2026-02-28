import React from 'react';
import { ChartSpec, CustomChartConfig, ColumnProfile, ChartType } from '../../app/types/dashboard';

const ChartPlaceholder = ({ chartType, xKey, yKey }: { chartType: ChartType, xKey?: string, yKey?: string }) => (
    <div
        className="bg-gray-50/70 rounded-xl border-2 border-gray-200 border-dashed h-72 flex flex-col items-center justify-center text-gray-400 group-hover:bg-blue-50/30 group-hover:border-blue-200 transition-colors"
        aria-hidden="true"
    >
        <div className="bg-white p-3 rounded-full shadow-sm mb-4 ring-1 ring-gray-900/5">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {chartType === 'bar' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                {chartType === 'line' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />}
                {chartType === 'pie' && (
                    <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </>
                )}
                {chartType === 'scatter' && (
                    <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3v18h18" />
                        <circle cx="9" cy="9" r="2.5" fill="currentColor" />
                        <circle cx="15" cy="15" r="2.5" fill="currentColor" />
                    </>
                )}
                {['area', 'radar', 'treemap', 'table', 'kpi', 'keyword'].includes(chartType) && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" />}
            </svg>
        </div>
        <p className="font-extrabold text-gray-600 uppercase tracking-widest text-xs mb-2.5">{chartType} Chart Layout</p>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
            <span className="text-gray-400">X:</span> <span className="text-gray-700 max-w-[80px] truncate">{xKey || 'N/A'}</span>
            <span className="w-px h-3 bg-gray-200"></span>
            <span className="text-gray-400">Y:</span> <span className="text-gray-700 max-w-[80px] truncate">{yKey || 'N/A'}</span>
        </div>
    </div>
);

export function AutoChartCard({ chart }: { chart: ChartSpec }) {
    return (
        <article className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all ring-1 ring-gray-900/5 group flex flex-col h-full focus-within:ring-2 focus-within:ring-blue-500">
            <h4 className="font-extrabold text-gray-900 text-lg mb-5 line-clamp-1" title={chart.title}>{chart.title}</h4>
            <div className="flex-1">
                <ChartPlaceholder chartType={chart.chartType} xKey={chart.xKey} yKey={chart.yKey} />
            </div>
        </article>
    );
}

export function CustomChartBuilder({
    config,
    columns,
    onUpdate,
    onDelete,
}: {
    config: CustomChartConfig,
    columns: ColumnProfile[],
    onUpdate?: (id: string, patch: Partial<CustomChartConfig>) => void,
    onDelete?: (id: string) => void,
}) {
    return (
        <article className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md ring-1 ring-blue-100 flex flex-col hover:shadow-lg transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-300 group h-full">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-gray-100 gap-4">
                <input
                    type="text"
                    value={config.title}
                    onChange={(e) => onUpdate?.(config.id, { title: e.target.value })}
                    aria-label="Chart Title"
                    className="font-extrabold text-gray-900 text-xl outline-none border-b-2 border-transparent focus:border-blue-500 focus:bg-blue-50/50 px-2 py-1 -ml-2 rounded transition-colors w-full sm:w-1/2 hover:bg-gray-50 placeholder-gray-400"
                    placeholder="Enter chart title"
                />
                <div className="flex items-center space-x-2 shrink-0 bg-gray-50 p-1.5 rounded-xl border border-gray-200/60">
                    <label htmlFor={`chartType-${config.id}`} className="sr-only">Chart Type</label>
                    <select
                        id={`chartType-${config.id}`}
                        className="text-sm border-none bg-transparent font-bold text-gray-700 py-1.5 px-2 outline-none hover:text-blue-700 focus:ring-2 focus:ring-blue-500 rounded-lg cursor-pointer transition-colors"
                        value={config.chartType}
                        onChange={(e) => onUpdate?.(config.id, { chartType: e.target.value as ChartType })}
                    >
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="scatter">Scatter Plot</option>
                        <option value="area">Area Chart</option>
                        <option value="treemap">Treemap</option>
                    </select>
                    <span className="w-px h-5 bg-gray-200"></span>
                    <button
                        type="button"
                        aria-label="Delete Chart"
                        onClick={() => onDelete?.(config.id)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </header>

            <div className="flex flex-col gap-4 mb-6 bg-gray-50/80 p-5 rounded-xl border border-gray-200/60">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label htmlFor={`xAxis-${config.id}`} className="text-xs font-bold text-gray-500 uppercase tracking-wider w-14 shrink-0">X-Axis</label>
                    <select
                        id={`xAxis-${config.id}`}
                        className="flex-1 text-sm font-semibold border border-gray-300 rounded-lg shadow-sm outline-none py-2.5 px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors cursor-pointer"
                        value={config.xKey}
                        onChange={(e) => onUpdate?.(config.id, { xKey: e.target.value })}
                    >
                        {columns.map(c => <option key={c.key} value={c.key}>{c.originalName}</option>)}
                    </select>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label htmlFor={`yAxis-${config.id}`} className="text-xs font-bold text-gray-500 uppercase tracking-wider w-14 shrink-0">Y-Axis</label>
                    <select
                        id={`yAxis-${config.id}`}
                        className="flex-1 text-sm font-semibold border border-gray-300 rounded-lg shadow-sm outline-none py-2.5 px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors cursor-pointer"
                        value={config.yKeys?.[0] || ''}
                        onChange={(e) => onUpdate?.(config.id, { yKeys: [e.target.value] })}
                    >
                        {columns.map(c => <option key={c.key} value={c.key}>{c.originalName}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex-1">
                <ChartPlaceholder chartType={config.chartType} xKey={config.xKey} yKey={config.yKeys?.[0]} />
            </div>
        </article>
    );
}

export default function ChartGrid({
    autoCharts = [],
    customConfigs = [],
    columns = [],
    mode,
    onAddCustomChart,
    onDeleteCustomChart,
    onUpdateCustomChart,
}: {
    autoCharts?: ChartSpec[],
    customConfigs?: CustomChartConfig[],
    columns?: ColumnProfile[],
    mode: 'auto' | 'custom',
    onAddCustomChart?: () => void,
    onDeleteCustomChart?: (id: string) => void,
    onUpdateCustomChart?: (id: string, patch: Partial<CustomChartConfig>) => void,
}) {
    const isCustomEmpty = mode === 'custom' && customConfigs.length === 0;

    return (
        <section aria-labelledby="charts-heading" className="mb-10">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 id="charts-heading" className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {mode === 'auto' ? 'Generated Insights' : 'Custom Canvas'}
                </h3>
                {mode === 'custom' && (
                    <button
                        type="button"
                        onClick={onAddCustomChart}
                        className="flex items-center text-sm font-bold text-white hover:text-white px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
                        aria-label="Add new custom chart"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Custom Chart
                    </button>
                )}
            </header>

            {isCustomEmpty ? (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-16 flex flex-col items-center justify-center text-center transition-opacity duration-500 opacity-100">
                    <div className="bg-blue-50/80 p-5 rounded-full mb-5 ring-4 ring-blue-50">
                        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <h4 className="text-xl font-extrabold text-gray-800 mb-2">No custom charts yet</h4>
                    <p className="text-gray-500 font-medium max-w-sm">Click the "Add Custom Chart" button above to start building your own visualizations from the dataset.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
                    {mode === 'auto' && autoCharts.map(chart => (
                        <AutoChartCard key={chart.id} chart={chart} />
                    ))}
                    {mode === 'custom' && customConfigs.map(config => (
                        <CustomChartBuilder
                            key={config.id}
                            config={config}
                            columns={columns}
                            onDelete={onDeleteCustomChart}
                            onUpdate={onUpdateCustomChart}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
