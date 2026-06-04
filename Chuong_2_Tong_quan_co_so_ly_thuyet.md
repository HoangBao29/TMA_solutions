# CHƯƠNG 2. TỔNG QUAN TÀI LIỆU VÀ CƠ SỞ LÝ THUYẾT (LITERATURE REVIEW & BACKGROUND)

## 2.1. Tổng quan lĩnh vực và Thị trường liên quan

### 2.1.1. Xu hướng phát triển của dịch vụ phát trực tuyến và OTT
Trong một thập kỷ qua, thị trường dịch vụ phát trực tuyến Over-The-Top (OTT) đã trải qua sự tăng trưởng bùng nổ, định hình lại toàn bộ nền kinh tế giải trí số toàn cầu. Sự dịch chuyển từ phương thức truyền hình truyền thống sang truyền hình Internet là kết quả của sự phát triển hạ tầng băng thông rộng (4G, 5G, cáp quang) và sự phổ cập của các thiết bị thông minh (Smartphones, Smart TVs, Tablets). Theo các báo cáo từ các tổ chức nghiên cứu thị trường danh tiếng như Grand View Research, quy mô thị trường OTT toàn cầu đạt giá trị hơn 200 tỷ USD và dự kiến sẽ duy trì tốc độ tăng trưởng kép hàng năm (CAGR) trên 14% trong giai đoạn từ nay đến năm 2030.

Tại Việt Nam, xu hướng này diễn ra vô cùng mạnh mẽ với sự gia nhập của các dịch vụ quốc tế (Netflix, Apple TV+) và sự đầu tư bài bản từ các doanh nghiệp công nghệ, truyền thông trong nước. Sự chuyển dịch này tạo ra một lượng dữ liệu tương tác khổng lồ (Big Data) bao gồm lịch sử xem phim, lượt đánh giá (ratings), lượt nhấp chuột (clicks), hành vi tìm kiếm và thời lượng dừng chân của người dùng tại mỗi nội dung. Khai phá nguồn dữ liệu này để thấu hiểu người dùng chính là chìa khóa tạo nên lợi thế cạnh tranh của các doanh nghiệp trong kỷ nguyên số.

### 2.1.2. Nhu cầu cá nhân hóa trải nghiệm người dùng
Sở thích điện ảnh của mỗi cá nhân là vô cùng đa dạng và thường xuyên thay đổi theo thời gian, ngữ cảnh hoặc thậm chí là tâm trạng. Việc phục vụ một danh mục phim tĩnh hoặc chỉ dựa vào các bộ phim đang thịnh hành (Popularity-based) không còn đủ để thỏa mãn người tiêu dùng. Người dùng hiện nay yêu cầu các đề xuất mang tính cá nhân hóa sâu sắc (Hyper-Personalization). Cá nhân hóa không chỉ dừng lại ở việc gợi ý những bộ phim cùng thể loại mà còn phải thấu hiểu hành vi ngầm định, dự đoán các mối quan tâm tiềm ẩn và hiển thị đề xuất theo thời gian thực (Real-time). Việc xây dựng hệ gợi ý hiệu quả đóng vai trò quyết định trong việc giải quyết bài toán giữ chân khách hàng (Customer Retention) và tối ưu hóa thời gian trải nghiệm dịch vụ của họ.

---

## 2.2. Khảo sát sản phẩm tương tự và Phân tích chiến lược

### 2.2.1. Khảo sát và so sánh các sản phẩm/hệ thống liên quan
Để định vị giải pháp **TKFilm**, việc tiến hành khảo sát và phân tích các hệ thống xem phim và gợi ý phim hiện hành là vô cùng cần thiết. Dưới đây là bảng so sánh chi tiết giữa TKFilm và ba sản phẩm đại diện tiêu biểu trên thị trường hiện nay: **Netflix** (Dịch vụ OTT hàng đầu thế giới), **Letterboxd** (Mạng xã hội điện ảnh) và **VieON/FPT Play** (Các OTT nội địa tại Việt Nam).

