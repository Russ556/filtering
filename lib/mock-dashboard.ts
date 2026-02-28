import { AppState } from '../app/types/dashboard';

export const mockDashboardData: AppState = {
    mode: 'auto',
    workbook: {
        fileName: 'sales_data_2023.xlsx',
        fileSize: 1024000,
        uploadedAt: new Date().toISOString(),
        sheetNames: ['Sales', 'Expenses'],
        activeSheet: 'Sales',
    },
    columns: [
        { key: 'date', originalName: 'Date', dataType: 'date', nullRatio: 0, uniqueCount: 30, sampleValues: ['2023-10-01'] },
        { key: 'revenue', originalName: 'Revenue', dataType: 'number', nullRatio: 0.05, uniqueCount: 15, sampleValues: ['1500'] },
        { key: 'category', originalName: 'Category', dataType: 'category', nullRatio: 0, uniqueCount: 3, sampleValues: ['Electronics'] },
        { key: 'isActive', originalName: 'Active', dataType: 'boolean', nullRatio: 0, uniqueCount: 2, sampleValues: ['true'] },
    ],
    rawRows: [],
    filteredRows: [
        { __rowId: 'r1', date: '2023-10-01', revenue: 1500, category: 'Electronics', isActive: true },
        { __rowId: 'r2', date: '2023-10-02', revenue: 2300, category: 'Clothing', isActive: true },
        { __rowId: 'r3', date: '2023-10-03', revenue: 800, category: 'Groceries', isActive: false },
    ],
    filters: {
        logic: 'and',
        conditions: []
    },
    presets: [],
    auto: {
        kpis: [
            { id: 'kpi1', label: 'Total Revenue', value: '$4,600' },
            { id: 'kpi2', label: 'Active Users', value: '1,240' },
            { id: 'kpi3', label: 'Bounce Rate', value: '42%' },
            { id: 'kpi4', label: 'Conversion', value: '3.8%' },
        ],
        keywords: [
            { text: 'Sale', count: 120 },
            { text: 'Discount', count: 85 },
            { text: 'Refund', count: 15 },
            { text: 'Event', count: 5 },
        ],
        recommendedCharts: [
            { id: 'rc1', title: 'Revenue over Time', chartType: 'line', xKey: 'date', yKey: 'revenue', dataset: [] },
            { id: 'rc2', title: 'Sales by Category', chartType: 'bar', xKey: 'category', yKey: 'revenue', dataset: [] },
        ],
    },
    custom: {
        charts: [
            { id: 'cc1', title: 'Custom Analysis', chartType: 'scatter', xKey: 'date', yKeys: ['revenue'] },
            { id: 'cc2', title: 'Custom Pie', chartType: 'pie', xKey: 'category', yKeys: ['revenue'] },
        ],
    },
    ui: {
        loading: false,
        error: null,
        selectedChartId: null
    },
};
