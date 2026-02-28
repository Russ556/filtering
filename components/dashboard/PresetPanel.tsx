import React from 'react';
import { FilterPreset } from '../../app/types/dashboard';

interface PresetPanelProps {
    presetName: string;
    onPresetNameChange: (name: string) => void;
    onSavePreset: () => void;
    presets: FilterPreset[];
    onApplyPreset: (id: string) => void;
    onDeletePreset: (id: string) => void;
}

export default function PresetPanel({
    presetName,
    onPresetNameChange,
    onSavePreset,
    presets,
    onApplyPreset,
    onDeletePreset,
}: PresetPanelProps) {
    return (
        <section aria-labelledby="preset-panel-heading" className="bg-white border border-gray-200 rounded-2xl p-5 mb-8 shadow-sm ring-1 ring-gray-900/5">
            <h3 id="preset-panel-heading" className="sr-only">Filter Presets</h3>
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

                <div className="flex flex-1 sm:max-w-md gap-3 items-center">
                    <div className="relative flex-1">
                        <label htmlFor="preset-name" className="sr-only">Preset Name</label>
                        <input
                            id="preset-name"
                            type="text"
                            value={presetName}
                            onChange={(e) => onPresetNameChange(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') onSavePreset(); }}
                            placeholder="Type preset name..."
                            className="h-11 w-full border border-gray-300 rounded-xl pl-4 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            aria-label="New filter preset name"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={onSavePreset}
                        disabled={!presetName.trim()}
                        className="h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm"
                        aria-label="Save current filter as preset"
                    >
                        Save
                    </button>
                </div>

                <div className="flex flex-wrap gap-2.5 flex-1 lg:justify-end content-start">
                    {presets.map((preset) => (
                        <div
                            key={preset.id}
                            className="inline-flex items-center gap-1.5 border border-gray-200 rounded-lg pl-3 pr-1.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group min-w-[120px] max-w-[220px]"
                            role="group"
                            aria-label={`Preset: ${preset.name}`}
                        >
                            <button
                                type="button"
                                onClick={() => onApplyPreset(preset.id)}
                                className="text-xs font-bold text-gray-700 group-hover:text-blue-700 truncate max-w-[120px] focus:outline-none focus:underline"
                                aria-label={`Apply preset ${preset.name}`}
                            >
                                {preset.name}
                            </button>
                            <span className="w-px h-3 bg-gray-200 mx-0.5"></span>
                            <button
                                type="button"
                                onClick={() => onDeletePreset(preset.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                aria-label={`Delete preset ${preset.name}`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    {presets.length === 0 && (
                        <p className="text-sm font-medium text-gray-400 italic flex items-center h-11">No presets saved.</p>
                    )}
                </div>

            </div>
        </section>
    );
}
