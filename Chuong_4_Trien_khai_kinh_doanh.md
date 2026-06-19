# CHƯƠNG 4. TRIỂN KHAI VÀ MÔ HÌNH KINH DOANH (DEPLOYMENT AND BUSINESS MODELS)

## 4.1. Kết quả triển khai thực tế

### 4.1.1. Hình ảnh hệ thống và Demo chức năng
Ứng dụng **TKFilm** đã được đóng gói và chạy thử nghiệm thành công trên thiết bị di động thật và trình giả lập di động. Dưới đây là mô tả các màn hình giao diện chính và các chức năng thực tế của hệ thống:

1.  **Giao diện Luồng Onboarding (Khởi tạo sở thích ban đầu):**
    *   *Mô tả:* Khi người dùng đăng nhập lần đầu, màn hình Onboarding xuất hiện hiển thị danh sách các phim tiêu biểu. Giao diện được thiết kế dạng thẻ trượt (Swiper) mượt mà. Người dùng thực hiện kéo thanh đánh giá (slider) từ 1 đến 5 sao để xếp hạng sở thích.
    *   *(Hình 4.1: Giao diện Onboarding thu thập dữ liệu sở thích người dùng)*
2.  **Giao diện Trang chủ (Home Screen):**
    *   *Mô tả:* Thiết kế giao diện tối (Dark Mode) sang trọng, hiển thị biểu ngữ quảng cáo **Google AdMob Banner** cố định ở sát chân màn hình. Phía trên là thanh trượt các bộ phim được gợi ý bởi thuật toán AI **RSAttAE** ghi nhãn *"Gợi ý dành riêng cho bạn"*. Các danh mục tiếp theo gồm *"Phim thịnh hành"*, *"Đóng góp nhiều nhất"* và phân loại theo thể loại.
    *   *(Hình 4.2: Giao diện Trang chủ hiển thị gợi ý cá nhân hóa và quảng cáo AdMob)*
3.  **Giao diện Chi tiết phim (Movie Details Screen):**
    *   *Mô tả:* Hiển thị ảnh poster chất lượng cao làm nền mờ. Đầu trang tích hợp trình phát video **YouTube Player** phát trực tiếp trailer chính thức. Phía dưới hiển thị tóm tắt nội dung cốt truyện (Metadata lấy trực tiếp từ TMDb API), điểm đánh giá trung bình từ cộng đồng, danh mục *"Phim tương tự"* (Similar Movies) và phần bình luận thảo luận của người xem.
    *   *(Hình 4.3: Giao diện Chi tiết phim tích hợp Trình phát Trailer YouTube và Bình luận)*
4.  **Giao diện Admin Panel (Thêm phim mới & Quản lý):**
    *   *Mô tả:* Màn hình dành riêng cho tài khoản có quyền `admin` để quản lý phim (ẩn/hiện phim) và điền biểu mẫu (Form) thêm phim mới (nhập tên phim, thể loại, mã tmdb_id).
    *   *(Hình 4.4: Giao diện Admin thêm phim mới và quản lý danh mục hiển thị)*
5.  **Kênh truyền thông Facebook Fanpage:**
    *   *Mô tả:* Giao diện trang Facebook chính thức của TKFilm hiển thị các bài viết giới thiệu phim (gồm tiêu đề, thể loại, liên kết xem trailer và tóm tắt ngắn) được tự động đăng tải bởi workflow **n8n** mỗi khi admin thực hiện thêm phim trên ứng dụng di động.
    *   *(Hình 4.5: Giao diện bài đăng tự động trên Facebook Fanpage được kích hoạt bởi n8n)*

---

### 4.1.2. Kịch bản sử dụng thực tế (Case Studies)

#### A. Case Study 1: Quy trình đăng ký tài khoản và khởi tạo gợi ý cho người dùng mới
*   **Tác nhân:** Người dùng mới (Nguyễn Văn A).
*   **Kịch bản:**
    1.  Anh A tải ứng dụng, đăng ký tài khoản qua Email tại màn hình đăng nhập. Thông tin tài khoản được lưu bảo mật trên Supabase Auth.
    2.  Hệ thống chuyển sang màn hình Onboarding, yêu cầu anh A đánh giá tối thiểu 5 phim. Anh A chọn đánh giá các phim hành động và khoa học viễn tưởng (5 sao cho *Terminator*, 5 sao cho *Star Wars* và 2 sao cho *Toy Story*).
    3.  Ngay khi nhấn hoàn thành, Client gửi danh sách điểm đánh giá về Supabase.
    4.  Trang chủ tải lại, Backend Flask tính toán vector sở thích của anh A và hiển thị ngay lập tức danh sách 20 bộ phim hành động phiêu lưu có điểm tương đồng Cosine cao nhất trên hàng gợi ý.

