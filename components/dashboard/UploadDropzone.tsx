import React from 'react';

interface UploadDropzoneProps {
    onFileSelect?: (file: File) => void;
}

export default function UploadDropzone({ onFileSelect }: UploadDropzoneProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) onFileSelect?.(file);
        event.target.value = '';
    };

    return (
        <label
            className="group relative border-2 border-dashed border-gray-300 rounded-2xl p-16 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer mb-10 overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/30"
            aria-label="File upload dropzone"
        >
            <div className="bg-white p-5 rounded-full shadow-sm mb-5 group-hover:scale-110 group-hover:shadow-md transition-transform duration-300 ring-1 ring-gray-900/5">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Drag and drop your spreadsheet</h3>
            <p className="text-gray-500 text-sm mb-6 font-medium">Supports .xlsx, .xls, .csv up to 50MB</p>
            <span className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2">
                Browse Files
            </span>
            <input
                className="sr-only"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleChange}
                aria-label="Upload spreadsheet file"
            />
        </label>
    );
}
