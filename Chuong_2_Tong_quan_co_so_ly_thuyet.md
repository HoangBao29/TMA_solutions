# CHƯƠNG 2. TỔNG QUAN TÀI LIỆU VÀ CƠ SỞ LÝ THUYẾT (LITERATURE REVIEW & BACKGROUND)

## 2.1. Tổng quan lĩnh vực và Thị trường liên quan

### 2.1.1. Xu hướng phát triển của dịch vụ phát trực tuyến và OTT
Trong một thập kỷ qua, thị trường dịch vụ phát trực tuyến Over-The-Top (OTT) đã trải qua sự tăng trưởng bùng nổ, định hình lại toàn bộ nền kinh tế giải trí số toàn cầu. Sự dịch chuyển từ phương thức truyền hình truyền thống sang truyền hình Internet là kết quả của sự phát triển hạ tầng băng thông rộng (4G, 5G, cáp quang) và sự phổ cập của các thiết bị thông minh (Smartphones, Smart TVs, Tablets). Theo các báo cáo từ các tổ chức nghiên cứu thị trường danh tiếng như Grand View Research [19], quy mô thị trường OTT toàn cầu đạt giá trị hơn 200 tỷ USD và dự kiến sẽ duy trì tốc độ tăng trưởng kép hàng năm (CAGR) trên 14% trong giai đoạn từ nay đến năm 2030.

Tại Việt Nam, xu hướng này diễn ra vô cùng mạnh mẽ với sự gia nhập của các dịch vụ quốc tế (Netflix, Apple TV+) và sự đầu tư bài bản từ các doanh nghiệp công nghệ, truyền thông trong nước. Sự chuyển dịch này tạo ra một lượng dữ liệu tương tác khổng lồ (Big Data) bao gồm lịch sử xem phim, lượt đánh giá (ratings), lượt nhấp chuột (clicks), hành vi tìm kiếm và thời lượng dừng chân của người dùng tại mỗi nội dung. Khai phá nguồn dữ liệu này để thấu hiểu người dùng chính là chìa khóa tạo nên lợi thế cạnh tranh của các doanh nghiệp trong kỷ nguyên số.

### 2.1.2. Nhu cầu cá nhân hóa trải nghiệm người dùng
Sở thích điện ảnh của mỗi cá nhân là vô cùng đa dạng và thường xuyên thay đổi theo thời gian, ngữ cảnh hoặc thậm chí là tâm trạng. Việc phục vụ một danh mục phim tĩnh hoặc chỉ dựa vào các bộ phim đang thịnh hành (Popularity-based) không còn đủ để thỏa mãn người tiêu dùng. Người dùng hiện nay yêu cầu các đề xuất mang tính cá nhân hóa sâu sắc (Hyper-Personalization). Cá nhân hóa không chỉ dừng lại ở việc gợi ý những bộ phim cùng thể loại mà còn phải thấu hiểu hành vi ngầm định, dự đoán các mối quan tâm tiềm ẩn và hiển thị đề xuất theo thời gian thực (Real-time). Việc xây dựng hệ gợi ý hiệu quả đóng vai trò quyết định trong việc giải quyết bài toán giữ chân khách hàng (Customer Retention) và tối ưu hóa thời gian trải nghiệm dịch vụ của họ [23].

---

## 2.2. Khảo sát sản phẩm tương tự và Phân tích chiến lược

### 2.2.1. Khảo sát và so sánh các sản phẩm/hệ thống liên quan
Để định vị giải pháp **TKFilm**, việc tiến hành khảo sát và phân tích các hệ thống xem phim và gợi ý phim hiện hành là vô cùng cần thiết [2], [10]. Dưới đây là bảng so sánh chi tiết giữa TKFilm và ba sản phẩm đại diện tiêu biểu trên thị trường hiện nay: **Netflix** (Dịch vụ OTT hàng đầu thế giới), **Letterboxd** (Mạng xã hội điện ảnh) và **VieON/FPT Play** (Các OTT nội địa tại Việt Nam).

| Tiêu chí so sánh | Netflix | Letterboxd | VieON / FPT Play | TKFilm (Đề xuất) |
| :--- | :--- | :--- | :--- | :--- |
| **Mục tiêu cốt lõi** | Phát video trực tuyến & Cá nhân hóa danh mục nội dung. | Mạng xã hội để ghi chép (log), đánh giá và thảo luận phim. | Phát trực tuyến nội dung bản quyền và truyền hình số. | Trải nghiệm thông tin phim, tích hợp thuật toán gợi ý AI thông minh thời gian thực. |
| **Thuật toán gợi ý chính** | Học sâu phức tạp (Deep Learning), Học máy tăng cường (Reinforcement Learning), Khám phá hành vi ngầm. | Gợi ý thủ công từ danh sách của người dùng khác (user-curated lists), thiếu tính tự động từ AI. | Gợi ý dựa trên độ phổ biến, quy tắc đơn giản (Rules-based) hoặc cộng tác truyền thống. | **Attention Autoencoder (RSAttAE)** kết hợp **XGBoost**, giải quyết bài toán khởi đầu lạnh bằng Hybrid/Content-based. |
| **Khả năng giải quyết Cold-Start** | Rất tốt (Yêu cầu chọn thể loại và phim yêu thích khi đăng ký). | Kém (Người dùng phải tự tìm kiếm nội dung hoặc theo dõi người khác). | Trung bình (Chủ yếu hiển thị phim thịnh hành, phim mới phát hành). | **Tốt** (Luồng Onboarding thông minh yêu cầu đánh giá nhanh một số phim tiêu biểu để tạo vector nhúng tức thời). |
| **Mức độ cá nhân hóa** | Cực kỳ cao (Cá nhân hóa từ danh sách phim đến cả ảnh đại diện - Artwork). | Thấp (Chủ yếu dựa vào bộ lọc cộng đồng). | Trung bình (Chưa tối ưu hóa theo hành vi tương tác thời gian thực). | **Cao** (Vector sở thích tự động cập nhật ngay khi người dùng đánh giá phim và thay đổi danh sách đề xuất tức thì). |
| **Chi phí vận hành và bản quyền** | Rất cao (Đầu tư hàng tỷ USD cho băng thông và nội dung tự sản xuất). | Thấp (Chỉ lưu trữ metadata phim, không chứa video phim). | Rất cao (Chi phí mua bản quyền phát sóng phim truyền hình và thể thao). | **Thấp** (Tận dụng metadata từ TMDb, trailers từ YouTube, tối ưu hóa lưu trữ đám mây qua Supabase). |