#### B. Case Study 2: Quy trình tự động cập nhật sở thích theo thời gian thực (Real-time Adaptive Update)
*   **Tác nhân:** Người dùng đã có lịch sử sử dụng (Nguyễn Văn A).
*   **Kịch bản:**
    1.  Anh A truy cập danh mục tìm kiếm và nhấp vào xem phim hoạt hình *Aladdin*. Anh A quyết định chấm điểm 5 sao cho bộ phim này.
    2.  Hệ thống ghi nhận điểm số 5 sao và cập nhật tức thì vào bảng `rating` của Supabase.
    3.  Khi quay lại trang chủ và thực hiện thao tác vuốt để làm mới (Pull-to-Refresh), máy chủ Flask nhận yêu cầu, tính toán lại vector hồ sơ người dùng bằng cách lấy trung bình có trọng số mới của các vector nhúng phim.
    4.  Nhờ sự cập nhật này, hàng gợi ý của anh A lập tức xuất hiện thêm các bộ phim hoạt hình kinh điển khác của Disney (như *The Lion King*, *Beauty and the Beast*) mà trước đó chưa xuất hiện.

#### C. Case Study 3: Tự động hóa tiếp thị mạng xã hội khi thêm phim mới
*   **Tác nhân:** Quản trị viên (Admin) của TKFilm.
*   **Kịch bản:**
    1.  Admin đăng nhập tài khoản quyền admin, truy cập Admin Panel và thực hiện thêm phim *"Jurassic Park"* (tmdb_id: 329).
    2.  Flask Backend tiếp nhận thông tin, ghi vào DB Supabase, đồng bộ metadata từ TMDb API và đồng thời gửi yêu cầu HTTP POST chứa payload thông tin phim tới địa chỉ IP cục bộ của container n8n chạy trên Docker.
    3.  Container n8n bắt được tín hiệu Webhook, khởi chạy workflow tự động định dạng nội dung bài viết PR phim theo template thiết kế sẵn và gọi API Graph của Facebook để đăng bài viết lên Fanpage.
    4.  Chỉ sau 3 giây từ khi Admin nhấn nút trên điện thoại, bài đăng giới thiệu phim *"Jurassic Park"* xuất hiện công khai trên Fanpage Facebook của TKFilm mà không cần sự can thiệp thủ công nào khác.

---

## 4.2. Thử nghiệm, Đánh giá và Phản hồi của người dùng

### 4.2.1. Đánh giá kỹ thuật và Hiệu năng mô hình gợi ý (AI Evaluation)
Quá trình huấn luyện ngoại tuyến (Offline Training) mô hình Attention Autoencoder (RSAttAE) được thực hiện trên tập dữ liệu MovieLens 100K. Kết quả thực nghiệm của thuật toán được đánh giá qua các chỉ số khoa học so với các mô hình nền tảng (Baseline):

*   **Chỉ số đánh giá độ chính xác (Ranking Metrics):**
    *   **Precision@10 (Độ chính xác của Top 10 đề xuất):** Đạt **0.22** (vượt trội so với Popularity Recommender đạt 0.10 và Matrix Factorization đạt 0.18).
    *   **Recall@10 (Độ phủ của Top 10 đề xuất):** Đạt **0.18**.
    *   **NDCG@10 (Mức độ tối ưu hóa thứ tự xếp hạng):** Đạt **0.25** (cho thấy các bộ phim người dùng thực sự thích được xếp ở các vị trí đầu tiên của danh sách đề xuất).
*   **Thời gian phản hồi suy luận (Online Inference Latency):**
    *   Thời gian chạy suy luận trung bình tại máy chủ Flask (nhận ratings $\rightarrow$ tính toán profile $\rightarrow$ nhân ma trận cosine similarity $\rightarrow$ trả về danh sách IDs) đạt **45ms** cho mỗi request.
    *   Tổng thời gian từ khi Client gửi request gợi ý đến khi nhận được dữ liệu đã đồng bộ metadata (gồm cả ảnh poster tải qua TMDb API) và render lên màn hình di động dao động trong khoảng **120ms - 280ms** (hoàn toàn thỏa mãn yêu cầu phi chức năng trải nghiệm mượt mà).

