# TÓM TẮT ĐỒ ÁN TỐT NGHIỆP (EXECUTIVE SUMMARY)

---

## TÓM TẮT ĐỒ ÁN (VIETNAMESE VERSION)

### 1. Đặt vấn đề và Mục tiêu đề tài
Trong kỷ nguyên số, sự bùng nổ của các dịch vụ truyền hình Internet và nền tảng phát trực tuyến Over-The-Top (OTT) đã tạo ra sự quá tải thông tin nghiêm trọng cho người xem. Người dùng thường mất quá nhiều thời gian để tìm kiếm bộ phim hợp sở thích cá nhân. Đồng thời, các nhà vận hành ứng dụng quy mô vừa và nhỏ phải đối mặt với khó khăn trong việc cá nhân hóa nội dung, giải quyết bài toán khởi đầu lạnh (Cold-Start), tối ưu hóa quy trình tiếp thị (marketing) lên mạng xã hội và đảm bảo doanh thu duy trì hệ thống. Đề tài **"Xây dựng ứng dụng xem phim tích hợp tính năng gợi ý phim"** (dự án **TKFilm**) được thực hiện nhằm xây dựng một giải pháp công nghệ toàn diện giải quyết triệt để các thách thức trên.

### 2. Phương pháp nghiên cứu và Kiến trúc công nghệ
Đồ án đã thiết kế và triển khai hệ thống phần mềm hoàn chỉnh theo mô hình Client-Server phân tách 3 lớp kết hợp luồng tự động hóa truyền thông, bao gồm:
*   **Phân hệ Client (Presentation Layer):** Ứng dụng di động đa nền tảng phát triển bằng **React Native & Expo**, quản lý trạng thái qua Zustand, tích hợp **Google AdMob SDK** để hiển thị banner quảng cáo thích ứng di động và **YouTube Player SDK** để phát trailer.
*   **Phân hệ Server (Application/AI Layer):** Máy chủ **Flask API (Python)** đóng vai trò trung tâm xử lý dữ liệu và AI. Backend tích hợp mô hình học sâu mạng nơ-ron tự mã hóa **RSAttAE (Information-Aware Attention Autoencoder)** để tính toán độ tương đồng Cosine thời gian thực và mô hình học máy **XGBoost Classifier** để thực hiện xếp hạng đề xuất nâng cao.
*   **Phân hệ Cơ sở dữ liệu (Data Layer):** Hệ cơ sở dữ liệu quan hệ PostgreSQL triển khai trên nền tảng đám mây **Supabase**, quản lý phiên đăng nhập và bảo mật dữ liệu cấp hàng thông qua Row Level Security (RLS).
*   **Phân hệ Tự động hóa tiếp thị (Automation Layer):** Công cụ workflow **n8n** tự lưu trữ (self-hosted) trên môi trường ảo hóa **Docker**, tự động nhận webhook từ Flask khi admin cập nhật phim mới để đăng tải bài viết PR tự động lên Facebook Fanpage qua Facebook Graph API.

### 3. Kết quả đạt được và Đóng góp thực tiễn
Qua quá trình thực nghiệm và kiểm thử trên tập dữ liệu chuẩn MovieLens 100K cùng phiên bản chạy thực tế (MVP) với 50 người dùng thử nghiệm, đồ án đã đạt được các kết quả nổi bật:
*   **Hiệu năng AI:** Mô hình học sâu RSAttAE đạt chỉ số Precision@10 là **0.22**, Recall@10 là **0.18** và NDCG@10 là **0.25** (vượt trội hơn 20% so với mô hình lọc cộng tác truyền thống). Độ trễ phản hồi suy luận trung bình đạt **45ms** (đáp ứng xuất sắc tiêu chuẩn phi chức năng <100ms).
*   **Vận hành & Kiếm tiền:** Tỷ lệ kích hoạt webhook và tự động đăng bài PR phim lên Facebook Page thông qua n8n đạt **100%** thành công với thời gian phản hồi dưới 3 giây. Giao diện quảng cáo Google AdMob tích hợp mượt mà ở chân màn hình mà không làm vỡ bố cục (Layout Shift).
*   **Độ hài lòng người dùng:** Khảo sát thực tế đạt điểm đánh giá trung bình từ **4.2 đến 4.5 trên thang điểm 5.0** về trải nghiệm giao diện Dark Mode cao cấp và tính cá nhân hóa của đề xuất.

