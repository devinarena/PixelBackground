
/**
* @file pixelator.js
* @author Devin Arena
* @since 12/14/2021
* @description Handles image manipulation of the downloaded files.
*/

const sharp = require('sharp');
const fs = require('fs');

/**
 * Pixelates the files using sharp library. Very basic algorithm, 
 * shrinks the image by a factor of {pixelation} and regrows it back to 
 * its original size to produce a pixelated effect.
 * 
 * @param {Array} files the files to pixelate
 * @param {Number} pixelation the amount to pixelate the files
 */
const pixelate = async (file, pixelation) => {
    const input = fs.readFileSync(file);
    const image = await sharp(input);
    const width = (await image.metadata()).width;
    await sharp(await image.resize(Math.round(width / pixelation), null, {kernel: sharp.kernel.nearest}).toBuffer())
        .resize(width, null, {kernel: sharp.kernel.nearest}).toFile(file);

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
    pixelate,
    setBackground
};