"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const isDev = process.env.NODE_ENV !== 'production';
// The Vite dev server URL - must match vite.config.ts server port
const DEV_SERVER_URL = 'http://localhost:5173';
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1100,
        minHeight: 700,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: '#07111e',
        show: false,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: false, // allow fetch to localhost:8000 in packaged app
        },
    });
    // Show window once ready to avoid white flash
    win.once('ready-to-show', () => win.show());
    // Open DevTools with F12
    win.webContents.on('before-input-event', (_, input) => {
        if (input.key === 'F12')
            win.webContents.openDevTools({ mode: 'detach' });
    });
    // Open external links in default browser
    win.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
    if (isDev) {
        win.loadURL(DEV_SERVER_URL);
    }
    else {
        win.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    // Window control IPC handlers
    electron_1.ipcMain.on('window-minimize', () => win.minimize());
    electron_1.ipcMain.on('window-maximize', () => win.isMaximized() ? win.unmaximize() : win.maximize());
    electron_1.ipcMain.on('window-close', () => win.close());
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
