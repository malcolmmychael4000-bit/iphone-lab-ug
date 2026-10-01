export const MAX_IMAGE_UPLOAD_BODY_BYTES = 3 * 1024 * 1024;

interface ImageUploadResponse {
  image_url?: string;
  error?: string;
}

function serializeUpload(imageBase64: string, filename: string): string {
  return JSON.stringify({ imageBase64, filename });
}

function isPayloadWithinLimit(body: string): boolean {
  return new TextEncoder().encode(body).byteLength <= MAX_IMAGE_UPLOAD_BODY_BYTES;
}

function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('Could not read image'));
    reader.onerror = () => reject(reader.error || new Error('Could not read image'));
    reader.readAsDataURL(file);
  });
}

async function decodeImage(file: File): Promise<{
  image: CanvasImageSource;
  width: number;
  height: number;
  close?: () => void;
}> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    return { image: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('Could not decode image. Please choose a JPEG or PNG image.'));
      element.src = objectUrl;
    });
    return { image, width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not compress image in this browser'));
    }, 'image/jpeg', quality);
  });
}

async function compressImage(file: File, filename: string): Promise<string> {
  let decoded: Awaited<ReturnType<typeof decodeImage>>;
  try {
    decoded = await decodeImage(file);
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Could not decode image. Please choose a JPEG or PNG image.');
  }

  try {
    if (!decoded.width || !decoded.height) {
      throw new Error('Could not determine image dimensions');
    }

    const canvas = document.createElement('canvas');
    const qualities = [0.86, 0.76, 0.66, 0.56];
    let maxDimension = 1600;

    for (let sizeAttempt = 0; sizeAttempt < 7; sizeAttempt += 1) {
      const scale = Math.min(1, maxDimension / Math.max(decoded.width, decoded.height));
      canvas.width = Math.max(1, Math.round(decoded.width * scale));
      canvas.height = Math.max(1, Math.round(decoded.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not prepare image in this browser');

      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(decoded.image, 0, 0, canvas.width, canvas.height);

      for (const quality of qualities) {
        const jpeg = await canvasToJpeg(canvas, quality);
        const dataUrl = await readFileAsDataUrl(jpeg);
        const body = serializeUpload(dataUrl, filename);
        if (isPayloadWithinLimit(body)) return body;
      }

      maxDimension = Math.floor(maxDimension * 0.8);
    }
  } finally {
    decoded.close?.();
  }

  throw new Error('Image could not be reduced enough to upload. Choose a smaller image.');
}

export async function prepareImageUploadBody(file: File): Promise<string> {
  const hasImageExtension = /\.(?:jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i.test(file.name);
  if (!file.type.startsWith('image/') && !hasImageExtension) {
    throw new Error('Please choose an image file');
  }

  const filename = file.name || 'image';
  if (file.type.startsWith('image/') && file.size <= MAX_IMAGE_UPLOAD_BODY_BYTES * 0.7) {
    const body = serializeUpload(await readFileAsDataUrl(file), filename);
    if (isPayloadWithinLimit(body)) return body;
  }

  return compressImage(file, filename);
}

export async function readImageUploadResponse(response: Response): Promise<string> {
  const responseText = await response.text();
  let data: ImageUploadResponse | undefined;
  try {
    data = JSON.parse(responseText) as ImageUploadResponse;
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    if (typeof data?.error === 'string' && data.error) throw new Error(data.error);
    if (response.status === 413) {
      throw new Error('Image upload was rejected because the request is too large. Choose a smaller image and try again.');
    }
    throw new Error(`Image upload failed (${response.status})${response.statusText ? ` ${response.statusText}` : ''}`);
  }

  if (!data || typeof data.image_url !== 'string' || !data.image_url) {
    throw new Error('Image upload returned an invalid server response');
  }

  return data.image_url;
}

export async function uploadAdminImage(file: File, headers: Record<string, string>): Promise<string> {
  const body = await prepareImageUploadBody(file);
  const response = await fetch('/api/admin/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });
  return readImageUploadResponse(response);
}
