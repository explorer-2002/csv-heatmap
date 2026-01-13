import { useState, useRef, useCallback } from 'react';
import type { FileError } from '../types/fileUpload.types';
import { validateFile as validateFileUtil, convertMBToBytes } from '../utils/fileUpload.utils';

interface UseFileUploadProps {
    onFileSelect: (file: File) => void;
    onFileRemove?: () => void;
    maxSizeInMB: number;
    disabled: boolean;
}

export const useFileUpload = ({
    onFileSelect,
    onFileRemove,
    maxSizeInMB,
    disabled,
}: UseFileUploadProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<FileError | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const maxSizeInBytes = convertMBToBytes(maxSizeInMB);

    const handleFileChange = useCallback(
        (file: File | null) => {
            setError(null);

            if (!file) {
                setSelectedFile(null);
                return;
            }

            const validationError = validateFileUtil(file, maxSizeInBytes, maxSizeInMB);

            if (validationError) {
                setError(validationError);
                setSelectedFile(null);
                return;
            }

            setSelectedFile(file);
            onFileSelect(file);
        },
        [maxSizeInBytes, maxSizeInMB, onFileSelect]
    );

    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0] || null;
            handleFileChange(file);
        },
        [handleFileChange]
    );

    const handleDragOver = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            if (!disabled) {
                setIsDragging(true);
            }
        },
        [disabled]
    );

    const handleDragLeave = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(false);
        },
        []
    );

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(false);

            if (disabled) return;

            const file = event.dataTransfer.files?.[0] || null;
            handleFileChange(file);
        },
        [disabled, handleFileChange]
    );

    const handleRemove = useCallback(() => {
        setSelectedFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onFileRemove?.();
    }, [onFileRemove]);

    const handleClick = useCallback(() => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    }, [disabled]);

    return {
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
    };
};
