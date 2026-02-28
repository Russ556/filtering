'use client';

import { useEffect, useMemo, useState } from 'react';
import HeaderBar from '../components/dashboard/HeaderBar';
import ModeTabs from '../components/dashboard/ModeTabs';
import UploadDropzone from '../components/dashboard/UploadDropzone';
import FilterPanel from '../components/dashboard/FilterPanel';
import PresetPanel from '../components/dashboard/PresetPanel';
import KPIGrid from '../components/dashboard/KPIGrid';
import KeywordCardList from '../components/dashboard/KeywordCardList';
import ChartGrid from '../components/dashboard/ChartGrid';
import DataTablePreview from '../components/dashboard/DataTablePreview';
import { mockDashboardData } from '../lib/mock-dashboard';
import type { AppState, CustomChartConfig, FilterPreset, RowData } from './types/dashboard';
import {
  applyFilters,
  buildKpis,
  extractKeywords,
  profileColumns,
  recommendCharts,
} from './lib/auto-analysis';
import { exportDashboardAsHtml, exportRowsAsXlsx, parseSpreadsheetFile } from './lib/export-utils';

const PRESETS_STORAGE_KEY = 'dashboard.filterPresets.v1';
const CUSTOM_CHARTS_STORAGE_KEY = 'dashboard.customCharts.v1';

function createStateFromRows(fileName: string, fileSize: number, rows: RowData[]): AppState {
  const columns = profileColumns(rows);
  const filteredRows = applyFilters(rows, { logic: 'and', conditions: [] }, columns);
  const auto = {
    kpis: buildKpis(filteredRows, columns),
    keywords: extractKeywords(
      filteredRows,
      columns.filter((column) => column.dataType === 'text' || column.dataType === 'category').map((column) => column.key),
    ),
    recommendedCharts: recommendCharts(filteredRows, columns),
  };

  return {
    ...mockDashboardData,
    workbook: {
      fileName,
      fileSize,
      uploadedAt: new Date().toISOString(),
      sheetNames: ['Sheet1'],
      activeSheet: 'Sheet1',
    },
    columns,
    rawRows: rows,
    filteredRows,
    auto,
  };
}

function createCustomChart(columns: AppState['columns']): CustomChartConfig {
  const numberColumn = columns.find((column) => column.dataType === 'number');
  const fallbackX = columns[0]?.key ?? 'x';
  const fallbackY = numberColumn?.key ?? columns[1]?.key ?? fallbackX;
  const now = Date.now().toString(36);
  return {
    id: `custom_${now}`,
    title: 'Custom Chart',
    chartType: 'bar',
    xKey: fallbackX,
    yKeys: [fallbackY],
  };
}

