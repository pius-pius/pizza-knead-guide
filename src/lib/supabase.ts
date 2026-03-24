import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://woxspcafuxqejttvrqun.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveHNwY2FmdXhxZWp0dHZycXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODYzMjAsImV4cCI6MjA4OTg2MjMyMH0.ltZJekato9NYmirzz9lhCsdOucxRB9IrdCo1hthBg2E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
