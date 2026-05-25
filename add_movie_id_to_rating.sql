-- Add movie_id to Supabase rating table so the app can store per-movie ratings
-- and the RSAttAE backend can read persisted user history.
-- Add item_id to Supabase rating table so the app can store per-item ratings
-- and the RSAttAE backend can read persisted user history.

ALTER TABLE rating
ADD COLUMN IF NOT EXISTS item_id INTEGER;

-- Optional index for faster lookups by user/item pair.
CREATE INDEX IF NOT EXISTS idx_rating_user_item
ON rating (user_id, item_id);

-- If you want to prevent duplicate ratings per item later, you can enable this
-- after verifying existing data:
-- ALTER TABLE rating
-- ADD CONSTRAINT rating_user_item_unique UNIQUE (user_id, item_id);
