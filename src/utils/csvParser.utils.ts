import Papa from 'papaparse';
import type { CSVParseResult, CSVError } from '../types/csvParser.types';
import { CSV_PARSER_CONSTANTS } from '../constants/csvParser.constants';

export const parseCSVFile = (
  file: File,
  maxRows?: number
): Promise<CSVParseResult> => {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const errors: CSVError[] = [];

    Papa.parse<Record<string, unknown>>(file, {
      ...CSV_PARSER_CONSTANTS.PARSE_CONFIG,
      complete: (results) => {
        const parseTime = performance.now() - startTime;
        
        if (!results.data || results.data.length === 0) {
          reject(new Error('CSV file is empty or invalid'));
          return;
        }

        // Filter out empty rows
        const validData: Record<string, unknown>[] = results.data.filter((row: Record<string, unknown>) => {
          return Object.values(row).some(
            value => value !== null && value !== undefined && value !== ''
          );
        });

        // Apply max rows limit if specified
        const limitedData: Record<string, unknown>[] = maxRows 
          ? validData.slice(0, maxRows)
          : validData;

        // Extract headers from first data row
        const headers: string[] = results.meta.fields || [];

        // Process Papa parse errors
        if (results.errors && results.errors.length > 0) {
          results.errors.forEach((error: { row?: number, message: string }) => {
            errors.push({
              row: error.row || 0,
              message: error.message,
              type: 'parse',
            });
          });
        }

        const parseResult: CSVParseResult = {
          data: limitedData,
          headers,
          errors,
          meta: {
            totalRows: limitedData.length,
            totalColumns: headers.length,
            parseTime: Math.round(parseTime),
            fileSize: file.size,
          },
        };

        resolve(parseResult);
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
};

export const generateColumnsFromHeaders = (headers: string[]) => {
  return headers.map((header) => ({
    accessorKey: header,
    header: header,
    size: 150,
    enableSorting: true,
    enableColumnFilter: true,
  }));
};