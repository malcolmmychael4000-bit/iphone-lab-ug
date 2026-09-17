import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) before running this diagnostic.',
  );
  process.exitCode = 1;
} else {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const run = async () => {
    const { data, error } = await supabase.from('parts_products').select('*');

    if (error) {
      throw new Error(`Failed to fetch parts_products inventory: ${error.message}`);
    }

    for (const row of data ?? []) {
      console.log(
        JSON.stringify({
          id: row.id,
          name: row.name,
          image_url: row.image_url,
          incell_image_url: row.incell_image_url,
          oled_image_url: row.oled_image_url,
          incellImageUrl: row.incellImageUrl,
          oledImageUrl: row.oledImageUrl,
        }),
      );
    }

    console.log(`Fetched ${data?.length ?? 0} rows from parts_products.`);
  };

  run().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
