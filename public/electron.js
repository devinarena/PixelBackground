const path = require('path');

const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const isDev = require('electron-is-dev');

const { grabPosts, downloadImages } = require('./image-grabber.js');
const { pixelate, setBackground } = require('./pixelator.js');
const { loadSettings, getSettings, setSettings, saveSettings } = require('./settings.js');

const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 800;

let win;

/**
 * Creates the window and loads the content into the electron app.
 */
const createWindow = () => {
    // Generate a window with initial width and height and integrate with node
    win = new BrowserWindow({
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.setMenu(Menu.buildFromTemplate(createMenu()));

    // Load content into the electron window, dev and production builds will have different URLs
    win.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    );
    // Open dev tools for debugging
    // if (isDev) {
    //     win.webContents.openDevTools({ mode: 'detach' });
    // }
};

/**
 * Creates and returns the menu template for the top menu.
 */
const createMenu = () => {
    return [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Reload Settings',
                    click() {
                        loadSettings();
                        // send to React renderer
                        win.webContents.send('settings', getSettings());
                    }
                },
                {
                    label: 'Save Settings',
                    click() {
                        win.webContents.send('requestSettings');
                    }
                },
                process.platform === 'darwin' ? {
                    role: 'close'
                } : {
                    role: 'quit'
                }
            ]
        }
    ];
};

// callbacks for when the program is closed or opened

app.whenReady().then(createWindow).then(() => {
    win.webContents.on('did-finish-load', () => {
        loadSettings();
        // send to React renderer
        win.webContents.send('settings', getSettings());
    });
});

// when all windows are closed, quit the program
app.on('window-all-closed', () => {
    // if not on mac, exit the program
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Upon reactivation for mac, create a new window
app.on('activate', () => {
    // if we're on mac, create another window upon reactivation
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

/**
 * Runs when the main form is submitted
 */
ipcMain.on('submit', async (event, data) => {
    console.log(settings);
    // initial message
    event.reply('message', {
        progress: 0,
        message: `Grabbing ${data.numberOfPosts} from ${data.subreddits}`
    });
    // grab posts from reddit
    const posts = await grabPosts(data.subreddits, data.from, data.numberOfPosts);
    if (posts.length == 0) {
        event.reply('error', 'Could not find a subreddit of that name, make sure it exists.');
        return;
    }
    event.reply('message', {
        progress: 1,
        message: `Grabbed ${posts.length} posts, downloading images`
    });
    // download the images from the acquired URLs
    const files = await downloadImages(data.saveDirectory, posts);
    if (files.length == 0) {
        event.reply('error', 'Failed to save images to the directory, does it exist?');
        return;
    }
    event.reply('message', {
        progress: 2,
        message: `Downloaded ${files.length} images, beginning pixelation`
    });
    // pixelate the files we grabbed
    if (!await pixelate(files, data.pixelation)) {
        event.reply('error', 'Failed to pixelate some files, the files may be deleted or corrupted.');
        return;
    }
    event.reply('message', {
        progress: 3,
        message: `Pixelates ${files.length} images, finalizing...`
    });
    // if we're in background mode, set the last file (should be only) as the wallpaper 
    if (!data.save) {
        if (!await setBackground(files.at(-1))) {
            event.reply('error', 'Failed to pixelate some files, the files may be deleted or corrupted.');
            return;
        }
        event.reply('message', {
            progress: 4,
            message: `Set background image to ${files.at(-1)}`
        });
    } else {
        event.reply('message', {
            progress: 4,
            message: `Finished saving pixelated files to ${data.saveDirectory}`
        });
    }
    console.log('FINISHED');
});

/**
 * When we receive the settings from the renderer, save them to the local settings.json file.
 */
ipcMain.on('retrieveSettings', (event, data) => {
    setSettings(data.save, data.subreddits, data.saveDirectory, data.numberOfPosts, data.pixelation, data.from);
    if (saveSettings()) {
        event.reply('message', {
            progress: 4,
            message: 'Successfully saved settings.'
        });
    } else {
        event.reply('error', 'Failed to save settings!');
    }
});