
import { useState, useRef, type ChangeEvent, type FC } from 'react';
import { Download, Upload, FileText, AlertTriangle, CheckCircle, Loader, ChevronLeft } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useError } from '../lib/ErrorContext';
import { backupService } from '../lib/backupService';
import { useAppState } from '../lib/AppStateContext';

const DataExportImport: FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const { addToast } = useError();
  const { dispatch } = useAppState();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      dispatch({ type: 'SET_DETAIL_VIEW', payload: null });
    }
  };

  const handleExport = async () => {
    if (!user?.id) return;

    setIsExporting(true);
    try {
      await backupService.downloadBackupFile();
      addToast({
        type: 'success',
        title: 'Backup Downloaded',
        message: 'Your memories have been exported successfully!',
        duration: 4000
      });
    } catch (error: any) {
      console.error('Export error:', error);
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export your data.',
        duration: 5000
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please select a valid JSON backup file.',
        duration: 4000
      });
      return;
    }

    try {
      const text = await file.text();
      const backupData = backupService.parseBackupData(text);
      setImportPreview(backupData);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Invalid Backup File',
        message: error.message || 'The selected file is not a valid backup.',
        duration: 5000
      });
    }
  };

  const handleImport = async () => {
    if (!importPreview) return;

    setIsImporting(true);
    try {
      const result = await backupService.importBackupData(importPreview);

      if (result.errors.length > 0) {
        addToast({
          type: 'warning',
          title: 'Import Completed with Issues',
          message: `Imported ${result.importedMemories} memories. ${result.skippedMemories} skipped. Check console for details.`,
          duration: 6000
        });
        console.warn('Import errors:', result.errors);
      } else {
        addToast({
          type: 'success',
          title: 'Import Complete',
          message: `Successfully imported ${result.importedMemories} memories${result.importedProfile ? ' and profile data' : ''}.`,
          duration: 5000
        });
      }

      setImportPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Import Failed',
        message: error.message || 'Failed to import backup data.',
        duration: 5000
      });
    } finally {
      setIsImporting(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-800">Data Management</h1>
          <p className="text-sm text-gray-600">Backup your memories or import from another device</p>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Export Backup</h2>
            <p className="text-sm text-gray-600">Download all your memories and data</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Backup includes all memories, profile data, and settings</li>
                  <li>File will be downloaded as JSON format</li>
                  <li>Keep backups safe and private</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isExporting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating Backup...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download Backup
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Import Backup</h2>
            <p className="text-sm text-gray-600">Restore memories from a backup file</p>
          </div>
        </div>

        {!importPreview ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Select a MemoryKeeper backup file (.json)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Choose File
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-2">Backup Preview:</p>
                  <div className="space-y-1">
                    <p><strong>Memories:</strong> {importPreview.memories.length}</p>
                    <p><strong>Profile:</strong> {importPreview.profile ? 'Yes' : 'No'}</p>
                    <p><strong>Exported:</strong> {new Date(importPreview.exportDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Import Warning:</p>
                  <p>This will merge data with your existing memories. Duplicate entries will be handled automatically.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setImportPreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="flex-1 flex items-center justify-center gap-3 py-3 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isImporting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Import Data
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataExportImport;
