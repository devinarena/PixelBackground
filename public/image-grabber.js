
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Axios = require('axios');

const BASE_URL = 'https://reddit.com/r/';

/**
* @file image-grabber.js
* @author Devin Arena
* @since 12/13/2021
* @description Handles grabbing images from the specified subreddits.
*/

/**
 * Grabs posts from the specified subreddits.
 * 
 * @param {String} subreddits the list of subreddits separated by commas
 * @param {Number} count the number of posts to grab 
 * 
 * @return {Array} the list of post URLs
 */
const grabPosts = async (subreddits, from, count) => {
    const posts = [];

    // if we're given a list, grab count from every sub, otherwise grab count from one sub
    if (!subreddits.includes(',')) {
        const res = await fetch(`${BASE_URL}${subreddits.trim()}/${from}.json`);
        if (res.error) {
            console.log(`failed to get posts from ${subreddits.trim()}`);
            return null;
        }
        await readJSON(res, count, posts);
    } else {
        for (let sub of subreddits.split(',')) {
            sub = sub.trim();

            const res = await fetch(`${BASE_URL}${sub}/${from}.json`);
            if (res.error) {
                console.log(`failed to get posts from ${sub}`);
                continue;
            }
            await readJSON(res, count, posts);
        }
    }
    return posts;
};

/**
 * Reads JSON from the fetched URL, grabs children (posts) and reads the url of their data.
 * Only adds URLs that are formatted as JPG or PNG pictures.
 * 
 * @param {Result} res the fetch result to read JSON from
 * @param {Number} count the max number of posts to grab
 */
const readJSON = async (res, count, posts) => {
    const json = await res.json();
    for (const post of json.data.children) {
        const url = post.data.url;

        if (url.endsWith('.jpg') || url.endsWith('.png'))
            posts.push(url);

        if (posts.length === count)
            return;
    }
};

/**
 * Grabs images using HTTP GET requests from Axios. Saves them to the specified output directory.
 * 
 * @param {String} dir the output directory to save to
 * @param {Array} posts the list of post URLs to grab images from. 
 * 
 * @return {Array} the list of file URLs
 */
const downloadImages = async (dir, posts) => {
    const files = [];

    let index = 0;

    for (const url of posts) {

        const ext = url.split('.').at(-1);

        const response = await Axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        const date = Date.now().toString();
        const fp = path.resolve(dir, `${date}-${index}.${ext}`);

        index++;

        const write = fs.createWriteStream(fp);

        const file = await new Promise((res, reject) => {
            write.on('open', () => {
                response.data.pipe(write).on('error', () => {
                    reject(`Failed to grab file from ${url} for ${fp}`);
                }).once('close', () => {
                    console.log(`Grabbed from ${url} for ${fp}`);
                    res(fp);
                });
            }).on('error', () => {
                reject(`Failed to open file ${fp}, does the directory exist?`);
            });
        }).catch(err => {
            console.log(err);
        });

        if (file)
            files.push(file);
    }

    return files;
};

module.exports = {
    grabPosts: grabPosts,
    downloadImages: downloadImages
};