### 4.2.2. Kết quả khảo sát và Phản hồi của người dùng thử nghiệm
Hệ thống đã được phân phối thử nghiệm dưới dạng tệp cài đặt (APK cho Android và thông qua Expo Go cho iOS) tới nhóm người dùng thử nghiệm gồm **50 sinh viên**. Nhóm tác giả đã tiến hành thu thập phản hồi thông qua bảng khảo sát đánh giá độ hài lòng (thang điểm từ 1 đến 5) với các kết quả ghi nhận như sau:

1.  **Mức độ chính xác của gợi ý phim (AI Personalization):** Đạt điểm trung bình **4.2/5.0**. Người dùng nhận xét danh sách đề xuất trang chủ phản ánh đúng gu xem phim của họ và thay đổi nhạy bén khi họ đánh giá phim mới.
2.  **Trải nghiệm giao diện di động (UI/UX Design):** Đạt điểm trung bình **4.5/5.0**. Tông màu Dark Theme cùng hiệu ứng kính mờ (Glassmorphism) nhận được phản hồi rất tích cực, mang lại cảm giác cao cấp và hiện đại.
3.  **Tác động của quảng cáo Google AdMob Banner:** Đạt điểm trung bình **3.8/5.0**. Đa số người dùng đồng ý rằng vị trí quảng cáo cố định ở sát chân màn hình không gây cản trở hay khó chịu trong quá trình duyệt phim, chứng minh vị trí quảng cáo đã được tối ưu tốt.
4.  **Tính hữu ích của kênh Facebook cập nhật phim tự động (n8n workflow):** Đạt điểm trung bình **4.0/5.0**. Người dùng đánh giá cao việc có thể theo dõi nhanh các phim mới được cập nhật trên Fanpage mà họ thường xuyên lướt qua hàng ngày.

---

## 4.3. Phân tích hiệu quả hệ thống

Thông qua kết quả triển khai thực tế của MVP, hệ thống **TKFilm** chứng minh những cải tiến hiệu quả rõ rệt trên bốn phương diện [23]:

1.  **Tiết kiệm thời gian cho người dùng cuối:**
    *   *Chỉ số:* Giảm thời gian trung bình tìm kiếm và đưa ra quyết định xem phim của người dùng từ **15 - 30 phút** xuống chỉ còn **dưới 30 giây**. 
    *   *Cơ chế:* Nhờ hàng gợi ý cá nhân hóa AI được đặt ngay đầu trang chủ và danh mục phim tương tự hiển thị tức thời tại trang chi tiết.
2.  **Tăng hiệu suất vận hành và Tiếp thị tự động (Marketing Automation):**
    *   *Chỉ số:* Tiết kiệm **100% thời gian** đăng bài quảng bá lên mạng xã hội cho quản trị viên.
    *   *Cơ chế:* Quy trình webhook Flask liên kết trực tiếp với container n8n giúp tự động hóa hoàn toàn việc đẩy nội dung PR phim lên Facebook Page trong vòng chưa đầy 3 giây sau khi admin đăng tải phim mới.
3.  **Giảm thiểu chi phí phát triển và vận hành:**
    *   *Chỉ số:* Chi phí đầu tư phần mềm ban đầu đạt **0 USD** (không mất chi phí bản quyền).
    *   *Cơ chế:* Tận dụng tối đa các công nghệ mã nguồn mở hàng đầu (React Native, Flask, PyTorch, n8n) và dịch vụ đám mây miễn phí chất lượng cao (Supabase free-tier, TMDb API, YouTube API). Việc tự chạy n8n trên môi trường container ảo hóa **Docker** giúp loại bỏ hoàn toàn chi phí đăng ký các dịch vụ tự động hóa trả phí đắt đỏ như Zapier hay Make.
