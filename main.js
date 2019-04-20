const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

// listen for app to be ready

app.on('ready', function() {
    //create new window
    mainWindow = new BrowserWindow({});

    // load html window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));  // file://dirname/mainWindow.html

    // quit entire app when closed
    mainWindow.on('closed', function() {
        app.quit();
    })

    // build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // insert menu
    Menu.setApplicationMenu(mainMenu);
})

// Handle create window
function createWindow() {
    //create new window
    addWindow = new BrowserWindow({
        width: 200,
        height: 300,
        title: 'Create new file / folder'
    });
    // load html window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'createWindow.html'),
        protocol: 'file:',
        slashes: true
    }));  // file://dirname/mainWindow.html

    // garbage collection handle
    addWindow.on('close', function() {
        addWindow = null;
    })
}

// Catch file:add
ipcMain.on('file:add', function(err, file) {
    mainWindow.webContents.send('file:add', file);
    addWindow.close();
})

// create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Create file/folder',
                click() {
                    createWindow();
                }
            },
            {
                label: 'Delete file/folder'
            },
            {
                label: 'Copy file/copy folder'
            },
            {
                label: 'Quit',
                // hot key to quit
                accelerator: process.platform == 'darwin' ? 'Command+Q' :
                'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Copy file/folder'
            },
        ]
    }
];

// if mac add empty object to menu
if(process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// Add developer tool items if not in production
if(process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                // hot key to quit
                accelerator: process.platform == 'darwin' ? 'Command+I' :
                'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}