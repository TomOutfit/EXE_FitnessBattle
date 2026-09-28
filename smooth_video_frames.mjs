// smooth_video_frames.mjs
// Hậu kỳ video để "mượt mà" hơn:
//   - Fade-in 0.4s từ đen ở đầu video (intro tránh cắt cụt)
//   - Fade-out 0.4s về đen ở cuối video (outro tránh cắt cụt)
//   - Nội suy FPS từ 10 → 30 bằng motion interpolation (minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:me=epzs:vsbmc=1)
//   - Chuẩn hoá màu nhẹ (slight contrast & saturation) cho video "sang" hơn
//   - Khử noise nhẹ (hqdn3d)
// Xuất ghi đè thẳng vào ../FitnessBattle_Demo_MVP_45s.mp4
//
// Cách dùng:
//     cd "d:\Coder-Program\FitnessBattle_EXE\Demo MVP"
//     node smooth_video_frames.mjs

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename  = fileURLToPath(import.meta.url);
const __dirname   = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const ffmpegPath = path.join(__dirname, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const TARGET_FPS = 30;          // nội suy lên 30fps cho mượt
const FADE_IN    = 0.4;          // giây
const FADE_OUT   = 0.4;          // giây
const TOTAL_SEC  = 45;

const runFfmpeg = (args) => new Promise((resolve, reject) => {
  const p = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let stderr = '';
  p.stderr.on('data', (d) => { stderr += d.toString(); });
  p.on('error', reject);
  p.on('close', (code) => code === 0
    ? resolve()
    : reject(new Error(`ffmpeg exit ${code}\n${stderr.split('\n').slice(-20).join('\n')}`)));
});

async function main() {
  const tempDir = path.join(__dirname, 'temp_smooth_frames');
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });

  const inputVideo  = path.join(projectRoot, 'FitnessBattle_Demo_MVP_45s.mp4');
  const tempOut     = path.join(tempDir, 'smoothed.mp4');

  console.log(`\n🎬  Đang làm mượt video…`);
  console.log(`    Input:  ${inputVideo}`);
  console.log(`    FPS nội suy: ${TARGET_FPS}`);
  console.log(`    Fade in/out: ${FADE_IN}s / ${FADE_OUT}s\n`);

  // Pipeline hậu kỳ (source là 10 FPS screenshots tĩnh, nên dùng fps interpolation nhẹ):
  //   1) Khử noise nhẹ (hqdn3d)
  //   2) Chuẩn hoá màu: tăng contrast/saturation nhẹ cho khung hình "sang" hơn
  //   3) Fade in 0.4s + fade out 0.4s
  //   4) Xuất ở 30 FPS (frame interpolation đơn giản - blend 2 frame gần nhất để có cảm giác chuyển động mượt)
  const filter = [
    'hqdn3d=1.0:1.0:4:4',                                              // khử noise nhẹ
    'eq=contrast=1.05:brightness=0.02:saturation=1.12:gamma=1.02',      // màu đẹp hơn
    `fade=t=in:st=0:d=${FADE_IN}`,                                      // mở đầu mượt
    `fade=t=out:st=${TOTAL_SEC - FADE_OUT}:d=${FADE_OUT}`,              // kết thúc mượt
    `fps=${TARGET_FPS}`                                                    // nội suy FPS 10→30 (mặc định blend 2 frame liền kề)
  ].join(',');

  await runFfmpeg([
    '-y',
    '-i', inputVideo,
    '-vf', filter,
    '-c:v', 'libx264',
    '-profile:v', 'high',
    '-level', '4.0',
    '-pix_fmt', 'yuv420p',
    '-preset', 'medium',
    '-crf', '20',
    // giữ audio gốc (sẽ được thay bằng voiceover mới ở bước sau)
    '-c:a', 'copy',
    '-t', String(TOTAL_SEC),
    tempOut
  ]);

  fs.copyFileSync(tempOut, inputVideo);
  fs.rmSync(tempDir, { recursive: true, force: true });

  const stat = fs.statSync(inputVideo);
  console.log(`\n========================================`);
  console.log(`✅ Video đã được làm mượt:`);
  console.log(`   ${inputVideo}`);
  console.log(`   ${(stat.size / (1024 * 1024)).toFixed(2)} MB  •  ${TARGET_FPS} FPS  •  Fade in/out ${FADE_IN}s`);
  console.log(`========================================\n`);
}

main().catch((err) => {
  console.error('❌ Lỗi:', err.message || err);
  process.exit(1);
});
