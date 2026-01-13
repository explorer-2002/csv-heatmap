import { useState, useEffect, useCallback } from 'react';
import type { CSVParseResult, ParseStatus } from '../types/csvParser.types';
import { parseCSVFile } from '../utils/csvParser.utils';

interface UseCSVParserProps {
  file: File | null;
  maxRows?: number;
  onParseComplete?: (result: CSVParseResult) => void;
  onParseError?: (error: Error) => void;
}

export const useCSVParser = ({
  file,
  maxRows,
  onParseComplete,
  onParseError,
}: UseCSVParserProps) => {
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [status, setStatus] = useState<ParseStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const parseFile = useCallback(async () => {
    if (!file) {
      setStatus('idle');
      setParseResult(null);
      setError(null);
      return;
    }

    setStatus('parsing');
    setError(null);

    try {
      const result = await parseCSVFile(file, maxRows);
      setParseResult(result);
      setStatus('success');
      if (onParseComplete) {
        onParseComplete(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown parsing error');
      setError(error);
      setStatus('error');
      onParseError?.(error);
    }
  }, [file, maxRows, onParseComplete, onParseError]);

  useEffect(() => {
    // Defer parseFile to avoid calling setState synchronously within an effect
    queueMicrotask(() => {
      parseFile();
    });
  }, [parseFile]);

  const reset = useCallback(() => {
    setParseResult(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    parseResult,
    status,
    error,
    reset,
    reparse: parseFile,
  };
};
