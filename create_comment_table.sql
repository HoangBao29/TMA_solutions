-- 📝 TẬP LỆNH SQL TẠO BẢNG BÌNH LUẬN PHIM (MOVIE_COMMENT)
-- Chạy tập lệnh này trong phần SQL Editor trên Supabase Dashboard của bạn.

-- Bước 1: Tạo bảng movie_comment nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS public.movie_comment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    movie_id INTEGER NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Bước 2: Tạo index tăng tốc độ truy vấn theo ID phim
CREATE INDEX IF NOT EXISTS idx_movie_comment_movie_id ON public.movie_comment(movie_id);

-- Bước 3: Kích hoạt Row Level Security (RLS)
ALTER TABLE public.movie_comment ENABLE ROW LEVEL SECURITY;

-- Bước 4: Thiết lập các chính sách bảo mật (Policies)

-- 1. Cho phép bất kỳ ai (cả khách và người dùng đăng nhập) được xem bình luận
DROP POLICY IF EXISTS "Allow public read access to comments" ON public.movie_comment;
CREATE POLICY "Allow public read access to comments" ON public.movie_comment
    FOR SELECT
    USING (true);

-- 2. Cho phép người dùng đã đăng nhập được tạo bình luận dưới ID của chính họ
DROP POLICY IF EXISTS "Allow authenticated users to insert comments" ON public.movie_comment;
CREATE POLICY "Allow authenticated users to insert comments" ON public.movie_comment
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 3. Cho phép người dùng được xoá bình luận của chính mình
DROP POLICY IF EXISTS "Allow users to delete their own comments" ON public.movie_comment;
CREATE POLICY "Allow users to delete their own comments" ON public.movie_comment
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 4. Cho phép người dùng chỉnh sửa bình luận của chính mình (nếu cần mở rộng sau này)
DROP POLICY IF EXISTS "Allow users to update their own comments" ON public.movie_comment;
CREATE POLICY "Allow users to update their own comments" ON public.movie_comment
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
