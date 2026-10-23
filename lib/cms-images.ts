import type { Editor } from 'tinymce';

export const CMS_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif';
export const CMS_IMAGE_EXTENSIONS = 'jpg,jpeg,png,webp,gif,avif';
export const MAX_CMS_IMAGE_SIZE = 10 * 1024 * 1024;

export function validateCmsImage(file: Pick<Blob, 'type' | 'size'>): void {
  if (!CMS_IMAGE_ACCEPT.split(',').includes(file.type)) {
    throw new Error('Choose a JPG, PNG, WebP, GIF, or AVIF image.');
  }
  if (file.size === 0) {
    throw new Error('This image is empty. Choose another file.');
  }
  if (file.size > MAX_CMS_IMAGE_SIZE) {
    throw new Error('Images must be 10 MB or smaller.');
  }
}

export async function uploadCmsImage(file: Blob, filename: string): Promise<string> {
  validateCmsImage(file);

  let authorization: Response;
  try {
    authorization = await fetch('/api/cms/images/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: file.type, size: file.size }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new Error('Image upload could not complete. Check your connection and try again.');
  }

  const credentials = await authorization.json().catch(() => null);
  if (!authorization.ok) {
    throw new Error(typeof credentials?.error === 'string' ? credentials.error : 'Could not authorize image upload. Please try again.');
  }
  if (
    typeof credentials?.cloudName !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(credentials.cloudName) ||
    typeof credentials?.apiKey !== 'string' || !credentials.apiKey ||
    !Number.isSafeInteger(credentials?.timestamp) ||
    typeof credentials?.signature !== 'string' || !credentials.signature
  ) {
    throw new Error('Could not authorize image upload. Please try again.');
  }

  const formData = new FormData();
  formData.append('file', file, filename);
  formData.append('api_key', credentials.apiKey);
  formData.append('timestamp', String(credentials.timestamp));
  formData.append('signature', credentials.signature);

  let response: Response;
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${credentials.cloudName}/image/upload`,
      { method: 'POST', body: formData, signal: AbortSignal.timeout(60_000) },
    );
  } catch {
    throw new Error('Image upload could not complete. Check your connection and try again.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || typeof data?.secure_url !== 'string' || !data.secure_url.startsWith('https://')) {
    throw new Error(
      typeof data?.error?.message === 'string'
        ? data.error.message
        : `Image upload failed (HTTP ${response.status}). Please try again.`,
    );
  }

  return data.secure_url;
}

// Resolve local editor images before saving: the API strips blob/data URLs.
export async function prepareCmsContent(
  editor: Pick<Editor, 'uploadImages' | 'getContent'> | null,
  currentContent: string,
): Promise<string> {
  if (editor) {
    const uploads = await editor.uploadImages();
    if (uploads.some((upload) => !upload.status && !upload.removed)) {
      throw new Error('An article image could not be uploaded. Retry or remove it before saving.');
    }
    currentContent = editor.getContent();
  }

  if (/<img\b(?:[^"'>]|"[^"]*"|'[^']*')*?\s+src\s*=\s*["']?\s*(?:blob:|data:)/i.test(currentContent)) {
    throw new Error('An article image has not finished uploading. Retry or remove it before saving.');
  }
  return currentContent;
}
