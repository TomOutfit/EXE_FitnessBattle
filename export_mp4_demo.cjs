const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_MP4 = path.join(__dirname, '..', 'FitnessBattle_Demo_MVP_45s.mp4');
const FRAMES_DIR = path.join(__dirname, 'temp_frames');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('🎬 Bắt đầu quy trình quay và xuất video Demo MVP 45s (.MP4)...');
  console.log(`📌 FFMPEG Path: ${ffmpegPath}`);
  console.log(`📌 Output MP4: ${OUTPUT_MP4}`);

  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

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
  
  // Mobile viewport 390x844 with scale factor 2 = 780x1688 (Retina crisp HD)
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // Inject Voiceover Overlay and subtitle controller
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
      overlay.style.padding = '12px 16px';
      overlay.style.borderRadius = '16px';
      overlay.style.background = 'rgba(11, 15, 29, 0.94)';
      overlay.style.border = '1.5px solid #FF6B35';
      overlay.style.boxShadow = '0 12px 35px rgba(0,0,0,0.85), 0 0 25px rgba(255, 107, 53, 0.45)';
      overlay.style.backdropFilter = 'blur(16px)';
      overlay.style.color = '#FFFFFF';
      overlay.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
      overlay.style.pointerEvents = 'none';

      overlay.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:linear-gradient(135deg, #FF6B35, #FF4757); font-size:12px;">🎙️</span>
          <span style="font-size:11px; font-weight:900; color:#FF8E53; text-transform:uppercase; letter-spacing:0.8px;">THUYẾT MINH DEMO MVP</span>
          <span id="demo-timer" style="margin-left:auto; font-size:11px; font-weight:800; color:#2ED573; background:rgba(46,213,115,0.15); border:1px solid rgba(46,213,115,0.4); padding:2px 8px; border-radius:8px;">00:00</span>
        </div>
        <div id="demo-sub-text" style="font-size:13px; font-weight:600; line-height:1.45; color:#F1F2F6;">
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

  console.log('🌐 Điều hướng tới ứng dụng http://localhost:5173/auth...');
  await page.goto('http://localhost:5173/auth', { waitUntil: 'networkidle2' });

  let frameCount = 0;
  let capturing = true;

  // Frame capture loop ~ 10 FPS (every 100ms)
  const captureLoop = async () => {
    while (capturing) {
      const frameNum = String(frameCount).padStart(5, '0');
      const frameFile = path.join(FRAMES_DIR, `frame_${frameNum}.jpg`);
      try {
        await page.screenshot({ path: frameFile, type: 'jpeg', quality: 85 });
        frameCount++;
      } catch (e) {}
      await sleep(100);
    }
  };

  const capturePromise = captureLoop();

  console.log('🎬 [00:00 - 00:06] CẢNH 1: Đăng nhập & Lựa chọn Cấp độ Thể lực...');
  await page.evaluate(() => window.updateSubtitle(
    "Chào mừng đến với Fitness Battle - Nền tảng thể thao điện tử thể hình thông minh!",
    "00:01"
  ));
  await sleep(2500);

  // Auto Quick Login
  try {
    const quickBtn = await page.$('button');
    if (quickBtn) await quickBtn.click();
  } catch (e) {}
  
  await page.evaluate(() => window.updateSubtitle(
    "Hệ thống phân cấp 3 trình độ: Tân Thủ, Trung Cấp và Lâu Năm giúp cá nhân hóa bài tập vừa sức.",
    "00:04"
  ));
  await sleep(3500);

  console.log('🏠 [00:06 - 00:15] CẢNH 2: Màn hình Home & Thể trạng người dùng...');
  await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.updateSubtitle(
    "Màn hình chính hiển thị tiến độ, streak luyện tập và huy hiệu cấp độ thể lực hiện tại.",
    "00:07"
  ));
  await sleep(3500);

  await page.evaluate(() => {
    window.scrollTo({ top: 300, behavior: 'smooth' });
    window.updateSubtitle(
      "Dễ dàng theo dõi mục tiêu calo, số rep hoàn thành và mở nhanh các bài tập cốt lõi.",
      "00:11"
    );
  });
  await sleep(4500);

  console.log('📚 [00:15 - 00:26] CẢNH 3: Kho Bài Tập Phân Loại & Lộ Trình Thăng Hạng...');
  await page.goto('http://localhost:5173/track', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.updateSubtitle(
    "Kho Bài Tập nâng cấp với bộ lọc biến thể đa dạng từ cơ bản (Chống tường, Quỳ gối) đến nâng cao.",
    "00:16"
  ));
  await sleep(3500);

  // Click on Roadmap tab if present
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const roadTab = tabs.find(b => b.innerText.includes('Lộ trình') || b.innerText.includes('Roadmap'));
    if (roadTab) roadTab.click();
    window.updateSubtitle(
      "Tab Lộ Trình Thăng Hạng vạch rõ các nấc thang phát triển thể lực từ 0 đến Master Calisthenics!",
      "00:20"
    );
  });
  await sleep(3500);

  // Switch back to Push-up tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const pushTab = tabs.find(b => b.innerText.includes('Hít đất') || b.innerText.includes('Push-up'));
    if (pushTab) pushTab.click();
    window.updateSubtitle(
      "Mỗi bài tập đều tích hợp hướng dẫn tiêu chuẩn góc khớp AI chi tiết và trực quan.",
      "00:24"
    );
  });
  await sleep(2500);

  console.log('🤖 [00:26 - 00:38] CẢNH 4: Trọng tài Camera AI Vision & Chống gian lận...');
  await page.goto('http://localhost:5173/exercise/pushups', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.updateSubtitle(
    "Trọng tài Camera AI Vision tự động nhận diện khung xương, đo góc khuỷu tay 90° và đếm Reps chuẩn xác.",
    "00:27"
  ));
  await sleep(4000);

  await page.evaluate(() => window.updateSubtitle(
    "Thuật toán Anti-Cheat phát hiện đà giật và cảnh báo sửa tư thế lưng thẳng tức thì theo thời gian thực!",
    "00:32"
  ));
  await sleep(4000);

  await page.evaluate(() => window.updateSubtitle(
    "Giao diện HUD thể thao điện tử hiện đại, hiển thị góc độ sâu và calo tiêu hao liên tục.",
    "00:36"
  ));
  await sleep(2500);

  console.log('⚔️ [00:38 - 00:45] CẢNH 5: Đấu Trường PvP 1v1 & Tổng kết...');
  await page.goto('http://localhost:5173/battle', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.updateSubtitle(
    "Đấu Trường 1v1 kịch tính ghép cặp thi đấu thời gian thực, biến luyện tập thành eSports đỉnh cao!",
    "00:39"
  ));
  await sleep(3500);

  await page.evaluate(() => window.updateSubtitle(
    "Fitness Battle - Tập luyện thông minh, Thăng hạng mỗi ngày! Trải nghiệm ngay trên Android & PC.",
    "00:43"
  ));
  await sleep(3000);

  capturing = false;
  await capturePromise;
  await browser.close();

  console.log(`✅ Đã thu thập tổng cộng ${frameCount} khung hình chất lượng cao.`);
  console.log(`🎬 Bắt đầu đóng gói MP4 bằng FFMPEG (H.264 / AAC 60fps / 10fps smooth rate)...`);

  // Render MP4 with FFMPEG
  await new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-framerate', '10',
      '-i', path.join(FRAMES_DIR, 'frame_%05d.jpg'),
      '-c:v', 'libx264',
      '-profile:v', 'high',
      '-level', '4.0',
      '-pix_fmt', 'yuv420p',
      '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
      '-preset', 'medium',
      '-crf', '20',
      OUTPUT_MP4
    ];

    const proc = spawn(ffmpegPath, args);

    proc.stderr.on('data', (data) => {
      // console.log(`FFMPEG: ${data}`);
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`🎉 XUẤT THÀNH CÔNG VIDEO MP4: ${OUTPUT_MP4}`);
        // Clean up temp frames to save disk space
        try {
          fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
        } catch (e) {}
        resolve();
      } else {
        reject(new Error(`FFMPEG exited with code ${code}`));
      }
    });
  });

  const stats = fs.statSync(OUTPUT_MP4);
  console.log(`📦 Kích thước file MP4: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

run().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
