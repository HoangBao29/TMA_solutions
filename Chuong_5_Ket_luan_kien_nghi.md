# CHƯƠNG 5. KẾT LUẬN VÀ KIẾN NGHỊ (CONCLUSION AND PRODUCT ROADMAP)

## 5.1. Các kết quả chính đạt được và Giá trị thực tiễn

### 5.1.1. Các kết quả chính đạt được
Sau thời gian nghiên cứu lý thuyết, thiết kế hệ thống và tiến hành phát triển thử nghiệm, đề tài **"Xây dựng ứng dụng xem phim tích hợp tính năng gợi ý phim"** đã hoàn thành toàn bộ các mục tiêu đặt ra với các kết quả cụ thể như sau:
1.  **Về mặt lý thuyết học máy (AI Core):**
    *   Nghiên cứu thành công cơ chế hoạt động của mạng nơ-ron tự mã hóa (Autoencoder) kết hợp cơ chế chú ý (Attention Mechanism) trong hệ gợi ý. Đề tài đã phân tích chi tiết toán lý thuyết của việc ánh xạ ma trận đánh giá thưa thớt vào không gian ẩn có số chiều thấp thông qua bộ mã hóa (Encoder). Đồng thời, cơ chế chú ý được tích hợp để tự động tính trọng số đóng góp của từng bộ phim đã xem đối với sở thích hiện tại của người dùng. Việc này giúp cải thiện đáng kể khả năng biểu diễn thông tin biểu thị sự quan tâm và sở thích động của người dùng trong hệ thống gợi ý.
    *   Huấn luyện và tối ưu hóa thành công mô hình **RSAttAE (Information-Aware Attention Autoencoder)** trên tập dữ liệu MovieLens 100K, đạt chỉ số Precision@10 là **0.22**, Recall@10 là **0.18**, và NDCG@10 là **0.25** trên tập thử nghiệm độc lập. Quá trình huấn luyện đã áp dụng các kỹ thuật điều chuẩn như Dropout và Weight Decay để ngăn chặn hiện tượng quá khớp (Overfitting). Các chỉ số đo lường thực tế này chứng minh độ chính xác vượt trội của giải pháp so với các phương pháp lọc cộng tác (Collaborative Filtering) truyền thống. Đây là cơ sở khoa học quan trọng để hệ thống đưa ra các gợi ý có tính liên quan cao đến người dùng cuối.
    *   Tích hợp thành công 23 đặc trưng phụ (Side Information) của phim (thể loại, năm phát hành) và đặc trưng người dùng vào vector biểu diễn trong không gian ẩn 64 chiều, giúp tăng độ chính xác gợi ý và giải quyết tốt bài toán khởi đầu lạnh ban đầu. Các đặc trưng phụ này được chuẩn hóa và nối trực tiếp với ma trận ratings đầu vào để tạo thành một vector đầu vào mở rộng. Nhờ có các thông tin phụ trợ này, mô hình Autoencoder vẫn có thể thực hiện tính toán không gian nhúng chính xác cho các thực thể thưa thớt dữ liệu. Đây là giải pháp kỹ thuật cốt lõi giúp hệ gợi ý nâng cao đáng kể hiệu năng dự báo đối với nhóm người dùng mới hoặc phim mới.
