import { addMemory } from './dataService';
import { addActivityAndRecalculate } from './memoryStrengthService';
import { sanitizeMemoryData, sanitizeTextInput } from './inputSanitizer';
import { ProcessedFileData } from '../components/FileUpload';

export interface ImportResult {
  success: boolean;
  importedMemories: number;
  failedImports: number;
  errors: string[];
  processedFiles: ProcessedFileData[];
}

export interface MemoryImportOptions {
  autoTag?: boolean;
  preserveDates?: boolean;
  generatePrompts?: boolean;
  batchSize?: number;
}

/**
 * Import memories from processed file data
 */
export const importMemoriesFromFiles = async (
  files: ProcessedFileData[],
  userId: string,
  options: MemoryImportOptions = {}
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: false,
    importedMemories: 0,
    failedImports: 0,
    errors: [],
    processedFiles: files
  };

  const normalizedOptions: Required<MemoryImportOptions> = {
    autoTag: options.autoTag ?? true,
    preserveDates: options.preserveDates ?? false,
    generatePrompts: options.generatePrompts ?? true,
    batchSize: options.batchSize ?? 5
  };

  try {
    // Process files in batches to avoid overwhelming the system
    for (let i = 0; i < files.length; i += normalizedOptions.batchSize) {
      const batch = files.slice(i, i + normalizedOptions.batchSize);
      await Promise.all(batch.map(file => processFile(file, userId, normalizedOptions, result)));
    }

    result.success = result.failedImports === 0;
  } catch (error: any) {
    result.errors.push(`Import failed: ${error.message}`);
    console.error('Memory import error:', error);
  }

  return result;
};

/**
 * Process a single file and extract memories
 */
const processFile = async (
  fileData: ProcessedFileData,
  userId: string,
  options: MemoryImportOptions,
  result: ImportResult
): Promise<void> => {
  try {
    const memories = await extractMemoriesFromFile(fileData, options);

    for (const memoryData of memories) {
      try {
        // Sanitize the memory data
        const sanitizedData = sanitizeMemoryData({
          prompt: memoryData.prompt,
          response: memoryData.response,
          type: memoryData.type,
          tags: memoryData.tags
        });

        // Create the memory object
        const memory = {
          id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          prompt: sanitizedData.prompt,
          response: sanitizedData.response,
          date: memoryData.date || new Date().toISOString(),
          type: sanitizedData.type,
          tags: sanitizedData.tags,
        };

        // Add to database
        const dbResult = await addMemory(memory, userId);
        if (dbResult.error) {
          throw new Error(`Database error: ${dbResult.error.message}`);
        }

        // Update memory strength
        try {
          const { getActivityPoints } = await import('./memoryStrengthService');
          await addActivityAndRecalculate(userId, {
            type: 'memory_imported',
            timestamp: new Date(),
            value: getActivityPoints('memory_imported'),
            metadata: {
              importSource: fileData.metadata.name,
              memoryId: memory.id
            }
          });
        } catch (error) {
          console.warn('Failed to update memory strength:', error);
        }

        result.importedMemories++;
      } catch (error: any) {
        result.failedImports++;
        result.errors.push(`Failed to import memory from ${fileData.metadata.name}: ${error.message}`);
      }
    }
  } catch (error: any) {
    result.failedImports++;
    result.errors.push(`Failed to process ${fileData.metadata.name}: ${error.message}`);
  }
};

/**
 * Extract memories from different file types
 */
