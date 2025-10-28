import { getAllMemories, getProfile } from './indexedDBService';
import { OfflineMemory } from './indexedDBService';

export interface BackupData {
  memories: OfflineMemory[];
  profile: any;
  exportDate: string;
  version: string;
}

/**
 * Export all user memories and profile data to JSON
 */
export const exportBackupData = async (): Promise<string> => {
  try {
    const memories = await getAllMemories();
    const profile = await getProfile();

    const backupData: BackupData = {
      memories,
      profile,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(backupData, null, 2);
  } catch (error) {
    console.error('Error exporting backup data:', error);
    throw new Error('Failed to export backup data');
  }
};

/**
 * Download backup data as a JSON file
 */
export const downloadBackupFile = async (filename?: string): Promise<void> => {
  try {
    const backupData = await exportBackupData();
    const defaultFilename = `memorykeeper-backup-${new Date().toISOString().split('T')[0]}.json`;
    const finalFilename = filename || defaultFilename;

    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading backup file:', error);
    throw new Error('Failed to download backup file');
  }
};

/**
 * Parse backup data from JSON string
 */
export const parseBackupData = (jsonData: string): BackupData => {
  try {
    const data = JSON.parse(jsonData) as BackupData;

    // Basic validation
    if (!data.memories || !Array.isArray(data.memories)) {
      throw new Error('Invalid backup data: memories array missing');
    }

    if (!data.exportDate) {
      throw new Error('Invalid backup data: export date missing');
    }

    return data;
  } catch (error) {
    console.error('Error parsing backup data:', error);
    throw new Error('Invalid backup file format');
  }
};

/**
 * Import backup data with validation and conflict resolution
 */
export const importBackupData = async (backupData: BackupData): Promise<{
  importedMemories: number;
  importedProfile: boolean;
  skippedMemories: number;
  errors: string[];
}> => {
  const result = {
    importedMemories: 0,
    importedProfile: false,
    skippedMemories: 0,
    errors: [] as string[]
  };

  try {
    const { addSingleMemory, saveProfile, getAllMemories } = await import('./indexedDBService');

    // Validate backup data
    if (!Array.isArray(backupData.memories)) {
      result.errors.push('Invalid backup data: memories array missing');
      return result;
    }

    // Get existing memories for conflict detection
    const existingMemories = await getAllMemories();
    const existingIds = new Set(existingMemories.map(m => m.id));

    // Import memories with conflict resolution
    for (const memory of backupData.memories) {
      try {
        // Skip if memory with this ID already exists
        if (existingIds.has(memory.id)) {
          result.skippedMemories++;
          continue;
        }

        // Validate memory data
        if (!memory.prompt || !memory.response) {
          result.errors.push(`Invalid memory data for ID ${memory.id}`);
          continue;
        }

        const success = await addSingleMemory(memory);
        if (success) {
          result.importedMemories++;
        } else {
          result.errors.push(`Failed to import memory "${memory.prompt}"`);
        }
      } catch (error: any) {
        result.errors.push(`Error importing memory: ${error.message}`);
      }
    }

    // Import profile if it exists
    if (backupData.profile) {
      try {
        await saveProfile(backupData.profile);
        result.importedProfile = true;
      } catch (error: any) {
        result.errors.push(`Failed to import profile: ${error.message}`);
      }
    }

  } catch (error: any) {
    result.errors.push(`Import failed: ${error.message}`);
  }

  return result;
};

// Export service object
export const backupService = {
  exportBackupData,
  downloadBackupFile,
  parseBackupData,
  importBackupData
};