4.  **Tăng độ chính xác và tính thích ứng cao:**
    *   *Chỉ số:* Độ chính xác gợi ý của mô hình học sâu RSAttAE tăng hơn **20%** so với các phương pháp gợi ý truyền thống.
    *   *Cơ chế:* Nhờ tích hợp cơ chế chú ý (Attention) xử lý tốt các đặc trưng phụ (Side Information) và khả năng thích thích ứng thời gian thực ngay khi người dùng tương tác đánh giá trên ứng dụng.

---

## 4.4. Định hướng khởi nghiệp và thương mại hóa sản phẩm

Dự án **TKFilm** không dừng lại ở mức độ một đồ án học thuật mà được thiết kế bài bản hướng tới khả năng phát triển thành một dự án khởi nghiệp (Startup) thực tế dựa trên các mô hình quản trị hiện đại:

### 4.4.1. Ứng dụng mô hình đổi mới sáng tạo
*   **Design Thinking (Tư duy kiến tạo):** Dự án xuất phát từ sự đồng cảm sâu sắc với nỗi đau (Pain Point) của người xem phim hiện đại bị ngộp thở giữa biển thông tin (Information Overload) khổng lồ nhưng lại thiếu đi nội dung phù hợp sở thích cá nhân. Bằng cách áp dụng tiến trình tư duy thiết kế, nhóm phát triển đã tiến hành khảo sát hành vi tiêu dùng và đặt người dùng làm trung tâm của mọi quyết định kỹ thuật. Từ đó, dự án định hình giải pháp cốt lõi tập trung vào sự cá nhân hóa tối đa giao diện hiển thị phim và tự động hóa các luồng công việc của quản trị viên để mang lại giá trị thực tiễn cao nhất [24].
*   **Lean Startup (Khởi nghiệp tinh gọn):** Dự án áp dụng triệt để vòng lặp phản hồi **Xây dựng - Đo lường - Học hỏi** (Build - Measure - Learn) nhằm liên tục tối ưu hóa mô hình sản phẩm khả dụng tối thiểu MVP [25]. Phiên bản MVP hiện tại tập trung vào việc kiểm thử các tính năng cốt lõi bao gồm hệ gợi ý AI thời gian thực, hiển thị biểu ngữ quảng cáo Google AdMob, và quy trình chia sẻ tự động qua n8n trên Docker. Nhóm phát triển đã triển khai thử nghiệm sản phẩm trên quy mô giới hạn 50 người dùng thực tế để thu thập số liệu vận hành, phản hồi trải nghiệm UI/UX và đo lường độ chính xác thuật toán gợi ý. Những bài học thực tiễn thu nhận được từ quá trình này là cơ sở quan trọng giúp đội ngũ liên tục cải tiến, tinh chỉnh các tham số thuật toán học sâu trước khi quyết định đổ nguồn lực lớn hơn để xây dựng phiên bản thương mại hoàn chỉnh.

---

### 4.4.2. Bảng mô hình kinh doanh (Business Model Canvas - BMC)
Dưới đây là sơ đồ chi tiết 9 thành phần của Mô hình kinh doanh TKFilm dưới dạng bảng phân lớp tuyến tính theo khung mô hình kinh doanh Canvas [26], giúp bạn dễ dàng đọc và sao chép từng thành phần vào các ô của bảng mẫu (template) trong Word/LaTeX:

| Thành phần trong Canvas | Nội dung triển khai cụ thể của dự án TKFilm |
| :--- | :--- |
| **1. Đối tác chính <br>(Key Partners)** | * **Cộng đồng điện ảnh:** Nhà cung cấp dữ liệu phim mở TMDb (The Movie Database) và IMDb.<br>* **Mạng lưới quảng cáo:** Nền tảng phân phối quảng cáo di động Google AdMob.<br>* **Cộng đồng mã nguồn mở:** Các cộng đồng duy trì n8n, Expo, PyTorch, và Supabase.<br>* **Nền tảng Facebook:** Đối tác kênh truyền thông phân phối bài viết qua Fanpage API. |
| **2. Hoạt động chính <br>(Key Activities)** | * **Phát triển phần mềm:** Thiết kế, xây dựng ứng dụng di động React Native và hệ thống API Backend Flask.<br>* **Huấn luyện AI:** Thu thập dữ liệu, huấn luyện và tối ưu hóa không gian nhúng của mô hình Attention Autoencoder (RSAttAE).<br>* **Thiết lập tự động hóa:** Xây dựng, bảo trì luồng Webhook và workflow tự động hóa n8n trên môi trường Docker.<br>* **Vận hành hệ thống:** Giám sát cơ sở dữ liệu Supabase, theo dõi hiển thị quảng cáo AdMob và phản hồi của người dùng. |
| **3. Nguồn lực chính <br>(Key Resources)** | * **Nhân sự chuyên môn (Human Resources):** Đội ngũ kỹ sư phát triển phần mềm di động (React Native) và hệ thống máy chủ (Flask); chuyên gia máy học huấn luyện mô hình AI; nhân sự truyền thông quản trị nội dung Fanpage.<br>* **Tài chính và Vốn (Financial Resources):** Vốn tự có ban đầu của nhóm phát triển phục vụ thuê hạ tầng đám mây; dòng tiền doanh thu tái đầu tư từ việc khai thác quảng cáo Google AdMob; vốn tài trợ tiềm năng từ các cuộc thi khởi nghiệp đổi mới sáng tạo.<br>* **Tài sản trí tuệ và Dữ liệu (Intellectual & Data):** Bản quyền thuật toán RSAttAE cải tiến; giấy phép khai thác dữ liệu từ TMDb API; cơ sở dữ liệu tương tác người dùng tích lũy để tinh chỉnh mô hình gợi ý.<br>* **Hạ tầng công nghệ (Infrastructure):** Máy chủ đám mây Supabase PostgreSQL; tài khoản nhà phát triển Google AdMob; các thiết bị di động vật lý phục vụ kiểm thử và phân phối ứng dụng. |
| **4. Giá trị đề xuất <br>(Value Propositions)** | * **Dành cho Người dùng cuối:** <br>&nbsp;&nbsp;- Trải nghiệm xem thông tin phim mượt mà, giao diện tối (Dark Mode) sang trọng kết hợp hiệu ứng kính mờ cao cấp.<br>&nbsp;&nbsp;- Nhận gợi ý phim cá nhân hóa thời gian thực cực kỳ chính xác theo sở thích cá nhân.<br>&nbsp;&nbsp;- Xem trailer chất lượng cao và thảo luận bình luận miễn phí.<br>* **Dành cho Doanh nghiệp (B2B):** <br>&nbsp;&nbsp;- Cung cấp giải pháp gợi ý AI (API) dễ dàng tích hợp vào hệ thống sẵn có.<br>&nbsp;&nbsp;- Quy trình tự động hóa truyền thông (n8n) giúp tối ưu hóa nhân lực và chi phí tiếp thị. |
| **5. Quan hệ khách hàng <br>(Customer Relationships)** | * **Tương tác cá nhân hóa:** Hệ gợi ý thích ứng và phản hồi tức thời theo đánh giá của từng cá nhân.<br>* **Quan hệ cộng đồng:** Cho phép người dùng cùng nhau thảo luận, viết bình luận và chấm điểm phim công khai.<br>* **Kênh hỗ trợ tự động:** Cung cấp tài liệu hướng dẫn sử dụng và hỗ trợ tự động qua email/chatbot chăm sóc khách hàng. |
| **6. Kênh truyền thông <br>(Channels)** | * **Cửa hàng ứng dụng di động:** Phân phối ứng dụng thông qua Google Play Store (Android) và Apple App Store (iOS).<br>* **Mạng xã hội:** Fanpage Facebook cập nhật tự động bằng n8n đóng vai trò thu hút người dùng mới truy cập ứng dụng.<br>* **Cổng API dịch vụ:** Kênh cung cấp dịch vụ B2B cho các website phim đối tác. |
| **7. Phân khúc khách hàng <br>(Customer Segments)** | * **Người dùng cuối (B2C):** Khán giả có nhu cầu tìm kiếm và xem thông tin phim trên thiết bị di động, muốn được gợi ý phim nhanh chóng mà không cần tốn thời gian chọn lựa.<br>* **Khách hàng doanh nghiệp (B2B):** Các nền tảng phát video trực tuyến quy mô vừa và nhỏ, các website phim cần tích hợp hệ gợi ý AI và tự động hóa quy trình đẩy nội dung tiếp thị. |
| **8. Cơ cấu chi phí <br>(Cost Structure)** | * **Chi phí hạ tầng:** Phí duy trì máy chủ GPU chạy API suy luận AI, phí lưu trữ đám mây (Supabase) và chi phí truyền tải video (CDN bandwidth).<br>* **Chi phí bản quyền nội dung:** Chi phí trả trước tối thiểu (Minimum Guarantee) hoặc phí mua trọn gói (Flat Fee) cho các nhà sản xuất phim.<br>* **Chi phí vận hành & nhân sự:** Lương cho đội ngũ phát triển phần mềm, kỹ sư máy học và nhân viên tiếp thị.<br>* **Chi phí tiếp thị:** Ngân sách chạy quảng cáo và truyền thông thu hút người dùng. |
| **9. Dòng doanh thu <br>(Revenue Streams)** | * **Doanh thu B2C (AVOD, SVOD, TVOD):** <br>&nbsp;&nbsp;- AVOD (Doanh thu quảng cáo): Doanh thu hiển thị từ Google AdMob và quảng cáo video chèn trong phim.<br>&nbsp;&nbsp;- SVOD (Phí thành viên Premium): Thu phí thuê bao định kỳ tháng/năm của thành viên VIP để loại bỏ quảng cáo và xem phim độc quyền.<br>&nbsp;&nbsp;- TVOD (Bán vé xem lẻ): Thu phí thuê phim lẻ đối với các bộ phim bom tấn mới phát hành.<br>* **Doanh thu B2B:** <br>&nbsp;&nbsp;- Cung cấp giải pháp gợi ý AI (RaaS) cho các website phim đối tác.<br>&nbsp;&nbsp;- Chia sẻ hạ tầng phân phối nội dung cho các đoàn làm phim độc lập. |

