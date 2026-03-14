create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null check (item_type in ('image', 'url', 'text')),
  original_text text,
  original_url text,
  image_path text,
  ocr_text text,
  ai_title text not null,
  ai_summary text not null,
  detected_intent text not null,
  category text,
  suggested_action text,
  reminder_date timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists saved_items_user_id_created_at_idx
  on public.saved_items (user_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists saved_items_set_updated_at on public.saved_items;
create trigger saved_items_set_updated_at
  before update on public.saved_items
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.saved_items enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "Users can view own items" on public.saved_items;
create policy "Users can view own items"
  on public.saved_items
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own items" on public.saved_items;
create policy "Users can insert own items"
  on public.saved_items
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own items" on public.saved_items;
create policy "Users can update own items"
  on public.saved_items
  for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own items" on public.saved_items;
create policy "Users can delete own items"
  on public.saved_items
  for delete
  using (auth.uid() = user_id);
