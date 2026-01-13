import React, { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import type { CSVTableViewerProps } from '../../types/csvParser.types';
import { CSV_PARSER_CONSTANTS, CSV_PARSER_MESSAGES } from '../../constants/csvParser.constants';
import { useCSVParser } from '../../hooks/useCsvParser';
import { generateColumnsFromHeaders } from '../../utils/csvParser.utils';
import { CSVStats } from './CSVStats';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { EmptyState } from './EmptyState';
import { Button, Menu, MenuItem } from '@mui/material';

// Utility to interpolate color between green and red according to a normalized value [0, 1]
// minValue gets green, maxValue gets red, values in between get a gradient
// Modified: Now returns colors such that the minimum "rate" in the row is greenest, the maximum is reddest, and intermediates smoothly interpolate.
// For N supplier rates in the row, computes color per rate based on rank (0 = min, 1 = max).
// function getSupplierRateColorByRow(
//   value: number,
//   allRatesInRow: number[],
// ): string {
//   if (!Array.isArray(allRatesInRow) || allRatesInRow.length === 0) {
//     return '#C8E6C9'; // fallback: light green
//   }
//   const validRates = allRatesInRow.filter((n) => isFinite(n));
//   if (validRates.length === 0) {
//     return '#C8E6C9';
//   }
//   const min = Math.min(...validRates);
//   const max = Math.max(...validRates);

//   if (max === min) {
//     return '#C8E6C9'; // all same
//   }
//   // Normalize: 0 for min -> green, 1 for max -> red
//   const ratio = (value - min) / (max - min);

//   // Gradient from green (low) to red (high)
//   const r = Math.round(200 + 55 * ratio); // 200->255
//   const g = Math.round(230 - 60 * ratio); // 230->170
//   const b = Math.round(201 - 70 * ratio); // 201->131
//   return `rgb(${r},${g},${b})`;
// }

// function getSupplierRateColor(value: number, min: number, max: number): string {
//   if (max === min) {
//     // Only one supplier, just use green
//     return '#C8E6C9'; // Light green
//   }
//   // Normalize value between 0 and 1
//   const ratio = (value - min) / (max - min);
//   // Gradient from green (low) to red (high)
//   const r = Math.round(200 + 55 * ratio); // 200->255
//   const g = Math.round(230 - 60 * ratio); // 230->170
//   const b = Math.round(201 - 70 * ratio); // 201->131
//   return `rgb(${r},${g},${b})`;
// }

// Helper to get up/down arrow unicode and color for percentage diff
function getDiffIndicator(diff: number) {
  if (diff > 0) {
    return { arrow: '↑', color: '#D32F2F' }; // red, upwards
  }
  if (diff < 0) {
    return { arrow: '↓', color: '#388E3C' }; // green, downwards
  }
  return { arrow: '', color: '#757575' };
}

// Helper to calculate relative luminance for contrast checking
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Helper to determine text color based on background brightness
function getTextColorForBackground(r: number, g: number, b: number): string {
  const luminance = getLuminance(r, g, b);
  // Use white text for dark backgrounds (luminance < 0.5), black for light backgrounds
  return luminance < 0.5 ? '#FFFFFF' : '#1F2937';
}

// Helper to compute a color for a cell based on its value relative to other rates in its row.
// Lightest color for min value, darkest for max.
function getSupplierRateColorRelativeInRow(
  value: number,
  allRatesInRow: number[],
): { bgColor: string; textColor: string } {
  if (!Array.isArray(allRatesInRow) || allRatesInRow.length === 0) {
    return { bgColor: '#E8F5E9', textColor: '#1F2937' }; // light green with dark text
  }
  const validRates = allRatesInRow.filter((n) => isFinite(n));
  if (validRates.length === 0) {
    return { bgColor: '#E8F5E9', textColor: '#1F2937' };
  }
  const min = Math.min(...validRates);
  const max = Math.max(...validRates);

  if (!isFinite(value) || max === min) {
    return { bgColor: '#E8F5E9', textColor: '#1F2937' }; // fallback/lightest for corner cases
  }
  // Ratio: 0 for min (lightest), 1 for max (darkest)
  const ratio = (value - min) / (max - min);

  // Multi-stop color gradient: Light green → Yellow → Orange → Light red → Dark red
  // Color stops with RGB values
  const colorStops = [
    { stop: 0.0, rgb: [232, 245, 233] },   // #E8F5E9 - Light green
    { stop: 0.25, rgb: [255, 249, 196] },  // #FFF9C4 - Yellow
    { stop: 0.5, rgb: [255, 183, 77] },    // #FFB74D - Orange
    { stop: 0.75, rgb: [239, 83, 80] },    // #EF5350 - Light red
    { stop: 1.0, rgb: [198, 40, 40] },     // #C62828 - Dark red
  ];

  // Find which two color stops to interpolate between
  let startStop = colorStops[0];
  let endStop = colorStops[colorStops.length - 1];

  for (let i = 0; i < colorStops.length - 1; i++) {
    if (ratio >= colorStops[i].stop && ratio <= colorStops[i + 1].stop) {
      startStop = colorStops[i];
      endStop = colorStops[i + 1];
      break;
    }
  }

  // Calculate interpolation factor within the current segment
  const segmentRange = endStop.stop - startStop.stop;
  const segmentRatio = segmentRange > 0 
    ? (ratio - startStop.stop) / segmentRange 
    : 0;

  // Interpolate between the two color stops
  function interpolateColor(start: number[], end: number[], t: number): number[] {
    return start.map((s, i) => Math.round(s + (end[i] - s) * t));
  }

  const [r, g, b] = interpolateColor(startStop.rgb, endStop.rgb, segmentRatio);
  const bgColor = `rgb(${r},${g},${b})`;
  const textColor = getTextColorForBackground(r, g, b);

  return { bgColor, textColor };
}

// Custom cell renderer for Supplier Rates
function makeSupplierRatesColumn(
  header: string,
  supplierRateKey: string,
  estimatedAmountKey: string,
  supplierRateKeys: string[]
): MRT_ColumnDef<Record<string, unknown>> {
  return {
    header,
    accessorKey: supplierRateKey,
    Cell: ({ cell, row }) => {
      const rate = Number(cell.getValue());
      const estimated = Number(row.original[estimatedAmountKey]);
      let percentDiff: number | null = null;
      if (isFinite(rate) && isFinite(estimated) && estimated !== 0) {
        percentDiff = ((rate - estimated) / estimated) * 100;
      }

      // Get all supplier rates from the current row only
      const ratesInCurrentRow = supplierRateKeys
        .map((key) => Number(row.original[key]))
        .filter((v) => isFinite(v));

      const { bgColor, textColor } = getSupplierRateColorRelativeInRow(rate, ratesInCurrentRow);
      let diffIndicator = null;
      if (percentDiff !== null) {
        const indicator = getDiffIndicator(percentDiff);
        // Adjust indicator color for better visibility on dark backgrounds
        const indicatorColor = textColor === '#FFFFFF'
          ? (indicator.color === '#D32F2F' ? '#FFCDD2' : '#A5D6A7') // lighter colors for dark bg
          : indicator.color; // original colors for light bg
        diffIndicator = (
          <span style={{ color: indicatorColor, marginLeft: 8, fontWeight: 500 }}>
            {indicator.arrow}
            {Math.abs(percentDiff).toFixed(1)}%
          </span>
        );
      }
      return (
        <div
          style={{
            background: bgColor,
            color: textColor,
            padding: '0.35em 0.75em',
            borderRadius: 6,
            minWidth: 90,
            display: 'flex',
            alignItems: 'center',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 500,
          }}
        >
          {isNaN(rate) ? '-' : rate.toLocaleString()}
          {diffIndicator}
        </div>
      );
    },
  };
}

// The below config assumes columns for estimatedAmount and supplier rates are named consistently, e.g.,
// estimated_amount and each supplier as SupplierX_Rate. Adapt the selector as needed.

// You may adapt these to your own header/field names
const ESTIMATED_AMOUNT_KEY = 'Estimated Rate'; // expected column name for estimated amount
const SUPPLIER_RATE_HEADER_PREFIX = 'Supplier'; // e.g. "Supplier1_Rate", "Supplier2_Rate"...

function getSupplierRateColumnsAndStats(headers: string[]) {
  // Find all supplier rate columns
  const supplierRateKeys = headers.filter(
    (h) =>
      h.toLowerCase().startsWith(SUPPLIER_RATE_HEADER_PREFIX.toLowerCase())
  );

  // Now, build columns with custom cell renderer for each supplier
  // Pass supplierRateKeys so each cell can calculate colors based on its row's rates
  const supplierRateColumns: MRT_ColumnDef<Record<string, unknown>>[] = supplierRateKeys.map(
    (key) =>
      makeSupplierRatesColumn(
        headers.find((h) => h === key) || key,
        key,
        ESTIMATED_AMOUNT_KEY,
        supplierRateKeys
      )
  );
  return supplierRateColumns;
}

export const CSVTableViewer: React.FC<CSVTableViewerProps> = ({
  file,
  onParseComplete,
  onParseError,
  enableSearch = true,
  enableColumnFilters = true,
  enableSorting = true,
  enablePagination = true,
  pageSize = CSV_PARSER_CONSTANTS.DEFAULT_PAGE_SIZE,
  maxRows = CSV_PARSER_CONSTANTS.MAX_ROWS_DEFAULT,
  className = '',
}) => {
  const { parseResult, status, error, reparse } = useCSVParser({
    file,
    maxRows,
    onParseComplete,
    onParseError,
  });

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const columns = useMemo<MRT_ColumnDef<Record<string, unknown>>[]>(() => {
    if (!parseResult) return [];

    // Generate default columns
    const defaultColumns = generateColumnsFromHeaders(parseResult.headers);

    // Check if we have supplier rate columns and replace them with custom formatted ones
    const supplierRateColumns = getSupplierRateColumnsAndStats(
      parseResult.headers
    );

    // If we found supplier rate columns, replace them in the default columns
    if (supplierRateColumns.length > 0) {
      const supplierRateKeys = supplierRateColumns.map(col => col.accessorKey as string);
      // Filter out default columns that match supplier rate keys, then add custom ones
      const filteredColumns = defaultColumns.filter(
        col => !supplierRateKeys.includes(col.accessorKey as string)
      );
      return [...filteredColumns, ...supplierRateColumns];
    }

    return defaultColumns;
  }, [parseResult]);

  const table = useMaterialReactTable({
    columns,
    data: parseResult?.data ?? [],
    enableColumnFilters,
    enableGlobalFilter: enableSearch,
    enableSorting,
    enablePagination,
    enableColumnResizing: true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableHiding: true,
    enableColumnPinning: true,
    enableColumnActions: true,
    enablePinning: true,
    initialState: {
      pagination: {
        pageSize,
        pageIndex: 0,
      },
      density: 'compact',
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: 'calc(100vh - 300px)',
        height: '100%',
      },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
      },
    },
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: '#f9fafb',
        fontWeight: 600,
        fontSize: '0.875rem',
      },
    },
    muiTableBodyCellProps: {
      sx: {
        fontSize: '0.875rem',
      },
    },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    renderTopToolbarCustomActions: ({ table }) => (
      <>
        <Button onClick={(e) => setAnchorEl(e.currentTarget)}>
          Freeze Columns
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            table.setColumnPinning({ left: [], right: [] });
            setAnchorEl(null);
          }}>
            Unfreeze All
          </MenuItem>
          {table.getAllColumns().map((column, index) => (
            <MenuItem
              key={column.id}
              onClick={() => {
                const columnsToFreeze = table
                  .getAllColumns()
                  .slice(0, index)
                  .map(col => col.id);

                table.setColumnPinning({
                  left: columnsToFreeze,
                  right: []
                });
                setAnchorEl(null);
              }}
            >
              Freeze before "{column.columnDef.header}"
            </MenuItem>
          ))}
        </Menu>
      </>
    )
  });

  if (!file) {
    return (
      <div className={className}>
        <EmptyState message={CSV_PARSER_MESSAGES.NO_FILE} />
      </div>
    );
  }

  if (status === 'parsing') {
    return (
      <div className={className}>
        <LoadingSpinner message={CSV_PARSER_MESSAGES.PARSING} />
      </div>
    );
  }

  if (status === 'error' && error) {
    return (
      <div className={className}>
        <ErrorDisplay error={error} onRetry={reparse} />
      </div>
    );
  }

  if (status === 'success' && parseResult) {
    const isLimited = parseResult.data.length >= maxRows;

    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="shrink-0 space-y-4 mb-4">
          <CSVStats
            result={parseResult}
            fileName={file.name}
            isLimited={isLimited}
            maxRows={maxRows}
          />

          {isLimited && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ {CSV_PARSER_MESSAGES.ROWS_LIMIT(maxRows)}
              </p>
            </div>
          )}

          {parseResult.errors.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm font-medium text-orange-800 mb-2">
                Parsing Warnings ({parseResult.errors.length})
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {parseResult.errors.slice(0, 5).map((err, idx) => (
                  <p key={idx} className="text-xs text-orange-700">
                    Row {err.row}: {err.message}
                  </p>
                ))}
                {parseResult.errors.length > 5 && (
                  <p className="text-xs text-orange-700 font-medium">
                    ...and {parseResult.errors.length - 5} more warnings
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0">
          <MaterialReactTable table={table} />
        </div>
      </div>
    );
  }

  return null;
};
