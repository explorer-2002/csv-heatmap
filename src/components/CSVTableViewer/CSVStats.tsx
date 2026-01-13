import React from 'react';
import { FileText, Table, Clock, HardDrive } from 'lucide-react';
import type { CSVParseResult } from '../../types/csvParser.types';
import { formatFileSize } from '../../utils/csvParser.utils';

interface CSVStatsProps {
  result: CSVParseResult;
  fileName: string;
  isLimited?: boolean;
  maxRows?: number;
}

export const CSVStats: React.FC<CSVStatsProps> = ({ 
  result, 
  fileName,
  isLimited,
  maxRows,
}) => {
  const stats = [
    {
      icon: FileText,
      label: 'File',
      value: fileName,
    },
    {
      icon: Table,
      label: 'Rows',
      value: `${result.meta.totalRows.toLocaleString()}${isLimited ? ` of ${maxRows}` : ''}`,
    },
    {
      icon: Table,
      label: 'Columns',
      value: result.meta.totalColumns.toString(),
    },
    {
      icon: Clock,
      label: 'Parse Time',
      value: `${result.meta.parseTime}ms`,
    },
    {
      icon: HardDrive,
      label: 'File Size',
      value: formatFileSize(result.meta.fileSize),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <stat.icon className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 truncate" title={stat.value}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};