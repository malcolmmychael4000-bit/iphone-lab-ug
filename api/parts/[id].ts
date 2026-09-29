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
  body?: Record<string, unknown>;
  query: { id?: string | string[] };
}

interface Response {
  status: (code: number) => Response;
  json: (body: unknown) => void;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    requireAdmin(req);
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!id) {
      res.status(400).json({ error: 'Missing part id' });
      return;
    }
    const supabase = getSupabase();
    if (req.method === 'DELETE') {
      const { error } = await supabase.from(INVENTORY_TABLE).delete().eq('id', id);
      if (error) throw error;
      res.status(200).json({ success: true, id });
      return;
    }
    if (req.method !== 'PUT') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    const { data: existing, error: readError } = await supabase.from(INVENTORY_TABLE).select('*').eq('id', id).maybeSingle();
    if (readError) throw readError;
    const columns = existing ? Object.keys(existing) : await getInventoryColumns(supabase);
    const { data, error } = await supabase.from(INVENTORY_TABLE).upsert(
      toSupabasePart({ ...(req.body || {}), id }, existing as Record<string, unknown> | undefined, columns),
      { onConflict: 'id' },
    ).select().single();
    if (error || !data) throw error || new Error('Inventory update returned no row');
    res.status(200).json({ success: true, part: normalizePart(data as Record<string, unknown>) });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      res.status(401).json({ error: error.message });
      return;
    }
    sendError(res, error, 'Inventory request failed');
  }
}
