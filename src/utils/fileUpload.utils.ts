import { FILE_UPLOAD_CONSTANTS, FILE_UPLOAD_MESSAGES } from '../constants/fileUpload.constants';
import type { FileError } from '../types/fileUpload.types';

export const validateFile = (
    file: File,
    maxSizeInBytes: number,
    maxSizeInMB: number
  ): FileError | null => {
    const isValidType = 
      file.name.toLowerCase().endsWith('.csv') || 
      file.type === 'text/csv' ||
      file.type === 'application/vnd.ms-excel';
  
    if (!isValidType) {
      return {
        message: FILE_UPLOAD_MESSAGES.FILE_TYPE_ERROR,
        type: 'type',
      };
    }
  
    if (file.size > maxSizeInBytes) {
      return {
        message: FILE_UPLOAD_MESSAGES.FILE_SIZE_ERROR(maxSizeInMB),
        type: 'size',
      };
    }
  
    return null;
  };

  export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const { KILOBYTE, FILE_SIZE_UNITS } = FILE_UPLOAD_CONSTANTS;
    const i = Math.floor(Math.log(bytes) / Math.log(KILOBYTE));
    const size = bytes / Math.pow(KILOBYTE, i);
    
    return `${Math.round(size * 100) / 100} ${FILE_SIZE_UNITS[i]}`;
  };

  export const convertMBToBytes = (mb: number): number => {
    return mb * FILE_UPLOAD_CONSTANTS.KILOBYTE * FILE_UPLOAD_CONSTANTS.KILOBYTE;
  };