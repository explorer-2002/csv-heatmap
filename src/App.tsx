import { useState } from 'react';
import './App.css';
import { FileUpload } from './components/FileUpload/FileUpload';
import { CSVTableViewer } from './components/CSVTableViewer/CSVTableViewer';
import { FILE_UPLOAD_CONSTANTS } from './constants/fileUpload.constants';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleParseComplete = () => {
    // Optional: Handle successful parse completion
    console.log('CSV parsed successfully');
  };

  const handleParseError = (error: Error) => {
    // Optional: Handle parse errors
    console.error('CSV parse error:', error);
  };

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden">
      {!selectedFile ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CSV Parser
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            Upload a CSV file to view and analyze your data
          </p>
          <FileUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            maxSizeInMB={FILE_UPLOAD_CONSTANTS.DEFAULT_MAX_SIZE_MB}
            className="w-full max-w-4xl"
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="shrink-0 px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                CSV Data Viewer
              </h1>
              <p className="text-sm text-gray-600">
                Analyzing: <span className="font-medium">{selectedFile.name}</span>
              </p>
            </div>
            <button
              onClick={handleFileRemove}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200 font-medium"
            >
              Upload New File
            </button>
          </div>
          <div className="flex-1 overflow-auto px-6 py-4">
            <CSVTableViewer
              file={selectedFile}
              onParseComplete={handleParseComplete}
              onParseError={handleParseError}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