### 2.2.2. Phân tích chiến lược phát triển hệ thống qua ma trận SWOT
Phân tích ma trận SWOT giúp xác định rõ các yếu tố bên trong (Internal) bao gồm Điểm mạnh (S), Điểm yếu (W) và các yếu tố bên ngoài (External) bao gồm Cơ hội (O), Thách thức (T) tác động trực tiếp đến khả năng xây dựng, vận hành và thương mại hóa hệ thống **TKFilm**:

| **THẾ MẠNH (STRENGTHS - S)** | **ĐIỂM YẾU (WEAKNESSES - W)** |
| :--- | :--- |
| *   Sở hữu thuật toán gợi ý tiên tiến **Attention Autoencoder (RSAttAE)** có khả năng học các mối quan hệ phi tuyến tính phức tạp và tận dụng hiệu quả thông tin phụ (Side Information) của cả người dùng lẫn phim.<br>*   Tích hợp luồng **tự động hóa marketing n8n**, tự động hóa quy trình đẩy bài giới thiệu phim mới lên mạng xã hội Facebook ngay khi Admin thêm phim vào hệ thống.<br>*   Khả năng sinh lời tích hợp thông qua mạng lưới quảng cáo di động **Google AdMob**, giúp tạo doanh thu tự động từ các banner quảng cáo tương thích thích ứng mà không ảnh hưởng lớn tới trải nghiệm người dùng.<br>*   Kiến trúc Client-Server phân tách rõ ràng giúp hệ thống vận hành mượt mà, độ trễ suy luận AI cực thấp (<100ms).<br>*   Giao diện ứng dụng di động hiện đại (React Native, Glassmorphism, Dark Theme) mang lại trải nghiệm người dùng cao cấp vượt trội so với các đồ án thông thường.<br>*   Tích hợp dịch vụ đám mây Supabase giúp giảm tải việc quản trị hạ tầng, nâng cao tính bảo mật (RLS) và đồng bộ hóa thời gian thực dữ liệu. | *   Dữ liệu huấn luyện mô hình AI gốc bị giới hạn bởi tập dữ liệu học thuật MovieLens 100K.<br>*   Hệ thống chưa hỗ trợ trình phát video phát trực tiếp đầy đủ (chỉ hỗ trợ phát trailer qua YouTube) do hạn chế về bản quyền và băng thông lưu trữ.<br>*   Nguồn nhân lực phát triển và vận hành mỏng (chủ yếu thực hiện bởi nhóm tác giả đồ án). |
| **CƠ HỘI (OPPORTUNITIES - O)** | **THÁCH THỨC (THREATS - T)** |
| *   Nhu cầu trải nghiệm giải trí số cá nhân hóa của người dùng di động ngày càng tăng cao.<br>*   Thị trường các nền tảng xem phim trực tuyến vừa và nhỏ ở Việt Nam đang thiếu các giải pháp gợi ý AI giá thành hợp lý, mở ra cơ hội kinh doanh dạng SaaS (RaaS).<br>*   Sự phát triển mạnh mẽ của các thư viện mã nguồn mở về AI giúp việc cập nhật và cải tiến mô hình học sâu trở nên thuận tiện hơn. | *   Các ông lớn công nghệ như Netflix, YouTube có tiềm lực tài chính khổng lồ và thuật toán gợi ý đã được tối ưu hóa qua hàng chục năm.<br>*   Vấn đề bảo mật thông tin và quyền riêng tư dữ liệu cá nhân của người dùng ngày càng bị thắt chặt về mặt pháp lý.<br>*   Sự thay đổi liên tục trong thói quen và xu hướng giải trí đòi hỏi mô hình phải được cập nhật (retrain) thường xuyên để tránh hiện tượng suy giảm hiệu năng theo thời gian (Model Drift). |

---

## 2.3. Xác định yêu cầu hệ thống (System Requirements)

Hệ thống được thiết kế nhằm phục vụ đồng thời hai đối tượng: Người xem phim (End-User) và Quản trị viên (Administrator). Các yêu cầu được phân tích thành yêu cầu chức năng và yêu cầu phi chức năng.

### 2.3.1. Bảng yêu cầu chức năng cho Người xem phim (End-User App)
Dưới đây là đặc tả các yêu cầu chức năng đối với giao diện ứng dụng di động dành cho đối tượng người xem phim:

| Chức năng | Mô tả chức năng |
| :--- | :--- |
| **Đăng ký/Đăng nhập và Xác thực** | Cho phép người dùng đăng ký tài khoản mới bằng email và mật khẩu cá nhân. Mọi phiên làm việc được quản lý bảo mật thông qua dịch vụ xác thực đám mây của Supabase Auth. |
| **Khởi tạo sở thích ban đầu (Onboarding Flow)** | Yêu cầu người dùng mới chấm điểm (từ 1 đến 5 sao) đối với tối thiểu 5 bộ phim tiêu biểu khi đăng nhập lần đầu nhằm xây dựng vector sở thích ban đầu và giải quyết bài toán khởi đầu lạnh (Cold-Start). |
| **Duyệt danh mục và xem chi tiết** | Cho phép người dùng duyệt phim theo thể loại, xem thông tin phim chi tiết (tên, poster, tóm tắt cốt truyện lấy trực tiếp từ TMDb API) và phát trailer chính thức qua trình phát YouTube tích hợp. |
| **Hệ thống gợi ý cá nhân hóa (Recommendation)** | Hiển thị danh sách Top 20 bộ phim được đề xuất riêng biệt cho từng người dùng sử dụng thuật toán RSAttAE thời gian thực tại trang chủ và các phim tương đồng (Similar Movies) tại trang chi tiết. |
| **Tương tác và Đánh giá phim** | Cho phép chấm điểm (từ 1 đến 5 sao) và viết bình luận dưới các trang chi tiết phim, dữ liệu đánh giá được đồng bộ lập tức sang Backend AI để tính toán lại vector người dùng thời gian thực. |
| **Lịch sử xem phim và Tìm kiếm** | Lưu trữ nhật ký các phim người dùng đã nhấp vào xem trailer/chi tiết và cung cấp thanh tìm kiếm nhanh thời gian thực kết hợp bộ lọc thể loại phim. |
| **Tích hợp quảng cáo (Monetization)** | Hiển thị biểu ngữ quảng cáo thích ứng Google AdMob Banner ở chân trang giao diện di động mà không gây gián đoạn lớn tới trải nghiệm duyệt phim. |