| Tiêu chí so sánh | Netflix | Letterboxd | VieON / FPT Play | TKFilm (Đề xuất) |
| :--- | :--- | :--- | :--- | :--- |
| **Mục tiêu cốt lõi** | Phát video trực tuyến & Cá nhân hóa danh mục nội dung. | Mạng xã hội để ghi chép (log), đánh giá và thảo luận phim. | Phát trực tuyến nội dung bản quyền và truyền hình số. | Trải nghiệm thông tin phim, tích hợp thuật toán gợi ý AI thông minh thời gian thực. |
| **Thuật toán gợi ý chính** | Học sâu phức tạp (Deep Learning), Học máy tăng cường (Reinforcement Learning), Khám phá hành vi ngầm. | Gợi ý thủ công từ danh sách của người dùng khác (user-curated lists), thiếu tính tự động từ AI. | Gợi ý dựa trên độ phổ biến, quy tắc đơn giản (Rules-based) hoặc cộng tác truyền thống. | **Attention Autoencoder (RSAttAE)** kết hợp **XGBoost**, giải quyết bài toán khởi đầu lạnh bằng Hybrid/Content-based. |
| **Khả năng giải quyết Cold-Start** | Rất tốt (Yêu cầu chọn thể loại và phim yêu thích khi đăng ký). | Kém (Người dùng phải tự tìm kiếm nội dung hoặc theo dõi người khác). | Trung bình (Chủ yếu hiển thị phim thịnh hành, phim mới phát hành). | **Tốt** (Luồng Onboarding thông minh yêu cầu đánh giá nhanh một số phim tiêu biểu để tạo vector nhúng tức thời). |
| **Mức độ cá nhân hóa** | Cực kỳ cao (Cá nhân hóa từ danh sách phim đến cả ảnh đại diện - Artwork). | Thấp (Chủ yếu dựa vào bộ lọc cộng đồng). | Trung bình (Chưa tối ưu hóa theo hành vi tương tác thời gian thực). | **Cao** (Vector sở thích tự động cập nhật ngay khi người dùng đánh giá phim và thay đổi danh sách đề xuất tức thì). |
| **Chi phí vận hành và bản quyền** | Rất cao (Đầu tư hàng tỷ USD cho băng thông và nội dung tự sản xuất). | Thấp (Chỉ lưu trữ metadata phim, không chứa video phim). | Rất cao (Chi phí mua bản quyền phát sóng phim truyền hình và thể thao). | **Thấp** (Tận dụng metadata từ TMDb, trailers từ YouTube, tối ưu hóa lưu trữ đám mây qua Supabase). |

### 2.2.2. Phân tích chiến lược phát triển hệ thống qua ma trận SWOT
Phân tích SWOT giúp xác định rõ các yếu tố bên trong và bên ngoài tác động trực tiếp đến khả năng xây dựng và vận hành hệ thống **TKFilm**:

*   **Điểm mạnh (Strengths - S):**
    *   Sở hữu thuật toán gợi ý tiên tiến **Attention Autoencoder (RSAttAE)** có khả năng học các mối quan hệ phi tuyến tính phức tạp và tận dụng hiệu quả thông tin phụ (Side Information) của cả người dùng lẫn phim.
    *   Kiến trúc Client-Server phân tách rõ ràng giúp hệ thống vận hành mượt mà, độ trễ suy luận AI cực thấp (<100ms).
    *   Giao diện ứng dụng di động hiện đại (React Native, Glassmorphism, Dark Theme) mang lại trải nghiệm người dùng cao cấp vượt trội so với các đồ án thông thường.
    *   Tích hợp dịch vụ đám mây Supabase giúp giảm tải việc quản trị hạ tầng, nâng cao tính bảo mật (RLS) và đồng bộ hóa thời gian thực dữ liệu.
*   **Điểm yếu (Weaknesses - W):**
    *   Dữ liệu huấn luyện mô hình AI gốc bị giới hạn bởi tập dữ liệu học thuật MovieLens 100K.
    *   Hệ thống chưa hỗ trợ trình phát video phát trực tiếp đầy đủ (chỉ hỗ trợ phát trailer qua YouTube) do hạn chế về bản quyền và băng thông lưu trữ.
    *   Nguồn nhân lực phát triển và vận hành mỏng (chủ yếu thực hiện bởi nhóm tác giả đồ án).
*   **Cơ hội (Opportunities - O):**
    *   Nhu cầu trải nghiệm giải trí số cá nhân hóa của người dùng di động ngày càng tăng cao.
    *   Thị trường các nền tảng xem phim trực tuyến vừa và nhỏ ở Việt Nam đang thiếu các giải pháp gợi ý AI giá thành hợp lý, mở ra cơ hội kinh doanh dạng SaaS (RaaS).
    *   Sự phát triển mạnh mẽ của các thư viện mã nguồn mở về AI giúp việc cập nhật và cải tiến mô hình học sâu trở nên thuận tiện hơn.
