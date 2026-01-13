export interface FileUploadProps {
    onFileSelect: (file: File) => void;
    onFileRemove?: () => void;
    maxSizeInMB?: number;
    disabled?: boolean;
    className?: string;
    accept?: string;
  }

  export interface FileError {
    message: string;
    type: 'size' | 'type' | 'general';
  }

  export const FileUploadStatus = {
    IDLE: 'idle',
    DRAGGING: 'dragging',
    ERROR: 'error',
    SUCCESS: 'success',
  } as const;

  export type FileUploadStatus = typeof FileUploadStatus[keyof typeof FileUploadStatus];