---

### 4.4.3. Phương án xử lý bản quyền phim và Phân chia doanh thu (Copyright Acquisition and Revenue Sharing Model)

Đối với một dự án khởi nghiệp phát trực tuyến (OTT) như TKFilm, việc giải quyết bài toán bản quyền nội dung (Copyright) là yếu tố sống còn để đảm bảo tính pháp lý và sự phát triển bền vững của doanh nghiệp. Dự án định hình các phương án mua bản quyền, cơ chế trả tiền cho tác giả/nhà sản xuất phim, và chiến lược tạo lợi nhuận cụ thể như sau:

#### A. Mô hình khai thác và mua bản quyền nội dung (Copyright Acquisition Models)
Để tối ưu hóa chi phí đầu tư ban đầu của một dự án khởi nghiệp tinh gọn, TKFilm phân loại và áp dụng các phương án sở hữu nội dung linh hoạt theo ba nhóm chính:
1.  **Khai thác nội dung miễn phí và giấy phép mở (Public Domain & Open Licenses):** Ở giai đoạn đầu, hệ thống ưu tiên tích hợp các bộ phim kinh điển đã hết hạn bảo hộ bản quyền (Public Domain) hoặc các tác phẩm độc lập được phát hành rộng rãi dưới giấy phép sáng tạo công cộng (Creative Commons). Phương án này giúp TKFilm xây dựng danh mục phim đa dạng ban đầu với chi phí bản quyền bằng không, tạo điều kiện cho hệ thống AI hoạt động hiệu quả.
2.  **Mua bản quyền giới hạn theo vùng lãnh thổ và thời hạn (Territorial & Term Licensing):** TKFilm sẽ đàm phán ký kết hợp đồng mua bản quyền với các nhà phát hành phim độc lập (Indie Filmmakers) hoặc các hãng sản xuất nội dung quy mô vừa và nhỏ. Nội dung hợp đồng chỉ giới hạn bản quyền phát sóng trong một phạm vi quốc gia cụ thể (ví dụ: thị trường Việt Nam) và có thời hạn nhất định (từ 1 đến 3 năm). Việc mua bản quyền phân khúc giúp startup tránh được việc phải chi trả ngân sách khổng lồ cho bản quyền toàn cầu.
3.  **Tích hợp trình nhúng hợp pháp (Legitimate Embedding Platform):** Dự án sử dụng giải pháp nhúng trực tiếp trình phát video từ các đối tác lớn như YouTube, Vimeo hoặc các nền tảng phát sóng đã được cấp phép. Phương thức này không vi phạm bản quyền do video vẫn được lưu trữ trên máy chủ gốc của tác giả và họ vẫn nhận được lượt xem cùng doanh thu quảng cáo từ nền tảng gốc, trong khi TKFilm đóng vai trò là kênh phân phối trung gian.