*   **Thách thức (Threats - T):**
    *   Các ông lớn công nghệ như Netflix, YouTube có tiềm lực tài chính khổng lồ và thuật toán gợi ý đã được tối ưu hóa qua hàng chục năm.
    *   Vấn đề bảo mật thông tin và quyền riêng tư dữ liệu cá nhân của người dùng ngày càng bị thắt chặt về mặt pháp lý.
    *   Sự thay đổi liên tục trong thói quen và xu hướng giải trí đòi hỏi mô hình phải được cập nhật (retrain) thường xuyên để tránh hiện tượng suy giảm hiệu năng theo thời gian (Model Drift).

---

## 2.3. Xác định yêu cầu hệ thống (System Requirements)

Hệ thống được thiết kế nhằm phục vụ đồng thời hai đối tượng: Người xem phim (End-User) và Quản trị viên (Administrator). Các yêu cầu được phân tích thành yêu cầu chức năng và yêu cầu phi chức năng.

### 2.3.1. Yêu cầu chức năng (Functional Requirements - FR)

#### A. Đối với phân hệ Người xem phim (End-User App)
1.  **Đăng ký/Đăng nhập và Xác thực:**
    *   Người dùng đăng ký tài khoản mới bằng Email và Mật khẩu.
    *   Đăng nhập hệ thống bảo mật qua dịch vụ xác thực của Supabase.
2.  **Khởi tạo sở thích ban đầu (Onboarding Flow):**
    *   Yêu cầu người dùng mới đánh giá (rating từ 1 đến 5 sao) tối thiểu 5 bộ phim tiêu biểu trong danh sách gợi ý khởi động để hệ thống xây dựng vector sở thích ban đầu, giải quyết bài toán Khởi đầu lạnh (Cold-Start).
3.  **Xem phim và duyệt thông tin chi tiết:**
    *   Duyệt danh mục phim theo thể loại, năm phát hành.
    *   Xem trang thông tin chi tiết của phim bao gồm: tên phim, ảnh poster chất lượng cao, thể loại, ngày phát hành, nội dung tóm tắt (sử dụng dữ liệu cập nhật từ TMDb).
    *   Xem trực tiếp trailer chính thức của phim thông qua trình phát YouTube tích hợp.
4.  **Hệ thống gợi ý cá nhân hóa (Recommendation):**
    *   Trang chủ hiển thị danh sách phim được đề xuất riêng biệt cho từng người dùng sử dụng thuật toán RSAttAE dựa trên lịch sử tương tác thời gian thực.
    *   Gợi ý các bộ phim tương tự (Similar Movies) khi người dùng đang xem trang chi tiết của một bộ phim cụ thể (sử dụng Content-based / Item Embedding Similarity).
5.  **Tương tác và Đánh giá:**
    *   Đánh giá điểm số (từ 1 đến 5 sao) cho các bộ phim đã xem. Điểm số đánh giá này sẽ được lưu lập tức vào cơ sở dữ liệu và gửi tín hiệu về Backend AI để tính lại vector người dùng thời gian thực.
    *   Viết bình luận, phản hồi dưới trang chi tiết phim.
6.  **Lịch sử xem phim (Watch History) và Tìm kiếm:**
    *   Lưu trữ lịch sử các bộ phim người dùng đã nhấp vào xem thông tin hoặc trailer.
    *   Tìm kiếm phim theo từ khóa tiêu đề hoặc bộ lọc thể loại.

#### B. Đối với phân hệ Quản trị viên (Administrator Interface)
1.  **Quản lý danh mục phim:**
    *   Xem danh sách toàn bộ các bộ phim đang có trong hệ thống dữ liệu.
    *   Thêm mới thông tin phim vào hệ thống lưu trữ của Supabase.
2.  **Kiểm soát hiển thị (Hide/Unhide Movies):**
    *   Thực hiện ẩn (hide) các bộ phim lỗi thông tin hoặc vi phạm chính sách bản quyền khỏi giao diện của người dùng cuối mà không cần xóa vật lý trong database (soft delete).
    *   Khôi phục hiển thị (unhide) phim khi thông tin đã được chuẩn hóa.
3.  **Quản lý người dùng:**
    *   Xem danh sách các tài khoản người dùng đã đăng ký.
    *   Khóa (ban) hoặc mở khóa các tài khoản người dùng vi phạm quy chế cộng đồng.

### 2.3.2. Yêu cầu phi chức năng (Non-Functional Requirements - NFR)
1.  **Hiệu năng và Tốc độ phản hồi (Performance & Latency):**
    *   Thời gian suy luận (Inference time) của thuật toán gợi ý tại Backend AI phải nhỏ hơn 100ms cho mỗi lượt truy vấn danh sách đề xuất.
    *   Thời gian tải trang và hiển thị thông tin phim trên thiết bị di động không vượt quá 2 giây dưới điều kiện mạng thông thường.
