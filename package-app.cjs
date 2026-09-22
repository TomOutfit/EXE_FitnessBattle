const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('1. Building Vite dist...');
execSync('npm run build', { stdio: 'inherit', cwd: __dirname });

console.log('2. Preparing build_staging folder...');
const stagingDir = path.join(__dirname, 'build_staging');
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

// Copy dist, electron, public
fs.cpSync(path.join(__dirname, 'dist'), path.join(stagingDir, 'dist'), { recursive: true });
fs.cpSync(path.join(__dirname, 'electron'), path.join(stagingDir, 'electron'), { recursive: true });
fs.cpSync(path.join(__dirname, 'public'), path.join(stagingDir, 'public'), { recursive: true });

// Write minimal package.json
const pkgContent = {
  name: 'fitness-battle',
  version: '1.0.0',
  main: 'electron/main.cjs'
};
fs.writeFileSync(path.join(stagingDir, 'package.json'), JSON.stringify(pkgContent, null, 2));

console.log('3. Packaging with Electron Packager...');
const outDir = path.resolve(__dirname, '../FitnessBattle_Windows');
execSync(`npx electron-packager "${stagingDir}" "FitnessBattle" --platform=win32 --arch=x64 --out="${outDir}" --overwrite`, {
  stdio: 'inherit',
  cwd: __dirname
});

console.log('4. Cleaning staging...');
fs.rmSync(stagingDir, { recursive: true, force: true });

console.log('5. Compressing into zip archive...');
const zipSrc = path.join(outDir, 'FitnessBattle-win32-x64', '*');
const zipDest = path.resolve(__dirname, '../FitnessBattle_Windows.zip');
execSync(`powershell -Command "Compress-Archive -Path '${zipSrc}' -DestinationPath '${zipDest}' -Force"`, {
  stdio: 'inherit'
});

console.log('DONE! Successfully built and zipped FitnessBattle_Windows.zip');
