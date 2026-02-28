import React from 'react';

interface HeaderBarProps {
    filename?: string;
    sheets?: string[];
    activeSheet?: string;
    onExportHtml?: () => void;
    onExportExcel?: () => void;
}

export default function HeaderBar({
    filename = 'Untitled.xlsx',
    sheets = ['Sheet1'],
    activeSheet = 'Sheet1',
    onExportHtml,
    onExportExcel,
}: HeaderBarProps) {
    return (
        <header className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-gray-200 mb-8 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight shrink-0">Dashboard</h1>
                <div className="flex items-center px-4 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 shadow-inner group transition-colors hover:bg-gray-200">
                    <svg className="w-4 h-4 mr-2.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-semibold mr-4 truncate max-w-[150px] sm:max-w-xs">{filename}</span>
                    <label htmlFor="sheet-select" className="sr-only">Select Sheet</label>
                    <select
                        id="sheet-select"
                        className="bg-transparent text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer border-l border-gray-300 pl-3 py-0.5 rounded-sm"
                        defaultValue={activeSheet}
                    >
                        {sheets.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onExportHtml}
                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm"
                    aria-label="Export dashboard to HTML"
                >
                    Export HTML
                </button>
                <button
                    type="button"
                    onClick={onExportExcel}
                    className="px-5 py-2.5 bg-blue-600 border border-transparent text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm flex items-center gap-2"
                    aria-label="Export filtered data to Excel"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Export Excel
                </button>
            </div>
        </header>
    );
}