2.  **Độ chính xác gợi ý (Recommendation Accuracy):**
    *   Đảm bảo các chỉ số đo lường chất lượng hệ gợi ý đạt ngưỡng khoa học chấp nhận được trên tập thử nghiệm MovieLens 100K: Precision@10 đạt trên 0.20, Recall@10 đạt trên 0.15 và NDCG@10 đạt trên 0.22.
3.  **Tính bảo mật và An toàn thông tin (Security):**
    *   Mật khẩu người dùng phải được mã hóa một chiều trước khi lưu trữ.
    *   Áp dụng chính sách bảo mật cấp hàng (Row Level Security - RLS) trên cơ sở dữ liệu Supabase, đảm bảo người dùng này không thể chỉnh sửa, ghi đè lịch sử xem hoặc điểm đánh giá của người dùng khác.
4.  **Độ tin cậy và Tính sẵn sàng (Availability):**
    *   Hệ thống cơ sở dữ liệu đám mây Supabase đảm bảo hoạt động liên tục với cam kết thời gian hoạt động (Uptime) đạt 99.9%.
    *   Backend Flask có cơ chế ghi nhật ký lỗi (logging) chi tiết để hỗ trợ việc khắc phục sự cố nhanh chóng.
5.  **Khả năng mở rộng (Scalability):**
    *   Thiết kế cơ sở dữ liệu và API RESTful hỗ trợ tốt khả năng mở rộng số lượng người dùng đồng thời (Concurrent Users) lên tới hàng nghìn tài khoản mà không làm nghẽn hệ thống.

---

## 2.4. Cơ sở lý thuyết nền tảng (Theoretical Background)

### 2.4.1. Tổng quan về Hệ gợi ý (Recommendation Systems)
Hệ gợi ý (Recommendation System - RS) là một phân ngành của Trí tuệ Nhân tạo và Khai phá dữ liệu, có chức năng dự đoán mức độ quan tâm hoặc điểm đánh giá mà một người dùng sẽ dành cho một sản phẩm nào đó, từ đó đề xuất các sản phẩm phù hợp nhất. Về mặt toán học, bài toán gợi ý được phát biểu dưới dạng ước lượng các giá trị còn trống trong ma trận tương tác Người dùng - Sản phẩm (User-Item Interaction Matrix).

Gọi $U = \{u_1, u_2, ..., u_M\}$ là tập hợp gồm $M$ người dùng, và $I = \{i_1, i_2, ..., i_N\}$ là tập hợp gồm $N$ sản phẩm (trong đồ án này là các bộ phim). Ma trận tương tác người dùng - sản phẩm được ký hiệu là $R \in \mathbb{R}^{M \times N}$, trong đó mỗi phần tử $R_{u, i}$ thể hiện mức độ tương tác (như điểm số rating hoặc hành vi ngầm định click/view) của người dùng $u$ đối với sản phẩm $i$. Do một người dùng thông thường chỉ tương tác với một lượng rất nhỏ sản phẩm trong hệ thống, hầu hết các phần tử của ma trận $R$ đều chưa có giá trị (unknown). Mục tiêu của hệ gợi ý là xây dựng một hàm dự đoán $f$:
$$\hat{R}_{u, i} = f(u, i | \Theta)$$
sao cho $\hat{R}_{u, i}$ xấp xỉ gần nhất với giá trị thực tế nếu người dùng $u$ tương tác với sản phẩm $i$, với $\Theta$ là tập hợp các tham số tối ưu của mô hình gợi ý.

### 2.4.2. Kỹ thuật lọc cộng tác truyền thống và các công thức tính độ tương đồng
Lọc cộng tác (Collaborative Filtering - CF) dựa trên giả thuyết cơ bản rằng: nếu các người dùng có chung hành vi hoặc đánh giá tương tự nhau trong quá khứ, họ sẽ có xu hướng đồng thuận ý kiến đối với các sản phẩm mới trong tương lai. Kỹ thuật này được chia làm hai hướng tiếp cận chính:

#### A. Lọc cộng tác dựa trên lân cận (Neighborhood-based CF)
*   **Lọc cộng tác dựa trên người dùng (User-based CF):** Tìm kiếm các người dùng có sở thích tương tự với người dùng mục tiêu $u$. Điểm số dự đoán cho sản phẩm $i$ được tính bằng trung bình cộng có trọng số từ điểm đánh giá của các người dùng lân cận:
    $$\hat{R}_{u, i} = \bar{R}_u + \frac{\sum_{v \in S(u)} Sim(u, v) \cdot (R_{v, i} - \bar{R}_v)}{\sum_{v \in S(u)} |Sim(u, v)|}$$
    Trong đó, $\bar{R}_u$ và $\bar{R}_v$ lần lượt là điểm đánh giá trung bình của người dùng $u$ và $v$; $S(u)$ là tập hợp các người dùng lân cận có độ tương đồng cao nhất với $u$; $Sim(u, v)$ là hàm đo lường độ tương đồng giữa hai người dùng.
*   **Lọc cộng tác dựa trên sản phẩm (Item-based CF):** Thay vì tìm người dùng tương đồng, phương pháp này tính toán độ tương đồng giữa các sản phẩm dựa trên cách mà chúng được đánh giá bởi những người dùng chung. Điểm số dự đoán được tính bằng:
    $$\hat{R}_{u, i} = \frac{\sum_{j \in S(i)} Sim(i, j) \cdot R_{u, j}}{\sum_{j \in S(i)} |Sim(i, j)|}$$

#### B. Các công thức đo lường độ tương đồng (Similarity Metrics)
Độ tương đồng giữa hai vector (người dùng hoặc phim) thường được tính toán qua hai công thức chính:
1.  **Độ tương đồng Cosine (Cosine Similarity):**
    $$Sim(\mathbf{x}, \mathbf{y}) = \cos(\theta) = \frac{\mathbf{x} \cdot \mathbf{y}}{\|\mathbf{x}\| \|\mathbf{y}\|} = \frac{\sum_{k} x_k y_k}{\sqrt{\sum_{k} x_k^2} \sqrt{\sum_{k} y_k^2}}$$
    Độ tương đồng Cosine đo góc giữa hai vector trong không gian đa chiều mà không phụ thuộc vào độ dài vật lý của chúng, rất phù hợp cho việc đo độ tương đồng giữa các vector nhúng (embeddings) được chuẩn hóa.
2.  **Hệ số tương quan Pearson (Pearson Correlation Coefficient):**
    $$Sim(\mathbf{x}, \mathbf{y}) = \frac{\sum_{k} (x_k - \bar{x})(y_k - \bar{y})}{\sqrt{\sum_{k} (x_k - \bar{x})^2} \sqrt{\sum_{k} (y_k - \bar{y})^2}}$$
    Hệ số Pearson khắc phục được nhược điểm của Cosine khi người dùng có xu hướng đánh giá khắt khe (luôn cho điểm thấp) hoặc dễ tính (luôn cho điểm cao) bằng cách trừ đi điểm đánh giá trung bình $\bar{x}, \bar{y}$.

### 2.4.3. Mạng tự mã hóa Autoencoder (AE)
Autoencoder là một dạng mạng nơ-ron truyền thẳng không giám sát (Unsupervised Neural Network), được thiết kế để học cách biểu diễn dữ liệu đầu vào dưới dạng nén hiệu quả, sau đó tái cấu trúc lại dữ liệu ở đầu ra gần giống nhất với dữ liệu đầu vào ban đầu. Một mạng Autoencoder chuẩn bao gồm hai thành phần chính:

```
          Đầu vào X              Không gian ẩn Z              Đầu ra X̂
     [ x₁ , x₂ , ... , xₙ ]  -->  [ z₁ , ... , z_d ]  -->  [ x̂₁ , x̂₂ , ... , x̂ₙ ]
              |                        |                        |
              +-------- Encoder -------+-------- Decoder -------+
                       W_e, b_e                 W_d, b_d
```

1.  **Bộ mã hóa (Encoder):** Ánh xạ dữ liệu đầu vào $\mathbf{x} \in \mathbb{R}^n$ sang không gian ẩn (Latent Space) có số chiều thấp hơn $d \ll n$ để tạo ra vector ẩn $\mathbf{z} \in \mathbb{R}^d$:
    $$\mathbf{z} = g(\mathbf{W}_e \mathbf{x} + \mathbf{b}_e)$$
    Trong đó, $\mathbf{W}_e \in \mathbb{R}^{d \times n}$ là ma trận trọng số của bộ mã hóa, $\mathbf{b}_e \in \mathbb{R}^d$ là vector độ chệch (bias), và $g(\cdot)$ là hàm kích hoạt phi tuyến (như Sigmoid, ReLU, hoặc LeakyReLU).
