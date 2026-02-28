import type {
  ChartSpec,
  ColumnProfile,
  DataType,
  FilterCondition,
  FilterState,
  KPIItem,
  KeywordItem,
  RowData,
} from '../types/dashboard';

export function detectColumnType(values: unknown[]): DataType {
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== '');
  if (nonNull.length === 0) return 'unknown';

  let numberCount = 0;
  let dateCount = 0;
  let booleanCount = 0;
  const normalized = nonNull.map((v) => String(v).trim());

  for (const value of normalized) {
    const lower = value.toLowerCase();
    if (value !== '' && !Number.isNaN(Number(value))) numberCount += 1;
    if (!Number.isNaN(Date.parse(value))) dateCount += 1;
    if (lower === 'true' || lower === 'false' || lower === '1' || lower === '0') booleanCount += 1;
  }

  const total = nonNull.length;
  const uniqueCount = new Set(normalized).size;

  if (booleanCount / total >= 0.95) return 'boolean';
  if (numberCount / total >= 0.8) return 'number';
  if (dateCount / total >= 0.7) return 'date';
  if (uniqueCount <= Math.min(30, Math.ceil(total * 0.2))) return 'category';
  return 'text';
}

export function profileColumns(rows: RowData[]): ColumnProfile[] {
  if (rows.length === 0) return [];

  const keys = Object.keys(rows[0]).filter((k) => k !== '__rowId');
  return keys.map((key) => {
    const values = rows.map((row) => row[key]);
    const nonNull = values.filter((v) => v !== null && v !== undefined && v !== '');
    const dataType = detectColumnType(values);
    const normalized = nonNull.map((v) => String(v));
    const uniqueCount = new Set(normalized).size;
    const nullRatio = values.length === 0 ? 0 : (values.length - nonNull.length) / values.length;
    const sampleValues = normalized.slice(0, 5);

    let min: number | string | undefined;
    let max: number | string | undefined;

    if (dataType === 'number') {
      const nums = nonNull.map((v) => Number(v)).filter((v) => !Number.isNaN(v));
      if (nums.length > 0) {
        min = Math.min(...nums);
        max = Math.max(...nums);
      }
    } else if (dataType === 'date') {
      const times = nonNull
        .map((v) => Date.parse(String(v)))
        .filter((v) => !Number.isNaN(v))
        .sort((a, b) => a - b);
      if (times.length > 0) {
        min = new Date(times[0]).toISOString();
        max = new Date(times[times.length - 1]).toISOString();
      }
    }

    return {
      key,
      originalName: key,
      dataType,
      nullRatio,
      uniqueCount,
      sampleValues,
      min,
      max,
    };
  });
}

export function applyFilters(
  rows: RowData[],
  filter: FilterState,
  columns: ColumnProfile[] = [],
): RowData[] {
  return applyFiltersWithColumns(rows, filter, columns);
}

export function applyFiltersWithColumns(
  rows: RowData[],
  filter: FilterState,
  columns: ColumnProfile[] = [],
): RowData[] {
  if (!filter.conditions.length) return rows;

  const typeMap = new Map(columns.map((column) => [column.key, column.dataType]));
  const parseDate = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const t = Date.parse(String(value));
    return Number.isNaN(t) ? null : t;
  };
  const toComparableNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  };
  const normalizeForEquality = (value: unknown, dataType: DataType | undefined): string | number | boolean | null => {
    if (value === null || value === undefined || value === '') return null;
    if (dataType === 'number') {
      const n = toComparableNumber(value);
      return n === null ? null : n;
    }
    if (dataType === 'boolean') {
      if (typeof value === 'boolean') return value;
      const lower = String(value).toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
    }
    return String(value).toLowerCase();
  };

  const evaluate = (row: RowData, condition: FilterCondition): boolean => {
    const rowValue = row[condition.column];
    const expected = condition.value;
    const rowText = rowValue === null || rowValue === undefined ? '' : String(rowValue);
    const dataType = typeMap.get(condition.column);

    switch (condition.op) {
      case 'eq': {
        const left = normalizeForEquality(rowValue, dataType);
        const right = normalizeForEquality(expected, dataType);
        return left === right;
      }
      case 'neq': {
        const left = normalizeForEquality(rowValue, dataType);
        const right = normalizeForEquality(expected, dataType);
        return left !== right;
      }
      case 'gt': {
        if (dataType === 'date') {
          const left = parseDate(rowValue);
          const right = parseDate(expected);
          return left !== null && right !== null ? left > right : false;
        }
        return Number(rowValue) > Number(expected);
      }
      case 'gte': {
        if (dataType === 'date') {
          const left = parseDate(rowValue);
          const right = parseDate(expected);
          return left !== null && right !== null ? left >= right : false;
        }
        return Number(rowValue) >= Number(expected);
      }
      case 'lt': {
        if (dataType === 'date') {
          const left = parseDate(rowValue);
          const right = parseDate(expected);
          return left !== null && right !== null ? left < right : false;
        }
        return Number(rowValue) < Number(expected);
      }
      case 'lte': {
        if (dataType === 'date') {
          const left = parseDate(rowValue);
          const right = parseDate(expected);
          return left !== null && right !== null ? left <= right : false;
        }
        return Number(rowValue) <= Number(expected);
      }
      case 'contains':
        return rowText.toLowerCase().includes(String(expected ?? '').toLowerCase());
      case 'startsWith':
        return rowText.toLowerCase().startsWith(String(expected ?? '').toLowerCase());
      case 'endsWith':
        return rowText.toLowerCase().endsWith(String(expected ?? '').toLowerCase());
      case 'in':
        return Array.isArray(expected)
          ? expected.some((item) => normalizeForEquality(item, dataType) === normalizeForEquality(rowValue, dataType))
          : false;
      case 'between':
        if (!Array.isArray(expected) || expected.length !== 2) return true;
        if (dataType === 'date') {
          const rowTime = parseDate(rowValue);
          const minTime = parseDate(expected[0]);
          const maxTime = parseDate(expected[1]);
          return rowTime !== null && minTime !== null && maxTime !== null
            ? rowTime >= minTime && rowTime <= maxTime
            : false;
        }
        return Number(rowValue) >= Number(expected[0]) && Number(rowValue) <= Number(expected[1]);
      case 'isNull':
        return rowValue === null || rowValue === undefined || rowValue === '';
      case 'isNotNull':
        return rowValue !== null && rowValue !== undefined && rowValue !== '';
      default:
        return true;
    }
  };

  return rows.filter((row) => {
    const results = filter.conditions.map((condition) => evaluate(row, condition));
    return filter.logic === 'and' ? results.every(Boolean) : results.some(Boolean);
  });
}

