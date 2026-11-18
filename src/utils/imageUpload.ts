/**
 * Reads an uploaded image File and downscales/compresses it to a compact JPEG Data URL
 * so member portraits save reliably to backend store and localStorage without quota overflows.
 */
export function compressImageFileToDataUrl(file: File, maxDimension = 640, quality = 0.84): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (ev) => {
      const rawDataUrl = ev.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Empty image data'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback to raw Data URL if browser canvas decode fails (e.g. SVG)
        resolve(rawDataUrl);
      };
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        if (!width || !height) {
          resolve(rawDataUrl);
          return;
        }

        let targetW = width;
        let targetH = height;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            targetW = maxDimension;
            targetH = Math.round((height / width) * maxDimension);
          } else {
            targetH = maxDimension;
            targetW = Math.round((width / height) * maxDimension);
          }
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed && compressed.length < rawDataUrl.length ? compressed : rawDataUrl);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}
