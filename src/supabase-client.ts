import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://gkixztfvgvbltfsevjpu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdraXh6dGZ2Z3ZibHRmc2V2anB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzgxOTksImV4cCI6MjA3NjExNDE5OX0.o_0KB7Wpnc0wp5KK2_YNLCp27oAYOUD2jJiGfbCCMLw'


export const supabase = createClient(supabaseUrl, supabaseKey)
