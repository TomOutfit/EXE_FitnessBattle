// generate_voiceover_natural.mjs
// Microsoft Edge TTS - vi-VN-NamMinhNeural với lời đọc tự nhiên + audio pipeline mượt mà.
// Xuất ra:
//   - ../FitnessBattle_Voiceover_45s.mp3  (file rời, EBU R128 -16 LUFS)
//   - Ghi đè thẳng audio vào ../FitnessBattle_Demo_MVP_45s.mp4
//
// Cách dùng (PowerShell):
//     cd "d:\Coder-Program\FitnessBattle_EXE\Demo MVP"
//     node generate_voiceover_natural.mjs

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts/dist/index.js';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename  = fileURLToPath(import.meta.url);
const __dirname   = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const ffmpegPath = path.join(__dirname, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');

// ---------- Cấu hình giọng ----------
const VOICE       = 'vi-VN-NamMinhNeural';   // nam, neural, phát âm chuẩn
const RATE        = '-8%';                   // chậm vừa đủ → câu có trọng lượng, rõ chữ
const PITCH       = '-1Hz';                  // trầm ấm hơn → bớt "mỏng", tự nhiên hơn
const VOLUME      = '+0%';
const TIMELINE    = 45;
const MASTER_KBPS = 192;

// ---------- Kịch bản 12 câu (đã viết lại: giọng đọc tự nhiên, ngắn gọn, dễ nghe) ----------
const voiceLines = [
  { startSec:  0.0, endSec:  3.0, text: 'Xin chào! Đây là Fitness Battle — nền tảng thể thao điện tử dành cho người tập thể hình.',                       id: 'scene1_1' },
  { startSec:  3.0, endSec:  6.0, text: 'Hệ thống sẽ tự cá nhân hoá ba cấp độ: Tân thủ, Trung cấp, hoặc Lâu năm.',                                            id: 'scene1_2' },
  { startSec:  6.0, endSec: 10.5, text: 'Màn hình chính hiển thị rõ chuỗi ngày tập, lượng calo đốt, và huy hiệu thể lực của bạn.',                              id: 'scene2_1' },
  { startSec: 10.5, endSec: 15.0, text: 'Bạn dễ dàng theo dõi mục tiêu số lần tập mỗi ngày và bắt đầu tập chỉ bằng một chạm.',                                  id: 'scene2_2' },
  { startSec: 15.0, endSec: 18.5, text: 'Kho bài tập được chia thành ba cấp: từ chống tường, quỳ gối, cho đến tiêu chuẩn.',                                       id: 'scene3_1' },
  { startSec: 18.5, endSec: 22.5, text: 'Tab Lộ trình thăng hạng vẽ ra lộ trình rõ ràng, từ số không đến Master Calisthenics.',                                  id: 'scene3_2' },
  { startSec: 22.5, endSec: 26.0, text: 'Mỗi bài tập đều có hướng dẫn góc khớp bằng AI, chi tiết và rất trực quan.',                                              id: 'scene3_3' },
  { startSec: 26.0, endSec: 30.0, text: 'Trọng tài AI Vision nhận diện khung xương theo thời gian thực và đo góc khuỷu tay chính xác.',                            id: 'scene4_1' },
  { startSec: 30.0, endSec: 34.0, text: 'Thuật toán chống gian lận phát hiện đà giật, và cảnh báo bạn sửa tư thế ngay lập tức.',                                   id: 'scene4_2' },
  { startSec: 34.0, endSec: 38.0, text: 'Giao diện HUD thể thao điện tử hiện đại, đếm số lần tập và ghi nhận calo liên tục.',                                       id: 'scene4_3' },
  { startSec: 38.0, endSec: 41.5, text: 'Đấu trường một đối một ghép cặp theo thời gian thực, biến việc tập luyện thành eSports.',                                 id: 'scene5_1' },
  { startSec: 41.5, endSec: 45.0, text: 'Fitness Battle — Tập luyện thông minh, thăng hạng mỗi ngày. Phiên bản một không bốn.',                                    id: 'scene5_2' }
];

// ---------- Hàm tiện ích ----------
const runFfmpeg = (args) => new Promise((resolve, reject) => {
  const p = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let stderr = '';
  p.stderr.on('data', (d) => { stderr += d.toString(); });
  p.on('error', reject);
  p.on('close', (code) => code === 0
    ? resolve()
    : reject(new Error(`ffmpeg exit ${code}\n${stderr.split('\n').slice(-15).join('\n')}`)));
});

const msleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function synth(text, outMp3, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const dir = path.dirname(outMp3);
      const tts = new MsEdgeTTS();
      await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioFilePath } = await tts.toFile(dir, text, {
        rate: RATE, pitch: PITCH, volume: VOLUME
      });
      if (path.resolve(audioFilePath) !== path.resolve(outMp3)) {
        if (fs.existsSync(outMp3)) fs.unlinkSync(outMp3);
        fs.renameSync(audioFilePath, outMp3);
      }
      if (!fs.existsSync(outMp3) || fs.statSync(outMp3).size < 2000) {
        throw new Error('Audio rỗng / quá nhỏ');
      }
      return outMp3;
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`   ↻ thử lại lần ${attempt + 1} sau 2s…`);
      await msleep(2000);
    }
  }
}

