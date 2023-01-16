import './App.css';

function App() {
  const MicRecorder = require('mic-recorder-to-mp3');
  const recorder = new MicRecorder({
    bitRate: 128
  });

  function onStartRecording(){
    // Start recording. Browser will request permission to use your microphone.
    recorder.start().then(() => {
      // something else
    }).catch((e) => {
      console.error(e);
    });
  }

  function onStopRecording(){
    recorder
    .stop()
    .getMp3().then(([buffer, blob]) => {
      // do what ever you want with buffer and blob
      // Example: Create a mp3 file and play
      const file = new File(buffer, 'me-at-thevoice.mp3', {
        type: blob.type,
        lastModified: Date.now()
      });

    const player = new Audio(URL.createObjectURL(file));
    player.play();

    }).catch((e) => {
        alert('We could not retrieve your message');
        console.log(e);
    });
  }
  return (
    <div>
      <img className="App-logo" src="logo.png"></img>
      <button onClick={onStartRecording}>
        Start Recording
      </button>
      <button onClick={onStopRecording}>
        Stop Recording
      </button>
    </div>
  );
}

export default App;
