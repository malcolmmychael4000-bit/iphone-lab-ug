import { getPublicSupabase, getSupabase, normalizePart, requireAdmin, sendError, toSupabasePart } from './_lib/inventory';

interface Request {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
}

interface Response {
  status: (code: number) => Response;
  json: (body: unknown) => void;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    if (req.method === 'GET') {
      const supabase = getPublicSupabase();
      const { data, error } = await supabase.from('parts_products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.status(200).json((data || []).map((row) => normalizePart(row as Record<string, unknown>)));
      return;
    }
    requireAdmin(req);
    const supabase = getSupabase();
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    const { data, error } = await supabase.from('parts_products').upsert(toSupabasePart(req.body || {}), { onConflict: 'id' }).select().single();
    if (error || !data) throw error || new Error('Inventory save returned no row');
    res.status(200).json({ success: true, part: normalizePart(data as Record<string, unknown>) });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      res.status(401).json({ error: error.message });
      return;
    }
    sendError(res, error, 'Inventory request failed');
  }
}