export function buildKpis(rows: RowData[], profiles: ColumnProfile[]): KPIItem[] {
  const numberColumns = profiles.filter((profile) => profile.dataType === 'number');
  const kpis: KPIItem[] = [
    { id: 'rows', label: 'Rows', value: rows.length },
    { id: 'columns', label: 'Columns', value: profiles.length },
  ];

  for (const profile of numberColumns.slice(0, 2)) {
    const nums = rows
      .map((row) => Number(row[profile.key]))
      .filter((v) => !Number.isNaN(v));
    if (nums.length === 0) continue;
    const sum = nums.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / nums.length;
    kpis.push({ id: `${profile.key}-sum`, label: `${profile.originalName} Sum`, value: Math.round(sum * 100) / 100 });
    kpis.push({ id: `${profile.key}-avg`, label: `${profile.originalName} Avg`, value: Math.round(avg * 100) / 100 });
  }

  return kpis.slice(0, 6);
}

export function extractKeywords(rows: RowData[], textColumns: string[]): KeywordItem[] {
  const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'to', 'of', 'for', 'in', 'on', 'at', 'is', 'are']);
  const counts = new Map<string, number>();

  for (const row of rows) {
    for (const column of textColumns) {
      const value = row[column];
      if (typeof value !== 'string') continue;
      const tokens = value
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 2 && !stopwords.has(token));
      for (const token of tokens) {
        counts.set(token, (counts.get(token) ?? 0) + 1);
      }
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([text, count]) => ({ text, count }));
}

export function recommendCharts(rows: RowData[], profiles: ColumnProfile[]): ChartSpec[] {
  const charts: ChartSpec[] = [];
  const numberColumns = profiles.filter((profile) => profile.dataType === 'number');
  const dateColumns = profiles.filter((profile) => profile.dataType === 'date');
  const categoryColumns = profiles.filter((profile) => profile.dataType === 'category');

  if (dateColumns[0] && numberColumns[0]) {
    const x = dateColumns[0];
    const y = numberColumns[0];
    charts.push({
      id: 'line-date-number',
      title: `${y.originalName} Over ${x.originalName}`,
      chartType: 'line',
      xKey: x.key,
      yKey: y.key,
      dataset: rows.map((row) => ({ [x.key]: row[x.key], [y.key]: row[y.key] })),
    });
  }

  if (categoryColumns[0] && numberColumns[0]) {
    const x = categoryColumns[0];
    const y = numberColumns[0];
    charts.push({
      id: 'bar-category-number',
      title: `${y.originalName} by ${x.originalName}`,
      chartType: 'bar',
      xKey: x.key,
      yKey: y.key,
      dataset: rows.map((row) => ({ [x.key]: row[x.key], [y.key]: row[y.key] })),
    });
  }

  if (numberColumns.length >= 2) {
    const x = numberColumns[0];
    const y = numberColumns[1];
    charts.push({
      id: 'scatter-number-number',
      title: `${y.originalName} vs ${x.originalName}`,
      chartType: 'scatter',
      xKey: x.key,
      yKey: y.key,
      dataset: rows.map((row) => ({ [x.key]: row[x.key], [y.key]: row[y.key] })),
    });
  }

  if (numberColumns.length >= 3) {
    charts.push({
      id: 'radar-three-number',
      title: 'Multi-Metric Radar',
      chartType: 'radar',
      series: numberColumns.slice(0, 3).map((column) => ({ key: column.key, name: column.originalName })),
      dataset: rows.slice(0, 20).map((row) =>
        numberColumns.slice(0, 3).reduce<Record<string, unknown>>((acc, column) => {
          acc[column.key] = row[column.key];
          return acc;
        }, {}),
      ),
    });
  }

  return charts;
}
