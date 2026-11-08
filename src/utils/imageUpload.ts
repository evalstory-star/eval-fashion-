/**
 * Client-side image processing utility.
 * Optimizes mobile camera & gallery photos into lightweight base64 Data URLs
 * to ensure smooth storage and fast rendering across devices.
 */

export const processImageFile = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.84
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding within maxWidth/maxHeight
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Fill background with white to handle transparent PNGs converting to JPEG cleanly
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(optimizedDataUrl);
        } catch (canvasErr) {
          resolve(event.target?.result as string);
        }
      };

      img.onerror = () => reject(new Error('تعذر معالجة الصورة المختارة.'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('تعذر قراءة الملف من ذاكرة الهاتف.'));
    reader.readAsDataURL(file);
  });
};
