import {
  getInventoryColumns,
  getSupabase,
  INVENTORY_TABLE,
  normalizePart,
  requireAdmin,
  sendError,
  toSupabasePart,
} from '../_lib/inventory.js';

interface Request {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: { parts?: Record<string, unknown>[] };
}

interface Response {
  status: (code: number) => Response;
  json: (body: unknown) => void;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    requireAdmin(req);
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    if (!Array.isArray(req.body?.parts) || req.body.parts.length === 0) {
      res.status(400).json({ error: 'Invalid parts payload for restore' });
      return;
    }

    const supabase = getSupabase();
    const { data: currentRows, error: readError } = await supabase.from(INVENTORY_TABLE).select('*');
    if (readError) throw readError;
    const columns = currentRows?.[0] ? Object.keys(currentRows[0]) : await getInventoryColumns(supabase);
    const currentById = new Map((currentRows || []).map((row) => [String(row.id), row as Record<string, unknown>]));
    const payload = req.body.parts.map((part) =>
      toSupabasePart(part, currentById.get(String(part.id)), columns),
    );
    const { data, error } = await supabase.from(INVENTORY_TABLE)
      .upsert(payload, { onConflict: 'id' })
      .select();
    if (error || !data) throw error || new Error('Inventory restore returned no rows');

    const parts = data.map((row) => normalizePart(row as Record<string, unknown>));
    res.status(200).json({
      success: true,
      message: `Successfully restored ${parts.length} inventory products and screen images!`,
      count: parts.length,
      parts,
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      res.status(401).json({ error: error.message });
      return;
    }
    sendError(res, error, 'Inventory restore failed');
  }
}
