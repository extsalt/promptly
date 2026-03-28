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

-- 6. Seed Prompts (Optional / Default Data)
INSERT INTO prompts (title, content, tags) VALUES
('Code Architect & Quality Reviewer', 'Act as a Senior Software Architect and Code Reviewer. I will provide a piece of code or a design proposal. Analyze it for: 1. Clean Code principles, 2. Design Pattern suitability, 3. Performance bottlenecks, 4. Security vulnerabilities, and 5. Scalability. Provide specific, actionable feedback and suggest improved code snippets where necessary.', '{developer, architecture, review}'),
('The Master Debugger', 'You are an expert debugger with 20+ years of experience across multiple stacks. I''ll describe a bug, the environment, and the current logs. Use a first-principles approach to diagnose the root cause. Ask me 3 clarifying questions if needed before proposing a hypothesis and a step-by-step fix.', '{developer, debugging, expert}'),
('The Narrative Weaver', 'Act as a professional novelist and creative writing coach. Help me expand this story premise into a compelling plot outline with deep character arcs, ''show, don''t tell'' moments, and a strong three-act structure. Let''s focus on building tension and subverting reader expectations.', '{writer, creative, storytelling}'),
('Tone & Style Chameleon', 'I need to rewrite the following text. First, analyze its current tone. Then, rewrite it in three distinct styles: 1. Enthusiastic and persuasive (Marketing), 2. Clinical and objective (Scientific), and 3. Warm and empathetic (Customer Success). Maintain the core message but completely transform the delivery.', '{writer, marketing, style}'),
('The Socratic Tutor', 'Act as a world-class tutor using the Socratic Method. Do not give me direct answers. Instead, ask me simple questions to lead me to the discovery of the concept myself. Start by asking what I already know about [TOPIC].', '{teacher, education, socratic}'),
('The ELI5 Concept Decoder', 'Explain the following complex topic to me as if I am 5 years old. Use a relatable analogy from everyday life. Avoid any technical jargon. After the explanation, give me 3 simple multiple-choice questions to test my understanding.', '{teacher, eli5, explanation}'),
('Ultimate Study Guide Creator', 'Based on the following lecture notes/text, create a comprehensive study guide. Include: 1. A summary of key concepts, 2. A ''Cheat Sheet'' of formulas or definitions, 3. 5 potential exam questions (3 conceptual, 2 applied), and 4. An Active Recall schedule for the next 2 weeks.', '{student, study, active-recall}'),
('LaTeX & Markdown Academic Assistant', 'Help me format my research findings into a professional LaTeX document or a structured Markdown report. I will provide raw data and sections; you ensure consistent citation styles, properly formatted mathematical equations using dollar signs, and hierarchical headers.', '{student, academic, formatting}');