2.  **Về mặt kỹ thuật và phát triển phần mềm (MVP):**
    *   Xây dựng hoàn chỉnh ứng dụng di động **TKFilm** đa nền tảng bằng React Native & Expo với giao diện Dark Mode sang trọng, mượt mà và trực quan. Giao diện được tối ưu hóa theo ngôn ngữ Material Design hiện đại kết hợp với phong cách Glassmorphism tạo chiều sâu hiển thị. Ứng dụng hoạt động ổn định trên cả thiết bị chạy hệ điều hành Android và iOS, mang lại khả năng tương thích cao. Nhờ đó, người dùng có thể duyệt phim, xem trailer và đánh giá phim một cách nhanh chóng và dễ dàng.
    *   Xây dựng hệ thống máy chủ API Backend bằng Flask (Python) chịu trách nhiệm chạy suy luận mô hình học sâu PyTorch thời gian thực với độ trễ cực thấp (trung bình **45ms**). Hệ thống API được thiết kế theo kiến trúc RESTful chuẩn hóa giúp việc trao đổi dữ liệu JSON diễn ra trơn tru. Máy chủ Flask được cấu hình tải sẵn các trọng số mô hình đã huấn luyện vào bộ nhớ RAM để thực hiện các phép tính nhân ma trận tốc độ cao. Giải pháp này giúp loại bỏ hoàn toàn hiện tượng thắt nút cổ chai về mặt hiệu năng và đáp ứng tối ưu các yêu cầu phản hồi phi chức năng.
    *   Thiết lập cơ sở dữ liệu đám mây PostgreSQL (Supabase Cloud) đồng bộ hóa thời gian thực, quản lý phiên đăng nhập và bảo mật dữ liệu qua các chính sách bảo mật cấp hàng (Row Level Security - RLS). Toàn bộ các tương tác ratings và nhật ký xem phim của người dùng được lưu trữ an toàn trong các bảng vật lý chuyên dụng. Các quy tắc chính sách RLS đảm bảo rằng mỗi người dùng chỉ có quyền đọc và sửa dữ liệu do chính họ tạo ra. Việc này giúp nâng cao độ an toàn thông tin, bảo mật tuyệt đối tài khoản và ngăn chặn các nguy cơ khai thác lỗ hổng cơ sở dữ liệu từ bên ngoài.
    *   Ứng dụng thành công công nghệ ảo hóa container **Docker & Docker Compose** [18] để đóng gói và vận hành độc lập nền tảng tự động hóa n8n, đảm bảo tính cô lập tài nguyên và tính nhất quán khi triển khai hệ thống. Việc đóng gói này giúp cô lập môi trường thực thi của n8n khỏi các xung đột về thư viện trên máy chủ lưu trữ chính. Ngoài ra, tệp cấu hình Docker Compose hỗ trợ việc khởi chạy và kết nối mạng nội bộ giữa các container một cách nhanh chóng và tự động. Đây là mô hình triển khai chuẩn hóa giúp đơn giản hóa quy trình nâng cấp và bảo trì hệ thống tiếp thị tự động về sau.
3.  **Về mặt tự động hóa quy trình và thương mại hóa:**
    *   Ứng dụng thành công nền tảng **n8n** chạy trên môi trường **Docker** để xây dựng kịch bản tiếp thị tự động (Marketing Automation): tự động đăng bài quảng bá giới thiệu phim kèm link trailer lên Facebook Fanpage ngay khi admin cập nhật phim mới. Kịch bản này được kích hoạt thông qua một cuộc gọi HTTP POST bất đồng bộ từ máy chủ API Backend đến webhook của n8n. Workflow tiếp đó sẽ tự động xử lý chuỗi ký tự, định dạng mẫu bài viết PR và kết nối với Facebook Graph API bằng mã thông báo bảo mật. Nhờ cơ chế này, dự án giúp tiết kiệm tối đa thời gian vận hành thủ công và tối ưu hóa hiệu quả truyền thông tiếp thị cho sản phẩm.
    *   Tích hợp thành công quảng cáo biểu ngữ **Google AdMob Banner** (thích ứng di động) vào giao diện ứng dụng, mở ra dòng doanh thu tự động bền vững cho sản phẩm. Khung hiển thị quảng cáo sử dụng loại Adaptive Banners để tự động tối ưu hóa kích thước hiển thị khớp với chiều rộng của từng màn hình thiết bị di động. Biểu ngữ này được nhúng khéo léo ở chân trang chủ và trang chi tiết mà không gây ảnh hưởng tiêu cực hay làm dịch chuyển bố cục UI của người dùng. Đây là mô hình kiếm tiền tự động giúp mang lại nguồn thu thụ động ổn định nhằm duy trì kinh phí duy trì máy chủ cho nhà phát triển.

