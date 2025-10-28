import { useState, useEffect, type FC } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useDataMigration } from '../lib/dataMigrationService';
import { useError } from '../lib/ErrorContext';

interface DataMigrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const DataMigrationDialog: FC<DataMigrationDialogProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { user } = useAuth();
  const { migrateData, migrationStatus } = useDataMigration();
  const { addToast } = useError();
  const [hasLocalData, setHasLocalData] = useState<{
    hasMemories: boolean;
    hasProfile: boolean;
    totalMemories: number;
  } | null>(null);

  useEffect(() => {
    const checkLocalData = async () => {
      if (isOpen && user) {
        const { hasLocalDataToMigrate } = await import('../lib/dataMigrationService');
        const data = await hasLocalDataToMigrate(user.id);
        setHasLocalData(data);
      }
    };

    checkLocalData();
  }, [isOpen, user]);

  const handleMigrate = async () => {
    if (!user) return;

    try {
      const result = await migrateData(user.id);

      if (result.success) {
        addToast({
          type: 'success',
          title: 'Migration Complete!',
          message: `Successfully migrated ${result.memoriesMigrated} memories${result.profileMigrated ? ' and your profile' : ''} to the cloud.`,
          duration: 5000
        });
        onComplete?.();
      } else {
        addToast({
          type: 'warning',
          title: 'Migration Completed with Issues',
          message: `Some data may not have migrated. Please check the details.`,
          duration: 6000
        });
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Migration Failed',
        message: 'There was an error migrating your data. Please try again.',
        duration: 5000
      });
    }
  };

  const handleSkip = () => {
    addToast({
      type: 'info',
      title: 'Migration Skipped',
      message: 'You can migrate your data later from Settings.',
      duration: 4000
    });
    onComplete?.();
  };

  if (!isOpen) return null;

  const hasAnyData = hasLocalData && (hasLocalData.hasMemories || hasLocalData.hasProfile);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-orange-100">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mt-4">Migrate Your Data</h2>
          <p className="text-gray-600 text-sm mt-1">
            We found local data from your previous sessions. Let's move it to the cloud!
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {migrationStatus.isMigrating ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Migrating Your Data...</h3>
              <p className="text-gray-600 text-sm mb-4">{migrationStatus.currentStep}</p>

              {/* Progress bar */}
              <div className="bg-orange-200 h-2 rounded-full mb-4">
                <div
                  className="bg-gradient-to-r from-orange-500 to-rose-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${migrationStatus.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{migrationStatus.progress}% complete</p>
            </div>
          ) : hasAnyData ? (
            <div>
              <div className="bg-blue-50 p-4 rounded-xl mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">Data Found:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {hasLocalData.hasMemories && (
                    <li>📝 {hasLocalData.totalMemories} memories</li>
                  )}
                  {hasLocalData.hasProfile && (
                    <li>👤 User profile and preferences</li>
                  )}
                </ul>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-2">Benefits of Migration:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>✅ Access your data from any device</li>
                    <li>✅ Automatic backups and sync</li>
                    <li>✅ Enhanced memory analytics</li>
                    <li>✅ Cross-platform accessibility</li>
                  </ul>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-amber-800 mb-2">⚠️ Important Notes:</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Local data will be kept as backup</li>
                    <li>• Migration may take a few moments</li>
                    <li>• You can skip and migrate later</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Local Data Found</h3>
              <p className="text-gray-600 text-sm">
                We couldn't find any local data to migrate. You're all set to start fresh with cloud storage!
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {!migrationStatus.isMigrating && (
          <div className="p-6 border-t border-orange-100 bg-gray-50/50">
            {hasAnyData ? (
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Skip for Now
                </button>
                <button
                  onClick={handleMigrate}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
                >
                  Migrate Data
                </button>
              </div>
            ) : (
              <button
                onClick={onComplete}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
              >
                Get Started
              </button>
            )}
          </div>
        )}

        {/* Migration Results */}
        {migrationStatus.result && (
          <div className="p-6 border-t border-orange-100">
            <h4 className="font-semibold text-gray-800 mb-3">
              {migrationStatus.result.success ? 'Migration Successful!' : 'Migration Completed with Issues'}
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Memories migrated:</span>
                <span className="font-medium text-gray-800">{migrationStatus.result.memoriesMigrated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profile migrated:</span>
                <span className="font-medium text-gray-800">
                  {migrationStatus.result.profileMigrated ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {migrationStatus.result.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <h5 className="font-medium text-red-800 mb-2">Issues encountered:</h5>
                <ul className="text-sm text-red-700 space-y-1">
                  {migrationStatus.result.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={onComplete}
              className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataMigrationDialog;
