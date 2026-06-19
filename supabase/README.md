# Supabase schema

`schema.sql` is the **single source of truth** for the database (tables, RLS
policies, constraints, indexes). It is a full dump of the `public` schema:

- `trades` (includes `fee`), `prop_accounts`, `mt5_api_keys`, `benchmarks`
- Row Level Security enabled on every table + all policies

The existing cloud project is already set up — a normal `git clone` does **not**
need any DB step (the app connects via the URL/keys in `.env.local`).

## Recreating the database on a fresh / empty Supabase project

Run `schema.sql` once. Either:

**SQL Editor:** Supabase Dashboard → SQL Editor → paste `schema.sql` → Run.

**psql:**

```bash
PGPASSWORD='<db-password>' psql \
  -h aws-1-<region>.pooler.supabase.com -p 5432 \
  -U postgres.<project-ref> -d postgres \
  -f supabase/schema.sql
```

> Use the **session pooler** host (IPv4). The direct `db.<ref>.supabase.co`
> host is IPv6-only and may be unreachable.

## Updating the schema after DB changes

After changing the schema in the dashboard, re-dump so the repo stays current:

```bash
PGPASSWORD='<db-password>' pg_dump \
  -h aws-1-<region>.pooler.supabase.com -p 5432 \
  -U postgres.<project-ref> -d postgres \
  --schema=public --schema-only --no-owner --no-privileges \
  -f supabase/schema.sql
```

(pg_dump major version must be >= the server's, e.g. pg_dump 18 for PG 17.)
