import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  EyeOff,
  Scale,
  HeartPulse,
  Coins,
  AlertTriangle,
  Lock,
  CheckCircle2,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  ArrowRight,
  HelpCircle,
  Mail,
  Zap,
} from 'lucide-react';

export const PolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'privacy' | 'fairplay' | 'health' | 'economy'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const policySections = [
    {
      id: 'privacy',
      category: 'privacy',
      tag: 'BẢO MẬT & QUYỀN RIÊNG TƯ',
      title: 'Chính sách Quyền riêng tư & Dữ liệu Camera (Privacy First)',
      badgeColor: '#00E5FF',
      icon: EyeOff,
      summary: 'Cam kết xử lý cục bộ 100% hình ảnh camera trên thiết bị (Edge AI), không bao giờ tải video riêng tư của bạn lên đám mây.',
      points: [
        {
          title: 'Không lưu trữ video / hình ảnh gốc',
          desc: 'Toàn bộ quá trình nhận diện thị giác máy tính (AI Pose Tracking) được xử lý trực tiếp trên chip thiết bị người dùng (On-device / Edge processing). Khung hình camera bị hủy lập tức trong RAM ngay sau khi AI tính toán xong tọa độ mà không hề lưu vào ổ cứng hay máy chủ.',
          highlight: 'Zero Video Upload — 100% Xử lý tại biên',
        },
        {
          title: 'Thu thập dữ liệu tối thiểu (Minimalist Data Footprint)',
          desc: 'Hệ thống chỉ trích xuất và gửi tọa độ khung xương (33 điểm Landmark dạng số: x, y, z và độ tin cậy) lên máy chủ để tính góc độ khớp và đếm rep thi đấu. Dữ liệu số này hoàn toàn không thể tái dựng lại khuôn mặt hay không gian riêng tư xung quanh bạn.',
          highlight: 'Chỉ truyền 33 tọa độ số học — Đảm bảo 100% riêng tư tại gia đình',
        },
      ],
      extraInfo: {
        title: 'Quy trình xử lý dữ liệu Camera an toàn:',
        steps: [
          'Camera thu nhận khung hình thực tế trong phòng',
          'MediaPipe Edge AI phân tích cục bộ trên RAM thiết bị',
          'Trích xuất 33 điểm Landmark dạng số thuần túy',
          'Khung hình gốc lập tức bị xóa khỏi bộ nhớ RAM (0 byte tồn đọng)',
          'Gửi 33 điểm số học lên Server để tính góc gập (ROM) & đếm Rep',
        ],
      },
    },
    {
      id: 'fairplay',
      category: 'fairplay',
      tag: 'CÔNG BẰNG & MINH BẠCH',
      title: 'Chính sách Chống gian lận & Thi đấu Công bằng (Fair Play)',
      badgeColor: '#FF6B35',
      icon: Scale,
      summary: 'Thiết lập đấu trường PvP minh bạch với trọng tài AI xác thực biên độ chuyển động và chống phát lại video giả lập.',
      points: [
        {
          title: 'Xác thực chuyển động thực (ROM & Biomechanics Verification)',
          desc: 'Thuật toán AI phân tích toàn diện biên độ chuyển động (ROM - Range of Motion), gia tốc khớp và chu kỳ vận động sinh học. Các động tác "ăn gian" biên độ (như hạ người nửa chừng, nhấp lưng thay vì gập khuỷu tay) sẽ bị tính là Không Hợp Lệ (No Rep) ngay lập tức.',
          highlight: 'Thuật toán Joint-Angle AI kiểm soát từng milimet chuyển động',
        },
        {
          title: 'Phát hiện video phát lại & giả lập (Anti-Replay / Anti-Spoofing)',
          desc: 'Hệ thống tự động kiểm tra độ sâu hình ảnh, tần số quét khung hình, micro-jitter và nhịp sinh học ngẫu nhiên trong trận đấu 1v1 để ngăn chặn hành vi chiếu video có sẵn trước camera hoặc sử dụng phần mềm webcam ảo.',
          highlight: 'Bảo vệ kết quả trận đấu 1v1 chống lại video phát lại',
        },
        {
          title: 'Quy chế xử phạt vi phạm nghiêm ngặt',
          desc: 'Mọi tài khoản cố tình gian lận hoặc can thiệp dữ liệu sẽ bị: (1) Hủy ngay kết quả trận đấu, (2) Reset toàn bộ điểm Rank xếp hạng mùa giải về 0, và (3) Khóa vĩnh viễn quyền nhận quà và đổi voucher từ hệ thống Battle Pass.',
          highlight: 'Xử phạt nghiêm khắc: Reset Rank + Khóa quyền đổi thưởng',
        },
      ],
      extraInfo: {
        title: 'Các cấp độ xử lý vi phạm Fair Play:',
        steps: [
          'Mức 1: Cảnh cáo & tính No Rep cho các động tác sai tư thế hoặc biên độ',
          'Mức 2: Tự động xử thua trận đấu nếu phát hiện thay đổi người tập giữa chừng',
          'Mức 3: Khóa ghép trận PvP 24h - 72h đối với tài khoản nghi vấn can thiệp tín hiệu',
          'Mức 4: Tước quyền tham gia bảng xếp hạng mùa giải và thu hồi quà thưởng liên quan',
        ],
      },
    },
    {
      id: 'health',
      category: 'health',
      tag: 'AN TOÀN & SỨC KHỎE',
      title: 'Chính sách Miễn trừ Trách nhiệm Y tế (Health Disclaimer)',
      badgeColor: '#2ED573',
      icon: HeartPulse,
      summary: 'Ứng dụng đóng vai trò đồng hành và tạo động lực tập luyện, không thay thế cho chẩn đoán hay phác đồ y khoa.',
      points: [
        {
          title: 'Hỗ trợ tập luyện, không thay thế y bác sĩ',
          desc: 'Nền tảng Fitness Battle đóng vai trò tạo động lực, hướng dẫn chuyển động và theo dõi số lần lặp lại. Hệ thống không đưa ra phác đồ điều trị y tế, không kê đơn vận động trị liệu và không thay thế cho bác sĩ chuyên khoa hoặc chuyên gia phục hồi chức năng.',
          highlight: 'Công cụ thể thao giải trí — Không phải thiết bị điều trị y tế',
        },
        {
          title: 'Khuyến cáo và trách nhiệm người dùng',
          desc: 'Người dùng có tiền sử bệnh lý tim mạch, huyết áp, tổn thương xương khớp hoặc các thể trạng đặc biệt khác phải tự đánh giá và chịu trách nhiệm đối với cường độ bài tập mình tham gia. Luôn khởi động kỹ lưỡng và dừng lại ngay lập tức nếu cảm thấy choáng váng hoặc đau nhức bất thường.',
          highlight: 'Tự lượng sức mình — Khởi động kỹ và lắng nghe cơ thể',
        },
      ],
      extraInfo: {
        title: 'Lời khuyên an toàn từ ban huấn luyện:',
        steps: [
          'Lựa chọn đúng trình độ thể lực (Tân thủ / Trung cấp / Pro) trong mục Cá nhân',
          'Đảm bảo không gian xung quanh bằng phẳng, đủ ánh sáng và không có vật cản',
          'Uống đủ nước trước, trong và sau mỗi trận đấu thể lực',
          'Tham vấn ý kiến bác sĩ chuyên khoa nếu bạn có tiền sử bệnh lý nền',
        ],
      },
    },
    {
      id: 'economy',
      category: 'economy',
      tag: 'KINH TẾ & PHẦN THƯỞNG',
      title: 'Chính sách Tiền tệ & Đổi thưởng (Battle Pass & Voucher)',
      badgeColor: '#FFD700',
      icon: Coins,
      summary: 'Quy định minh bạch về điểm thưởng, xu số và cơ chế đổi voucher quà tặng từ các đối tác liên kết uy tín.',
      points: [
        {
          title: 'Không quy đổi thành tiền mặt (Non-Cashable Reward System)',
          desc: 'Xu thưởng (Coins), Ruby và điểm Battle Pass tích lũy chỉ được sử dụng để mở khóa các tính năng, vật phẩm thời trang avatar trong ứng dụng và đổi voucher ưu đãi từ các nhãn hàng đối tác liên kết (Ẩm thực, Đồ thể thao, Phòng gym...). Tuyệt đối không có chức năng rút hoặc quy đổi thành tiền mặt.',
          highlight: 'Điểm thưởng dùng mở khóa tính năng & voucher thương hiệu',
        },
        {
          title: 'Quy tắc 1 tài khoản / 1 thiết bị (Anti-Sybil Device Binding)',
          desc: 'Nhằm ngăn chặn hành vi tạo nhiều tài khoản ảo (clone / bot / giả lập) để trục lợi mã giảm giá và tài nguyên của đối tác tài trợ, mỗi thiết bị chỉ được liên kết với một định danh tích điểm hợp lệ trong mỗi chu kỳ ưu đãi.',
          highlight: 'Bảo vệ giá trị voucher thực tế cho người tập chân chính',
        },
      ],
      extraInfo: {
        title: 'Quy trình nhận & sử dụng Voucher đối tác:',
        steps: [
          'Hoàn thành thử thách hàng ngày và leo cấp Battle Pass bằng mồ hôi thực tế',
          'Vào Cửa Hàng / Voucher để đổi mã ưu đãi của các thương hiệu đối tác',
          'Mã QR / Voucher có thời hạn sử dụng rõ ràng và kèm hướng dẫn tại điểm áp dụng',
          'Mỗi tài khoản được đổi số lượng giới hạn theo hạn mức từng mùa giải',
        ],
      },
    },
  ];

  const faqs = [
    {
      q: 'Dữ liệu hình ảnh camera của tôi có bị truyền ra bên ngoài máy chủ không?',
      a: 'Hoàn toàn KHÔNG. Toàn bộ quá trình quét khung xương bằng thị giác máy tính AI diễn ra trực tiếp trên điện thoại/máy tính của bạn (Edge AI). Khung hình video bị hủy bỏ ngay trong RAM sau khi AI tính toán xong và chỉ có 33 con số tọa độ khớp được gửi lên máy chủ.',
    },
    {
      q: 'Tại sao động tác của tôi bị AI báo "No Rep" (Không tính điểm)?',
      a: 'AI Trọng tài chấm điểm dựa trên Range of Motion (Biên độ chuyển động chuẩn). Ví dụ với Hít đất (Push-up), góc khuỷu tay phải đạt ≤90° ở điểm thấp nhất và cánh tay phải duỗi thẳng ở đỉnh chuyển động. Nếu bạn nhấp lưng hoặc không xuống đủ sâu, AI sẽ không tính rep đó.',
    },
    {
      q: 'Tôi có thể dùng nhiều tài khoản trên cùng 1 máy để cày voucher không?',
      a: 'Không. Để đảm bảo công bằng cho đối tác tài trợ và cộng đồng, hệ thống kích hoạt cơ chế nhận diện định danh thiết bị độc bản. Việc cày tài khoản clone sẽ bị khóa tính năng đổi voucher.',
    },
    {
      q: 'Tôi có thể quy đổi Xu hoặc Ruby trong ứng dụng ra tiền mặt được không?',
      a: 'Không. Điểm thưởng và xu trong Fitness Battle được thiết kế nhằm mục đích khích lệ rèn luyện sức khỏe thể chất, chỉ dùng để đổi vật phẩm ảo và voucher ưu đãi dịch vụ từ các đối tác chính hãng.',
    },
    {
      q: 'Nếu gặp sự cố sức khỏe trong lúc tập thì tôi cần làm gì?',
      a: 'Hãy lập tức dừng bài tập, ngồi nghỉ tại nơi thoáng khí và bổ sung nước. Bạn hãy tham khảo ý kiến chuyên gia y tế trước khi tiếp tục các bài tập cường độ cao.',
    },
  ];

  const filteredSections = policySections.filter((section) => {
    const matchCategory = activeTab === 'all' || section.category === activeTab;
    const matchSearch =
      searchQuery === '' ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.points.some(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchCategory && matchSearch;
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090A14',
        color: '#FFFFFF',
        padding: '50px 20px 100px',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Background Decorative Glows */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '20%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0, 229, 255, 0.08) 0%, rgba(9, 10, 20, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30%',
          right: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, rgba(9, 10, 20, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* ── HEADER BANNER ───────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 18px',
              borderRadius: 30,
              background: 'rgba(0, 229, 255, 0.12)',
              border: '1px solid rgba(0, 229, 255, 0.4)',
              color: '#00E5FF',
              fontSize: 12.5,
              fontWeight: 800,
              marginBottom: 20,
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.25)',
            }}
          >
            <ShieldCheck size={16} />
            <span>FITNESS BATTLE • MINH BẠCH & BẢO MẬT TUYỆT ĐỐI</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(28px, 4.5vw, 50px)',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-1px',
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            Chính Sách & Quy Định{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00E5FF 0%, #FF6B35 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Vận Hành Nền Tảng
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(14px, 1.6vw, 17px)',
              color: '#B0B0C3',
              maxWidth: 760,
              margin: '0 auto 28px',
              lineHeight: 1.6,
            }}
          >
            Bộ quy chuẩn bảo vệ quyền riêng tư người dùng khi tập luyện tại nhà, quy chế trọng tài AI
            chống gian lận và chính sách đổi thưởng minh bạch của hệ sinh thái Fitness Battle.
          </p>

          {/* Trust Highlights Badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 32,
            }}
          >
            {[
              { icon: Lock, label: 'Edge AI: Không tải video lên mạng', color: '#00E5FF' },
              { icon: Scale, label: 'AI ROM: Trọng tài chuẩn hóa', color: '#FF6B35' },
              { icon: HeartPulse, label: 'Health Disclaimer: An toàn thể chất', color: '#2ED573' },
              { icon: Coins, label: 'Kinh tế 100% minh bạch', color: '#FFD700' },
            ].map((b, i) => {
              const BIcon = b.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${b.color}40`,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: b.color,
                  }}
                >
                  <BIcon size={15} />
                  <span>{b.label}</span>
                </div>
              );
            })}
          </div>

          {/* Search & Filter Controls */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              maxWidth: 800,
              margin: '0 auto',
            }}
          >
            {/* Search Box */}
            <div
              style={{
                width: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search
                size={18}
                color="#8E94A5"
                style={{ position: 'absolute', left: 16, pointerEvents: 'none' }}
              />
              <input
                type="text"
                placeholder="Tìm kiếm nội dung chính sách (vd: camera, no rep, voucher, riêng tư)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: 14,
                  background: 'rgba(20, 20, 40, 0.9)',
                  border: '1px solid rgba(255, 107, 53, 0.3)',
                  color: '#FFFFFF',
                  fontSize: 14,
                  outline: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 14,
                    background: 'transparent',
                    border: 'none',
                    color: '#8E94A5',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Xóa lọc
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
              }}
            >
              {[
                { id: 'all', label: 'Tất Cả Chính Sách', icon: FileText },
                { id: 'privacy', label: 'Dữ Liệu Camera & Riêng Tư', icon: EyeOff },
                { id: 'fairplay', label: 'Chống Gian Lận (Fair Play)', icon: Scale },
                { id: 'health', label: 'Miễn Trừ Y Tế', icon: HeartPulse },
                { id: 'economy', label: 'Tiền Tệ & Đổi Thưởng', icon: Coins },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '9px 16px',
                      borderRadius: 12,
                      background: isSelected
                        ? 'linear-gradient(135deg, #FF6B35, #FF4757)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected ? '1px solid #FF6B35' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: isSelected ? '#FFFFFF' : '#B0B0C3',
                      fontSize: 13,
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <TabIcon size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 4 MAIN POLICY SECTIONS ──────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36, marginBottom: 60 }}>
          {filteredSections.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'rgba(20, 20, 40, 0.6)',
                borderRadius: 20,
                border: '1px dashed rgba(255, 255, 255, 0.2)',
              }}
            >
              <AlertTriangle size={40} color="#FFA502" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: 18, fontWeight: 700 }}>Không tìm thấy chính sách phù hợp</div>
              <p style={{ fontSize: 14, color: '#8E94A5', marginTop: 6 }}>
                Vui lòng thử từ khóa khác hoặc bấm nút bên dưới để xem toàn bộ.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
                style={{
                  marginTop: 16,
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: '#FF6B35',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Xem tất cả chính sách
              </button>
            </div>
          ) : (
            filteredSections.map((sec) => {
              const SecIcon = sec.icon;
              return (
                <div
                  key={sec.id}
                  id={sec.id}
                  style={{
                    background: 'rgba(15, 15, 32, 0.95)',
                    border: `1px solid ${sec.badgeColor}40`,
                    borderRadius: 24,
                    padding: '32px 28px',
                    boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${sec.badgeColor}12`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Section Title & Header */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      marginBottom: 20,
                      paddingBottom: 16,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          background: `${sec.badgeColor}20`,
                          border: `1px solid ${sec.badgeColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: sec.badgeColor,
                        }}
                      >
                        <SecIcon size={26} />
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 900,
                            letterSpacing: '1px',
                            color: sec.badgeColor,
                            textTransform: 'uppercase',
                          }}
                        >
                          {sec.tag}
                        </span>
                        <h2
                          style={{
                            fontSize: 'clamp(18px, 2.2vw, 24px)',
                            fontWeight: 800,
                            color: '#FFFFFF',
                            marginTop: 2,
                          }}
                        >
                          {sec.title}
                        </h2>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '5px 12px',
                        borderRadius: 20,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#8E94A5',
                      }}
                    >
                      Hiệu lực: Mùa giải 2026
                    </div>
                  </div>

                  {/* Summary Callout */}
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: 14,
                      background: `${sec.badgeColor}0F`,
                      borderLeft: `4px solid ${sec.badgeColor}`,
                      color: '#E0E0F0',
                      fontSize: 14,
                      lineHeight: 1.6,
                      marginBottom: 24,
                    }}
                  >
                    <strong>Tóm tắt cam kết:</strong> {sec.summary}
                  </div>

                  {/* Main Points Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                      gap: 20,
                      marginBottom: 24,
                    }}
                  >
                    {sec.points.map((p, pIdx) => (
                      <div
                        key={pIdx}
                        style={{
                          background: 'rgba(25, 25, 50, 0.6)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: 16,
                          padding: 20,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              marginBottom: 10,
                            }}
                          >
                            <CheckCircle2 size={18} color={sec.badgeColor} />
                            <span
                              style={{
                                fontSize: 16,
                                fontWeight: 800,
                                color: '#FFFFFF',
                              }}
                            >
                              {p.title}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: 13.5,
                              color: '#B0B0C3',
                              lineHeight: 1.65,
                              marginBottom: 14,
                            }}
                          >
                            {p.desc}
                          </p>
                        </div>

                        <div
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            background: 'rgba(0, 0, 0, 0.35)',
                            border: `1px dashed ${sec.badgeColor}50`,
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: sec.badgeColor,
                          }}
                        >
                          📌 {p.highlight}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Extra Technical / Operational Breakdown */}
                  {sec.extraInfo && (
                    <div
                      style={{
                        background: 'rgba(10, 10, 24, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: 14,
                        padding: '16px 20px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 800,
                          color: '#FFFFFF',
                          marginBottom: 10,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Zap size={14} color={sec.badgeColor} />
                        <span>{sec.extraInfo.title}</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                          gap: 8,
                        }}
                      >
                        {sec.extraInfo.steps.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 8,
                              fontSize: 12,
                              color: '#8E94A5',
                            }}
                          >
                            <span
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                background: `${sec.badgeColor}25`,
                                color: sec.badgeColor,
                                fontSize: 10,
                                fontWeight: 900,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginTop: 1,
                              }}
                            >
                              {sIdx + 1}
                            </span>
                            <span style={{ lineHeight: 1.45 }}>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── FAQ ACCORDION SECTION ───────────────────────────────── */}
        <div
          style={{
            background: 'rgba(18, 18, 38, 0.85)',
            border: '1px solid rgba(255, 107, 53, 0.25)',
            borderRadius: 24,
            padding: '36px 28px',
            marginBottom: 60,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 800,
                color: '#FFA502',
                marginBottom: 8,
              }}
            >
              <HelpCircle size={15} />
              <span>CÂU HỎI THƯỜNG GẶP</span>
            </div>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 800 }}>
              Giải Đáp Thắc Mắc Về Chính Sách
            </h2>
            <p style={{ fontSize: 13.5, color: '#8E94A5', maxWidth: 600, margin: '6px auto 0' }}>
              Những câu hỏi hội viên và giám khảo khởi nghiệp quan tâm nhiều nhất về cơ chế bảo mật và vận hành.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  style={{
                    borderRadius: 14,
                    background: isOpen ? 'rgba(255, 107, 53, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: isOpen
                      ? '1px solid rgba(255, 107, 53, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 700, color: isOpen ? '#FF8E53' : '#FFFFFF' }}>
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={20} color="#FF8E53" />
                    ) : (
                      <ChevronDown size={20} color="#8E94A5" />
                    )}
                  </div>
                  {isOpen && (
                    <p
                      style={{
                        marginTop: 12,
                        fontSize: 13.5,
                        color: '#B0B0C3',
                        lineHeight: 1.6,
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        paddingTop: 10,
                      }}
                    >
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BAN QUẢN TRỊ & HỖ TRỢ PHÁP LÝ / KHIẾU NẠI ──────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(83, 82, 237, 0.15))',
            border: '1px solid rgba(255, 107, 53, 0.35)',
            borderRadius: 24,
            padding: '36px 28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#FF8E53', marginBottom: 6 }}>
              TRUNG TÂM KHIẾU NẠI & HỖ TRỢ THÀNH VIÊN
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
              Bạn Cần Hỗ Trợ Hoặc Khiếu Nại Kết Quả Trọng Tài AI?
            </h3>
            <p style={{ fontSize: 13.5, color: '#B0B0C3', lineHeight: 1.6 }}>
              Ban phát triển dự án Fitness Battle luôn lắng nghe mọi phản hồi của cộng đồng để liên tục cải tiến
              độ nhạy thuật toán Vision và bảo đảm tối đa lợi ích của người dùng.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FFFFFF' }}>
                <Mail size={16} color="#00E5FF" />
                <span>legal@fitnessbattle.vn</span>
              </div>
              <div style={{ color: '#8E94A5' }}>•</div>
              <div style={{ color: '#2ED573', fontWeight: 700 }}>
                Hỗ trợ 24/7 trong mùa giải
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
            <button
              onClick={() => navigate('/demo')}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FF6B35, #FF4757)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)',
              }}
            >
              <span>Trải Nghiệm AI Trọng Tài</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => navigate('/ai-tech')}
              style={{
                padding: '11px 20px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span>Xem Sơ Đồ AI Deep Tech</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
