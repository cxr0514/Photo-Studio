import React from 'react';

interface HistoryProps {
  images: string[];
  onImageClick: (imageUrl: string) => void;
}

const History: React.FC<HistoryProps> = ({ images, onImageClick }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-4">Generation History</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4 -mb-4">
        {images.map((imageUrl, index) => (
          <div key={index} className="flex-shrink-0 group">
            <img
              src={imageUrl}
              alt={`Generated image ${images.length - index}`}
              className="w-32 h-32 object-cover rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 border-2 border-transparent group-hover:border-indigo-500"
              onClick={() => onImageClick(imageUrl)}
              aria-label={`View generated image ${images.length - index} in lightbox`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
