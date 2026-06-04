-- Add user_uuid to Supabase rating table so authenticated users can store
-- and fetch their own ratings using Supabase auth UUIDs.

ALTER TABLE rating
ADD COLUMN IF NOT EXISTS user_uuid UUID;

-- Optional index for faster lookups by user UUID and item id.
CREATE INDEX IF NOT EXISTS idx_rating_user_uuid_item
ON rating (user_uuid, item_id);

-- If you want to enforce one rating per item per authenticated user, enable this
-- after verifying there is no conflicting data:
-- ALTER TABLE rating
-- ADD CONSTRAINT rating_user_uuid_item_unique UNIQUE (user_uuid, item_id);