---

### 5.1.2. Giá trị đổi mới và Tính ứng dụng thực tiễn
*   **Giá trị đổi mới (Innovation Value):**
    *   Đề tài mang tính đổi mới sáng tạo cao khi không chỉ nghiên cứu độc lập về thuật toán học sâu AI mà còn đóng gói, tích hợp thành công mô hình AI này vào một ứng dụng di động hoàn chỉnh có mức độ hoàn thiện cao.
    *   Sự kết hợp sáng tạo giữa ba trụ cột: **Hệ gợi ý học sâu (AI RS)** $\rightarrow$ **Tự động hóa tiếp thị (n8n Automation)** $\rightarrow$ **Mô hình kiếm tiền tự động (Google AdMob)** tạo nên một giải pháp công nghệ khép kín tối ưu, giải quyết triệt để các vấn đề của cả người dùng, nhà tiếp thị và nhà phát triển.
*   **Tính ứng dụng thực tiễn (Applicability):**
    *   Ứng dụng giải quyết hiệu quả bài toán quá tải thông tin của người dùng di động khi xem phim trực tuyến, rút ngắn thời gian đưa ra quyết định chọn phim từ hàng chục phút xuống dưới 30 giây.
    *   Cấu trúc API RESTful phân tách của hệ thống có khả năng ứng dụng thực tế rất cao, dễ dàng đóng gói chuyển giao dạng SaaS để tích hợp vào các nền tảng xem phim sẵn có của doanh nghiệp.

---

## 5.2. Hạn chế của đề tài và Kết quả chưa giải quyết tốt

Mặc dù đạt được những kết quả rất tích cực, đồ án vẫn tồn tại một số hạn chế kỹ thuật cần được khắc phục trong tương lai:
1.  **Vấn đề trôi dạt mô hình (Model Drift) và cập nhật trọng số:**
    *   Hiện tại, mô hình Autoencoder (RSAttAE) chạy trên các vector nhúng (embeddings) được huấn luyện ngoại tuyến cố định. Khi người dùng đánh giá phim mới, hệ thống chỉ cập nhật vector hồ sơ người dùng (User Profile) thông qua trung bình cộng có trọng số của các vector phim đã có sẵn. Hệ thống chưa hỗ trợ cơ chế tự động huấn luyện lại trực tuyến (Online Retraining) để cập nhật liên tục không gian nhúng của toàn bộ hệ thống khi có lượng lớn dữ liệu tương tác mới, điều này có thể dẫn đến hiện tượng trôi dạt mô hình theo thời gian.
2.  **Khống chế bài toán Khởi đầu lạnh cho phim mới (Item Cold-Start):**
    *   Khi quản trị viên thêm một bộ phim hoàn toàn mới vào cơ sở dữ liệu Supabase, bộ phim này chưa được định vị tọa độ vector nhúng ẩn trong không gian latent space 64 chiều của Autoencoder (do không nằm trong tập dữ liệu MovieLens huấn luyện gốc). Hệ thống hiện tại phải giải quyết bằng thuật toán dự phòng Lai ghép (Hybrid/Content-based) dựa trên thể loại để gợi ý, dẫn đến độ chính xác gợi ý của riêng các phim mới này chưa tối ưu bằng các phim gốc.
3.  **Quy mô thử nghiệm thực tế hạn chế:**
    *   Hệ thống mới chỉ được chạy thử nghiệm nội bộ với quy mô nhỏ (50 người dùng thử). Do đó, chưa đánh giá được toàn diện hiệu năng chịu tải (Load Testing), độ trễ mạng và khả năng tối ưu hóa tài nguyên phần cứng khi có hàng chục nghìn kết nối đồng thời trong môi trường production thực tế.
