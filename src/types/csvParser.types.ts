export interface CSVParseResult<T = Record<string, unknown>> {
    data: T[];
    headers: string[];
    errors: CSVError[];
    meta: {
        totalRows: number;
        totalColumns: number;
        parseTime: number;
        fileSize: number;
    };
}

export interface CSVError {
    row: number;
    message: string;
    type: 'parse' | 'validation' | 'empty';
}

export interface CSVTableViewerProps {
    file: File | null;
    onParseComplete?: (result: CSVParseResult) => void;
    onParseError?: (error: Error) => void;
    enableSearch?: boolean;
    enableColumnFilters?: boolean;
    enableSorting?: boolean;
    enablePagination?: boolean;
    pageSize?: number;
    maxRows?: number;
    className?: string;
}

export type ParseStatus = 'idle' | 'parsing' | 'success' | 'error';
