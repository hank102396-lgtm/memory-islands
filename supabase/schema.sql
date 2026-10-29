create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  island_id text not null check (island_id in ('golden', 'green', 'blue')),
  title text not null check (char_length(title) between 1 and 60),
  note text not null default '',
  image_url text not null default '',
  image_path text not null default '',
  x double precision not null default 50,
  y double precision not null default 50,
  created_at timestamptz not null default now()
);

alter table public.memories enable row level security;

drop policy if exists "Anyone can read memories" on public.memories;
create policy "Anyone can read memories"
  on public.memories for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can create memories" on public.memories;
create policy "Anyone can create memories"
  on public.memories for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Anyone can delete memories" on public.memories;
create policy "Anyone can delete memories"
  on public.memories for delete
  to anon, authenticated
  using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-images',
  'memory-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = true,
    file_size_limit = 10485760,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can read memory images" on storage.objects;
create policy "Anyone can read memory images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'memory-images');

drop policy if exists "Anyone can upload memory images" on storage.objects;
create policy "Anyone can upload memory images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'memory-images');

drop policy if exists "Anyone can delete memory images" on storage.objects;
create policy "Anyone can delete memory images"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'memory-images');

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'memories'
  ) then
    alter publication supabase_realtime add table public.memories;
  end if;
end $$;
