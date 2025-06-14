
-- Create a table for public user profiles
create table public.profiles (
  id uuid not null primary key references auth.users on delete cascade,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  interests text[],
  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 20)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policy: Public profiles are viewable by any authenticated user.
create policy "Authenticated users can view profiles." on public.profiles
  for select to authenticated using (true);

-- Policy: Users can update their own profile.
create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Trigger: This automatically creates a profile for new users.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
