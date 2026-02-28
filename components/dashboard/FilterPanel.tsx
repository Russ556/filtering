import React from 'react';
import { ColumnProfile, FilterCondition, FilterState } from '../../app/types/dashboard';

interface FilterPanelProps {
  columns: ColumnProfile[];
  filters: FilterState;
  onChangeFilters: (next: FilterState) => void;
}

const OPERATORS: FilterCondition['op'][] = [
  'eq',
  'neq',
  'contains',
  'startsWith',
  'endsWith',
  'in',
  'between',
  'gt',
  'gte',
  'lt',
  'lte',
  'isNull',
  'isNotNull',
];

const OP_LABEL: Record<FilterCondition['op'], string> = {
  eq: 'Equals',
  neq: 'Not Equals',
  gt: 'Greater than',
  gte: 'Greater or Equal',
  lt: 'Less than',
  lte: 'Less or Equal',
  contains: 'Contains',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  in: 'In list',
  between: 'Between',
  isNull: 'Is empty',
  isNotNull: 'Is not empty',
};

function createDefaultCondition(columns: ColumnProfile[]): FilterCondition {
  return {
    id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    column: columns[0]?.key ?? '',
    op: 'eq',
    value: '',
  };
}

export default function FilterPanel({ columns, filters, onChangeFilters }: FilterPanelProps) {
  if (!columns || columns.length === 0) return null;

  const getColumnType = (columnKey: string) => columns.find((column) => column.key === columnKey)?.dataType;
  const castValue = (columnKey: string, raw: string): string | number | boolean => {
    const type = getColumnType(columnKey);
    if (type === 'number') {
      const n = Number(raw);
      return Number.isNaN(n) ? raw : n;
    }
    if (type === 'boolean') {
      const lower = raw.trim().toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
    }
    return raw;
  };
  const castArrayValue = (columnKey: string, raw: string): string | number => {
    const type = getColumnType(columnKey);
    if (type === 'number') {
      const n = Number(raw);
      return Number.isNaN(n) ? raw : n;
    }
    return raw;
  };

  const updateCondition = (id: string, patch: Partial<FilterCondition>) => {
    const next = filters.conditions.map((condition) =>
      condition.id === id ? { ...condition, ...patch } : condition,
    );
    onChangeFilters({ ...filters, conditions: next });
  };

  const removeCondition = (id: string) => {
    onChangeFilters({
      ...filters,
      conditions: filters.conditions.filter((condition) => condition.id !== id),
    });
  };

  const addCondition = () => {
    onChangeFilters({
      ...filters,
      conditions: [...filters.conditions, createDefaultCondition(columns)],
    });
  };

  const clearAll = () => {
    onChangeFilters({ ...filters, conditions: [] });
  };

  return (
    <section aria-labelledby="filter-panel-heading" className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm ring-1 ring-gray-900/5 transition-all">
      <div className="flex items-center justify-between mb-6">
        <h3 id="filter-panel-heading" className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Data Filters
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={filters.logic}
            onChange={(e) => onChangeFilters({ ...filters, logic: e.target.value as 'and' | 'or' })}
            className="text-sm font-bold border border-gray-200 bg-gray-50 text-gray-700 rounded-lg px-3 py-1.5 outline-none hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm cursor-pointer"
            aria-label="Filter logic"
          >
            <option value="and">Match All (AND)</option>
            <option value="or">Match Any (OR)</option>
          </select>
          <span className="w-px h-5 bg-gray-200"></span>
          <button
            type="button"
            onClick={clearAll}
            className="text-sm font-bold text-gray-400 hover:text-red-600 transition-colors focus:outline-none focus:underline rounded"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filters.conditions.map((condition) => (
          <div key={condition.id} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100 group">
            <select
              value={condition.column}
              onChange={(e) => updateCondition(condition.id, { column: e.target.value })}
              className="lg:col-span-3 h-11 border border-gray-300 rounded-xl px-3 bg-white text-sm font-semibold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors cursor-pointer"
              aria-label="Filter column"
            >
              {columns.map((column) => (
                <option key={column.key} value={column.key}>
                  {column.originalName}
                </option>
              ))}
            </select>
            <select
              value={condition.op}
              onChange={(e) => {
                const op = e.target.value as FilterCondition['op'];
                const valuePatch =
                  op === 'isNull' || op === 'isNotNull'
                    ? undefined
                    : op === 'between'
                      ? ['', '']
                      : op === 'in'
                        ? []
                        : '';
                updateCondition(condition.id, { op, value: valuePatch });
              }}
              className="lg:col-span-3 h-11 border border-gray-300 rounded-xl px-3 bg-white text-sm font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors cursor-pointer"
              aria-label="Filter operator"
            >
              {OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {OP_LABEL[op]}
                </option>
              ))}
            </select>
            {condition.op === 'between' ? (
              <div className="lg:col-span-5 grid grid-cols-2 gap-2">
                <input
                  type={getColumnType(condition.column) === 'date' ? 'date' : 'text'}
                  value={Array.isArray(condition.value) ? String(condition.value[0] ?? '') : ''}
                  onChange={(e) => {
                    const current = Array.isArray(condition.value) ? condition.value : ['', ''];
                    updateCondition(condition.id, {
                      value: [castArrayValue(condition.column, e.target.value), current[1] ?? ''],
                    });
                  }}
                  placeholder="Min"
                  className="h-11 border border-gray-300 rounded-xl px-3 bg-white text-sm font-medium focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all shadow-sm placeholder-gray-400"
                  aria-label="Between minimum value"
                />
                <input
                  type={getColumnType(condition.column) === 'date' ? 'date' : 'text'}
                  value={Array.isArray(condition.value) ? String(condition.value[1] ?? '') : ''}
                  onChange={(e) => {
                    const current = Array.isArray(condition.value) ? condition.value : ['', ''];
                    updateCondition(condition.id, {
                      value: [current[0] ?? '', castArrayValue(condition.column, e.target.value)],
                    });
                  }}
                  placeholder="Max"
                  className="h-11 border border-gray-300 rounded-xl px-3 bg-white text-sm font-medium focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all shadow-sm placeholder-gray-400"
                  aria-label="Between maximum value"
                />
              </div>
            ) : condition.op === 'in' ? (
              <input
                type="text"
                value={Array.isArray(condition.value) ? condition.value.map((v) => String(v)).join(', ') : ''}
                onChange={(e) =>
                  updateCondition(condition.id, {
                    value: e.target.value
                      .split(',')
                      .map((part) => part.trim())
                      .filter((part) => part.length > 0)
                      .map((part) => castArrayValue(condition.column, part)),
                  })
                }
                placeholder="Value1, Value2, Value3"
                className="lg:col-span-5 h-11 border border-gray-300 rounded-xl px-3 bg-white text-sm font-medium focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all shadow-sm placeholder-gray-400"
                aria-label="List values"
              />
            ) : (
              <input
                type={getColumnType(condition.column) === 'date' ? 'date' : 'text'}
                value={condition.value === undefined ? '' : String(condition.value)}
                onChange={(e) => updateCondition(condition.id, { value: castValue(condition.column, e.target.value) })}
                disabled={condition.op === 'isNull' || condition.op === 'isNotNull'}
                placeholder="Enter value"
                className="lg:col-span-5 h-11 border border-gray-300 rounded-xl px-3 bg-white text-sm font-medium focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 placeholder-gray-400"
                aria-label="Filter value"
              />
            )}
            <button
              type="button"
              onClick={() => removeCondition(condition.id)}
              className="lg:col-span-1 h-11 border border-gray-300 rounded-xl bg-white text-gray-500 hover:text-white hover:bg-red-500 hover:border-red-500 text-sm font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center opacity-100"
              aria-label="Remove filter"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        {filters.conditions.length === 0 && (
          <div className="py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center">
            <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6M9 17h3" />
            </svg>
            <p className="text-gray-500 font-bold mb-1">No active filters</p>
            <p className="text-gray-400 text-sm">Add a filter to refine the data in your dashboard.</p>
          </div>
        )}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={addCondition}
          className="h-11 px-5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 hover:text-blue-800 text-sm font-bold flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Filter
        </button>
      </div>
    </section>
  );
}
