const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlViewerPath = path.join(__dirname, '..', 'FitnessBattle_Demo_MVP_Player.html');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('🚀 Khởi động Chrome Mobile Recording (Độ nét cao)...');
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=430,932',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // Inject Subtitle Banner overlay on every page load automatically
  await page.evaluateOnNewDocument(() => {
    function ensureOverlay() {
      if (document.getElementById('demo-voiceover-overlay')) return;
      const overlay = document.createElement('div');
      overlay.id = 'demo-voiceover-overlay';
      overlay.style.position = 'fixed';
      overlay.style.bottom = '16px';
      overlay.style.left = '12px';
      overlay.style.right = '12px';
      overlay.style.zIndex = '9999999';
      overlay.style.padding = '12px 14px';
      overlay.style.borderRadius = '16px';
      overlay.style.background = 'rgba(15, 23, 42, 0.95)';
      overlay.style.border = '1.5px solid #FF6B35';
      overlay.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(255, 107, 53, 0.4)';
      overlay.style.backdropFilter = 'blur(16px)';
      overlay.style.color = '#FFFFFF';
      overlay.style.fontFamily = 'Inter, -apple-system, sans-serif';
      overlay.style.pointerEvents = 'none';

      overlay.innerHTML = `
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:3px;">
          <span style="font-size:14px;">🎙️</span>
          <span style="font-size:10.5px; font-weight:800; color:#FF8E53; text-transform:uppercase; letter-spacing:0.5px;">LỜI THOẠI THUYẾT MINH DEMO</span>
          <span id="demo-timer" style="margin-left:auto; font-size:10px; font-weight:700; color:#A29BFE; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:6px;">00:00</span>
        </div>
        <div id="demo-sub-text" style="font-size:12px; font-weight:600; line-height:1.45; color:#F1F2F6;">
          Khởi động hệ thống Fitness Battle...
        </div>
      `;

      if (document.body) {
        document.body.appendChild(overlay);
      } else {
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(overlay));
      }
    }

    window.updateSubtitle = (text, timeStr) => {
      ensureOverlay();
      const subEl = document.getElementById('demo-sub-text');
      const timeEl = document.getElementById('demo-timer');
      if (subEl) subEl.innerHTML = text;
      if (timeEl) timeEl.innerText = timeStr;
    };

    ensureOverlay();
  });

  console.log('🌐 Đang kết nối tới http://localhost:5173/auth...');
  await page.goto('http://localhost:5173/auth', { waitUntil: 'networkidle2' });

  console.log('🎬 Bắt đầu thu thập khung hình chuẩn 45 giây...');

  const startTime = Date.now();
  const frames = [];

  // Start frame capture loop
  const captureInterval = setInterval(async () => {
    try {
      const buffer = await page.screenshot({ type: 'jpeg', quality: 80 });
      frames.push({ time: Date.now() - startTime, data: buffer });
    } catch (e) {}
  }, 120);

  // SCENE 1: (0s - 8s) Login & Fitness Level 1-Click
  await page.evaluate(() => window.updateSubtitle(
    "Chào mừng đến với Fitness Battle – Ứng dụng tập luyện và thi đấu thể lực ứng dụng Trí tuệ Nhân tạo.",
    "00:02"
  ));
  await sleep(2500);

  await page.evaluate(() => window.updateSubtitle(
    "Người dùng có thể dễ dàng khởi đầu với hồ sơ cá nhân hóa theo từng trình độ thể lực.",
    "00:05"
  ));
  await page.evaluate(() => window.scrollBy({ top: 160, behavior: 'smooth' }));
  await sleep(2000);

  // Click Login
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.click();
  });
  await sleep(2500);

  // SCENE 2: (8s - 18s) HomePage Exploration
  await page.evaluate(() => window.updateSubtitle(
    "Tại Trang chủ, toàn bộ chỉ số như Chuỗi Streak, Cấp độ thể lực, XP và Năng lượng Stamina đều được đồng bộ thời gian thực.",
    "00:10"
  ));
  await sleep(2000);

  await page.evaluate(() => window.scrollBy({ top: 220, behavior: 'smooth' }));
  await sleep(2500);

  await page.evaluate(() => window.updateSubtitle(
    "Các mục tiêu tập luyện hàng ngày và thử thách nhận thưởng được sắp xếp trực quan, khoa học.",
    "00:14"
  ));
  await page.evaluate(() => window.scrollBy({ top: -220, behavior: 'smooth' }));
  await sleep(2500);

  // SCENE 3: (18s - 30s) Exercise Track & Multi-Tier Level Library
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (let b of buttons) {
      if (b.innerText.includes('Xem tất cả')) { b.click(); break; }
    }
  });
  await sleep(2000);

  await page.evaluate(() => window.updateSubtitle(
    "Điểm đột phá là Hệ thống Kho Bài Tập Đa Tầng. Dễ dàng đổi cấp độ để AI tự động khớp bài tập vừa sức.",
    "00:20"
  ));
  await sleep(2500);

  // Open Level Modal
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (let b of buttons) {
      if (b.innerText.includes('Đổi Cấp Độ')) { b.click(); break; }
    }
  });
  await sleep(2500);

  // Select Beginner
  await page.evaluate(() => {
    const options = document.querySelectorAll('div');
    for (let d of options) {
      if (d.innerText.includes('Mới Tập / Chưa Từng Tập')) { d.click(); break; }
    }
  });
  await sleep(2000);

  await page.evaluate(() => window.updateSubtitle(
    "Chế độ Tân Thủ cung cấp các bài trợ lực (Hít đất tường, quỳ gối) với góc chấm nới lỏng để tránh chấn thương.",
    "00:26"
  ));
  await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
  await sleep(2500);

  // SCENE 4: (30s - 38s) Camera AI Vision Form Checking
  await page.evaluate(() => window.updateSubtitle(
    "Trọng tài AI Vision độc quyền tự động nhận diện khớp xương, khóa định danh duy nhất và đếm rep chuẩn 100%.",
    "00:32"
  ));

  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (let b of buttons) {
      if (b.innerText.includes('BẮT ĐẦU TẬP (CAMERA AI)')) { b.click(); break; }
    }
  });
  await sleep(3500);

  await page.evaluate(() => window.updateSubtitle(
    "Hệ thống phân tích góc độ sâu thời gian thực và ngăn chặn hoàn toàn gian lận đà giật.",
    "00:36"
  ));
  await sleep(3000);

  // SCENE 5: (38s - 45s) Battle Arena & Wrap up
  await page.goto('http://localhost:5173/battle', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.updateSubtitle(
    "Kết hợp cùng Đấu Trường 1v1 bùng nổ, Fitness Battle biến tập luyện thành trải nghiệm thể thao điện tử hấp dẫn!",
    "00:41"
  ));
  await sleep(4000);

  clearInterval(captureInterval);
  await browser.close();

  console.log(`📸 Đã thu thập ${frames.length} khung hình HD.`);
  console.log('🎞️ Đang xuất bản Video Demo Player Standalone...');

  // Take sampled frames
  const frameDataUrls = frames.map(f => `data:image/jpeg;base64,${f.data.toString('base64')}`);

  const playerHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Fitness Battle - Video Demo MVP (45 Giây)</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#080814; color:#fff; font-family:'Segoe UI',Roboto,Helvetica,sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; padding:16px; }
    .container { max-width:440px; width:100%; text-align:center; }
    h1 { font-size:21px; font-weight:900; color:#FF6B35; margin-bottom:4px; letter-spacing:0.5px; }
    p.sub { font-size:12.5px; color:#A29BFE; margin-bottom:14px; font-weight:600; }
    .phone-frame { width:100%; max-width:390px; height:780px; border-radius:40px; border:10px solid #1c1c38; box-shadow:0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(255,107,53,0.35); overflow:hidden; position:relative; background:#0F0F23; margin:0 auto; }
    #demo-img { width:100%; height:100%; object-fit:cover; display:block; }
    .controls { display:flex; align-items:center; gap:10px; margin-top:14px; background:#181832; padding:10px 16px; border-radius:14px; border:1px solid #28284e; }
    button { background:linear-gradient(135deg, #FF6B35, #FF4757); color:#fff; border:none; padding:8px 16px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:13px; }
    #time-display { font-size:13px; font-weight:bold; color:#2ED573; min-width:48px; }
    input[type=range] { flex:1; accent-color:#FF6B35; cursor:pointer; }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚡ FITNESS BATTLE - DEMO MVP</h1>
    <p class="sub">🎬 Trình Chiếu Demo Chuẩn 45 Giây (Kèm Lời Thoại Thuyết Minh)</p>
    <div class="phone-frame">
      <img id="demo-img" src="${frameDataUrls[0]}" alt="Demo Frame" />
    </div>
    <div class="controls">
      <button id="play-btn" onclick="togglePlay()">⏸ Tạm Dừng</button>
      <input type="range" id="seek-bar" min="0" max="${frameDataUrls.length - 1}" value="0" oninput="seek(this.value)">
      <span id="time-display">00:00</span>
    </div>
  </div>
  <script>
    const frames = ${JSON.stringify(frameDataUrls)};
    let currentIndex = 0;
    let isPlaying = true;
    const img = document.getElementById('demo-img');
    const seekBar = document.getElementById('seek-bar');
    const timeDisplay = document.getElementById('time-display');
    const playBtn = document.getElementById('play-btn');

    function update() {
      if (isPlaying && frames.length > 0) {
        currentIndex = (currentIndex + 1) % frames.length;
        img.src = frames[currentIndex];
        seekBar.value = currentIndex;
        const sec = Math.floor((currentIndex / frames.length) * 45);
        timeDisplay.innerText = '00:' + (sec < 10 ? '0' + sec : sec);
      }
    }
    const timer = setInterval(update, 120);

    function togglePlay() {
      isPlaying = !isPlaying;
      playBtn.innerText = isPlaying ? '⏸ Tạm Dừng' : '▶ Tiếp Tục';
    }
    function seek(val) {
      currentIndex = parseInt(val, 10);
      img.src = frames[currentIndex];
      const sec = Math.floor((currentIndex / frames.length) * 45);
      timeDisplay.innerText = '00:' + (sec < 10 ? '0' + sec : sec);
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(htmlViewerPath, playerHtml, 'utf8');
  console.log(`🎉 HOÀN THÀNH XUẤT BẢN DEMO MVP TẠI: ${htmlViewerPath}`);
}

run().catch(console.error);
