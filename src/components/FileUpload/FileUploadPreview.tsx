import React from 'react';
import { FileText, X } from 'lucide-react';
import { formatFileSize } from '../../utils/fileUpload.utils';

interface FileUploadPreviewProps {
  file: File;
  disabled: boolean;
  onRemove: () => void;
}

export const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({
  file,
  disabled,
  onRemove,
}) => {
  return (
    <div className="border-2 border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="shrink-0">
            <FileText className="h-10 w-10 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
              {file.name}
            </p>
            <p className="text-sm text-gray-500">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          disabled={disabled}
          className="shrink-0 ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Remove file"
          type="button"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};
