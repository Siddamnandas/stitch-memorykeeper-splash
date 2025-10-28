import { useState, useCallback, useRef, type FC, type ChangeEvent, type DragEvent } from 'react';
import { Upload, X, Image, FileText, Eye } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useError } from '../lib/ErrorContext';
import { sanitizeFilename } from '../lib/inputSanitizer';

export interface ProcessedFileData {
  file: File;
  type: 'image' | 'document' | 'video';
  preview?: string;
  textContent?: string;
  metadata: {
    name: string;
    size: number;
    lastModified: number;
    type: string;
  };
}

interface FileUploadProps {
  onFileProcessed: (fileData: ProcessedFileData) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  multiple?: boolean;
}

const FileUpload: FC<FileUploadProps> = ({
  onFileProcessed,
  acceptedTypes = ['image/*', '.pdf', '.txt'],
  maxFileSize = 10, // 10MB default
  multiple = false
}) => {
  const { user } = useAuth();
  const { addToast } = useError();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSizeBytes = maxFileSize * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSizeBytes) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }

    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const processFile = async (file: File): Promise<ProcessedFileData | null> => {
    const validationError = validateFile(file);
    if (validationError) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: validationError,
        duration: 4000
      });
      return null;
    }

    const detectedType: ProcessedFileData['type'] =
      file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
        ? 'video'
        : 'document';

    const fileData: ProcessedFileData = {
      file,
      type: detectedType,
      metadata: {
        name: sanitizeFilename(file.name),
        size: file.size,
        lastModified: file.lastModified,
        type: file.type
      }
    };

  // Process image files
  if (fileData.type === 'image') {
    try {
      const preview = await createImagePreview(file);
      fileData.preview = preview;
    } catch (error) {
      console.error('Error creating image preview:', error);
    }
  }

  if (fileData.type === 'video') {
    try {
      const preview = await createImagePreview(file);
      fileData.preview = preview;
    } catch (error) {
      console.error('Error creating video preview:', error);
    }
  }

    // Process text-based documents
    if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      try {
        const textContent = await readTextFile(file);
        fileData.textContent = textContent;
      } catch (error) {
        console.error('Error reading text file:', error);
      }
    }

    return fileData;
  };

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Failed to create image preview'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Failed to read text file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  };

  const handleFiles = useCallback(async (files: FileList) => {
    if (!user?.id) {
      addToast({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please sign in to upload files.',
        duration: 4000
      });
      return;
    }

    const fileArray = Array.from(files);
    setIsProcessing(true);

    const processedResults: ProcessedFileData[] = [];

    for (const file of fileArray) {
      try {
        const processedFile = await processFile(file);
        if (processedFile) {
          processedResults.push(processedFile);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        addToast({
          type: 'error',
          title: 'Processing Error',
          message: `Failed to process ${file.name}`,
          duration: 4000
        });
      }
    }

    setIsProcessing(false);

    if (processedResults.length > 0) {
      if (multiple) {
        setProcessedFiles(prev => [...prev, ...processedResults]);
      } else {
        setProcessedFiles([processedResults[0]]);
      }

      processedResults.forEach(fileData => {
        onFileProcessed(fileData);
      });

      addToast({
        type: 'success',
        title: 'Files Processed',
        message: `Successfully processed ${processedResults.length} file(s).`,
        duration: 3000
      });
    }
  }, [user?.id, multiple, onFileProcessed, addToast]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setProcessedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragOver
            ? 'border-orange-400 bg-orange-50'
            : 'border-gray-300 bg-white/80 backdrop-blur-xl'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={handleFileInputChange}
        />
        
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Drag & drop files here
        </h3>
        <p className="text-gray-500 mb-4">
          or{' '}
          <button
            type="button"
            className="text-orange-600 hover:text-orange-700 font-medium"
            onClick={() => fileInputRef.current?.click()}
          >
            browse files
          </button>
        </p>
        <p className="text-sm text-gray-400">
          Accepted types: {acceptedTypes.join(', ')} | Max size: {maxFileSize}MB
        </p>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-700">Processing files...</span>
        </div>
      )}

      {/* Processed files */}
      {processedFiles.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-orange-100">
          <h3 className="font-semibold text-gray-800 mb-3">Uploaded Files</h3>
          <div className="space-y-3">
            {processedFiles.map((fileData, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white">
                  {fileData.type === 'image' ? (
                    <Image className="w-5 h-5 text-orange-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{fileData.metadata.name}</p>
                  <p className="text-sm text-gray-500">
                    {(fileData.metadata.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {fileData.preview && (
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-gray-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
