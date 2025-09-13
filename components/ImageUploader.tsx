
import React, { useState, useRef, useCallback } from 'react';
import { ImageFile } from '../types';
import { fileToBase64 } from '../utils/fileUtils';

interface ImageUploaderProps {
  id: string;
  label: string;
  onImageUpload: (imageFile: ImageFile | null) => void;
  icon: React.ReactNode;
  heightClassName?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageUpload, icon, heightClassName = 'h-48' }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setPreview(URL.createObjectURL(file));
        onImageUpload({ file, base64, mimeType: file.type });
      } catch (error) {
        console.error('Error converting file to base64:', error);
        onImageUpload(null);
      }
    }
  }, [onImageUpload]);

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageUpload(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const uploaderContent = preview ? (
    <div className="relative w-full h-full group">
      <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
        <button 
            onClick={handleRemoveImage} 
            className="text-white bg-red-600 hover:bg-red-700 rounded-full p-2"
            aria-label="Remove image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-2 text-center">
      {icon}
      <p className="mt-2 text-sm font-semibold">{label}</p>
      <p className="text-xs">Click or drag & drop</p>
    </div>
  );

  return (
    <div className="w-full">
        <label htmlFor={id} className="cursor-pointer">
            <div className={`w-full ${heightClassName} bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center hover:border-indigo-500 hover:bg-gray-700 transition-colors`}>
                {uploaderContent}
            </div>
        </label>
        <input
            id={id}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
        />
    </div>
  );
};

export default ImageUploader;