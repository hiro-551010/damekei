# DB スキーマ（team-builds）

Supabase / PostgreSQL。`auth.users` は Supabase が管理する組み込みテーブル。

---

## テーブル定義

### `team_builds`

```sql
create table team_builds (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 50),
  share_token text not null unique,
  slots       jsonb not null default '[]',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

### インデックス

```sql
create index on team_builds (user_id);
create index on team_builds (share_token);
```

---

## slots カラムの JSON 構造

`slots` は `BuildSlot[]`（6要素）を JSONB で保存する。

```json
[
  {
    "slotIndex": 0,
    "pokemonId": 6,
    "nature": "timid",
    "statPoints": { "hp": 0, "attack": 0, "defense": 0, "spAttack": 32, "spDefense": 2, "speed": 32 },
    "abilityNameEn": "blaze",
    "itemNameEn": "choice-scarf",
    "boosts": { "attack": 0, "defense": 0, "spAttack": 0, "spDefense": 0, "speed": 0 },
    "moveNameEn": "flamethrower"
  },
  { "slotIndex": 1, "pokemonId": null, "nature": "hardy", "statPoints": { "hp": 0, "attack": 0, "defense": 0, "spAttack": 0, "spDefense": 0, "speed": 0 }, "abilityNameEn": "", "itemNameEn": "", "boosts": { "attack": 0, "defense": 0, "spAttack": 0, "spDefense": 0, "speed": 0 }, "moveNameEn": "" }
]
```

---

## RLS（Row Level Security）

```sql
alter table team_builds enable row level security;

-- 全員が shareToken で SELECT 可能
create policy "public read by share_token"
  on team_builds for select
  using (true);

-- 所有者のみ INSERT
create policy "owner insert"
  on team_builds for insert
  with check (auth.uid() = user_id);

-- 所有者のみ UPDATE
create policy "owner update"
  on team_builds for update
  using (auth.uid() = user_id);

-- 所有者のみ DELETE
create policy "owner delete"
  on team_builds for delete
  using (auth.uid() = user_id);
```

---

## updated_at 自動更新トリガー

```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger team_builds_updated_at
  before update on team_builds
  for each row execute function update_updated_at();
```