### 2.3.2. Bảng yêu cầu chức năng cho Quản trị viên (Administrator Interface)
Dưới đây là đặc tả các yêu cầu chức năng dành cho phân hệ quản trị viên để kiểm soát và vận hành hệ thống:

| Chức năng | Mô tả chức năng |
| :--- | :--- |
| **Quản lý danh mục phim** | Hỗ trợ quản trị viên duyệt xem danh sách toàn bộ các bộ phim đang có trên hệ thống và điền biểu mẫu thêm mới thông tin phim vào cơ sở dữ liệu Supabase. |
| **Kiểm soát hiển thị (Hide/Unhide Movies)** | Cho phép ẩn (hide) các bộ phim lỗi thông tin hoặc vi phạm bản quyền khỏi giao diện người dùng di động dưới dạng soft delete và khôi phục hiển thị (unhide) khi thông tin chuẩn hóa. |
| **Quản lý tài khoản người dùng** | Hỗ trợ xem danh sách toàn bộ tài khoản đăng ký và thực hiện thao tác khóa (ban) hoặc mở khóa các tài khoản người dùng vi phạm quy chế cộng đồng. |
| **Tự động đăng bài truyền thông (n8n)** | Kích hoạt webhook truyền siêu dữ liệu phim mới tới container tự động hóa n8n khi admin thêm phim thành công để tự động đăng tải bài viết PR phim lên Fanpage Facebook. |

### 2.3.3. Bảng yêu cầu phi chức năng (Non-Functional Requirements - NFR)
Dưới đây là đặc tả các yêu cầu phi chức năng nhằm đảm bảo hiệu năng, bảo mật và độ tin cậy của toàn bộ hệ thống:

| Chức năng | Mô tả chức năng |
| :--- | :--- |
| **Hiệu năng và Tốc độ phản hồi (Latency)** | Thời gian suy luận của AI gợi ý phải nhỏ hơn 100ms; thời gian tải trang di động không quá 2 giây; cuộc gọi webhook tiếp thị tự động chạy bất đồng bộ để tránh tắc nghẽn giao dịch thêm phim. |
| **Độ chính xác gợi ý (Accuracy)** | Đảm bảo các chỉ số đo lường chất lượng hệ gợi ý đạt ngưỡng khoa học chấp nhận được trên tập thử nghiệm MovieLens 100K: Precision@10 đạt trên 0.20, Recall@10 đạt trên 0.15 và NDCG@10 đạt trên 0.22. |
| **Tính bảo mật và An toàn (Security)** | Mật khẩu tài khoản phải được mã hóa một chiều trước khi lưu và áp dụng chính sách Row Level Security (RLS) để ngăn chặn truy cập chéo dữ liệu giữa các tài khoản. |
| **Độ tin cậy và Tính sẵn sàng (Availability)** | Hệ cơ sở dữ liệu đám mây Supabase cam kết Uptime đạt 99.9% và Backend Flask tích hợp ghi nhật ký lỗi (logging) chi tiết để khắc phục nhanh sự cố phát sinh. |
| **Khả năng mở rộng (Scalability)** | Cơ sở dữ liệu PostgreSQL và API RESTful hỗ trợ mở rộng số lượng người dùng truy cập đồng thời lên hàng nghìn tài khoản mà không gây thắt nút cổ chai hệ thống. |

---

## 2.4. Cơ sở lý thuyết nền tảng (Theoretical Background)

### 2.4.1. Tổng quan về Hệ gợi ý (Recommendation Systems)
Hệ gợi ý (Recommendation System - RS) là một phân ngành của Trí tuệ Nhân tạo và Khai phá dữ liệu, có chức năng dự đoán mức độ quan tâm hoặc điểm đánh giá mà một người dùng sẽ dành cho một sản phẩm nào đó, từ đó đề xuất các sản phẩm phù hợp nhất [1], [2]. Về mặt toán học, bài toán gợi ý được phát biểu dưới dạng ước lượng các giá trị còn trống trong ma trận tương tác Người dùng - Sản phẩm (User-Item Interaction Matrix).

Gọi $U = \{u_1, u_2, ..., u_M\}$ là tập hợp gồm $M$ người dùng, và $I = \{i_1, i_2, ..., i_N\}$ là tập hợp gồm $N$ sản phẩm (trong đồ án này là các bộ phim). Ma trận tương tác người dùng - sản phẩm được ký hiệu là $R \in \mathbb{R}^{M \times N}$, trong đó mỗi phần tử $R_{u, i}$ thể hiện mức độ tương tác (như điểm số rating hoặc hành vi ngầm định click/view) của người dùng $u$ đối với sản phẩm $i$. Do một người dùng thông thường chỉ tương tác với một lượng rất nhỏ sản phẩm trong hệ thống, hầu hết các phần tử của ma trận $R$ đều chưa có giá trị (unknown). Mục tiêu của hệ gợi ý là xây dựng một hàm dự đoán $f$:
$$\hat{R}_{u, i} = f(u, i | \Theta)$$

**Công dụng và nguyên lý hoạt động của công thức dự đoán:**
Công thức trên là mô hình toán học tổng quát của hệ gợi ý. Trong đó:
*   $\hat{R}_{u, i}$ đại diện cho giá trị tương tác (điểm số rating, xác suất click, hoặc thời gian xem) dự đoán mà người dùng $u$ sẽ dành cho bộ phim $i$ mà họ chưa từng xem trong thực tế.
*   Hàm $f(u, i | \Theta)$ đóng vai trò là hàm ánh xạ mối quan hệ tương quan giữa người dùng $u$ và phim $i$ thông qua tập tham số học tập $\Theta$ (như trọng số của mạng nơ-ron hoặc các vector nhúng ẩn).
*   Công dụng thực tế của công thức này là tính toán điểm số dự đoán cho tất cả các bộ phim còn trống trong ma trận. Sau khi thu được toàn bộ điểm dự đoán $\hat{R}_{u, i}$, hệ thống sẽ tiến hành sắp xếp (rank) theo thứ tự giảm dần và chọn ra Top-K bộ phim có điểm số cao nhất để hiển thị trực tiếp lên giao diện của người dùng.

