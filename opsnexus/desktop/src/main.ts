import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'

const isDev = process.env.NODE_ENV !== 'production'

// The Vite dev server URL - must match vite.config.ts server port
const DEV_SERVER_URL = 'http://localhost:5173'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#07111e',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // allow fetch to localhost:8000 in packaged app
    },
  })

  // Show window once ready to avoid white flash
  win.once('ready-to-show', () => win.show())

  // Open DevTools with F12
  win.webContents.on('before-input-event', (_, input) => {
    if (input.key === 'F12') win.webContents.openDevTools({ mode: 'detach' })
  })

  // Open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    win.loadURL(DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Window control IPC handlers
  ipcMain.on('window-minimize', () => win.minimize())
  ipcMain.on('window-maximize', () => win.isMaximized() ? win.unmaximize() : win.maximize())
  ipcMain.on('window-close',    () => win.close())
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
