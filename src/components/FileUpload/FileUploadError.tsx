import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { FileError } from '../../types/fileUpload.types';

interface FileUploadErrorProps {
  error: FileError;
}

export const FileUploadError: React.FC<FileUploadErrorProps> = ({ error }) => {
  return (
    <div className="mt-2 flex items-center text-sm text-red-600" role="alert">
      <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
      <span>{error.message}</span>
    </div>
  );
};
