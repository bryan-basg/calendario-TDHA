const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false // Simplificado para desarrollo, considerar true para prod
        }
    });

    // Cargar el index.html construido por Vite
    // Asegúrese de haber corrido 'npm run build' antes
    const startFile = path.join(__dirname, '../dist/index.html');

    win.loadFile(startFile).catch(err => {
        console.error("Error cargando archivo:", err);
    });

    // Abrir herramientas de desarrollo si se desea
    // win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
