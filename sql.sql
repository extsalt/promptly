-- Idempotent Supabase Schema for Promptly

-- 1. Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Public profiles are viewable by everyone') THEN
    CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Prompts
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure author_id is nullable for anonymous posts
ALTER TABLE prompts ALTER COLUMN author_id DROP NOT NULL;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Public prompts are viewable by everyone') THEN
    CREATE POLICY "Public prompts are viewable by everyone" ON prompts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can insert own prompts') THEN
    CREATE POLICY "Users can insert own prompts" ON prompts FOR INSERT WITH CHECK (auth.uid() = author_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Anyone can insert anonymous prompts') THEN
    CREATE POLICY "Anyone can insert anonymous prompts" ON prompts FOR INSERT WITH CHECK (auth.uid() IS NULL AND author_id IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can update own prompts') THEN
    CREATE POLICY "Users can update own prompts" ON prompts FOR UPDATE USING (auth.uid() = author_id);
  END IF;
END $$;

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- 3. Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Public comments are viewable by everyone') THEN
    CREATE POLICY "Public comments are viewable by everyone" ON comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can insert own comments') THEN
    CREATE POLICY "Users can insert own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
  END IF;
END $$;

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 4. Upvotes
CREATE TABLE IF NOT EXISTS upvotes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (user_id, prompt_id)
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Public upvotes are viewable by everyone') THEN
    CREATE POLICY "Public upvotes are viewable by everyone" ON upvotes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can upvote') THEN
    CREATE POLICY "Users can upvote" ON upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can remove upvote') THEN
    CREATE POLICY "Users can remove upvote" ON upvotes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- 5. Auto-profile creation on signup
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger to avoid existence errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

