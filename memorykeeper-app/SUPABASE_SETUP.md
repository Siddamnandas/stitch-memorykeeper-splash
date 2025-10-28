# Supabase Setup Guide for MemoryKeeper

This guide explains how to set up Supabase for the MemoryKeeper application.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new Supabase project

## Setup Instructions

### 1. Create Required Tables

Run the following SQL commands in the Supabase SQL editor:

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  memory_strength integer default 0,
  constraint username_length check (char_length(full_name) >= 3)
);

-- Create memories table
create table memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  prompt text not null,
  response text not null,
  date date not null,
  type text not null,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table memories enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

create policy "Users can view their own memories." on memories
  for select using (auth.uid() = user_id);

create policy "Users can insert their own memories." on memories
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own memories." on memories
  for update using (auth.uid() = user_id);

create policy "Users can delete their own memories." on memories
  for delete using (auth.uid() = user_id);
```

### 2. Configure Environment Variables

Update the `.env` file with your Supabase project credentials:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project dashboard under "Project Settings" > "API".

### 3. Enable Authentication

In your Supabase project dashboard:
1. Go to "Authentication" > "Providers"
2. Enable "Email" authentication provider
3. Optionally enable other providers like Google, GitHub, etc.

## Testing the Integration

1. Start the development server: `npm run dev`
2. Navigate to `/supabase-test` to test the authentication flow
3. Create a test account and verify that you can sign in

## Data Service Functions

The application includes a data service (`src/lib/dataService.ts`) with the following functions:

- `getMemories(userId)`: Fetch all memories for a user
- `addMemory(memory, userId)`: Add a new memory
- `updateMemory(id, updates)`: Update an existing memory
- `deleteMemory(id)`: Delete a memory
- `getUserProfile(userId)`: Get user profile
- `updateUserProfile(userId, updates)`: Update user profile
- `createUserProfile(userId, profile)`: Create a new user profile
- `getMemoryStrength(userId)`: Get user's memory strength score
- `updateMemoryStrength(userId, strength)`: Update user's memory strength score

## Supabase Edge Functions for AI Integration

For production deployment with OpenAI, it's recommended to use Supabase Edge Functions to securely call OpenAI APIs:

1. Create a new Supabase Edge Function:
   ```bash
   supabase functions new ai_handler
   ```

2. Install the OpenAI Deno package:
   ```bash
   cd supabase/functions/ai_handler
   deno install --allow-read --allow-net https://deno.land/x/openai@v4.42.0/mod.ts
   ```

3. Implement the Edge Function:
   ```javascript
   // supabase/functions/ai_handler/index.ts
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
   import OpenAI from "https://deno.land/x/openai@v4.42.0/mod.ts";
   
   const openai = new OpenAI({
     apiKey: Deno.env.get("OPENAI_API_KEY"),
   });
   
   serve(async (_req) => {
     // Your AI logic here
     const response = await openai.chat.completions.create({
       model: "gpt-3.5-turbo",
       messages: [{ role: "user", content: "Hello!" }],
     });
   
     return new Response(JSON.stringify(response), {
       headers: { "Content-Type": "application/json" },
     });
   });
   ```

4. Deploy the function:
   ```bash
   supabase functions deploy ai_handler
   ```

5. Set the OpenAI API key as a Supabase secret:
   ```bash
   supabase secrets set OPENAI_API_KEY=your-openai-api-key
   ```

6. Call the Edge Function from your frontend code:
   ```javascript
   const { data, error } = await supabase.functions.invoke('ai_handler', {
     body: { prompt: 'Your prompt here' }
   });
   ```

## Troubleshooting

If you encounter issues:

1. Verify that your environment variables are correctly set
2. Check that the Supabase URL and anon key are correct
3. Ensure that the required tables have been created
4. Verify that RLS policies are properly configured