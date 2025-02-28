// Create a service role client explicitly
const serviceClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Then use this client for creating profiles
const { error: createProfileError } = await serviceClient
  .from('profiles')
  .insert({
    id: userId,
    username
  }); 