2.  **Bộ giải mã (Decoder):** Ánh xạ vector ẩn $\mathbf{z}$ từ không gian ẩn quay trở lại không gian dữ liệu ban đầu để tạo ra đầu ra tái cấu trúc $\hat{\mathbf{x}} \in \mathbb{R}^n$:
    $$\hat{\mathbf{x}} = h(\mathbf{W}_d \mathbf{z} + \mathbf{b}_d)$$
    Trong đó, $\mathbf{W}_d \in \mathbb{R}^{n \times d}$ là ma trận trọng số của bộ giải mã, $\mathbf{b}_d \in \mathbb{R}^n$ là vector độ chệch của bộ giải mã, và $h(\cdot)$ là hàm kích hoạt đầu ra.

Hàm mất mát (Loss Function) của mạng Autoencoder thường được định nghĩa bằng Sai số bình phương trung bình (Mean Squared Error - MSE) để giảm thiểu khoảng cách giữa $\mathbf{x}$ và $\hat{\mathbf{x}}$:
$$\mathcal{L}_{MSE}(\mathbf{W}, \mathbf{b}) = \frac{1}{2} \sum_{k=1}^{n} (x_k - \hat{x}_k)^2$$

Trong hệ gợi ý lọc cộng tác (ví dụ như thuật toán AutoRec), đầu vào $\mathbf{x}$ chính là một hàng (vector rating của một user) hoặc một cột (vector rating của một phim) trong ma trận tương tác $R$. Bộ giải mã của Autoencoder sẽ dự đoán các giá trị rating tại các vị trí chưa được đánh giá trong vector đầu vào thưa thớt.

### 2.4.4. Cơ chế chú ý (Attention Mechanism)
Cơ chế chú ý ban đầu được đề xuất trong lĩnh vực Dịch máy (Neural Machine Translation) và sau đó được chuẩn hóa trong kiến trúc Transformer. Bản chất của cơ chế chú ý là cho phép mạng nơ-ron tập trung vào các phần thông tin quan trọng nhất của dữ liệu đầu vào tùy thuộc vào ngữ cảnh hiện tại, thay vì ép mạng phải ghi nhớ toàn bộ thông tin với vai trò ngang nhau.

Mô hình Attention tổng quát nhận vào ba thành phần: **Query** (Truy vấn $\mathbf{Q}$), **Keys** (Khóa $\mathbf{K}$), và **Values** (Giá trị $\mathbf{V}$). Đầu ra của cơ chế chú ý là tổng có trọng số của các giá trị trong $\mathbf{V}$, trong đó trọng số gán cho mỗi giá trị được tính toán bằng một hàm tương tác (Compatibility Function) giữa truy vấn $\mathbf{Q}$ và khóa tương ứng $\mathbf{K}$:
$$\text{Attention}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \text{Softmax}\left(\frac{\mathbf{Q} \mathbf{K}^T}{\sqrt{d_k}}\right) \mathbf{V}$$
Trong đó, $d_k$ là số chiều của vector khóa (hệ số $\sqrt{d_k}$ đóng vai trò tỷ lệ hóa giúp ổn định gradient trong quá trình tính toán Softmax). Trong hệ gợi ý tích hợp thông tin phụ, cơ chế chú ý giúp mô hình tự động nhận diện thuộc tính nào của phim (ví dụ: thể loại "Hành động" hay năm sản xuất "Mới nhất") hoặc thuộc tính nào của người dùng (ví dụ: nghề nghiệp "Sinh viên" hay giới tính) đóng góp nhiều nhất vào hành vi đánh giá phim hiện tại, từ đó tinh chỉnh vector biểu diễn ẩn $\mathbf{z}$ một cách chính xác hơn.

### 2.4.5. Kiến trúc mô hình Attention Autoencoder tích hợp thông tin phụ (RSAttAE)
Mô hình **RSAttAE (Information-Aware Attention Autoencoder)** của dự án **TKFilm** kết hợp cả hai công nghệ Autoencoder và Cơ chế chú ý để tối ưu hóa không gian nhúng của người dùng và phim thông qua việc tích hợp thông tin phụ (Side Information). 

```
                                  +-----------------------+
                                  |   Side Information    |
                                  |  (User/Movie Features)|
                                  +-----------------------+
                                              |
                                              v
Input Rating Vector X --> Encoder --> Encoded Latent Representation (E)
                                              |
                                              v
                                   [ Attention Layer ] 
                                  Học trọng số Attention
                                 dựa trên Side Info (A_w)
                                              |
                                              v
                               Attended Vector = A_w * E
                                              |
                                              v
                              Final Latent Z = α*Attended + (1-α)*E
                                              |
                                              v
                                           Decoder 
                                              |
                                              v
                                    Reconstructed Rating X̂
```

