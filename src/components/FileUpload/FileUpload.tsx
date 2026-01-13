import React from 'react';
import type { FileUploadProps } from '../../types/fileUpload.types';
import { FILE_UPLOAD_CONSTANTS } from '../../constants/fileUpload.constants';
import { useFileUpload } from '../../hooks/useFileUpload';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadPreview } from './FileUploadPreview';
import { FileUploadError } from './FileUploadError';

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  maxSizeInMB = FILE_UPLOAD_CONSTANTS.DEFAULT_MAX_SIZE_MB,
  disabled = false,
  className = '',
  accept = FILE_UPLOAD_CONSTANTS.ACCEPTED_FILE_TYPES,
}) => {
  const {
    selectedFile,
    isDragging,
    error,
    fileInputRef,
    handleInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemove,
    handleClick,
  } = useFileUpload({
    onFileSelect,
    onFileRemove,
    maxSizeInMB,
    disabled,
  });

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
        aria-label="CSV file upload input"
      />

      {!selectedFile ? (
        <FileUploadDropzone
          isDragging={isDragging}
          disabled={disabled}
          maxSizeInMB={maxSizeInMB}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      ) : (
        <FileUploadPreview
          file={selectedFile}
          disabled={disabled}
          onRemove={handleRemove}
        />
      )}

      {error && <FileUploadError error={error} />}
    </div>
  );
};