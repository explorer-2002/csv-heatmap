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

        // Helpers for case-insensitive header matching
        const normalize = (str: string) => str.trim().toLowerCase();
        const headerMap = headers.reduce<Record<string, string>>((acc, h) => {
          acc[normalize(h)] = h;
          return acc;
        }, {});

        // Validate required headers before proceeding (case-insensitive)
        const requiredHeaders = CSV_PARSER_CONSTANTS.REQUIRED_HEADERS || [];
        const missingHeaders = requiredHeaders.filter(
          (required) => !headerMap[normalize(required)]
        );

        if (missingHeaders.length > 0) {
          const message = `Missing required columns: ${missingHeaders.join(
            ', '
          )}. Please upload a CSV file with the required content.`;
          reject(new Error(message));
          return;
        }

        // Validate numeric columns (case-insensitive)
        const numericHeaders =
          CSV_PARSER_CONSTANTS.REQUIRED_NUMERIC_HEADERS || requiredHeaders;
        const numericColumns = numericHeaders
          .map((required) => headerMap[normalize(required)])
          .filter(Boolean);

        const invalidNumericEntries: { row: number; column: string; value: unknown }[] = [];

        validData.forEach((row, idx) => {
          numericColumns.forEach((col) => {
            const value = row[col];
            if (value === null || value === undefined || value === '') return;
            const num = typeof value === 'number' ? value : Number(value);
            if (!Number.isFinite(num)) {
              invalidNumericEntries.push({ row: idx + 1, column: col, value });
            }
          });
        });

        if (invalidNumericEntries.length > 0) {
          const badColumns = Array.from(
            new Set(invalidNumericEntries.map((entry) => entry.column))
          );
          const badRows = Array.from(
            new Set(invalidNumericEntries.slice(0, 10).map((entry) => entry.row))
          );
          const message = `Invalid numeric data in required columns: ${badColumns.join(
            ', '
          )}. Problematic rows (sample): ${badRows.join(
            ', '
          )}. Please upload a CSV file with numeric values in these columns.`;
          reject(new Error(message));
          return;
        }

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