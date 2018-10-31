const electron = require('electron');
// Module to control application life.
const app = electron.app;
const process = require('process');

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

require('electron-context-menu')({
   prepend: (params, browserWindow) => [{
      label: 'Rainbow',
      // Only show it when right-clicking images
      visible: params.mediaType === 'image'
   }]
});

app.on('ready', () => {
   mainWindow = new BrowserWindow();
});

function createWindow() {
   // Create the browser window.
   mainWindow = new BrowserWindow({
      width: 1600,
      height: 1200
   });

   // and load the index.html of the app.
   mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, './src/core/index.html'),
      protocol: 'file:',
      slashes: true
   }));

   // mainWindow.setMenu(null);

   // Open the DevTools.
   // mainWindow.webContents.openDevTools()

   // Emitted when the window is closed.
   mainWindow.on('closed', function() {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
   });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
   // On OS X it is common for applications and their menu bar
   // to stay active until the user quits explicitly with Cmd + Q
   if (process.platform !== 'darwin') {
      app.quit();
   }
});

app.on('activate', function() {
   // On OS X it's common to re-create a window in the app when the
   // dock icon is clicked and there are no other windows open.
   if (mainWindow === null) {
      createWindow();
   }
});

let testMode = process.argv.indexOf('-test') < 0 ? false : true;
let fileNames = testMode ? {
   core: {
      dict: 'test-dict.json',
      config: 'test-config.json'
   },
   backup: {
      dict: 'test-dict-backup.json',
      config: 'test-config-backup.json'
   }
} : {
   core: {
      dict: 'Dict.json',
      config: 'Config.json'
   },
   backup: {
      dict: 'dict-backup.json',
      config: 'config-backup.json'
   }
}

global.sharedObject = {
   testMode: testMode,
   fileNames: fileNames
};

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const fs = require('fs');
const os = require('os');
const ipc = electron.ipcMain;
const shell = electron.shell;

ipc.on("print-to-pdf", function(event, arg) {
   const win = BrowserWindow.fromWebContents(event.sender);
   // Use default printing options
   win.webContents.printToPDF({}, function(error, data) {
      if (error) throw error;
      fs.writeFile(arg, data, function(error) {
         if (error) {
            throw error;
         }
         shell.openExternal('file://' + arg);
         event.sender.send('wrote-pdf', arg);
      });
   });
});