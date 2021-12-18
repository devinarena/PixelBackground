import './EntryForm.css';
import { Fragment, useEffect, useState } from 'react';
const { ipcRenderer } = window.require('electron');

/**
* @file EntryForm.js
* @author Devin Arena
* @since 12/13/2021
* @description Handles user entry for background generator. Allows users to customize their execution.
*/

const EntryForm = (props) => {

    const [subreddits, setSubreddits] = useState('');
    const [saveDirectory, setSaveDirectory] = useState('');
    const [numberOfPosts, setNumberOfPosts] = useState('');
    const [save, setSave] = useState(false);
    const [pixelation, setPixelation] = useState('');
    const [from, setFrom] = useState("new");

    /**
     * Handler for loading settings
     */
    useEffect(() => {
        ipcRenderer.on('settings', (event, data) => {
            setSubreddits(data.subreddits);
            setSaveDirectory(data.saveDirectory);
            setNumberOfPosts(data.numberOfPosts);
            setSave(data.saveMode);
            setPixelation(data.pixelation);
            props.setPixelSize(parseInt(data.pixelation) || 1)
            setFrom(data.from);
        });
    }, []);

    /**
     * Handler for saving settings, sends settings back to electron
     */
    useEffect(() => {
        const sendSettings = () => {
            ipcRenderer.send('retrieveSettings', {
                subreddits,
                saveDirectory,
                numberOfPosts: parseInt(numberOfPosts) || 1,
                save,
                pixelation: parseInt(pixelation) || 0,
                from
            });
        };

        ipcRenderer.on('requestSettings', sendSettings);

        return () => {
            ipcRenderer.removeListener('requestSettings', sendSettings);
        };
    }, [subreddits, saveDirectory, numberOfPosts, save, pixelation, from]);

    return (
        <form className='EntryForm' onSubmit={e =>
            props.submit(e, save, subreddits, saveDirectory, parseInt(numberOfPosts) || 1, parseInt(pixelation) || 0, from)
        }>
            <div className='Mode'>
                <label>
                    Mode
                </label>
                <div className='ModeChoice'>
                    <input type='radio' id="modeChoice1" name='mode' value='Save to Folder'
                        checked={save} onChange={() => setSave(true)} />
                    <label htmlFor='modeChoice1'>
                        Save to Folder
                    </label>
                </div>
                <div className='ModeChoice'>
                    <input type='radio' id="modeChoice2" name='mode' value='Set Background'
                        checked={!save} onChange={() => setSave(false)} />
                    <label htmlFor='modeChoice2'>
                        Set Wallpaper
                    </label>
                </div>
            </div>
            <div className='ModeFields'>
                <label htmlFor='subreddits'>
                    Subreddits (seperate with commas)
                </label>
                <input type='text' name='subreddits' value={subreddits} onChange={e => setSubreddits(e.target.value)} required />
                {save &&
                    <Fragment>
                        <label htmlFor='numPosts'>
                            Number of Posts (max 50)
                        </label>
                        <input type='number' name='numPosts' value={numberOfPosts}
                            onChange={e => setNumberOfPosts(e.target.value)} min={1} max={50} required />
                    </Fragment>
                }
                <label htmlFor='saveDir'>
                    Save Directory
                </label>
                <input type='text' name='saveDir' value={saveDirectory} onChange={e => setSaveDirectory(e.target.value)} required />
                <label htmlFor='pixelation'>
                    Pixelation
                </label>
                <input type='number' name='pixelation' value={pixelation}
                    onChange={e => setPixelation(e.target.value)}
                    onBlur={() => props.setPixelSize(parseInt(pixelation) || 1)} min={0} max={100} required />
                <label htmlFor='options'>
                    Grab From
                </label>
                <select name="options" value={from} onChange={e => setFrom(e.target.value)} required>
                    <option value="new">New</option>
                    <option value="hot">Hot</option>
                    <option value="top">Top</option>
                    <option value="controversial">Controversial</option>
                </select>
            </div>
            <button type='submit'>Grab</button>
            <progress name='progress' value={props.progress} max={4}></progress>
            <label htmlFor='progress' className='message'>{props.message}</label>
        </form >
    );
};

export default EntryForm;