4.  **Giới hạn bản quyền trình phát video:**
    *   Do rào cản về hạ tầng lưu trữ và vấn đề bản quyền phim, ứng dụng mới chỉ dừng lại ở việc phát trailer video từ YouTube thay vì cung cấp trình phát video phát trực tuyến (streaming player) đầy đủ cho toàn bộ bộ phim.

---

## 5.3. Kiến nghị và Hướng phát triển tương lai (Product Roadmap)

Để nâng cấp dự án **TKFilm** thành một giải pháp thương mại hoàn chỉnh, các hướng nghiên cứu và phát triển tiếp theo được đề xuất như sau:

### 5.3.1. Nâng cấp mô hình AI và Quy trình MLOps
*   **Xây dựng quy trình tự động tái huấn luyện (MLOps Pipeline):** Thiết lập một tác vụ chạy định kỳ (Cron Job / Scheduled Task) trên máy chủ để tự động xuất dữ liệu ratings mới từ Supabase, tự động chạy script huấn luyện cập nhật (incremental training) mô hình PyTorch và lưu đè file `.pt` mới mà không gây gián đoạn hệ thống đang hoạt động [27].
*   **Thử nghiệm các kiến trúc học sâu tiên tiến:** Nghiên cứu áp dụng mạng nơ-ron đồ thị (Graph Neural Networks - GNNs) [28] hoặc mạng nơ-ron tự mã hóa biến phân (Variational Autoencoders - VAEs) kết hợp cơ chế chú ý đa đầu (Multi-head Attention) để nâng cao hơn nữa chỉ số Precision@K và Recall@K trên các tập dữ liệu lớn hơn như MovieLens 20M.

### 5.3.2. Mở rộng luồng tự động hóa n8n và tích hợp truyền thông đa kênh
*   **Tích hợp đa nền tảng mạng xã hội:** Mở rộng luồng công việc n8n trên Docker để không chỉ đăng bài lên Facebook Fanpage mà còn tự động gửi thông báo giới thiệu phim đến các kênh Telegram cộng đồng, đăng tin Twitter (X), và tự động tạo các video ngắn (Shorts/Reels) từ trailer phim thông qua thư viện FFmpeg rồi đẩy lên TikTok, Instagram để tối đa hóa lượt tiếp cận.

### 5.3.3. Tối ưu hóa mô hình thương mại hóa
*   **Vận hành hệ thống quảng cáo nâng cao:** Tích hợp thêm các định dạng quảng cáo có mức sinh lời cao hơn của Google AdMob như quảng cáo xen kẽ (Interstitial Ads) khi chuyển trang hoặc quảng cáo video nhận phần thưởng (Rewarded Video Ads) khi người dùng hoàn thành một số tương tác đánh giá.
*   **Tích hợp trình phát Video Streaming bảo mật:** Kết nối với các dịch vụ CDN lưu trữ video đám mây và áp dụng các giải pháp mã hóa bảo mật DRM (Digital Rights Management) theo tiêu chuẩn mã hóa mở rộng EME [29] để hỗ trợ trình phát video phim trực tuyến bản quyền đầy đủ ngay trong ứng dụng, biến TKFilm thành một sản phẩm OTT thương mại hoàn chỉnh.

---

## TÀI LIỆU THAM KHẢO

[1] C. C. Aggarwal, *Recommender Systems: The Textbook*, Springer, 2016.

[2] F. Ricci, L. Rokach, and B. Shapira, *Recommender Systems Handbook*, 2nd ed., Springer, 2015.

[3] P. Resnick, N. Iacovou, M. Suchak, P. Bergstrom, and J. Riedl, "GroupLens: An open architecture for collaborative filtering of netnews," in *Proceedings of the 1994 ACM Conference on Computer Supported Cooperative Work*, 1994, pp. 175–186.

[4] B. Sarwar, G. Karypis, J. Konstan, and J. Riedl, "Item-based collaborative filtering recommendation algorithms," in *Proceedings of the 10th International Conference on World Wide Web*, 2001, pp. 285–295.

