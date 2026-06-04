# 🔧 Hướng dẫn khắc phục lỗi Supabase kết nối Thể loại

## 📋 Bước 1: Kiểm tra Console Log

1. Chạy app trên điện thoại/emulator
2. Mở DevTools/Console (với Expo: nhấn `j` để xem logs)
3. Tìm dòng: `[DEBUG] Supabase response:` 
4. Kiểm tra:
   - Nếu có `error`: xem messages lỗi chi tiết
   - Nếu `data` là `null` hoặc `[]`: bảng rỗng hoặc RLS chặn

---

## 🔍 Bước 2: Kiểm tra Supabase Dashboard

### 2.1 Kiểm tra bảng `genre` tồn tại
- Vào [Supabase Dashboard](https://app.supabase.com)
- Project: `tkfilm`
- Click vào `SQL Editor` hoặc `Table Editor`
- Tìm table `genre`
- Nếu không tồn tại, chạy SQL:
  ```sql
  CREATE TABLE genre (
    id SERIAL PRIMARY KEY,
    genre TEXT NOT NULL UNIQUE,
    describe TEXT
  );

  INSERT INTO genre (genre, describe) VALUES
  ('Action', 'Phim hành động'),
  ('Adventure', 'Phim phiêu lưu'),
  ('Comedy', 'Phim hài'),
  ('Drama', 'Phim tâm lý'),
  ('Horror', 'Phim kinh dị'),
  ('Romance', 'Phim tình cảm'),
  ('Sci-Fi', 'Phim khoa học viễn tưởng');
  ```

### 2.2 Kiểm tra dữ liệu trong bảng
- Mở Table Editor → table `genre`
- Xem có bao nhiêu rows
- Nếu rỗng → thêm dữ liệu theo lệnh ở trên

---

## 🔐 Bước 3: Kiểm tra & Fix Row Level Security (RLS)

RLS thường là nguyên nhân chính!

### 3.1 Kiểm tra RLS status
- Supabase dashboard → `Authentication` → `Policies`
- Hoặc vào `SQL Editor`, chạy:
  ```sql
  -- Kiểm tra RLS có bật không
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE tablename = 'genre';
  ```

### 3.2 Fix RLS (nếu cần)

**Cách 1: Tắt RLS (nhanh nhất cho dev)**
```sql
ALTER TABLE genre DISABLE ROW LEVEL SECURITY;
```

**Cách 2: Thêm Policy cho phép đọc (nên hơn)**
```sql
-- Allow anonymous/public users to SELECT
CREATE POLICY "Allow public read" ON genre
  FOR SELECT
  USING (true);

-- Hoặc cho authenticated users
CREATE POLICY "Allow authenticated read" ON genre
  FOR SELECT
  TO authenticated
  USING (true);
```

**Cách 3: Dùng Supabase UI**
- Table `genre` → `Authentication` tab → `New Policy`
- Name: `Allow public select`
- Type: SELECT
- Cấp quyền: FOR (SELECT only)
- Roles: anon, authenticated
- USING: (true)
- Save

---

## 🧪 Bước 4: Test kết nối sau khi fix

1. Chạy lại app
2. Xem console log:
   - `[TEST 3] Data count:` > 0 ✓
   - Không có error ✓
3. Nhấn nút "Chọn" thể loại
4. Danh sách genre phải hiện mà không error "không tìm thấy trên database"

---

## 📱 Nếu vẫn lỗi

### Kiểm tra URL/Key Supabase
File: `supabase.ts`
```typescript
const supabaseUrl = 'https://kzcsegvlfaebwpxipqxx.supabase.co';
const supabaseAnonKey = 'sb_publishable_aX-Pv8Sq7rhaPKTkyWkEqA_JwvmT8Xz';
```

- Nếu sai: copy lại từ Supabase Settings → API

### Kiểm tra Auth
- Nếu bảng `genre` private (chỉ cho authenticated):
  - Cần login trước 
  - Hoặc disable RLS cho bảng này
  - Hoặc thêm policy cho `anon` role

### Network
- Kiểm tra internet trên điện thoại/emulator
- Ping: `https://kzcsegvlfaebwpxipqxx.supabase.co` có response không

---

## 💡 Tóm tắt quick-fix

**Cách nhanh nhất:**
1. Vào Supabase dashboard
2. Table `genre` → "Enable RLS" or "Policies" tab
3. Nếu RLS enable → thêm policy cho phép SELECT tất cả (`USING true`)
4. Hoặc `ALTER TABLE genre DISABLE ROW LEVEL SECURITY;`
5. Reload app

Done! ✓