sao cho $\hat{R}_{u, i}$ xấp xỉ gần nhất với giá trị thực tế nếu người dùng $u$ tương tác với sản phẩm $i$, với $\Theta$ là tập hợp các tham số tối ưu của mô hình gợi ý.

### 2.4.2. Kỹ thuật lọc cộng tác truyền thống và các công thức tính độ tương đồng
Lọc cộng tác (Collaborative Filtering - CF) dựa trên giả thuyết cơ bản rằng: nếu các người dùng có chung hành vi hoặc đánh giá tương tự nhau trong quá khứ, họ sẽ có xu hướng đồng thuận ý kiến đối với các sản phẩm mới trong tương lai [3], [4]. Kỹ thuật này được chia làm hai hướng tiếp cận chính:

#### A. Lọc cộng tác dựa trên lân cận (Neighborhood-based CF)
*   **Lọc cộng tác dựa trên người dùng (User-based CF):** Tìm kiếm các người dùng có sở thích tương tự với người dùng mục tiêu $u$. Điểm số dự đoán cho sản phẩm $i$ được tính bằng trung bình cộng có trọng số từ điểm đánh giá của các người dùng lân cận [3]:
    $$\hat{R}_{u, i} = \bar{R}_u + \frac{\sum_{v \in S(u)} Sim(u, v) \cdot (R_{v, i} - \bar{R}_v)}{\sum_{v \in S(u)} |Sim(u, v)|}$$
    
    **Công dụng và nguyên lý hoạt động:**
    Công thức này dùng để ước lượng điểm số rating mà người dùng mục tiêu $u$ sẽ gán cho bộ phim $i$ chưa xem. Bằng cách sử dụng điểm đánh giá trung bình $\bar{R}_u$ của chính người dùng $u$ làm mốc nền tảng (cơ sở), công thức cộng thêm phần bù sai lệch từ điểm đánh giá của các người dùng lân cận $v \in S(u)$ có độ tương đồng sở thích cao nhất. Độ tương đồng sở thích $Sim(u, v)$ đóng vai trò là trọng số ảnh hưởng; người có sở thích càng giống người dùng mục tiêu thì tiếng nói đóng góp của họ vào điểm số dự đoán càng lớn.

*   **Lọc cộng tác dựa trên sản phẩm (Item-based CF):** Thay vì tìm người dùng tương đồng, phương pháp này tính toán độ tương đồng giữa các sản phẩm dựa trên cách mà chúng được đánh giá bởi những người dùng chung [4]. Điểm số dự đoán được tính bằng:
    $$\hat{R}_{u, i} = \frac{\sum_{j \in S(i)} Sim(i, j) \cdot R_{u, j}}{\sum_{j \in S(i)} |Sim(i, j)|}$$

    **Công dụng và nguyên lý hoạt động:**
    Công thức này dự đoán điểm đánh giá của người dùng $u$ đối với bộ phim $i$ bằng cách tính trung bình cộng có trọng số từ các điểm rating thực tế $R_{u, j}$ mà chính người dùng này đã cho những bộ phim tương tự $j \in S(i)$ trong quá khứ. Trọng số ở đây chính là độ tương đồng giữa phim mục tiêu $i$ và các phim lân cận $j$, được ký hiệu là $Sim(i, j)$. Công thức giúp cá nhân hóa gợi ý bằng cách tập trung vào độ tương quan thuộc tính và lịch sử tương tác trực tiếp của người dùng lên các sản phẩm.

#### B. Các công thức đo lường độ tương đồng (Similarity Metrics)
Độ tương đồng giữa hai vector (người dùng hoặc phim) thường được tính toán qua hai công thức chính:
1.  **Độ tương đồng Cosine (Cosine Similarity):**
    $$Sim(\mathbf{x}, \mathbf{y}) = \cos(\theta) = \frac{\mathbf{x} \cdot \mathbf{y}}{\|\mathbf{x}\| \|\mathbf{y}\|} = \frac{\sum_{k} x_k y_k}{\sqrt{\sum_{k} x_k^2} \sqrt{\sum_{k} y_k^2}}$$

    **Công dụng và nguyên lý hoạt động:**
    Hàm số này đo lường cosin của góc $\theta$ tạo bởi hai vector đặc trưng $\mathbf{x}$ và $\mathbf{y}$ trong không gian đa chiều, phản ánh mức độ trùng khớp về mặt hướng sở thích giữa chúng mà không bị ảnh hưởng bởi độ dài vật lý (quy mô đánh giá) của các vector. Kết quả của công thức có miền giá trị từ $-1$ đến $1$ (hoặc từ $0$ đến $1$ với dữ liệu không âm), trong đó giá trị tiến gần về $1$ thể hiện hai vector gần như song song, biểu thị mức độ tương đồng sở thích cực kỳ cao.

2.  **Hệ số tương quan Pearson (Pearson Correlation Coefficient):**
    $$Sim(\mathbf{x}, \mathbf{y}) = \frac{\sum_{k} (x_k - \bar{x})(y_k - \bar{y})}{\sqrt{\sum_{k} (x_k - \bar{x})^2} \sqrt{\sum_{k} (y_k - \bar{y})^2}}$$

    **Công dụng và nguyên lý hoạt động:**
    Công thức này tính toán mức độ tương quan tuyến tính giữa hai thực thể sau khi đã thực hiện chuẩn hóa trừ đi điểm đánh giá trung bình tương ứng $\bar{x}$ và $\bar{y}$. Phép trừ này đóng vai trò loại bỏ "độ chệch đánh giá chủ quan" (tình trạng người dùng quá dễ tính luôn cho điểm cao hoặc quá khắt khe luôn chấm điểm thấp), giúp phản ánh chính xác hơn sự tương quan thực chất trong thị hiếu điện ảnh giữa các cá nhân.

---

