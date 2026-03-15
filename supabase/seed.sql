-- Add tags column if not present (idempotent)
ALTER TABLE public.entries
ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- Insert dummy entries for testing (run after schema)
INSERT INTO public.entries (title, body, entry_date, tags)
VALUES
  (
    'Morning pages',
    '<p>Woke up late again. The kind of late where the <strong>light in the room</strong> already feels different — heavier somehow, like the morning already moved on without you.</p><p>Made coffee and stood at the kitchen window for probably too long watching the neighbor''s cat sit completely still on the fence post.</p><ul><li>Finish proposal</li><li>Call mom</li><li>Read 30 min</li></ul>',
    '2025-03-13',
    ARRAY['Happy', 'Reflective']
  ),
  (
    'Weekend notes',
    '<p>It was a <em>good day</em>. Spent most of the afternoon reading. The kind of reading where hours slip by and you only notice when the light changes and the room goes quiet in a different way.</p><p>Dinner with friends. We talked about nothing and everything.</p>',
    '2025-03-08',
    ARRAY['Grateful', 'Calm']
  ),
  (
    'Ideas for the project',
    '<p>Feeling grateful today. Small things adding up to something bigger than I expected.</p><ol><li>A message from an old friend</li><li>Good coffee</li><li>A walk that lasted longer than planned</li></ol><p>Need to remember this when things feel stuck.</p>',
    '2025-03-05',
    ARRAY['Creative', 'Inspired']
  );
-- Run once. If you need to re-seed, delete entries first or run: DELETE FROM public.entries WHERE title IN ('Morning pages','Weekend notes','Ideas for the project');