const extractMemoriesFromFile = async (
  fileData: ProcessedFileData,
  options: MemoryImportOptions
): Promise<Array<{
  prompt: string;
  response: string;
  type: string;
  tags: string[];
  date?: string;
}>> => {
  const memories: Array<{
    prompt: string;
    response: string;
    type: string;
    tags: string[];
    date?: string;
  }> = [];

  if (fileData.type === 'image') {
    // For images, create a memory with the image description
    const prompt = generatePromptForImage(fileData.metadata.name, options);
    memories.push({
      prompt,
      response: `Image imported: ${fileData.metadata.name}`,
      type: 'visual',
      tags: generateTagsForImage(fileData.metadata.name, options),
      date: options.preserveDates ? new Date(fileData.metadata.lastModified).toISOString() : undefined
    });
  } else if (fileData.type === 'document' && fileData.textContent) {
    // For text documents, try to extract multiple memories
    const extractedMemories = await extractMemoriesFromText(
      fileData.textContent,
      fileData.metadata.name,
      options
    );
    memories.push(...extractedMemories);
  }

  return memories;
};

/**
 * Generate an appropriate prompt for an imported image
 */
const generatePromptForImage = (filename: string, options: MemoryImportOptions): string => {
  if (!options.generatePrompts) {
    return `Imported image: ${filename}`;
  }

  // Extract meaningful information from filename
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const cleanName = nameWithoutExt.replace(/[-_]/g, ' ');

  // Common patterns for photo names
  if (cleanName.match(/\b\d{4}\b/)) {
    return `Describe this photo from ${cleanName}`;
  }

  if (cleanName.toLowerCase().includes('family') || cleanName.toLowerCase().includes('wedding')) {
    return `Tell me about this ${cleanName.toLowerCase()}`;
  }

  return `What memories does this image "${cleanName}" bring back?`;
};

/**
 * Generate tags for an imported image
 */
const generateTagsForImage = (filename: string, options: MemoryImportOptions): string[] => {
  if (!options.autoTag) return ['imported', 'image'];

  const tags: string[] = ['imported', 'image'];
  const nameWithoutExt = filename.toLowerCase().replace(/\.[^/.]+$/, '');

  // Extract date patterns
  const dateMatch = nameWithoutExt.match(/(\d{4})[-_](\d{2})[-_](\d{2})/);
  if (dateMatch) {
    tags.push(`date:${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
  }

  // Extract common keywords
  const keywords = ['family', 'wedding', 'birthday', 'vacation', 'holiday', 'party', 'graduation'];
  keywords.forEach(keyword => {
    if (nameWithoutExt.includes(keyword)) {
      tags.push(keyword);
    }
  });

  return tags;
};

/**
 * Extract memories from text content
 */
const extractMemoriesFromText = async (
  textContent: string,
  filename: string,
  options: MemoryImportOptions
): Promise<Array<{
  prompt: string;
  response: string;
  type: string;
  tags: string[];
  date?: string;
}>> => {
  const memories: Array<{
    prompt: string;
    response: string;
    type: string;
    tags: string[];
    date?: string;
  }> = [];

  // Split text by common delimiters (paragraphs, dates, etc.)
  const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  for (const paragraph of paragraphs) {
    const cleanText = sanitizeTextInput(paragraph);

    if (cleanText.length < 10) continue; // Skip very short entries

    const prompt = options.generatePrompts
      ? `From your ${filename} document:`
      : `Imported text from ${filename}`;

    const tags = options.autoTag
      ? generateTagsFromText(cleanText).concat(['imported', 'document'])
      : ['imported', 'document'];

    memories.push({
      prompt,
      response: cleanText,
      type: 'text',
      tags,
      date: options.preserveDates ? new Date().toISOString() : undefined
    });
  }

  return memories;
};

/**
 * Generate tags from text content using simple keyword extraction
 */
const generateTagsFromText = (text: string): string[] => {
  const words = text.toLowerCase().split(/\s+/);
  const commonWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'an', 'a'
  ]);

  const wordCount: { [key: string]: number } = {};

  // Count word frequencies
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length > 3 && !commonWords.has(cleanWord)) {
      wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
    }
  });

  // Get top 3 most frequent words as tags
  const sortedWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([word]) => word);

  return sortedWords;
};

// Export service object
export const memoryImportService = {
  importMemoriesFromFiles,
  extractMemoriesFromFile,
  generatePromptForImage,
  generateTagsForImage,
  extractMemoriesFromText,
  generateTagsFromText
};
