import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftltdcbzgesurycovtqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bHRkY2J6Z2VzdXJ5Y292dHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MDc5MDAsImV4cCI6MjA4MzE4MzkwMH0.ippeYhPIixsyK5Dr_Ya4S5POkrE5wsHzDilot5lpxdw';

export const supabase = createClient(supabaseUrl, supabaseKey);
