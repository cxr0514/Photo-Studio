import React from 'react';

interface LightboxProps {
  imageUrl: string;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ imageUrl, onClose }) => {
  // Prevent clicks on the image itself from closing the lightbox
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
      <div
        className="relative max-w-4xl max-h-[90vh] w-full h-full"
        onClick={handleImageClick}
      >
        <img
          src={imageUrl}
          alt="Generated product in lightbox"
          className="w-full h-full object-contain"
        />
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 text-white bg-gray-800 bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition-colors"
          aria-label="Close lightbox"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Lightbox;
