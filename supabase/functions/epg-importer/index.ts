import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting EPG import job...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get NASA Live TV channel (is_tv = true)
    const { data: channels, error: channelError } = await supabase
      .from('content')
      .select('id, title')
      .eq('is_tv', true)
      .limit(1);

    if (channelError || !channels || channels.length === 0) {
      console.error('No live TV channels found:', channelError);
      return new Response(
        JSON.stringify({ error: 'No live TV channels found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const channel = channels[0];
    console.log(`Generating EPG data for channel: ${channel.title}`);

    // Generate EPG data for the next 7 days
    const epgEntries = [];
    const now = new Date();
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(now);
      currentDate.setDate(now.getDate() + day);
      currentDate.setHours(0, 0, 0, 0);

      // Generate 24 hours of programming (1-hour blocks)
      for (let hour = 0; hour < 24; hour++) {
        const startTime = new Date(currentDate);
        startTime.setHours(hour);

        const endTime = new Date(startTime);
        endTime.setHours(hour + 1);

        const programs = [
          { title: 'Live from Space', description: 'Live feed from the International Space Station', genre: 'Documentary' },
          { title: 'Earth Views', description: 'Beautiful views of Earth from orbit', genre: 'Documentary' },
          { title: 'Space Exploration', description: 'Latest discoveries in space exploration', genre: 'Science' },
          { title: 'Astronomy Tonight', description: 'Deep space observations and discoveries', genre: 'Science' },
          { title: 'Mission Control', description: 'Behind the scenes at NASA mission control', genre: 'Documentary' },
          { title: 'Rocket Science', description: 'How rockets work and space technology', genre: 'Educational' },
        ];

        const program = programs[hour % programs.length];

        epgEntries.push({
          channel_id: channel.id,
          program_title: program.title,
          program_description: program.description,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_minutes: 60,
          genre: program.genre,
          rating: 'G',
        });
      }
    }

    // Delete old EPG data for this channel (older than now)
    const { error: deleteError } = await supabase
      .from('epg_data')
      .delete()
      .eq('channel_id', channel.id)
      .lt('end_time', now.toISOString());

    if (deleteError) {
      console.error('Error deleting old EPG data:', deleteError);
    }

    // Insert new EPG data
    const { error: insertError } = await supabase
      .from('epg_data')
      .upsert(epgEntries, { onConflict: 'id' });

    if (insertError) {
      console.error('Error inserting EPG data:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to insert EPG data', details: insertError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Successfully imported ${epgEntries.length} EPG entries for ${channel.title}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Imported ${epgEntries.length} EPG entries for ${channel.title}`,
        entries_count: epgEntries.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('EPG import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
