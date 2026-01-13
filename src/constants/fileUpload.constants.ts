export const FILE_UPLOAD_CONSTANTS = {
    DEFAULT_MAX_SIZE_MB: 10,
    ACCEPTED_FILE_TYPES: '.csv,text/csv',
    FILE_SIZE_UNITS: ['Bytes', 'KB', 'MB', 'GB'] as const,
    KILOBYTE: 1024,
  } as const;

  export const FILE_UPLOAD_MESSAGES = {
    DRAG_ACTIVE: 'Drop your CSV file here',
    DRAG_INACTIVE: 'Click to upload or drag and drop',
    FILE_TYPE_ERROR: 'Please upload a CSV file',
    FILE_SIZE_ERROR: (maxSize: number) => `File size exceeds ${maxSize}MB limit`,
    FILE_DESCRIPTION: (maxSize: number) => `CSV files only (max ${maxSize}MB)`,
  } as const;