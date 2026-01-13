export const CSV_PARSER_CONSTANTS = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_ROWS_DEFAULT: 10000,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
    // Required columns in the CSV. Update this list to match your schema.
    REQUIRED_HEADERS: [
      'Item Code',
      'Material',
      'Quantity',
      'Estimated Rate',
      'Supplier 1 (Rate)',
      'Supplier 2 (Rate)',
      'Supplier 3 (Rate)',
      'Supplier 4 (Rate)',
      'Supplier 5 (Rate)',
    ],
    // Columns that must contain numeric data (case-insensitive matching)
    REQUIRED_NUMERIC_HEADERS: [
      'Quantity',
      'Estimated Rate',
      'Supplier 1 (Rate)',
      'Supplier 2 (Rate)',
      'Supplier 3 (Rate)',
      'Supplier 4 (Rate)',
      'Supplier 5 (Rate)',
    ],
    PARSE_CONFIG: {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header: string) => header.trim(),
    },
  } as const;

  export const CSV_PARSER_MESSAGES = {
    PARSING: 'Parsing CSV file...',
    SUCCESS: (rows: number) => `Successfully parsed ${rows} rows`,
    ERROR: 'Failed to parse CSV file',
    EMPTY_FILE: 'The CSV file is empty',
    NO_FILE: 'No file selected',
    LOADING: 'Loading data...',
    NO_DATA: 'No data available',
    ROWS_LIMIT: (max: number) => `Showing first ${max} rows`,
  } as const;

  