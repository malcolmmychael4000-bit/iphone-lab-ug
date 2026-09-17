import { getSupabase, PRODUCT_BUCKET, requireAdmin, sendError } from '../_lib/inventory';

interface Request {
  headers: Record<string, string | string[] | undefined>;
  body?: { imageBase64?: string; filename?: string };
}

interface Response {
  status: (code: number) => Response;
  json: (body: unknown) => void;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    requireAdmin(req);
    const imageBase64 = req.body?.imageBase64;
    if (!imageBase64?.startsWith('data:image/')) {
      res.status(400).json({ error: 'No valid image data provided' });
      return;
    }
    const contentType = imageBase64.slice(5, imageBase64.indexOf(';'));
    const extension = contentType.split('/')[1].replace('jpeg', 'jpg');
    const filename = (req.body?.filename || 'image').replace(/[^\w.-]/g, '_').replace(/\.[^.]+$/, '');
    const filePath = `inventory/custom_${Date.now()}_${filename}.${extension}`;
    const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
    const { data, error } = await getSupabase().storage.from(PRODUCT_BUCKET).upload(filePath, buffer, {
      contentType,
      upsert: false,
    });
    if (error || !data) throw error || new Error('Storage upload returned no object');
    const { data: publicUrl } = getSupabase().storage.from(PRODUCT_BUCKET).getPublicUrl(filePath);
    if (!publicUrl.publicUrl) throw new Error('Storage upload did not return a public URL');
    res.status(200).json({ success: true, image_url: publicUrl.publicUrl });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      res.status(401).json({ error: error.message });
      return;
    }
    sendError(res, error, 'Image upload failed');
  }
}
