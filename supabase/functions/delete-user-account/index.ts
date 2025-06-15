
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

// WARNING: This function will delete all data associated with a user and then delete the user themselves.
// This is irreversible.

// This list must be kept in sync with your database schema to ensure all user data is removed.
const userRelatedTables = [
  { table: 'profiles', column: 'id' },
  { table: 'posts', column: 'user_id' },
  { table: 'stories', column: 'user_id' },
  { table: 'notifications', column: 'user_id' },
  { table: 'conversation_participants', column: 'user_id' },
  { table: 'messages', column: 'sender_id' },
  { table: 'live_activities', column: 'user_id' },
  { table: 'group_members', column: 'user_id' },
  { table: 'groups', column: 'created_by' },
  { table: 'events', column: 'created_by' },
  { table: 'followers', column: 'follower_id' },
  { table: 'followers', column: 'following_id' },
  { table: 'blocked_users', column: 'user_id' },
  { table: 'blocked_users', column: 'blocked_user_id' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const userSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await userSupabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const userId = user.id;

    const adminSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    for (const { table, column } of userRelatedTables) {
      const { error: deleteError } = await adminSupabaseClient
        .from(table)
        .delete()
        .eq(column, userId);

      if (deleteError) {
        console.error(`Error deleting from ${table} for user ${userId}:`, deleteError);
      }
    }
    
    const { error: authUserDeleteError } = await adminSupabaseClient.auth.admin.deleteUser(userId);
    if (authUserDeleteError) {
      throw new Error('Failed to delete user from authentication system.');
    }

    return new Response(JSON.stringify({ message: 'User account deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
