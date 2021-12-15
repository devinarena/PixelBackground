import './App.css';

import { useEffect } from 'react';
import { useState } from 'react/cjs/react.development';
import EntryForm from './components/EntryForm';
const { ipcRenderer } = window.require('electron');

const App = () => {

  const [message, setMessage] = useState('Press the grab button to start');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    ipcRenderer.on('error', (event, data) => {
      setMessage(data);
    });
    ipcRenderer.on('message', (event, data) => {
      setMessage(data.message);
      setProgress(data.progress);
    });
  }, []);

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
      <h1>Pixel Background Generator</h1>
      <p>Pixelates pictures from Reddit.</p>
      <EntryForm submit={submit} message={message} progress={progress} />
    </div>
  );
};

export default App;
