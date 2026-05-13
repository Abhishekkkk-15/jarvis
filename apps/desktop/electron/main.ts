import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'node:path';
import { spawn, ChildProcess } from 'child_process';

// The built directory of the renderer process
const DIST_PATH = path.join(__dirname, '../dist');
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

let serverProcess: ChildProcess | null = null;

function startBackendServer() {
  // In dev mode, the backend is started separately (e.g., via turbo dev)
  if (VITE_DEV_SERVER_URL) return;

  // In packaged .exe: server is bundled at resources/server/
  const serverPath = path.join(
    process.resourcesPath,
    'server',
    'apps',
    'server',
    'src',
    'main.js'
  );

  console.log('[Backend] Launching server from:', serverPath);

  serverProcess = spawn(process.execPath, [serverPath], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout?.on('data', (data) => {
    console.log(`[Server] ${data.toString().trim()}`);
  });

  serverProcess.stderr?.on('data', (data) => {
    console.error(`[Server Error] ${data.toString().trim()}`);
  });

  serverProcess.on('exit', (code) => {
    console.log(`[Backend] Server exited with code ${code}`);
  });
}

let lastBounds: Electron.Rectangle | null = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    transparent: true,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(DIST_PATH, 'index.html'));
  }
}

app.whenReady().then(() => {
  startBackendServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Kill the backend server cleanly when the app closes
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
    serverProcess = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('execute-tool', async (event, { name, args }) => {
  console.log(`Executing tool: ${name}`, args);
  return { success: true };
});

let isPulseMode = false;

ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  
  isPulseMode = true;
  
  // Store previous desktop layout dimensions smartly
  lastBounds = win.getBounds();
  
  // Inform UI to render neural pulse overlay state
  win.webContents.send('set-mode', 'pulse');
  
  // Calculate precise bottom-right workspace layout coordinates dynamically
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const compactSize = 120;
  const x = width - compactSize - 20;
  const y = height - compactSize - 20;
  
  // Shrink to compact fully animated overlay emblem bounds pinned at bottom-right
  win.setBounds({ x, y, width: compactSize, height: compactSize });
  win.setAlwaysOnTop(true, 'floating');
  
  // Enable absolute touch-through passthrough directly to OS underlying context
  win.setIgnoreMouseEvents(true, { forward: true });
});

ipcMain.on('set-ignore-mouse-events', (event, ignore) => {
  if (!isPulseMode) return;
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.setIgnoreMouseEvents(ignore, { forward: true });
});

ipcMain.on('window-restore', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  
  isPulseMode = false;
  win.setAlwaysOnTop(false);
  win.setIgnoreMouseEvents(false);
  
  if (lastBounds) {
    win.setBounds(lastBounds);
  } else {
    win.setSize(1200, 800);
    win.center();
  }
  
  win.webContents.send('set-mode', 'desktop');
});

ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win?.isMaximized()) {
    win?.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.close();
});