### 2.4.3. Mạng tự mã hóa Autoencoder (AE)
Autoencoder là một dạng mạng nơ-ron truyền thẳng không giám sát (Unsupervised Neural Network), được thiết kế để học cách biểu diễn dữ liệu đầu vào dưới dạng nén hiệu quả, sau đó tái cấu trúc lại dữ liệu ở đầu ra gần giống nhất với dữ liệu đầu vào ban đầu [5], [6]. Một mạng Autoencoder chuẩn bao gồm hai thành phần chính:

```
          Đầu vào X              Không gian ẩn Z              Đầu ra X̂
     [ x₁ , x₂ , ... , xₙ ]  -->  [ z₁ , ... , z_d ]  -->  [ x̂₁ , x̂₂ , ... , x̂ₙ ]
              |                        |                        |
              +-------- Encoder -------+-------- Decoder -------+
                       W_e, b_e                 W_d, b_d
```

1.  **Bộ mã hóa (Encoder):** Ánh xạ dữ liệu đầu vào $\mathbf{x} \in \mathbb{R}^n$ sang không gian ẩn (Latent Space) có số chiều thấp hơn $d \ll n$ để tạo ra vector ẩn $\mathbf{z} \in \mathbb{R}^d$:
    $$\mathbf{z} = g(\mathbf{W}_e \mathbf{x} + \mathbf{b}_e)$$

    **Công dụng và nguyên lý hoạt động:**
    Công thức này thực hiện nhiệm vụ nén (giảm số chiều) vector dữ liệu đầu vào $\mathbf{x}$ thành một vector đại diện ẩn $\mathbf{z}$ có số chiều thấp hơn nhiều ($d = 64$). Quá trình nén được thực thi bằng cách nhân vector đầu vào với ma trận trọng số $\mathbf{W}_e$, cộng thêm vector chệch $\mathbf{b}_e$ và truyền qua hàm kích hoạt phi tuyến $g(\cdot)$ (như Sigmoid hoặc ReLU) nhằm giữ lại các đặc trưng ẩn cô đọng nhất và loại bỏ các thành phần nhiễu thông tin.

2.  **Bộ giải mã (Decoder):** Ánh xạ vector ẩn $\mathbf{z}$ từ không gian ẩn quay trở lại không gian dữ liệu ban đầu để tạo ra đầu ra tái cấu trúc $\hat{\mathbf{x}} \in \mathbb{R}^n$:
    $$\hat{\mathbf{x}} = h(\mathbf{W}_d \mathbf{z} + \mathbf{b}_d)$$

    **Công dụng và nguyên lý hoạt động:**
    Công thức giải mã chịu trách nhiệm khôi phục (khuếch đại chiều) vector biểu diễn ẩn $\mathbf{z}$ từ không gian latent space có chiều thấp quay trở về chiều không gian ban đầu $\hat{\mathbf{x}} \in \mathbb{R}^n$. Quá trình ánh xạ ngược này sử dụng ma trận trọng số giải mã $\mathbf{W}_d$, vector độ chệch $\mathbf{b}_d$ kết hợp hàm kích hoạt $h(\cdot)$ để tái tạo lại đầy đủ các thông tin ratings và dự báo các giá trị thưa thớt (các ô trống chưa có đánh giá) trong ma trận ban đầu.

Hàm mất mát (Loss Function) của mạng Autoencoder thường được định nghĩa bằng Sai số bình phương trung bình (Mean Squared Error - MSE) để giảm thiểu khoảng cách giữa $\mathbf{x}$ và $\hat{\mathbf{x}}$:
$$\mathcal{L}_{MSE}(\mathbf{W}, \mathbf{b}) = \frac{1}{2} \sum_{k=1}^{n} (x_k - \hat{x}_k)^2$$

**Công dụng và nguyên lý hoạt động:**
Công thức hàm mất mát MSE đo lường bình phương độ lệch giữa giá trị đầu vào thực tế $x_k$ và giá trị tái cấu trúc đầu ra $\hat{x}_k$ của mô hình. Trong quá trình huấn luyện bằng thuật toán lan truyền ngược (Backpropagation), hàm này đóng vai trò cung cấp tín hiệu gradient để cập nhật tối ưu các ma trận trọng số $\mathbf{W}$ và vector độ chệch $\mathbf{b}$, sao cho đầu ra dự báo tiệm cận gần nhất với hành vi tương tác thực tế của người dùng.

Trong hệ gợi ý lọc cộng tác (ví dụ như thuật toán AutoRec), đầu vào $\mathbf{x}$ chính là một hàng (vector rating của một user) hoặc một cột (vector rating của một phim) trong ma trận tương tác $R$ [5]. Bộ giải mã của Autoencoder sẽ dự đoán các giá trị rating tại các vị trí chưa được đánh giá trong vector đầu vào thưa thớt.

---

### 2.4.4. Cơ chế chú ý (Attention Mechanism)
Cơ chế chú ý ban đầu được đề xuất trong lĩnh vực Dịch máy (Neural Machine Translation) và sau đó được chuẩn hóa trong kiến trúc Transformer. Bản chất của cơ chế chú ý là cho phép mạng nơ-ron tập trung vào các phần thông tin quan trọng nhất của dữ liệu đầu vào tùy thuộc vào ngữ cảnh hiện tại, thay vì ép mạng phải ghi nhớ toàn bộ thông tin với vai trò ngang nhau [7].

Mô hình Attention tổng quát nhận vào ba thành phần: **Query** (Truy vấn $\mathbf{Q}$), **Keys** (Khóa $\mathbf{K}$), và **Values** (Giá trị $\mathbf{V}$). Đầu ra của cơ chế chú ý là tổng có trọng số của các giá trị trong $\mathbf{V}$, trong đó trọng số gán cho mỗi giá trị được tính toán bằng một hàm tương tác (Compatibility Function) giữa truy vấn $\mathbf{Q}$ và khóa tương ứng $\mathbf{K}$ [7]:
$$\text{Attention}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \text{Softmax}\left(\frac{\mathbf{Q} \mathbf{K}^T}{\sqrt{d_k}}\right) \mathbf{V}$$