### 4. Kiến nghị và Hướng phát triển tương lai
Để thương mại hóa sản phẩm hoàn chỉnh, nhóm tác giả đề xuất định hướng phát triển sản phẩm:
1.  **Về AI:** Xây dựng quy trình tự động huấn luyện lại mô hình (MLOps Pipeline) định kỳ để chống trôi dạt mô hình (Model Drift), nghiên cứu tích hợp mạng nơ-ron đồ thị (GNN) và Variational Autoencoder (VAE) để nâng cao độ chính xác.
2.  **Về Tự động hóa:** Tích hợp n8n đăng bài đa kênh (TikTok, Telegram, Twitter) và tự động tạo video ngắn bằng thư viện FFmpeg.
3.  **Về Tính năng:** Tích hợp trình phát video trực tuyến (Streaming Player) đầy đủ áp dụng các giải pháp mã hóa bảo mật DRM (Digital Rights Management) theo tiêu chuẩn EME của W3C.

---

## EXECUTIVE SUMMARY (ENGLISH VERSION)

### 1. Background and Objectives
In the digital era, the explosive growth of Over-The-Top (OTT) streaming platforms has led to severe information overload for viewers, who spend excessive time searching for movies that match their tastes. Concurrently, small-and-medium-sized streaming operators struggle with content personalization, the cold-start problem, social media marketing automation, and sustainable monetization. The graduation thesis titled **"Building a Movie Application Integrated with Movie Recommendation Features"** (project **TKFilm**) introduces a comprehensive technical solution to address these core challenges.

### 2. Methodology and System Architecture
The project designs and implements a complete software system utilizing a 3-tier Client-Server architecture integrated with an independent automation layer:
*   **Presentation Layer (Client App):** A cross-platform mobile application developed using **React Native & Expo**, managed by Zustand state library. It embeds **Google AdMob SDK** for adaptive banner advertising and **YouTube Player SDK** for movie trailer playback.
*   **Application & AI Layer (Backend API):** A centralized **Flask API Server (Python)**. It integrates a deep learning **RSAttAE (Information-Aware Attention Autoencoder)** model for real-time Cosine Similarity calculations, and an **XGBoost Classifier** model for advanced recommendation reranking.
*   **Data Layer (Cloud Database):** A relational PostgreSQL database deployed on **Supabase Cloud**, handling secure JWT authentication and data protection using Row-Level Security (RLS) policies.
*   **Automation Layer (Marketing Automation):** A self-hosted **n8n** workflow instance running inside a **Docker Container**, triggered via HTTP POST Webhook from Flask to automatically generate and post movie PR articles to the Facebook Fanpage via Facebook Graph API.

### 3. Key Findings and Empirical Results
Through offline training on the MovieLens 100K dataset and online validation with an MVP tested by 50 active users, the system demonstrated outstanding results:
*   **AI Performance:** The RSAttAE model achieved a Precision@10 of **0.22**, Recall@10 of **0.18**, and NDCG@10 of **0.25** (outperforming traditional Collaborative Filtering by over 20%). The average inference latency at the Flask backend was measured at **45ms** (well below the 100ms threshold).
*   **Operation & Monetization:** The webhook-driven n8n workflow posted movie updates to Facebook with a **100%** success rate in under 3 seconds. The Google AdMob banner adapted dynamically to screen heights without causing layout shifts.
*   **User Satisfaction:** Survey results showed high scores of **4.2 to 4.5 out of 5.0** for Dark Mode aesthetics and recommendation relevance.

### 4. Recommendations and Future Roadmap
To upgrade TKFilm into a commercial-grade OTT application, the following roadmap is recommended:
1.  **AI & MLOps:** Deploy an automated retraining pipeline (MLOps) to prevent model drift, and explore Graph Neural Networks (GNNs) and Variational Autoencoders (VAEs) for higher accuracy.
2.  **Multichannel Automation:** Extend the n8n workflow to post content on TikTok, Telegram, and Twitter, and automate short video generation using FFmpeg.
3.  **Core Video Streaming:** Integrate a secure video player powered by Content Delivery Networks (CDNs) and Digital Rights Management (DRM) standard conforming to W3C EME specs.