Kiến trúc chi tiết của mô hình được mô tả qua các bước toán học sau:

#### Bước 1: Mã hóa sơ bộ (Feature Encoding)
Vector ratings đầu vào $\mathbf{x}$ (cho user hoặc phim) trước hết được đưa qua một lớp loại bỏ nơ-ron ngẫu nhiên (Dropout) với tỷ lệ $0.5$ để tránh hiện tượng quá khớp (overfitting) do dữ liệu quá thưa thớt. Sau đó, vector được chiếu vào không gian ẩn thông qua lớp Encoder thứ nhất để thu được vector biểu diễn ẩn sơ bộ $\mathbf{e}$:
$$\mathbf{e} = \text{LeakyReLU}(\mathbf{W}_e \cdot \text{Dropout}(\mathbf{x}) + \mathbf{b}_e)$$
Với $\mathbf{W}_e \in \mathbb{R}^{d \times n}$ và $d = 64$ là chiều ẩn của vector nhúng.

#### Bước 2: Tích hợp thông tin phụ qua cơ chế chú ý (Information-Aware Attention)
Gọi $\mathbf{s}$ là vector đặc trưng thông tin phụ đi kèm (đối với phim, $\mathbf{s} \in \mathbb{R}^{23}$ gồm 19 thể loại và 4 nhóm năm phát hành; đối với người dùng, $\mathbf{s}$ chứa thông tin tuổi, giới tính, nghề nghiệp). 
1.  Đầu tiên, thông tin phụ $\mathbf{s}$ được chiếu qua một lớp tuyến tính để tạo ra không gian ẩn thông tin phụ $\mathbf{h}_s \in \mathbb{R}^d$:
    $$\mathbf{h}_s = \mathbf{W}_s \mathbf{s} + \mathbf{b}_s$$
2.  Trọng số chú ý $\mathbf{a}_w \in \mathbb{R}^d$ được tính toán bằng cách áp dụng hàm kích hoạt Softmax lên vector đặc trưng thông tin phụ để phân phối độ tập trung vào từng chiều trong số 64 chiều đặc trưng ẩn:
    $$\mathbf{a}_w = \text{Softmax}(\mathbf{h}_s)$$
3.  Vector đặc trưng ẩn sau khi áp dụng cơ chế chú ý (Attended Representation) $\mathbf{e}_{att}$ được tính bằng tích Hadamard (element-wise product) giữa trọng số chú ý $\mathbf{a}_w$ và vector biểu diễn ẩn sơ bộ $\mathbf{e}$:
    $$\mathbf{e}_{att} = \mathbf{a}_w \odot \mathbf{e}$$

#### Bước 3: Tổ hợp và Chuẩn hóa (Skip-Connection & Layer Normalization)
Để giữ lại các thông tin tương tác cộng tác gốc và tránh hiện tượng triệt tiêu gradient, một kết nối tắt (Skip-Connection) kết hợp với hệ số pha trộn $\alpha \in [0, 1]$ được áp dụng để tạo ra vector ẩn cuối cùng $\mathbf{z}$:
$$\mathbf{z}_{pre} = \alpha \mathbf{e}_{att} + (1 - \alpha) \mathbf{e}$$
Sau đó, để ổn định quá trình huấn luyện và đồng bộ biên độ của vector nhúng, lớp Layer Normalization được áp dụng:
$$\mathbf{z} = \text{LayerNorm}(\mathbf{z}_{pre})$$
Vector $\mathbf{z} \in \mathbb{R}^{64}$ chính là vector nhúng (embedding) đại diện cuối cùng của thực thể trong không gian latent space 64 chiều.

#### Bước 4: Giải mã và tái cấu trúc (Decoding)
Vector nhúng ẩn $\mathbf{z}$ được đưa qua bộ giải mã để tái cấu trúc lại vector rating ban đầu $\hat{\mathbf{x}} \in \mathbb{R}^n$:
$$\hat{\mathbf{x}} = \text{LeakyReLU}(\mathbf{W}_d \mathbf{z} + \mathbf{b}_d)$$

