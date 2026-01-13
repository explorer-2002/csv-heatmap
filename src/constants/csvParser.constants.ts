export const CSV_PARSER_CONSTANTS = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_ROWS_DEFAULT: 10000,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
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

  