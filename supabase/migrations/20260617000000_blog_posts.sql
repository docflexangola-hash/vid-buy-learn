create table blog_posts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  content       text not null default '',
  excerpt       text not null default '',
  cover_image   text,
  author_id     uuid not null references profiles(id),
  published     boolean not null default false,
  members_only  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_blog_posts_published_created
  on blog_posts (published, created_at desc);

alter table blog_posts enable row level security;

create policy "admins_all" on blog_posts
  for all using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "public_select_published" on blog_posts
  for select using (published = true);
