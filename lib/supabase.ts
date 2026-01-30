
import { createClient } from '@supabase/supabase-js';

// Utilizando as credenciais fornecidas para garantir o funcionamento imediato
const supabaseUrl = 'https://ixvkcovnqaezqibfsook.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dmtjb3ZucWFlenFpYmZzb29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDI1MzksImV4cCI6MjA4NTI3ODUzOX0.hL53rmmcEF3ivH7iXOtkk0gCVz5qTezJ-G_wITyG0UU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