**Công dụng và nguyên lý hoạt động:**
Công thức này thực hiện nhiệm vụ tính toán mức độ tập trung của truy vấn $\mathbf{Q}$ lên các khóa dữ liệu $\mathbf{K}$, từ đó lấy ra một tổng hợp thông tin tối ưu từ các giá trị $\mathbf{V}$ tương ứng. Phép nhân ma trận $\mathbf{Q} \mathbf{K}^T$ đo độ tương quan, sau đó được chia cho $\sqrt{d_k}$ để tránh bão hòa gradient và đi qua hàm Softmax để chuyển đổi thành một phân phối trọng số xác suất. Trong hệ gợi ý tích hợp thông tin phụ, cơ chế chú ý giúp mô hình tự động nhận diện thuộc tính nào của phim (ví dụ: thể loại "Hành động" hay năm sản xuất "Mới nhất") hoặc thuộc tính nào của người dùng (ví dụ: nghề nghiệp "Sinh viên" hay giới tính) đóng góp nhiều nhất vào hành vi đánh giá phim hiện tại, từ đó tinh chỉnh vector biểu diễn ẩn $\mathbf{z}$ một cách chính xác hơn [8].

---

### 2.4.5. Kiến trúc mô hình Attention Autoencoder tích hợp thông tin phụ (RSAttAE)
Mô hình **RSAttAE (Information-Aware Attention Autoencoder)** của dự án **TKFilm** kết hợp cả hai công nghệ Autoencoder và Cơ chế chú ý để tối ưu hóa không gian nhúng của người dùng và phim thông qua việc tích hợp thông tin phụ (Side Information) [9], [10]. 

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

**Công dụng và nguyên lý hoạt động:**
Công thức này làm nhiệm vụ lọc bớt dữ liệu nhiễu bằng cách che ngẫu nhiên 50% ratings qua hàm Dropout, sau đó chiếu vector thưa thớt này vào không gian ẩn sơ bộ 64 chiều $\mathbf{e}$. Hàm kích hoạt phi tuyến tính LeakyReLU với độ dốc nhỏ ở phần âm được sử dụng để tránh hiện tượng "chết nơ-ron" (dying ReLU), giúp mô hình duy trì khả năng truyền dẫn thông tin ngay cả khi giá trị đầu ra của lớp tích chập bị âm.

#### Bước 2: Tích hợp thông tin phụ qua cơ chế chú ý (Information-Aware Attention)
Gọi $\mathbf{s}$ là vector đặc trưng thông tin phụ đi kèm (đối với phim, $\mathbf{s} \in \mathbb{R}^{23}$ gồm 19 thể loại và 4 nhóm năm phát hành; đối với người dùng, $\mathbf{s}$ chứa thông tin tuổi, giới tính, nghề nghiệp). 

1.  Đầu tiên, thông tin phụ $\mathbf{s}$ được chiếu qua một lớp tuyến tính để tạo ra không gian ẩn thông tin phụ $\mathbf{h}_s \in \mathbb{R}^d$:
    $$\mathbf{h}_s = \mathbf{W}_s \mathbf{s} + \mathbf{b}_s$$

    **Công dụng và nguyên lý hoạt động:**
    Công thức chiếu này ánh xạ vector đặc trưng thông tin phụ $\mathbf{s}$ từ số chiều gốc của nó sang không gian có số chiều tương thích với đặc trưng ẩn của ratings ($d=64$). Điều này tạo tiền đề toán học để hệ thống có thể kết hợp và so sánh trực tiếp mức độ tương quan giữa thông tin thuộc tính nền (Side Info) và hành vi chấm điểm thực tế của người dùng.

2.  Trọng số chú ý $\mathbf{a}_w \in \mathbb{R}^d$ được tính toán bằng cách áp dụng hàm kích hoạt Softmax lên vector đặc trưng thông tin phụ để phân phối độ tập trung vào từng chiều trong số 64 chiều đặc trưng ẩn:
    $$\mathbf{a}_w = \text{Softmax}(\mathbf{h}_s)$$

    **Công dụng và nguyên lý hoạt động:**
    Công thức này sử dụng hàm Softmax để chuyển đổi vector đặc trưng thông tin phụ $\mathbf{h}_s$ thành một phân phối xác suất $\mathbf{a}_w$ có tổng các phần tử bằng $1$. Các giá trị trong vector $\mathbf{a}_w$ đại diện cho mức độ tập trung (trọng số chú ý) phân bổ trên từng chiều trong số 64 chiều latent space, chỉ ra thuộc tính nào của thông tin phụ có ảnh hưởng quyết định nhất.

3.  Vector đặc trưng ẩn sau khi áp dụng cơ chế chú ý (Attended Representation) $\mathbf{e}_{att}$ được tính bằng tích Hadamard (element-wise product) giữa trọng số chú ý $\mathbf{a}_w$ và vector biểu diễn ẩn sơ bộ $\mathbf{e}$:
    $$\mathbf{e}_{att} = \mathbf{a}_w \odot \mathbf{e}$$

    **Công dụng và nguyên lý hoạt động:**
    Phép toán tích Hadamard (element-wise product) này thực hiện việc điều biến trực tiếp cường độ của vector biểu diễn ẩn sơ bộ $\mathbf{e}$ theo trọng số chú ý $\mathbf{a}_w$ đã được học từ thông tin phụ. Tác dụng của công thức là làm nổi bật hoặc làm suy giảm độ ảnh hưởng của từng đặc trưng ẩn dựa theo thuộc tính đặc thù của bộ phim hoặc người dùng đó.

#### Bước 3: Tổ hợp và Chuẩn hóa (Skip-Connection & Layer Normalization)
Để giữ lại các thông tin tương tác cộng tác gốc và tránh hiện tượng triệt tiêu gradient, một kết nối tắt (Skip-Connection) kết hợp với hệ số pha trộn $\alpha \in [0, 1]$ được áp dụng để tạo ra vector ẩn cuối cùng $\mathbf{z}$:
$$\mathbf{z}_{pre} = \alpha \mathbf{e}_{att} + (1 - \alpha) \mathbf{e}$$
$$\mathbf{z} = \text{LayerNorm}(\mathbf{z}_{pre})$$

