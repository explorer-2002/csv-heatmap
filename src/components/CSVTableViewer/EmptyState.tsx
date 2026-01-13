import React from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileQuestion className="h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
};