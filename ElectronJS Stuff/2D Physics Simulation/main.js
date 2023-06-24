var Electron = require("electron");
var createWindow = function () {
    var win = new Electron.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    win.loadFile("page.html");
};
Electron.app.whenReady().then(createWindow);