**Công dụng và nguyên lý hoạt động:**
*   Công thức skip-connection thứ nhất thực hiện pha trộn tuyến tính giữa vector biểu diễn mang cơ chế chú ý $\mathbf{e}_{att}$ và vector biểu diễn cộng tác gốc $\mathbf{e}$ theo tỉ lệ điều phối $\alpha$. Mục đích là giữ lại cấu trúc tương tác ratings gốc để bảo toàn thông tin và ngăn ngừa lỗi triệt tiêu gradient khi huấn luyện qua nhiều tầng.
*   Công thức chuẩn hóa LayerNorm tiếp theo chịu trách nhiệm điều chỉnh giá trị trung bình và phương sai của vector đặc trưng về trạng thái phân phối chuẩn trên từng mẫu dữ liệu. Việc chuẩn hóa này giúp ổn định quá trình tối ưu hóa số học, tăng tốc hội tụ và giúp vector nhúng cuối cùng $\mathbf{z}$ có tính nhất quán cao.

Vector $\mathbf{z} \in \mathbb{R}^{64}$ chính là vector nhúng (embedding) đại diện cuối cùng của thực thể trong không gian latent space 64 chiều.

#### Bước 4: Giải mã và tái cấu trúc (Decoding)
Vector nhúng ẩn $\mathbf{z}$ được đưa qua bộ giải mã để tái cấu trúc lại vector rating ban đầu $\hat{\mathbf{x}} \in \mathbb{R}^n$:
$$\hat{\mathbf{x}} = \text{LeakyReLU}(\mathbf{W}_d \mathbf{z} + \mathbf{b}_d)$$

**Công dụng và nguyên lý hoạt động:**
Công thức này đại diện cho tầng đầu ra của bộ giải mã (Decoder). Nhiệm vụ của nó là tiếp nhận vector nhúng ẩn hoàn chỉnh $\mathbf{z}$ (đã được tích hợp đầy đủ thông tin phụ qua cơ chế chú ý) và thực hiện phép nhân ma trận trọng số $\mathbf{W}_d$ kèm vector bias $\mathbf{b}_d$ qua hàm LeakyReLU để tái tạo lại vector điểm số rating đầy đủ $\hat{\mathbf{x}}$. Kết quả đầu ra $\hat{\mathbf{x}}$ chính là danh sách điểm rating dự báo cho tất cả các bộ phim trong hệ thống đối với người dùng tương ứng.

#### Hàm mất mát huấn luyện (Training Loss Function)
Quá trình huấn luyện sử dụng hàm tổn hao lỗi bình phương trung bình có hiệu chỉnh (Masked MSE Loss) chỉ tính toán trên các phần tử thực sự đã có điểm rating trong ma trận huấn luyện nhằm tránh việc kéo điểm số dự đoán về 0:
$$\mathcal{L} = \frac{1}{|\mathcal{K}|} \sum_{(u, i) \in \mathcal{K}} (R_{u, i} - \hat{R}_{u, i})^2 + \lambda (\|\mathbf{W}_e\|_F^2 + \|\mathbf{W}_d\|_F^2)$$

**Công dụng và nguyên lý hoạt động:**
Hàm mất mát này là tiêu chí cốt lõi điều phối quá trình huấn luyện của mô hình RSAttAE. Công thức chia làm hai thành phần:
*   Thành phần thứ nhất là Masked MSE, thực hiện tính toán bình phương sai số chỉ giới hạn trên tập hợp các ô dữ liệu đã có tương tác ratings thực tế $\mathcal{K}$ để tránh việc mô hình bị lệch do số lượng lớn ô trống (missing values) trong ma trận thưa.
*   Thành phần thứ hai là chuẩn hóa L2 Regularization (sử dụng chuẩn Frobenius của ma trận trọng số) nhân với hệ số $\lambda$, có tác dụng kiểm soát biên độ của các tham số trọng số $\mathbf{W}_e$ và $\mathbf{W}_d$ nhằm chống lại hiện tượng quá khớp (Overfitting), đảm bảo khả năng khái quát hóa của hệ thống trên dữ liệu thực tế.

---

### 2.4.6. Mô hình phân loại XGBoost áp dụng trong gợi ý
Bên cạnh mô hình Attention Autoencoder dùng để sinh vector nhúng và tính toán độ tương đồng Cosine, hệ thống **TKFilm** còn tích hợp mô hình **XGBoost (Extreme Gradient Boosting)** làm bộ gợi ý xếp hạng nâng cao [11], [12].

XGBoost là một thuật toán học máy mạnh mẽ dựa trên kiến trúc Cây quyết định tăng cường độ dốc (Gradient Boosted Decision Trees - GBDT). Trong bài toán hệ gợi ý của TKFilm, mô hình XGBoost được huấn luyện đóng vai trò như một bộ phân loại/xếp hạng (Ranking Model). Đầu vào của XGBoost là sự kết hợp của nhiều nhóm đặc trưng:
*   Vector nhúng ẩn của người dùng $\mathbf{z}_u \in \mathbb{R}^{64}$ thu được từ User Autoencoder.
*   Vector nhúng ẩn của bộ phim $\mathbf{z}_i \in \mathbb{R}^{64}$ thu được từ Movie Autoencoder.
*   Các đặc trưng tương tác trực tiếp (điểm tương đồng Cosine giữa $\mathbf{z}_u$ và $\mathbf{z}_i$).
*   Các đặc trưng nội dung (thể loại phim, năm phát hành).

Hàm mục tiêu của mô hình xếp hạng XGBoost là tối ưu hóa điểm số dự đoán khả năng người dùng yêu thích bộ phim thông qua việc tối thiểu hóa hàm mất mát lỗi bình phương:
$$\mathcal{L}^{(t)} = \sum_{k=1}^{K} l\left(y_k, \hat{y}_k^{(t-1)} + f_t(\mathbf{x}_k)\right) + \Omega(f_t)$$

**Công dụng và nguyên lý hoạt động:**
Công thức này là hàm mục tiêu tối ưu hóa của XGBoost tại bước xây dựng cây quyết định thứ $t$. Trong đó:
*   Hàm mất mát $l(\cdot)$ đo lường khoảng cách giữa nhãn thực tế $y_k$ (mức độ yêu thích thực tế của người dùng) và giá trị dự báo tích lũy từ các cây trước đó kết hợp cây mới $f_t(\mathbf{x}_k)$.
*   Số hạng phạt $\Omega(f_t)$ đo lường độ phức tạp của cấu trúc cây quyết định thứ $t$ (dựa trên số lượng lá và trọng số các lá) nhằm khống chế cây không phát triển quá sâu gây ra overfitting.
*   Công dụng thực tế của công thức là làm tiêu chuẩn để thuật toán tìm kiếm cấu trúc phân nhánh cây tối ưu nhất, giúp xếp hạng chính xác danh sách phim đề xuất dựa trên các đặc trưng kết hợp đa dạng. Việc kết hợp XGBoost giúp hệ thống TKFilm tận dụng được sức mạnh của cả hai hướng tiếp cận: khả năng học biểu diễn tự động của Học Sâu (Deep Learning) và khả năng phân loại, tối ưu hóa cấu trúc bảng cực kỳ mạnh mẽ của Học Máy truyền thống (Machine Learning).


