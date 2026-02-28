import React from 'react';
import { ColumnProfile, RowData } from '../../app/types/dashboard';

interface DataTablePreviewProps {
    columns: ColumnProfile[];
    rows: RowData[];
}

export default function DataTablePreview({ columns, rows }: DataTablePreviewProps) {
    if (!columns || columns.length === 0) return null;

    return (
        <section aria-labelledby="data-preview-heading" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col mb-10 ring-1 ring-gray-900/5">
            <header className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center sm:px-8">
                <h3 id="data-preview-heading" className="text-lg font-extrabold text-gray-900 flex items-center tracking-tight">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Data Preview
                    <span className="ml-3 text-gray-500 font-semibold text-sm bg-gray-200/70 px-2.5 py-0.5 rounded-full inline-flex items-center justify-center">
                        Top {Math.min(rows.length, 5)}
                    </span>
                </h3>
            </header>
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left align-middle" aria-label="Data Preview Table">
                    <thead className="bg-white text-gray-700 font-bold border-b-2 border-gray-200 text-sm tracking-wide">
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} scope="col" className="px-6 py-4 sm:px-8 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {col.originalName}
                                        <span className="text-[10px] uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded-md tracking-widest font-extrabold border border-gray-200/60 shadow-sm">
                                            {col.dataType}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white text-sm font-medium">
                        {rows.slice(0, 5).map((row) => (
                            <tr key={row.__rowId} className="hover:bg-blue-50/50 transition-colors group">
                                {columns.map(col => (
                                    <td key={col.key} className="px-6 py-4 sm:px-8 text-gray-700 whitespace-nowrap group-hover:text-gray-900">
                                        {row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : <span className="text-gray-300">-</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                        <span className="text-base font-semibold">No data points found based on applied filters.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
