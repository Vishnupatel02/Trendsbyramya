-- Website Visitor Tracking Migration
-- ----------------------------------
-- Run this SQL query in your Supabase SQL Editor to create the website_visits table
-- and enable real-time replication updates.

CREATE TABLE IF NOT EXISTS public.website_visits (
  id BIGSERIAL PRIMARY KEY,
  visitor_id TEXT UNIQUE NOT NULL,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  device_type TEXT,
  browser TEXT,
  referrer TEXT,
  country TEXT,
  region TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.website_visits ENABLE ROW LEVEL SECURITY;

-- 1. Policy to allow anyone to insert a new visit log (anon inserts)
CREATE POLICY "Allow anonymous inserts to website_visits" ON public.website_visits
  FOR INSERT WITH CHECK (true);

-- 2. Policy to allow everyone (or authenticated admin) to read website visits
CREATE POLICY "Allow public select access to website_visits" ON public.website_visits
  FOR SELECT USING (true);

-- Enable Realtime updates for website_visits table
-- This enables the Admin Dashboard to receive instant postgres inserts notifications
alter publication supabase_realtime add table website_visits;
