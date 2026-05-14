// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' });
const { createClient } = // eslint-disable-next-line @typescript-eslint/no-require-imports
require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('benchmarks').select('*').limit(5);
  console.log("Benchmarks:", data, error);
}

test();
