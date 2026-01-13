import React from 'react';
import { Upload } from 'lucide-react';
import { FILE_UPLOAD_MESSAGES } from '../../constants/fileUpload.constants';

interface FileUploadDropzoneProps {
  isDragging: boolean;
  disabled: boolean;
  maxSizeInMB: number;
  onClick: () => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  isDragging,
  disabled,
  maxSizeInMB,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onKeyDown={handleKeyDown}
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
      `}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="File upload dropzone"
    >
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-lg font-medium text-gray-700 mb-2">
        {isDragging 
          ? FILE_UPLOAD_MESSAGES.DRAG_ACTIVE 
          : FILE_UPLOAD_MESSAGES.DRAG_INACTIVE}
      </p>
      <p className="text-sm text-gray-500">
        {FILE_UPLOAD_MESSAGES.FILE_DESCRIPTION(maxSizeInMB)}
      </p>
    </div>
  );
};