#### Hàm mất mát huấn luyện (Training Loss Function)
Quá trình huấn luyện sử dụng hàm tổn hao lỗi bình phương trung bình có hiệu chỉnh (Masked MSE Loss) chỉ tính toán trên các phần tử thực sự đã có điểm rating trong ma trận huấn luyện nhằm tránh việc kéo điểm số dự đoán về 0:
$$\mathcal{L} = \frac{1}{|\mathcal{K}|} \sum_{(u, i) \in \mathcal{K}} (R_{u, i} - \hat{R}_{u, i})^2 + \lambda (\|\mathbf{W}_e\|_F^2 + \|\mathbf{W}_d\|_F^2)$$
Trong đó, $\mathcal{K}$ là tập hợp các cặp (người dùng, phim) đã có rating thực tế trong tập train, và $\lambda$ là tham số điều trị quá khớp (L2 Regularization).

### 2.4.6. Mô hình phân loại XGBoost áp dụng trong gợi ý
Bên cạnh mô hình Attention Autoencoder dùng để sinh vector nhúng và tính toán độ tương đồng Cosine, hệ thống **TKFilm** còn tích hợp mô hình **XGBoost (Extreme Gradient Boosting)** làm bộ gợi ý nâng cao.

XGBoost là một thuật toán học máy mạnh mẽ dựa trên kiến trúc Cây quyết định tăng cường độ dốc (Gradient Boosted Decision Trees - GBDT). Trong bài toán hệ gợi ý của TKFilm, mô hình XGBoost được huấn luyện đóng vai trò như một bộ phân loại/xếp hạng (Ranking Model). Đầu vào của XGBoost là sự kết hợp của nhiều nhóm đặc trưng:
*   Vector nhúng ẩn của người dùng $\mathbf{z}_u \in \mathbb{R}^{64}$ thu được từ User Autoencoder.
*   Vector nhúng ẩn của bộ phim $\mathbf{z}_i \in \mathbb{R}^{64}$ thu được từ Movie Autoencoder.
*   Các đặc trưng tương tác trực tiếp (điểm tương đồng Cosine giữa $\mathbf{z}_u$ và $\mathbf{z}_i$).
*   Các đặc trưng nội dung (thể loại phim, năm phát hành).

Hàm mục tiêu của mô hình xếp hạng XGBoost là tối ưu hóa điểm số dự đoán khả năng người dùng yêu thích bộ phim thông qua việc tối thiểu hóa hàm mất mát lỗi bình phương:
$$\mathcal{L}^{(t)} = \sum_{k=1}^{K} l\left(y_k, \hat{y}_k^{(t-1)} + f_t(\mathbf{x}_k)\right) + \Omega(f_t)$$
Trong đó, $f_t(\mathbf{x}_k)$ là cấu trúc cây quyết định được thêm vào ở bước thứ $t$, và $\Omega(f_t)$ là thành phần phạt độ phức tạp của cây để chống overfitting. Việc kết hợp XGBoost giúp hệ thống TKFilm tận dụng được sức mạnh của cả hai hướng tiếp cận: khả năng học biểu diễn tự động của Học Sâu (Deep Learning) và khả năng phân loại, tối ưu hóa cấu trúc bảng cực kỳ mạnh mẽ của Học Máy truyền thống (Machine Learning).

### 2.4.7. Các công nghệ cốt lõi triển khai hệ thống
*   **React Native & Expo:** React Native sử dụng Bridge (hoặc kiến trúc JSI mới) để ánh xạ các thành phần giao diện viết bằng Javascript/Typescript thành các thành phần giao diện gốc (Native UI components) trên thiết bị di động. Expo đóng vai trò là một bộ công cụ và SDK bao bọc xung quanh React Native, cung cấp các thư viện truy cập phần cứng và cơ chế cập nhật ứng dụng tức thì qua mạng (Over-The-Air - OTA).
*   **Flask (Python API):** Flask hoạt động theo kiến trúc WSGI (Web Server Gateway Interface), chịu trách nhiệm lắng nghe và định tuyến các yêu cầu HTTP. Nó tích hợp thư viện PyTorch bằng cách tải sẵn các mô hình mạng nơ-ron dạng tĩnh vào bộ nhớ RAM khi khởi động máy chủ, cho phép các hàm API truy cập và thực hiện suy luận (Inference) song song thời gian thực với độ trễ tối thiểu.
*   **Supabase & PostgreSQL:** PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, hỗ trợ các truy vấn phức tạp và tính toàn vẹn dữ liệu thông qua ràng buộc khóa ngoại. Supabase cung cấp một lớp API RESTful tự động sinh ra từ cấu trúc bảng PostgreSQL và hỗ trợ cơ chế Websocket để đồng bộ hóa dữ liệu thời gian thực (Realtime database sync) giữa Cloud và Client App, đồng thời tích hợp cơ chế bảo mật xác thực JSON Web Token (JWT) thông qua Row Level Security (RLS).
