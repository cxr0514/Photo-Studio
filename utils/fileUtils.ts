import { ImageFile, AspectRatio } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove 'data:mime/type;base64,' part
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const resizeImageCanvas = (imageFile: ImageFile, targetAspectRatioValue: AspectRatio): Promise<ImageFile> => {
    return new Promise((resolve, reject) => {
        const [w, h] = targetAspectRatioValue.split(':').map(Number);
        const targetAR = w / h;

        const img = new Image();
        img.src = `data:${imageFile.mimeType};base64,${imageFile.base64}`;

        img.onload = () => {
            const originalWidth = img.width;
            const originalHeight = img.height;
            const originalAR = originalWidth / originalHeight;

            let newWidth: number;
            let newHeight: number;

            if (originalAR > targetAR) {
                // Original image is wider than target, so width is the constraining dimension.
                newWidth = originalWidth;
                newHeight = originalWidth / targetAR;
            } else {
                // Original image is taller or same as target, so height is the constraining dimension.
                newHeight = originalHeight;
                newWidth = originalHeight * targetAR;
            }

            const canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            // Fill background with white
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, newWidth, newHeight);

            // Calculate coordinates to draw the image centered
            const x = (newWidth - originalWidth) / 2;
            const y = (newHeight - originalHeight) / 2;

            ctx.drawImage(img, x, y, originalWidth, originalHeight);

            const newMimeType = 'image/jpeg';
            const newDataUrl = canvas.toDataURL(newMimeType, 0.95);
            const newBase64 = newDataUrl.split(',')[1];

            resolve({
                ...imageFile,
                base64: newBase64,
                mimeType: newMimeType,
            });
        };

        img.onerror = (error) => {
            reject(error);
        };
    });
};
