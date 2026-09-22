const { app, BrowserWindow, session, Menu } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 420,
    minHeight: 700,
    icon: path.join(__dirname, '../public/Logo.png'),
    title: 'Fitness Battle - Gamified Fitness Arena',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allows local camera & media streaming smoothly
    },
  });

  // Automatically grant camera and microphone permissions for Pose Detection
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media' || permission === 'camera' || permission === 'microphone' || permission === 'geolocation') {
      callback(true);
    } else {
      callback(true);
    }
  });

  // Load the built dist index.html
  const indexPath = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