// ---------- Main ----------
async function main() {
  const tempDir = path.join(__dirname, 'temp_audio_smooth');
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });

  console.log(`\n🎙️  Edge TTS - ${VOICE}`);
  console.log(`    Rate: ${RATE}  •  Pitch: ${PITCH}  •  Volume: ${VOLUME}`);
  console.log(`    Pipeline: silenceremove → highpass/lowpass → adeclick → afftdn → de-ess 6.5kHz → EQ 200Hz → dynaudnorm → loudnorm EBU R128\n`);

  // 1. Tổng hợp từng câu
  for (let i = 0; i < voiceLines.length; i++) {
    const line = voiceLines[i];
    const rawMp3 = path.join(tempDir, `raw_${line.id}.mp3`);

    console.log(`🗣️  [${String(i + 1).padStart(2)}/12] (${line.startSec.toFixed(1)}s-${line.endSec.toFixed(1)}s) "${line.text}"`);
    await synth(line.text, rawMp3);
    process.stdout.write('   ✅ Edge TTS xong\n');
  }

  // 2. Hậu kỳ từng câu - pipeline trong suốt, giữ dynamic tự nhiên của giọng đọc
  console.log(`\n🎛️  Hậu kỳ mượt mà từng câu…`);
  for (let i = 0; i < voiceLines.length; i++) {
    const line = voiceLines[i];
    const rawMp3 = path.join(tempDir, `raw_${line.id}.mp3`);
    const procWav = path.join(tempDir, `proc_${line.id}.wav`);

    const filter = [
      // cắt im lặng đầu/cuối thoáng hơn (0.2s/0.5s, ngưỡng -40/-38dB)
      'silenceremove=start_periods=1:start_duration=0.20:start_threshold=-40dB',
      'silenceremove=stop_periods=-1:stop_duration=0.50:stop_threshold=-38dB',
      // lọc dải: cắt ù dưới 80Hz (do tổng hợp), cắt xì trên 14kHz
      'highpass=f=80',
      'lowpass=f=14000',
      // sửa click/pop digital
      'adeclick',
      // khử noise nền nhẹ (giữ chi tiết)
      'afftdn=nf=-25',
      // de-ess nhẹ ở 6.5kHz - giảm sibilant xì
      'equalizer=f=6500:t=q:w=1.2:g=-1.5',
      // ấm nhẹ dải trầm-trung 200Hz (giọng dày hơn, đỡ "mỏng")
      'equalizer=f=200:t=q:w=1:g=1.8',
      // chuẩn hoá biên độ động trong suốt (thay thế compand cũ - mượt hơn)
      'dynaudnorm=p=0.95:s=5:g=3',
      'aresample=48000'
    ].join(',');

    await runFfmpeg([
      '-y', '-i', rawMp3,
      '-af', filter,
      '-ar', '48000', '-ac', '1',
      procWav
    ]);
  }
  console.log(`   ✅ 12 câu đã xử lý xong`);

  // 3. Đặt 12 câu lên timeline 45s
  console.log(`\n⏱️  Đang đặt 12 câu lên timeline ${TIMELINE}s…`);
  const inputs = [];
  let filterComplex = '';
  for (let i = 0; i < voiceLines.length; i++) {
    const line = voiceLines[i];
    const procWav = path.join(tempDir, `proc_${line.id}.wav`);
    inputs.push('-i', procWav);
    const delayMs = Math.round(line.startSec * 1000);
    filterComplex += `[${i}:a]adelay=${delayMs}|${delayMs}[a${i}];`;
  }
  const mixInputs = voiceLines.map((_, i) => `[a${i}]`).join('');
  // normalize=1 để amix tự cân bằng, tránh clipping
  filterComplex += `${mixInputs}amix=inputs=${voiceLines.length}:dropout_transition=0:normalize=1[mixed]`;

  const mixedWav = path.join(tempDir, 'voice_mixed.wav');
  await runFfmpeg([
    '-y', ...inputs,
    '-filter_complex', filterComplex,
    '-map', '[mixed]',
    '-t', String(TIMELINE),
    mixedWav
  ]);

  // 4. Master MP3 - EBU R128 (không compand, không double-processing)
  const finalMp3 = path.join(projectRoot, 'FitnessBattle_Voiceover_45s.mp3');
  console.log(`🎧  Master MP3 ${MASTER_KBPS}kbps (EBU R128 -16 LUFS)…`);
  await runFfmpeg([
    '-y', '-i', mixedWav,
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
    '-c:a', 'libmp3lame',
    '-b:a', `${MASTER_KBPS}k`,
    '-t', String(TIMELINE),
    finalMp3
  ]);
  console.log(`   ✅ ${finalMp3}`);

  // 5. Thay audio vào video - có fade in/out 0.3s cho mượt đầu cuối
  const inputVideo  = path.join(projectRoot, 'FitnessBattle_Demo_MVP_45s.mp4');
  const tempOutVid  = path.join(tempDir, 'temp_final_smooth.mp4');
  console.log(`\n🎬  Ghi đè giọng mới vào video (fade in/out 0.3s)…`);
  await runFfmpeg([
    '-y',
    '-i', inputVideo,
    '-i', finalMp3,
    '-filter_complex', '[1:a]afade=t=in:st=0:d=0.3,afade=t=out:st=44.7:d=0.3[a]',
    '-map', '0:v:0',
    '-map', '[a]',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', `${MASTER_KBPS}k`,
    '-shortest',
    tempOutVid
  ]);
  fs.copyFileSync(tempOutVid, inputVideo);

  // 6. Dọn dẹp
  fs.rmSync(tempDir, { recursive: true, force: true });

  const audioStat = fs.statSync(finalMp3);
  const videoStat = fs.statSync(inputVideo);
  console.log(`\n========================================`);
  console.log(`🎉 HOÀN THÀNH (mượt mà)`);
  console.log(`🎙️  Voice rời : ${finalMp3} (${(audioStat.size / 1024).toFixed(1)} KB)`);
  console.log(`🎬  Video đè audio: ${inputVideo} (${(videoStat.size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`========================================\n`);
}

main().catch((err) => {
  console.error('❌ Lỗi:', err.message || err);
  process.exit(1);
});
