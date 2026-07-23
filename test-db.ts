import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://gvhszzielsrmjshwvftc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2aHN6emllbHNybWpzaHd2ZnRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDA3NjcwNSwiZXhwIjoyMDk5NjUyNzA1fQ.ZgGLgvsBN0b88JJy1kGh-EWlhBVCJTBNkuL6vYWlJRQ";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('profiles').select('user_id, display_name');
  if (error) console.error(error);
  else console.log("Profiles:", data);
}
run();
