# TKFilm - Hệ thống gợi ý phim thông minh 🎬

Hệ thống gợi ý phim sử dụng Machine Learning (Attention-based Autoencoder) kết hợp với TMDB API để cung cấp trải nghiệm xem và khám phá phim tuyệt vời.

## ✨ Tính năng chính

### 🎬 Xem phim với thông tin đầy đủ
- **Poster HD** từ TMDB
- **Trailer YouTube** nhúng trực tiếp
- **Thông tin chi tiết**: Đánh giá, diễn viên, đạo diễn, tóm tắt
- **Responsive**: Hoạt động tốt trên mọi thiết bị

### 🎯 Hệ thống gợi ý thông minh
1. **Dựa trên đánh giá cá nhân**
   - Đánh giá phim 1-5 sao
   - Model AI tạo gợi ý dựa trên sở thích của bạn
   - Real-time recommendations

2. **Dựa trên phim tương tự**
   - Tìm phim giống với những phim bạn thích
   - Sử dụng embeddings từ trained model

3. **Cold-start recommendations**
   - Gợi ý cho người dùng mới
   - Dựa trên thể loại yêu thích

### 📚 Duyệt phim
- Danh sách tất cả phim từ dataset MovieLens 100K
- Lọc theo thể loại
- Tìm kiếm theo tên
- Phân trang

### 💾 Quản lý đánh giá
- Lưu đánh giá của bạn
- Xem lịch sử đánh giá
- Nhận gợi ý dựa trên tất cả đánh giá

## 🚀 Cài đặt và chạy

### Yêu cầu
- Python 3.8+
- PyTorch
- Flask
- TMDB API key (đã tích hợp sẵn)

### Các bước cài đặt

1. **Clone repository và vào thư mục**
```bash
cd /home/tuantn1807/project/tkfilm
```

2. **Kích hoạt virtual environment**
```bash
source .venv/bin/activate
```

3. **Cài đặt dependencies**
```bash
pip install -r requirements.txt
```

4. **Chạy ứng dụng**
```bash
python3 app.py
```

5. **Truy cập ứng dụng**
Mở trình duyệt và truy cập: `http://localhost:5000`

## 📖 Hướng dẫn sử dụng

### 1. Trang chủ
- Xem các phim mới nhất
- Khám phá phim phổ biến

### 2. Duyệt phim
- Click "Duyệt phim" trên menu
- Lọc theo thể loại hoặc tìm kiếm
- Click vào phim để xem chi tiết

### 3. Xem chi tiết và đánh giá phim
- Click vào bất kỳ phim nào
- Xem trailer, thông tin, diễn viên
- **Đánh giá phim**: Click vào số sao (1-5 ⭐)
- Đánh giá sẽ được lưu tự động

### 4. Nhận gợi ý phim
**Cách 1**: Từ đánh giá của bạn
- Đánh giá ít nhất 3-5 bộ phim
- Click "Đánh giá của tôi" trên menu
- Click "Nhận gợi ý từ đánh giá"

**Cách 2**: Trang gợi ý
- Click "Gợi ý" trên menu
- Hệ thống tự động tạo gợi ý từ đánh giá của bạn

## 🔧 API Endpoints

### Movies
- `GET /api/movies?page=1&per_page=20&genre=Action` - Danh sách phim
- `GET /api/movie/{movie_id}/tmdb` - Chi tiết phim với TMDB
- `GET /api/movie/{movie_id}/videos` - Trailer/videos

### Ratings
- `POST /api/rate` - Đánh giá phim
  ```json
  {
    "session_id": "user_xxx",
    "movie_id": 0,
    "rating": 4.5
  }
  ```
- `GET /api/user_ratings?session_id=user_xxx` - Lấy đánh giá của user

### Recommendations
- `POST /api/recommend_from_ratings` - Gợi ý từ đánh giá
  ```json
  {
    "session_id": "user_xxx",
    "top_n": 10
  }
  ```
- `GET /api/recommend?user_id=0&top_n=10` - Gợi ý cho user (ML-100K)
- `GET /api/recommend_coldstart?genres=Action,Comedy` - Cold-start
- `GET /api/recommend_from_movies?movie_ids=1,50,120` - Từ phim seed

### TMDB Integration
- `GET /api/tmdb/search?query=Matrix` - Tìm kiếm TMDB
- `GET /api/tmdb/movie/{tmdb_id}` - Chi tiết từ TMDB
- `GET /api/tmdb/trending?window=week` - Phim trending
- `GET /api/tmdb/popular` - Phim phổ biến

## 🤖 Model thông tin

### Architecture
- **RSAttAE**: Information-Aware Attention-based Autoencoder
- **User embeddings**: 64 dimensions
- **Movie embeddings**: 64 dimensions
- **Attention dropout**: 0.5

### Training Data
- Dataset: MovieLens 100K
- Users: 943
- Movies: 1682
- Ratings: 100,000
- Features: Demographics (users), Genres (movies)

### Files
- `users_embeddings_attention_autoencoder_64_0.5.pt` - User embeddings
- `movies_embeddings_attention_autoencoder_64_0.5.pt` - Movie embeddings

## 🎨 Giao diện

### Trang chủ
- Hero section với branding
- Grid phim mới nhất với poster

### Duyệt phim
- Filter controls (thể loại, tìm kiếm)
- Grid layout responsive
- Pagination

### Modal chi tiết phim
- Poster lớn
- Thông tin đầy đủ
- Embedded trailer YouTube
- Rating system (1-5 sao)
- Cast & crew

### Sidebar đánh giá
- Danh sách phim đã đánh giá
- Nút nhận gợi ý nhanh

## 🔑 TMDB API

API Key đã được tích hợp: `99a16771b399bdbcd6962d6a42ae9a8e`

### Dữ liệu từ TMDB:
- Poster images (HD)
- Backdrop images
- Movie details (overview, runtime, budget, etc.)
- Cast & crew
- Videos/Trailers
- Reviews
- Ratings & vote count

## 📊 Tech Stack

### Backend
- **Flask**: Web framework
- **PyTorch**: Deep learning
- **Pandas**: Data processing
- **NumPy**: Numerical computing

### Frontend
- **Vanilla JavaScript**: No frameworks
- **CSS3**: Modern styling
- **Responsive Design**: Mobile-first

### External APIs
- **TMDB API**: Movie data và media

## 🐛 Troubleshooting

### Port đã được sử dụng
```bash
lsof -ti:5000 | xargs kill -9
```

### Model files không tìm thấy
Đảm bảo các file embeddings có trong thư mục gốc:
- `users_embeddings_attention_autoencoder_64_0.5.pt`
- `movies_embeddings_attention_autoencoder_64_0.5.pt`

### TMDB không load poster
- Kiểm tra kết nối internet
- API key có thể bị rate limit (chờ vài phút)

## 📝 Notes

- **Session storage**: Đánh giá lưu trong memory (production nên dùng database)
- **TMDB cache**: Results được cache để giảm API calls
- **Development server**: Flask dev server (production dùng gunicorn/uwsgi)

## 🎯 Future Improvements

- [ ] User authentication & persistent storage
- [ ] Social features (share, comments)
- [ ] More recommendation algorithms
- [ ] Watchlist functionality
- [ ] Movie streaming integration
- [ ] Advanced filters (year, rating range, etc.)
- [ ] Recommendation explanations
- [ ] A/B testing for recommendations

## 📄 License

MIT License - See LICENSE file

## 👥 Contributors

- Tuan Tran (@tuantn1807)

---

**Enjoy discovering movies with TKFilm! 🎬🍿**