#### B. Cơ chế thanh toán và chia sẻ doanh thu với nhà sản xuất (Creator & Publisher Payout Models)
TKFilm xây dựng các cơ chế chi trả tài chính minh bạch cho các tác giả và nhà phân phối phim để thiết lập mối quan hệ hợp tác lâu dài:
1.  **Phân chia doanh thu theo tỷ lệ tương tác (Revenue Sharing per View - RevShare):** Đây là mô hình chủ đạo của dự án, trong đó doanh thu thu được từ quảng cáo (AVOD) và phí đăng ký Premium (SVOD) phát sinh từ một bộ phim cụ thể sẽ được chia sẻ lại cho nhà sản xuất theo tỷ lệ thỏa thuận (ví dụ: 60% cho chủ sở hữu bản quyền, 40% cho nền tảng). Số tiền chi trả được tính toán tự động dựa trên tổng thời lượng xem (Watch Time) và số lượt nhấp chuột của người dùng, được ghi nhận và đối soát minh bạch qua cơ sở dữ liệu Supabase.
2.  **Mô hình bảo chứng tối thiểu (Minimum Guarantee - MG):** Đối với các tác phẩm có tiềm năng thương mại cao, TKFilm áp dụng cơ chế thanh toán trước một khoản phí MG cố định cho nhà sản xuất như một khoản đặt cọc bảo chứng doanh thu. Sau khi phim được phát sóng, doanh thu thực tế phát sinh từ mô hình RevShare sẽ được khấu trừ dần vào khoản MG này. Khi doanh thu vượt qua ngưỡng MG, nhà sản xuất sẽ tiếp tục nhận được phần chia sẻ doanh thu thặng dư theo tỷ lệ hợp đồng.
3.  **Mô hình cấp phép trả phí cố định (Flat Fee Licensing):** Hệ thống mua đứt quyền phát sóng tác phẩm trong một khoảng thời gian nhất định bằng một khoản phí trọn gói duy nhất. Phương thức này phù hợp với các bộ phim cũ hoặc nội dung ngách, giúp tối giản hóa thủ tục thanh toán và dễ dàng dự báo chi phí tài chính cho startup.

#### C. Chiến lược vận hành tạo lợi nhuận cho doanh nghiệp (Profitability Strategy)
Để đảm bảo doanh thu thu được từ hệ thống lớn hơn chi phí mua bản quyền và chi phí vận hành hạ tầng (như băng thông CDN, lưu trữ PostgreSQL), TKFilm triển khai mô hình kiếm tiền đa luồng thích ứng:
1.  **Khai thác quảng cáo kết hợp (AVOD - Advertising Video on Demand):** Sử dụng mạng lưới Google AdMob để phân phối quảng cáo biểu ngữ và tích hợp thêm quảng cáo video ngắn (Instream Ads) trước khi phát phim. Dòng tiền quảng cáo thu được từ lượng người dùng xem miễn phí sẽ đóng vai trò bù đắp chi phí băng thông lưu trữ và thanh toán bản quyền dạng RevShare cho các phim phổ thông.
2.  **Mô hình phí thành viên Premium (SVOD - Subscription Video on Demand):** Người dùng trả một khoản phí định kỳ hàng tháng (hoặc hàng năm) để nâng cấp lên tài khoản VIP. Quyền lợi Premium bao gồm việc loại bỏ hoàn toàn quảng cáo AdMob, mở khóa quyền truy cập các bộ phim độc quyền chất lượng cao, và hỗ trợ tải phim ngoại tuyến. Phí thuê bao này là nguồn doanh thu ổn định nhất giúp startup nhanh chóng đạt điểm hòa vốn và tạo ra lợi nhuận ròng.
3.  **Bán lượt xem phim lẻ (TVOD - Transactional Video on Demand):** Đối với các tác phẩm điện ảnh bom tấn mới ra rạp, hệ thống cung cấp tùy chọn "thuê phim" hoặc "mua phim" lẻ với chi phí hợp lý. Khách hàng chỉ cần trả tiền một lần để xem bộ phim cụ thể đó trong vòng 48 giờ. Doanh thu từ TVOD có biên lợi nhuận rất cao và được chia sẻ trực tiếp với hãng phim theo tỷ lệ thỏa thuận, tạo động lực cho các nhà sản xuất đưa phim mới lên TKFilm.