export default function DashboardPage() {
  const [state, setState] = useState<AppState>({
    ...mockDashboardData,
    rawRows: mockDashboardData.filteredRows,
  });
  const [presetName, setPresetName] = useState('');
  const [hasLoadedLocalState, setHasLoadedLocalState] = useState(false);

  const computed = useMemo(() => {
    const baseRows = state.rawRows.length ? state.rawRows : state.filteredRows;
    const columns = state.columns.length ? state.columns : profileColumns(baseRows);
    const filteredRows = applyFilters(baseRows, state.filters, columns);
    const textColumns = columns
      .filter((column) => column.dataType === 'text' || column.dataType === 'category')
      .map((column) => column.key);
    return {
      columns,
      filteredRows,
      auto: {
        kpis: buildKpis(filteredRows, columns),
        keywords: extractKeywords(filteredRows, textColumns),
        recommendedCharts: recommendCharts(filteredRows, columns),
      },
    };
  }, [state.rawRows, state.filteredRows, state.columns, state.filters]);

  const handleModeChange = (mode: 'auto' | 'custom') => {
    setState((prev) => ({ ...prev, mode }));
  };

  const handleChangeFilters = (nextFilters: AppState['filters']) => {
    setState((prev) => ({ ...prev, filters: nextFilters }));
  };

  const handleAddCustomChart = () => {
    setState((prev) => ({
      ...prev,
      custom: {
        ...prev.custom,
        charts: [...prev.custom.charts, createCustomChart(computed.columns)],
      },
    }));
  };

  const handleDeleteCustomChart = (id: string) => {
    setState((prev) => ({
      ...prev,
      custom: {
        ...prev.custom,
        charts: prev.custom.charts.filter((chart) => chart.id !== id),
      },
    }));
  };

  const handleUpdateCustomChart = (id: string, patch: Partial<CustomChartConfig>) => {
    setState((prev) => ({
      ...prev,
      custom: {
        ...prev.custom,
        charts: prev.custom.charts.map((chart) => (chart.id === id ? { ...chart, ...patch } : chart)),
      },
    }));
  };

  const handleSavePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    const preset: FilterPreset = {
      id: `preset_${Date.now().toString(36)}`,
      name,
      filters: JSON.parse(JSON.stringify(state.filters)),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, presets: [preset, ...prev.presets] }));
    setPresetName('');
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = state.presets.find((item) => item.id === presetId);
    if (!preset) return;
    setState((prev) => ({ ...prev, filters: JSON.parse(JSON.stringify(preset.filters)) }));
  };

  const handleDeletePreset = (presetId: string) => {
    setState((prev) => ({
      ...prev,
      presets: prev.presets.filter((preset) => preset.id !== presetId),
    }));
  };

  const handleUpload = async (file: File) => {
    try {
      setState((prev) => ({ ...prev, ui: { ...prev.ui, loading: true, error: null } }));
      const rows = await parseSpreadsheetFile(file);
      if (!rows.length) {
        throw new Error('No rows detected. Please upload a valid spreadsheet with header and rows.');
      }
      const nextState = createStateFromRows(file.name, file.size, rows);
      setState((prev) => ({
        ...prev,
        ...nextState,
        mode: prev.mode,
        presets: prev.presets,
        custom: prev.custom,
        ui: { ...prev.ui, loading: false, error: null },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        ui: {
          ...prev.ui,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to parse file.',
        },
      }));
    }
  };

  const handleExportHtml = () => {
    try {
      exportDashboardAsHtml('dashboard-capture-root', `dashboard-${Date.now()}.html`);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        ui: {
          ...prev.ui,
          error: error instanceof Error ? error.message : 'HTML export failed.',
        },
      }));
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportRowsAsXlsx({
        rows: state.rawRows.length ? state.rawRows : computed.filteredRows,
        filteredRows: computed.filteredRows,
        columns: computed.columns,
        filters: state.filters,
        fileName: `filtered-${Date.now()}.xlsx`,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        ui: {
          ...prev.ui,
          error: error instanceof Error ? error.message : 'Excel export failed.',
        },
      }));
    }
  };

  useEffect(() => {
    try {
      const rawPresets = localStorage.getItem(PRESETS_STORAGE_KEY);
      const rawCharts = localStorage.getItem(CUSTOM_CHARTS_STORAGE_KEY);
      if (!rawPresets && !rawCharts) return;
      setState((prev) => ({
        ...prev,
        presets: rawPresets ? (JSON.parse(rawPresets) as FilterPreset[]) : prev.presets,
        custom: {
          ...prev.custom,
          charts: rawCharts ? (JSON.parse(rawCharts) as CustomChartConfig[]) : prev.custom.charts,
        },
      }));
    } catch {
      // Ignore corrupted local storage entries.
    } finally {
      setHasLoadedLocalState(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedLocalState) return;
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(state.presets));
  }, [hasLoadedLocalState, state.presets]);

  useEffect(() => {
    if (!hasLoadedLocalState) return;
    localStorage.setItem(CUSTOM_CHARTS_STORAGE_KEY, JSON.stringify(state.custom.charts));
  }, [hasLoadedLocalState, state.custom.charts]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 selection:bg-blue-200 selection:text-blue-900 pb-24">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {state.ui.error && (
          <div className="mt-6 mb-2 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl shadow-sm text-sm" role="alert">
            <p className="font-bold flex items-center">
              <svg className="w-5 h-5 mr-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {state.ui.error}
            </p>
          </div>
        )}

        <HeaderBar
          filename={state.workbook?.fileName || 'Untitled.xlsx'}
          sheets={state.workbook?.sheetNames || ['Sheet1']}
          activeSheet={state.workbook?.activeSheet || 'Sheet1'}
          onExportHtml={handleExportHtml}
          onExportExcel={handleExportExcel}
        />

        <main id="dashboard-capture-root" className="relative transition-opacity duration-500 ease-in-out">
          {state.ui.loading && (
            <div
              className="absolute inset-x-0 -inset-y-6 bg-white/70 backdrop-blur-md z-50 flex flex-col items-center justify-center rounded-3xl"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-blue-600 mb-4 shadow-sm" />
              <p className="font-bold text-lg text-blue-900 tracking-tight">Processing Data...</p>
            </div>
          )}

          <UploadDropzone onFileSelect={handleUpload} />

          <div className="flex flex-col md:items-center justify-center w-full">
            <ModeTabs activeMode={state.mode} onChangeMode={handleModeChange} />
          </div>

          <div className={(state.ui.loading || !state.workbook?.fileName) ? 'opacity-50 pointer-events-none' : ''}>
            <FilterPanel columns={computed.columns} filters={state.filters} onChangeFilters={handleChangeFilters} />
            <PresetPanel
              presetName={presetName}
              onPresetNameChange={setPresetName}
              onSavePreset={handleSavePreset}
              presets={state.presets}
              onApplyPreset={handleApplyPreset}
              onDeletePreset={handleDeletePreset}
            />

            {state.mode === 'auto' ? (
              <div className="opacity-100 translate-y-0 transition-all duration-500 ease-out">
                <KPIGrid kpis={computed.auto.kpis} />
                <KeywordCardList keywords={computed.auto.keywords} />
                <ChartGrid autoCharts={computed.auto.recommendedCharts} columns={computed.columns} mode="auto" />
              </div>
            ) : (
              <div className="opacity-100 translate-y-0 transition-all duration-500 ease-out">
                <ChartGrid
                  customConfigs={state.custom.charts}
                  columns={computed.columns}
                  mode="custom"
                  onAddCustomChart={handleAddCustomChart}
                  onDeleteCustomChart={handleDeleteCustomChart}
                  onUpdateCustomChart={handleUpdateCustomChart}
                />
              </div>
            )}

            <div className="mt-4">
              <DataTablePreview columns={computed.columns} rows={computed.filteredRows} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