### 2.4.7. Các công nghệ cốt lõi triển khai hệ thống
*   **React Native & Expo:** React Native sử dụng Bridge (hoặc kiến trúc JSI mới) để ánh xạ các thành phần giao diện viết bằng Javascript/Typescript thành các thành phần giao diện gốc (Native UI components) trên thiết bị di động [13]. Expo đóng vai trò là một bộ công cụ và SDK bao bọc xung quanh React Native, cung cấp các thư viện truy cập phần cứng và cơ chế cập nhật ứng dụng tức thì qua mạng (Over-The-Air - OTA).
*   **Flask (Python API):** Flask hoạt động theo kiến trúc WSGI (Web Server Gateway Interface), chịu trách nhiệm lắng nghe và định tuyến các yêu cầu HTTP. Nó tích hợp thư viện PyTorch bằng cách tải sẵn các mô hình mạng nơ-ron dạng tĩnh vào bộ nhớ RAM khi khởi động máy chủ, cho phép các hàm API truy cập và thực hiện suy luận (Inference) song song thời gian thực với độ trễ tối thiểu [14].
*   **Supabase & PostgreSQL:** PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, hỗ trợ các truy vấn phức tạp và tính toàn vẹn dữ liệu thông qua ràng buộc khóa ngoại [15]. Supabase cung cấp một lớp API RESTful tự động sinh ra từ cấu trúc bảng PostgreSQL và hỗ trợ cơ chế Websocket để đồng bộ hóa dữ liệu thời gian thực (Realtime database sync) giữa Cloud và Client App, đồng thời tích hợp cơ chế bảo mật xác thực JSON Web Token (JWT) thông qua Row Level Security (RLS).
*   **Hệ thống tự động hóa n8n (Workflow Automation):** n8n là công cụ tự động hóa các luồng công việc dựa trên node trực quan. Nó hỗ trợ cấu hình các Webhook kích hoạt bằng HTTP Trigger để nhận payload JSON từ Flask Server, sau đó chuyển tiếp dữ liệu qua các Node xử lý trung gian (như định dạng chuỗi, rút gọn URL) và kết thúc bằng Node tích hợp Facebook Graph API để tạo bài đăng tự động lên Trang Cộng Đồng (Facebook Page) [16].
*   **Bộ quảng cáo di động Google AdMob SDK:** Thư viện `react-native-google-mobile-ads` kết nối ứng dụng React Native với Google Mobile Ads SDK. Nó cho phép hiển thị các banner quảng cáo thích ứng (Adaptive Banners) có kích thước tự điều chỉnh theo độ phân giải màn hình thiết bị di động, tự động gửi các yêu cầu AdRequest bất đồng bộ tới máy chủ Google và trả về quảng cáo phi cá nhân hóa (Non-personalized Ads) cho người dùng nhằm tối ưu hóa tỷ lệ click-through rate (CTR) và doanh thu eCPM [17].
*   **Công nghệ đóng gói container Docker & Docker Compose (Containerization):** Docker là nền tảng mã nguồn mở cho phép ảo hóa cấp hệ điều hành bằng cách đóng gói mã nguồn và tất cả các thư viện phụ thuộc của một ứng dụng vào bên trong một Container duy nhất [18]. Container này có đặc tính nhẹ, độc lập và có thể chạy nhất quán trên bất kỳ máy chủ nào. Đồ án sử dụng Docker để tải hình ảnh (image) chính thức của n8n từ Docker Hub và chạy container n8n trong một môi trường cô lập, cho phép định cấu hình các biến môi trường, quản lý dữ liệu bền vững (Volumes) và mở cổng Webhook (port 5678) một cách an toàn và nhanh chóng.
đại diện cuối cùng của thực thể trong không gian latent space 64 chiều.

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
*   **Hệ thống tự động hóa n8n (Workflow Automation):** n8n là công cụ tự động hóa các luồng công việc dựa trên node trực quan. Nó hỗ trợ cấu hình các Webhook kích hoạt bằng HTTP Trigger để nhận payload JSON từ Flask Server, sau đó chuyển tiếp dữ liệu qua các Node xử lý trung gian (như định dạng chuỗi, rút gọn URL) và kết thúc bằng Node tích hợp Facebook Graph API để tạo bài đăng tự động lên Trang Cộng Đồng (Facebook Page).
*   **Bộ quảng cáo di động Google AdMob SDK:** Thư viện `react-native-google-mobile-ads` kết nối ứng dụng React Native với Google Mobile Ads SDK. Nó cho phép hiển thị các banner quảng cáo thích ứng (Adaptive Banners) có kích thước tự điều chỉnh theo độ phân giải màn hình thiết bị di động, tự động gửi các yêu cầu AdRequest bất đồng bộ tới máy chủ Google và trả về quảng cáo phi cá nhân hóa (Non-personalized Ads) cho người dùng nhằm tối ưu hóa tỷ lệ click-through rate (CTR) và doanh thu eCPM.
*   **Công nghệ đóng gói container Docker & Docker Compose (Containerization):** Docker là nền tảng mã nguồn mở cho phép ảo hóa cấp hệ điều hành bằng cách đóng gói mã nguồn và tất cả các thư viện phụ thuộc của một ứng dụng vào bên trong một Container duy nhất. Container này có đặc tính nhẹ, độc lập và có thể chạy nhất quán trên bất kỳ máy chủ nào. Đồ án sử dụng Docker để tải hình ảnh (image) chính thức của n8n từ Docker Hub và chạy container n8n trong một môi trường cô lập, cho phép định cấu hình các biến môi trường, quản lý dữ liệu bền vững (Volumes) và mở cổng Webhook (port 5678) một cách an toàn và nhanh chóng.

