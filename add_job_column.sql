-- Thêm cột job vào bảng profile để lưu nghề nghiệp của người dùng
-- Chạy SQL này trong Supabase SQL Editor

ALTER TABLE profile ADD COLUMN IF NOT EXISTS job TEXT;