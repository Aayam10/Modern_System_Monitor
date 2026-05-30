import { app, BrowserWindow } from 'electron'
import path from 'path'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#080d18',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../../assets/logo.png'),
  })

  win.webContents.on('before-input-event', (_, input) => {
    if (input.key === 'F12') win.webContents.openDevTools()
  })

  if (DEV_SERVER_URL) {
    win.loadURL(DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Expose backend URL to renderer
  win.webContents.executeJavaScript(`window.BACKEND_URL = "${BACKEND_URL}"`)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
