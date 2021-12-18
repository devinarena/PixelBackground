import './App.css';

import { useEffect, useState } from 'react';
import EntryForm from './components/EntryForm';
import { Pixelify } from 'react-pixelify';
const { ipcRenderer } = window.require('electron');

const App = () => {

  const [message, setMessage] = useState('Press the grab button to start');
  const [progress, setProgress] = useState(0);
  const [pixelSize, setPixelSize] = useState(10);

  /**
   * Set up communication with electron app.
   */
  useEffect(() => {
    ipcRenderer.on('error', (event, data) => {
      setMessage(data);
    });
    ipcRenderer.on('message', (event, data) => {
      setMessage(data.message);
      setProgress(data.progress);
    });
    ipcRenderer.on('settings', (event, data) => {
      setMessage('Successfully loaded settings');
    });
  }, []);

  /**
   * Sends a request to electron app to execute pixelation procedures.
   * 
   * @param {Event} e the event to cancel;
   * @param {Boolean} save if we are in save mode
   * @param {String} subreddits the subreddits to pull from (separated by comas)
   * @param {String} saveDirectory the directory to save to
   * @param {Number} numberOfPosts the number of posts to grab
   * @param {Number} pixelation the size of pixels for pixelation
   * @param {String} from the category to pull from
   */
  const submit = (e, save, subreddits, saveDirectory, numberOfPosts, pixelation, from) => {
    e.preventDefault();
    ipcRenderer.send('submit', {
      save: save,
      subreddits: subreddits,
      saveDirectory: saveDirectory,
      numberOfPosts: save ? numberOfPosts : 1,
      pixelation: pixelation,
      from: from
    });
  };

  return (
    <div className='App'>
      <div className='background'>
        {pixelSize >= 8 &&
          <Pixelify className='bgcanvas' src={process.env.PUBLIC_URL + '/background.jpg'} pixelSize={Math.min(pixelSize, 50)} />
        }
        {pixelSize <= 7 &&
          <img src={process.env.PUBLIC_URL + '/background.jpg'} alt='Pixel background' />
        }
      </div>
      <h1>Pixel Background Generator</h1>
      <p>Create pixel art backgrounds from Reddit.</p>
      <EntryForm submit={submit} renderer={ipcRenderer} message={message}
        progress={progress} setPixelSize={setPixelSize} />
    </div>
  );
};

export default App;
