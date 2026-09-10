-- ==============================================================================
-- PEGASUS UAV CLUB · IIST — SUPABASE SCHEMA & RLS MIGRATION SCRIPT
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Create Club Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_threshold INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'IN_STOCK',
    location TEXT NOT NULL DEFAULT 'Lab Bay 1',
    assigned_project TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for inventory
CREATE INDEX IF NOT EXISTS idx_inventory_category ON public.inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory(sku);

-- Enable RLS on inventory
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow public insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow public update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow public delete inventory" ON public.inventory;

CREATE POLICY "Allow public read inventory" 
ON public.inventory FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public insert inventory" 
ON public.inventory FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow public update inventory" 
ON public.inventory FOR UPDATE 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete inventory" 
ON public.inventory FOR DELETE 
TO anon, authenticated 
USING (true);

-- 2. Create Student Inventory Requisitions Table
CREATE TABLE IF NOT EXISTS public.inventory_requests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    student_code TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    parts JSONB NOT NULL DEFAULT '[]'::jsonb,
    purpose TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_inv_requests_status ON public.inventory_requests(status);
CREATE INDEX IF NOT EXISTS idx_inv_requests_student ON public.inventory_requests(student_code);

ALTER TABLE public.inventory_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read inventory_requests" ON public.inventory_requests;
DROP POLICY IF EXISTS "Allow public insert inventory_requests" ON public.inventory_requests;
DROP POLICY IF EXISTS "Allow public update inventory_requests" ON public.inventory_requests;

CREATE POLICY "Allow public read inventory_requests" 
ON public.inventory_requests FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public insert inventory_requests" 
ON public.inventory_requests FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow public update inventory_requests" 
ON public.inventory_requests FOR UPDATE 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- 3. Configure Policies for Updates table (Upload and Delete posts)
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read updates" ON public.updates;
DROP POLICY IF EXISTS "Allow public insert updates" ON public.updates;
DROP POLICY IF EXISTS "Allow public update updates" ON public.updates;
DROP POLICY IF EXISTS "Allow public delete updates" ON public.updates;

CREATE POLICY "Allow public read updates" 
ON public.updates FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public insert updates" 
ON public.updates FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow public update updates" 
ON public.updates FOR UPDATE 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete updates" 
ON public.updates FOR DELETE 
TO anon, authenticated 
USING (true);

-- 4. Storage Bucket Policies (for media uploads into 'media' bucket)
DROP POLICY IF EXISTS "Allow public uploads to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read media" ON storage.objects;

CREATE POLICY "Allow public read media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'media');

CREATE POLICY "Allow public uploads to media"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'media');

-- 5. Configure Policies for team_members table (Add and Delete Core Members)
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow public insert team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow public update team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow public delete team_members" ON public.team_members;

CREATE POLICY "Allow public read team_members" 
ON public.team_members FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public insert team_members" 
ON public.team_members FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow public update team_members" 
ON public.team_members FOR UPDATE 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete team_members" 
ON public.team_members FOR DELETE 
TO anon, authenticated 
USING (true);

-- 6. Configure Policies for projects table (Add and Delete Projects)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public insert projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public update projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public delete projects" ON public.projects;

CREATE POLICY "Allow public read projects" 
ON public.projects FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public insert projects" 
ON public.projects FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow public update projects" 
ON public.projects FOR UPDATE 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete projects" 
ON public.projects FOR DELETE 
TO anon, authenticated 
USING (true);
