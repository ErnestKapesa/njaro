import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { NFTStorage } from 'nft.storage';
import { useExifValidator } from '../hooks/useExifValidator';

interface ImageUploaderProps {
  onUploadComplete: (cid: string, latitude: number, longitude: number) => void;
}

const NFT_STORAGE_TOKEN = import.meta.env.VITE_NFT_STORAGE_TOKEN || '';

export const ImageUploader = ({ onUploadComplete }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { validateImage, isValidating, error: validationError } = useExifValidator();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const file = acceptedFiles[0];

      // Validate image EXIF data
      const exifData = await validateImage(file);
      if (!exifData || validationError) {
        throw new Error(validationError?.message || 'Invalid image data');
      }

      // Upload to IPFS
      const nftStorage = new NFTStorage({ token: NFT_STORAGE_TOKEN });
      const cid = await nftStorage.storeBlob(file);

      onUploadComplete(cid, exifData.latitude, exifData.longitude);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, [validateImage, validationError, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg']
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-savannaGold bg-savannaGold/10' : 'border-gold-200 hover:border-savannaGold'}
          ${isUploading || isValidating ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-4xl">📸</div>
          <p className="text-lg font-medium">
            {isDragActive
              ? 'Drop your safari photo here...'
              : 'Drag & drop your safari photo, or click to select'}
          </p>
          <p className="text-savannaGold font-semibold mb-2">Upload your best safari photo (JPEG only)</p>
          <p className="text-gray-500 mb-4">Images must have valid EXIF data and be taken in Africa.</p>
        </div>
      </div>

      {uploadError && (
        <div className="mt-4 text-red-600 bg-gold-50 border-l-4 border-savannaGold p-2 rounded">
          {uploadError}
        </div>
      )}

      {(isUploading || isValidating) && (
        <div className="mt-4 text-center text-gray-600">
          {isValidating ? 'Validating image...' : 'Uploading to IPFS...'}
        </div>
      )}
    </div>
  );
};
