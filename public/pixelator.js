
/**
* @file pixelator.js
* @author Devin Arena
* @since 12/14/2021
* @description Handles image manipulation of the downloaded files.
*/

const jimp = require('jimp');

/**
 * Pixelates the files using JIMP library.
 * 
 * @param {Array} files the files to pixelate
 * @param {Number} pixelation the amount to pixelate the files
 */
const pixelate = async (files, pixelation) => {
    for (const file of files) {
        let img = undefined;
        try {
            img = await jimp.read(file);
        } catch (e) {
            console.log(`Jimp failed to read ${file}`);
            return false;
        }

        img.pixelate(pixelation).write(file);
        console.log(`pixelated ${file} with amount ${pixelation}`);
    }
    return true;
};

/**
 * Sets the user's wallpaper using wallpaper library.
 * 
 * @param {String} file the file path to change to
 */
const setBackground = async (file) => {
    let success = true;

    import('wallpaper').then(async module => {
        try {
            await module.setWallpaper(file);
        } catch (e) {
            console.log(e);
            success = false;
        }
    });

    return success;
};

module.exports = {
    pixelate: pixelate,
    setBackground: setBackground
};