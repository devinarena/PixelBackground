const fs = require('fs');
const path = require('path');

/**
* @file settings.js
* @author Devin Arena
* @since 12/14/2021
* @description Contains setting methods and helpers, mainly sets settings and loads settings.
*/

// default settings, saved if file does not exist
let settings = {
    saveMode: true,
    subreddits: "EarthPorn",
    saveDirectory: path.join(require('os').homedir(), 'PixelBackgroundPictures'),
    numberOfPosts: 5,
    pixelation: 10,
    from: "new"
};

/**
 * Loads settings from settings.json file.
 */
const loadSettings = () => {
    try {
        // load settings
        if (fs.existsSync('./settings.json')) {
            const raw = fs.readFileSync('./settings.json');
            settings = JSON.parse(raw);
        } else {
            console.log('settings.json does not exist, generating...');
            fs.writeFileSync('./settings.json', JSON.stringify(settings), err => {
                if (err)
                    console.log(err);
            });
        }
    } catch (err) {
        console.log('Failed to load settings, it\'s likely corrupted, saving default settings');
        fs.writeFileSync('./settings.json', JSON.stringify(settings), err => {
            if (err)
                console.log(err);
        });
        loadSettings();
    }
};

/**
 * Updates user settings.
 * 
 * @param {boolean} saveMode save multiple posts mode
 * @param {String} subreddits the subreddits to save from
 * @param {String} saveDirectory the directory to save from
 * @param {Number} numberOfPosts how many posts to grab
 * @param {Number} pixelation the degree of pixelation
 * @param {String} from which type to grab (hot, new, etc)
 */
const setSettings = (saveMode, subreddits, saveDirectory, numberOfPosts, pixelation, from) => {
    settings.saveMode = saveMode;
    settings.subreddits = subreddits;
    settings.saveDirectory = saveDirectory;
    settings.numberOfPosts = numberOfPosts;
    settings.pixelation = pixelation;
    settings.from = from;
};

/**
 * Saves user settings.
 */
const saveSettings = () => {
    let success = true;
    fs.writeFileSync('./settings.json', JSON.stringify(settings), err => {
        if (err) {
            console.log(err);
            success = false;
        }
    });
    return success;
};

/**
 * Getter for settings.
 * 
 * @returns {Object} the settings object
 */
const getSettings = () => {
    return settings;
}

module.exports = {
    getSettings,
    loadSettings,
    setSettings,
    saveSettings
};