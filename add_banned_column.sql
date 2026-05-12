-- Thêm cột banned vào bảng profile để quản lý khoá tài khoản
-- Chạy SQL này trong Supabase SQL Editor

ALTER TABLE profile ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE;