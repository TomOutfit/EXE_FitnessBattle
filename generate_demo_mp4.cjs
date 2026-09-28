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
  console.log('🚀 Bắt đầu ghi hình lại toàn bộ Demo MVP 45s (Độ phân giải cao 800x1720 Retina)...');
  
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
  
  // Set crisp mobile resolution: 400 x 860 with 2x scale = 800 x 1720
  await page.setViewport({
    width: 400,
    height: 860,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // Inject Subtitle Overlay & Helper
  await page.evaluateOnNewDocument(() => {
    function ensureOverlay() {
      let overlay = document.getElementById('demo-voiceover-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'demo-voiceover-overlay';
        overlay.style.position = 'fixed';
        overlay.style.bottom = '16px';
        overlay.style.left = '14px';
        overlay.style.right = '14px';
        overlay.style.zIndex = '9999999';
        overlay.style.padding = '12px 16px';
        overlay.style.borderRadius = '18px';
        overlay.style.background = 'rgba(10, 14, 28, 0.95)';
        overlay.style.border = '1.5px solid #FF6B35';
        overlay.style.boxShadow = '0 12px 35px rgba(0,0,0,0.85), 0 0 25px rgba(255, 107, 53, 0.4)';
        overlay.style.backdropFilter = 'blur(16px)';
        overlay.style.color = '#FFFFFF';
        overlay.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
        overlay.style.pointerEvents = 'none';

        overlay.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px;">
            <span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:linear-gradient(135deg, #FF6B35, #FF4757); font-size:12px;">🎙️</span>
            <span style="font-size:11px; font-weight:900; color:#FF8E53; text-transform:uppercase; letter-spacing:0.8px;">THUYẾT MINH DEMO MVP</span>
            <span id="demo-timer" style="margin-left:auto; font-size:11px; font-weight:800; color:#2ED573; background:rgba(46,213,115,0.15); border:1px solid rgba(46,213,115,0.4); padding:2px 8px; border-radius:8px;">00:00</span>
          </div>
          <div id="demo-sub-text" style="font-size:12.5px; font-weight:600; line-height:1.45; color:#F1F2F6;">
            Khởi động hệ thống Fitness Battle...
          </div>
        `;
        if (document.body) document.body.appendChild(overlay);
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

  let currentFrame = 0;
  const FPS = 10; // 10 frames per second
  const TOTAL_SECONDS = 45;

  async function captureFrames(count, subText, secStart, interactionFn) {
    for (let i = 0; i < count; i++) {
      const currentSec = secStart + (i / FPS);
      const secInt = Math.floor(currentSec);
      const timeStr = '00:' + (secInt < 10 ? '0' + secInt : secInt);
      
      await page.evaluate((text, tStr) => {
        if (window.updateSubtitle) window.updateSubtitle(text, tStr);
      }, subText, timeStr);

      if (interactionFn) {
        await interactionFn(i, count);
      }

      const frameNum = String(currentFrame).padStart(5, '0');
      const filePath = path.join(FRAMES_DIR, `frame_${frameNum}.jpg`);
      await page.screenshot({ path: filePath, type: 'jpeg', quality: 90 });
      currentFrame++;
    }
  }

  console.log('🎬 Bắt đầu ghi hình tuần tự 5 phân cảnh theo chuẩn kịch bản 45s...');

  // ==========================================
  // SCENE 1: 0s - 6s (60 frames) -> AUTH & FITNESS LEVEL SELECTION
  // ==========================================
  console.log('📍 [00:00 - 00:06] CẢNH 1: Đăng nhập & Cá nhân hóa Cấp độ...');
  await page.goto('http://localhost:5173/auth', { waitUntil: 'networkidle2' });
  
  await captureFrames(30, "Chào mừng đến với Fitness Battle! Nền tảng thể thao điện tử thể hình thông minh.", 0);
  
  // Click choose level
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const targetBtn = btns.find(b => b.innerText.includes('Trung cấp') || b.innerText.includes('Tập luyện') || b.innerText.includes('Bắt đầu') || b.innerText.includes('Đăng nhập'));
    if (targetBtn) targetBtn.click();
  });
  await captureFrames(30, "Hệ thống tự động cá nhân hóa 3 cấp độ: Tân Thủ, Trung Cấp và Lâu Năm.", 3);

  // ==========================================
  // SCENE 2: 6s - 15s (90 frames) -> HOME & OVERVIEW
  // ==========================================
  console.log('📍 [00:06 - 00:15] CẢNH 2: Màn hình Home & Thể trạng...');
  await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle2' });
  await captureFrames(45, "Màn hình chính hiển thị trực quan Streak luyện tập, calo đốt cháy và huy hiệu thể lực.", 6);
  
  // Smooth scroll down
  await captureFrames(45, "Người dùng dễ dàng theo dõi mục tiêu reps hàng ngày và vào thẳng các chế độ tập.", 10.5, async (i, total) => {
    const scrollAmount = Math.round((i / total) * 320);
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'auto' }), scrollAmount);
  });

  // ==========================================
  // SCENE 3: 15s - 26s (110 frames) -> EXERCISE LIBRARY & ROADMAP
  // ==========================================
  console.log('📍 [00:15 - 00:26] CẢNH 3: Kho Bài Tập & Lộ Trình Thăng Hạng...');
  await page.goto('http://localhost:5173/track', { waitUntil: 'networkidle2' });
  await captureFrames(35, "Kho Bài Tập phân tầng theo 3 cấp độ thể lực: từ Chống tường, Quỳ gối đến Tiêu chuẩn.", 15);

  // Switch to Roadmap Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const roadTab = tabs.find(b => b.innerText.includes('Lộ trình') || b.innerText.includes('Roadmap'));
    if (roadTab) roadTab.click();
  });
  await captureFrames(40, "Tab Lộ Trình Thăng Hạng vạch rõ các nấc thang phát triển từ 0 đến Master Calisthenics!", 18.5);

  // Switch back to Push-ups
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const pushTab = tabs.find(b => b.innerText.includes('Hít đất') || b.innerText.includes('Push-up'));
    if (pushTab) pushTab.click();
  });
  await captureFrames(35, "Mỗi bài tập đều tích hợp hướng dẫn tiêu chuẩn góc khớp AI chi tiết và trực quan.", 22.5);

  // ==========================================
  // SCENE 4: 26s - 38s (120 frames) -> AI CAMERA VISION
  // ==========================================
  console.log('📍 [00:26 - 00:38] CẢNH 4: Trọng tài Camera AI Vision & Chống gian lận...');
  await page.goto('http://localhost:5173/exercise/pushups', { waitUntil: 'networkidle2' });
  await captureFrames(40, "Trọng tài Camera AI Vision nhận diện khung xương thời gian thực và đo góc khuỷu tay 90°.", 26);

  await captureFrames(40, "Thuật toán Anti-Cheat phát phát hiện đà giật, cảnh báo sửa tư thế chuẩn xác ngay lập tức!", 30);

  await captureFrames(40, "Giao diện HUD thể thao điện tử hiện đại, đếm Reps và ghi nhận calo tiêu hao liên tục.", 34);

  // ==========================================
  // SCENE 5: 38s - 45s (70 frames) -> 1V1 BATTLE ARENA & SUMMARY
  // ==========================================
  console.log('📍 [00:38 - 00:45] CẢNH 5: Đấu Trường PvP 1v1 & Tổng kết...');
  await page.goto('http://localhost:5173/battle', { waitUntil: 'networkidle2' });
  await captureFrames(35, "Đấu Trường 1v1 ghép cặp thời gian thực, biến việc rèn luyện thành eSports đỉnh cao!", 38);

  await captureFrames(35, "Fitness Battle - Tập luyện thông minh, Thăng hạng mỗi ngày! Bản phát hành v1.0.4.", 41.5);

  await browser.close();
  console.log(`✅ Đã thu thập thành công ${currentFrame} khung hình chất lượng cao.`);

  // ==========================================
  // FFMPEG ENCODING TO MP4 (Pure Video Stream)
  // ==========================================
  console.log(`🎞️ Đang xuất video MP4 sắc nét (H.264 High Profile, CRF 18)...`);

  await new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-r', String(FPS),
      '-i', path.join(FRAMES_DIR, 'frame_%05d.jpg'),
      '-c:v', 'libx264',
      '-profile:v', 'high',
      '-level', '4.0',
      '-pix_fmt', 'yuv420p',
      '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
      '-preset', 'medium',
      '-crf', '18',
      OUTPUT_MP4
    ];

    const proc = spawn(ffmpegPath, args);
    proc.stderr.on('data', () => {});
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFMPEG failed with exit code ${code}`));
      }
    });
  });

  const stats = fs.statSync(OUTPUT_MP4);
  console.log(`🎉 XUẤT VIDEO GỐC THÀNH CÔNG!`);
  console.log(`📁 File MP4: ${OUTPUT_MP4}`);
  console.log(`📦 Kích thước: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

  // Clean up frames
  try {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  } catch (e) {}
}

run().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
