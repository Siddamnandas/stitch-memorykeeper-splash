
import { useState, type FC } from 'react';
import { Upload, Settings, CheckCircle, AlertTriangle, ChevronLeft, Loader } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useError } from '../lib/ErrorContext';
import { useAppState } from '../lib/AppStateContext';
import FileUpload, { ProcessedFileData } from './FileUpload';
import { memoryImportService, MemoryImportOptions, ImportResult } from '../lib/memoryImportService';

const MemoryImport: FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const { addToast } = useError();
  const { dispatch } = useAppState();
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileData[]>([]);
  const [importOptions, setImportOptions] = useState<MemoryImportOptions>({
    autoTag: true,
    preserveDates: false,
    generatePrompts: true,
    batchSize: 5
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      dispatch({ type: 'SET_DETAIL_VIEW', payload: null });
    }
  };

  const handleFileProcessed = (fileData: ProcessedFileData) => {
    setProcessedFiles(prev => [...prev, fileData]);
  };

  const handleImport = async () => {
    if (!user?.id || processedFiles.length === 0) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await memoryImportService.importMemoriesFromFiles(
        processedFiles,
        user.id,
        importOptions
      );

      setImportResult(result);

      if (result.success) {
        addToast({
          type: 'success',
          title: 'Import Complete!',
          message: `Successfully imported ${result.importedMemories} memories from ${processedFiles.length} files.`,
          duration: 5000
        });

        // Clear processed files on success
        setProcessedFiles([]);
      } else {
        addToast({
          type: 'warning',
          title: 'Import Completed with Issues',
          message: `Imported ${result.importedMemories} memories, but ${result.failedImports} failed. Check details below.`,
          duration: 6000
        });
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Import Failed',
        message: error.message || 'An unexpected error occurred during import.',
        duration: 5000
      });
    } finally {
      setIsImporting(false);
    }
  };

  const clearFiles = () => {
    setProcessedFiles([]);
    setImportResult(null);
  };

  return (
    <div className="pt-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100 hover:bg-orange-50 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Import Memories</h1>
          <p className="text-sm text-gray-600">Upload photos and documents to create new memories</p>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Upload Files</h2>
            <p className="text-sm text-gray-600">Select photos and documents to import</p>
          </div>
        </div>

        <FileUpload
          onFileProcessed={handleFileProcessed}
          acceptedTypes={['image/*', '.pdf', '.txt', '.doc', '.docx']}
          maxFileSize={10}
          multiple={true}
        />
      </div>

      {/* Import Options */}
      {processedFiles.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Import Options</h2>
                <p className="text-sm text-gray-600">Customize how your files are processed</p>
              </div>
            </div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
          </div>

          <div className="space-y-4">
            {/* Basic Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={importOptions.autoTag}
                  onChange={(e) => setImportOptions(prev => ({ ...prev, autoTag: e.target.checked }))}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Auto-generate tags</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={importOptions.generatePrompts}
                  onChange={(e) => setImportOptions(prev => ({ ...prev, generatePrompts: e.target.checked }))}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Generate memory prompts</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={importOptions.preserveDates}
                  onChange={(e) => setImportOptions(prev => ({ ...prev, preserveDates: e.target.checked }))}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Preserve file dates</span>
              </label>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Advanced Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Size
                    </label>
                    <select
                      value={importOptions.batchSize}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value={1}>1 file at a time</option>
                      <option value={3}>3 files</option>
                      <option value={5}>5 files</option>
                      <option value={10}>10 files</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Summary */}
      {processedFiles.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ready to Import</h2>

          <div className="space-y-4">
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Import Summary:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{processedFiles.length} files ready for import</li>
                    {processedFiles.filter(f => f.type === 'image').length > 0 && (
                      <li>{processedFiles.filter(f => f.type === 'image').length} image files</li>
                    )}
                    {processedFiles.filter(f => f.type === 'document').length > 0 && (
                      <li>{processedFiles.filter(f => f.type === 'document').length} document files</li>
                    )}
                    <li>Auto-tagging: {importOptions.autoTag ? 'Enabled' : 'Disabled'}</li>
                    <li>Memory prompts: {importOptions.generatePrompts ? 'Generated' : 'Simple'}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearFiles}
                className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition-all"
                disabled={isImporting}
              >
                Clear Files
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="flex-1 flex items-center justify-center gap-3 py-3 px-6 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isImporting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Import Memories
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              importResult.success
                ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                : 'bg-gradient-to-br from-amber-400 to-orange-500'
            }`}>
              {importResult.success ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Import Results</h2>
              <p className="text-sm text-gray-600">
                {importResult.success ? 'Import completed successfully' : 'Import completed with some issues'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-green-50 rounded-xl p-3 text-center border border-green-200">
              <div className="text-2xl font-bold text-green-700">{importResult.importedMemories}</div>
              <div className="text-xs text-green-600">Imported</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center border border-red-200">
              <div className="text-2xl font-bold text-red-700">{importResult.failedImports}</div>
              <div className="text-xs text-red-600">Failed</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{importResult.processedFiles.length}</div>
              <div className="text-xs text-blue-600">Files</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
              <div className="text-2xl font-bold text-gray-700">{importResult.errors.length}</div>
              <div className="text-xs text-gray-600">Errors</div>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
              <h3 className="text-sm font-semibold text-red-800 mb-2">Errors:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                {importResult.errors.slice(0, 5).map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{error}</span>
                  </li>
                ))}
                {importResult.errors.length > 5 && (
                  <li className="text-red-600 font-medium">
                    ... and {importResult.errors.length - 5} more errors
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Import Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">For Images:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Photos will create visual memory prompts</li>
              <li>• Filenames with dates are automatically tagged</li>
              <li>• Keywords like "family", "wedding" are detected</li>
              <li>• Supported formats: JPG, PNG, GIF, WebP</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">For Documents:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Text files are split into memory entries</li>
              <li>• Each paragraph becomes a separate memory</li>
              <li>• Auto-generated tags from content keywords</li>
              <li>• Supported formats: TXT, PDF (text-based)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryImport;
