export type DataType = 'number' | 'category' | 'date' | 'text' | 'boolean' | 'unknown';

export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'radar'
  | 'scatter'
  | 'treemap'
  | 'area'
  | 'table'
  | 'kpi'
  | 'keyword';

export interface WorkbookMeta {
  fileName: string;
  fileSize: number;
  uploadedAt: string; // ISO
  sheetNames: string[];
  activeSheet: string;
}

export interface ColumnProfile {
  key: string;
  originalName: string;
  dataType: DataType;
  nullRatio: number;
  uniqueCount: number;
  sampleValues: string[];
  min?: number | string;
  max?: number | string;
}

export interface RowData {
  __rowId: string;
  [key: string]: string | number | boolean | null;
}

export interface FilterCondition {
  id: string;
  column: string;
  op:
    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'in'
    | 'between'
    | 'isNull'
    | 'isNotNull';
  value?: string | number | boolean | (string | number)[];
}

export interface FilterState {
  logic: 'and' | 'or';
  conditions: FilterCondition[];
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: string; // ISO
}

export interface KPIItem {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
}

export interface KeywordItem {
  text: string;
  count: number;
}

export interface ChartSpec {
  id: string;
  title: string;
  chartType: ChartType;
  xKey?: string;
  yKey?: string;
  series?: { key: string; name: string }[];
  dataset: Record<string, unknown>[];
}

export interface AutoAnalysisResult {
  kpis: KPIItem[];
  keywords: KeywordItem[];
  recommendedCharts: ChartSpec[];
}

export interface CustomChartConfig {
  id: string;
  title: string;
  chartType: ChartType;
  xKey: string;
  yKeys: string[];
  groupBy?: string;
}

export interface AppState {
  mode: 'auto' | 'custom';
  workbook: WorkbookMeta | null;
  columns: ColumnProfile[];
  rawRows: RowData[];
  filteredRows: RowData[];
  filters: FilterState;
  presets: FilterPreset[];
  auto: AutoAnalysisResult;
  custom: {
    charts: CustomChartConfig[];
  };
  ui: {
    loading: boolean;
    error: string | null;
    selectedChartId: string | null;
  };
}