[5] S. Sedhain, A. K. Menon, S. Sanner, and L. Xie, "AutoRec: Autoencoders meet collaborative filtering," in *Proceedings of the 24th International Conference on World Wide Web*, 2015, pp. 111–112.

[6] F. Strub and J. Mary, "Collaborative filtering in hybrid recommender systems with Autoencoders," in *Proceedings of the 9th ACM Conference on Recommender Systems (RecSys)*, 2015, pp. 1–8.

[7] A. Vaswani et al., "Attention is all you need," in *Advances in Neural Information Processing Systems (NeurIPS)*, 2017, pp. 5998–6008.

[8] J. Xiao, H. Ye, X. He, H. Zhang, H.-Y. Chua, and T.-S. Chua, "Attentional factorization machines: Learning the weight of feature interactions via attention networks," in *Proceedings of the 26th International Joint Conference on Artificial Intelligence (IJCAI)*, 2017, pp. 3119–3125.

[9] F. Strub, R. Gaudel, and J. Mary, "Hybrid collaborative filtering with Autoencoders," *arXiv preprint arXiv:1603.00806*, 2016.

[10] S. Zhang, L. Yao, A. Sun, and Y. Tay, "Deep learning based recommender system: A survey and new perspectives," *ACM Computing Surveys (CSUR)*, vol. 52, no. 1, pp. 1–38, 2019.

[11] T. Chen and C. Guestrin, "XGBoost: A scalable tree boosting system," in *Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, 2016, pp. 785–794.

[12] C. J. Burges, "From RankNet to LambdaRank to LambdaMART: An overview," Microsoft Research Technical Report MSR-TR-2010-82, 2010.

[13] Facebook Open Source, "React Native - A framework for building native apps using React," Documentation, 2026.

[14] Flask Project, "Flask Documentation (v3.0.x)," Pallets Projects, 2026.

[15] Supabase Inc., "Supabase - The Open Source Firebase Alternative," Developer Documentation, 2026.

[16] n8n.io, "n8n Documentation - Node-based workflow automation," n8n Community, 2026.

[17] Google AdMob, "AdMob SDK Integration Guide for Mobile Applications," Google Developer Documentation, 2026.

[18] Docker Inc., "Docker Containerization and Docker Compose Reference Guide," Docker Docs, 2026.

[19] Grand View Research, "Over-the-Top (OTT) Media Service Market Size, Share & Trends Analysis Report," Industry Report, 2025.

[20] Meta Platforms Inc., "Facebook Graph API and Webhooks Reference Documentation," Meta for Developers, 2026.

[21] Mermaid.js Community, "Mermaid - Generation of diagrams and flowcharts from text," Documentation, 2026.

[22] Google LLC, "Material Design 3 Specs - Guidelines for modern UI design," Material.io, 2024.

[23] McKinsey & Company, "Next in Personalization 2021 Report: The value of getting personalization right—or wrong—is multiplying," McKinsey Insights, 2021.

[24] T. Brown, *Design Thinking*, Harvard Business Review, 2008.

[25] E. Ries, *The Lean Startup: How Today's Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses*, Crown Business, 2011.

[26] A. Osterwalder and Y. Pigneur, *Business Model Generation: A Handbook for Visionaries, Game Changers, and Challengers*, John Wiley & Sons, 2010.

[27] A. Symeonidis et al., "MLOps: A survey on machine learning operations, practices, and challenges," *Journal of Systems and Software*, vol. 182, p. 111060, 2022.

[28] Z. Wu, S. Pan, F. Chen, G. Long, C. Zhang, and S. Y. Philip, "A comprehensive survey on graph neural networks," *IEEE Transactions on Neural Networks and Learning Systems*, vol. 32, no. 1, pp. 4–24, 2020.

[29] World Wide Web Consortium (W3C), "Encrypted Media Extensions (EME) - W3C Recommendation," W3C Standards, 2017.
