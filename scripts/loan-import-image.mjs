// Decode locally, bound resolution and remove EXIF/GPS before any upload.
export const photoQualityCopy = 'Use a sharp, well-lit photo of the whole record. Avoid glare and cropped edges—unclear writing can cause missing or incorrect details.';
export function photoDimensions(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width * height > 60_000_000) throw Error('Choose a photo up to 60 megapixels.');
  const scale = Math.min(1, 2048 / Math.max(width, height));
  return {width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale))};
}
export function validatePhotoFile(file) {
  if (!file.size || file.size > 20_000_000) throw Error('Choose one image up to 20 MB. Nothing was uploaded.');
  if (!/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) throw Error('Choose a JPEG, PNG, WebP or HEIC photo.');
}
export async function prepareLoanPhoto(file) {
  validatePhotoFile(file);
  const bytes = new Uint8Array(await file.arrayBuffer());
  // Do not silently import only the first frame of an animated PNG/WebP.
  const ascii = (start, end) => String.fromCharCode(...bytes.slice(start, end));
  if (ascii(0,4) === 'RIFF' && ascii(8,12) === 'WEBP') {
    for (let i = 12; i + 8 <= bytes.length;) {
      if (['ANIM','ANMF'].includes(ascii(i,i+4))) throw Error('Choose a single still photo. Animated images are not supported.');
      const length = new DataView(bytes.buffer).getUint32(i+4,true); i += 8 + length + length % 2;
    }
  }
  if (bytes[0] === 137 && ascii(1,4) === 'PNG') {
    for (let i = 8; i + 12 <= bytes.length;) {
      if (ascii(i+4,i+8) === 'acTL') throw Error('Choose a single still photo. Animated images are not supported.');
      i += 12 + new DataView(bytes.buffer).getUint32(i);
    }
  }
  const url = URL.createObjectURL(file), image = new Image();
  try {
    image.src = url;
    try { await image.decode(); } catch { throw Error('This image could not be opened. Choose a JPEG or PNG, or take another photo.'); }
    const size = photoDimensions(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement('canvas'); canvas.width = size.width; canvas.height = size.height;
    const context = canvas.getContext('2d'); if (!context) throw Error('Image preparation is unavailable in this browser.');
    context.fillStyle = '#ffffff'; context.fillRect(0,0,size.width,size.height); context.drawImage(image,0,0,size.width,size.height);
    const dataURL = canvas.toDataURL('image/jpeg',0.9), base64 = dataURL.split(',')[1];
    if (!dataURL.startsWith('data:image/jpeg;base64,') || !base64 || base64.length * 3 / 4 > 2_000_000) throw Error('This photo is too large after preparation. Crop to one complete loan and try again.');
    return {dataURL,base64};
  } finally { URL.revokeObjectURL(url); }
}
