import './App.css';
import MicRecorder from "mic-recorder-to-mp3"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { BiMicrophone, BiMicrophoneOff } from "react-icons/bi";
import { GiNotebook } from "react-icons/gi";
import HeaderView from './header';

  // Set AssemblyAI Axios Header
  const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
      authorization: "c5c138e4921f4b83a484283074eb397a",
      "content-type": "application/json",
    },
  })

const App = () => {
  // Mic-Recorder-To-MP3
  const recorder = useRef(null) //Recorder
  const audioPlayer = useRef(null) //Ref for the HTML Audio Tag
  const [blobURL, setBlobUrl] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [isRecording, setIsRecording] = useState(null)

  useEffect(() => {
    //Declares the recorder object and stores it inside of ref
    recorder.current = new MicRecorder({ bitRate: 128 })
  }, [])

  const startRecording = () => {
    // Check if recording isn't blocked by browser
    recorder.current.start().then(() => {
      setIsRecording(true)
    })
  }

  const stopRecording = () => {
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const file = new File(buffer, "audio.mp3", {
          type: blob.type,
          lastModified: Date.now(),
        })
        const newBlobUrl = URL.createObjectURL(blob)
        setBlobUrl(newBlobUrl)
        setIsRecording(false)
        setAudioFile(file)
      })
      .catch((e) => console.log(e))
  }

  // AssemblyAI API

  // State variables
  const [uploadURL, setUploadURL] = useState("")
  const [transcriptID, setTranscriptID] = useState("")
  const [transcriptData, setTranscriptData] = useState("")
  const [transcript, setTranscript] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Upload the Audio File and retrieve the Upload URL
  useEffect(() => {
    if (audioFile) {
      assembly
        .post("/upload", audioFile)
        .then((res) => setUploadURL(res.data.upload_url))
        .catch((err) => console.error(err))
    }
  }, [audioFile])

  // Submit the Upload URL to AssemblyAI and retrieve the Transcript ID
  const submitTranscriptionHandler = () => {
    assembly
      .post("/transcript", {
        audio_url: uploadURL,
        summarization: true,
        summary_model: "informative",
        summary_type: "bullets"
      })
      .then((res) => {
        setTranscriptID(res.data.id)

        checkStatusHandler()
      })
      .catch((err) => console.error(err))
  }

  // Check the status of the Transcript
  const checkStatusHandler = async () => {
    setIsLoading(true)
    try {
      await assembly.get(`/transcript/${transcriptID}`).then((res) => {
        setTranscriptData(res.data)
      })
    } catch (err) {
      console.error(err)
    }
  }

  // Periodically check the status of the Transcript
  useEffect(() => {
    const interval = setInterval(() => {
      if (transcriptData.status !== "completed" && isLoading) {
        checkStatusHandler()
      } else {
        setIsLoading(false)
        setTranscript(transcriptData.summary)

        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  },)

  return (
    <div className='blockStyle'>
      <HeaderView></HeaderView>
      <div className='buttonAlignment'>
        <button className={"button"} disabled={isRecording} onClick={startRecording}>
          <a className={"iconStyle"}>        
            <BiMicrophone></BiMicrophone>
            Listen
          </a>
        </button>
        <button className={"button"} disabled={!isRecording} onClick={stopRecording}>
          <a className={"iconStyle"}>        
            <BiMicrophoneOff></BiMicrophoneOff>
            Stop
          </a>
        </button>
        <button className={"button"} onClick={submitTranscriptionHandler}>
        <a className={"iconStyle"}>        
            <GiNotebook padding="100px"></GiNotebook>
            Summarize
          </a>
        </button>
      </div>
      <div>
        <audio ref={audioPlayer} src={blobURL} controls='controls'/>
      </div>
      {transcriptData.status === "completed" ? (
        <p>{transcript}</p>
      ) : (
        <p>{transcriptData.status}</p>
      )}
    </div>
  )
}

export default App
/*function App() {
  const MicRecorder = require('mic-recorder-to-mp3');
  const recorder = new MicRecorder({
    bitRate: 128
  });
  const [audioFile, setAudioFile] = useState(null);
  const [transcriptID, setTranscriptID] = useState("");
  const [uploadURL, setUploadURL] = useState("");
  const [transcript, setTranscript] = useState("")
  const [transcriptData, setTranscriptData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(null)
  const [blobURL, setBlobUrl] = useState(null)


  //const axios = require("axios");
  const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: "c5c138e4921f4b83a484283074eb397a",
    },
  });
  useEffect(() => {
    if (audioFile) {
      assembly
        .post("/upload", audioFile)
        .then((res) => setUploadURL(res.data.upload_url))
        .catch((err) => console.error(err))
    }
  }, [audioFile])

  useEffect(() => {
    const interval = setInterval(() => {
      if (transcriptData.status !== "completed" && isLoading) {
        checkStatusHandler()
      } else {
        setIsLoading(false)
        setTranscript(transcriptData.text)

        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  },)

  function onStartRecording(){
    // Start recording. Browser will request permission to use your microphone.
    recorder.start().then(() => {
      setIsRecording(true)
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
      const newBlobUrl = URL.createObjectURL(blob)
      setBlobUrl(newBlobUrl)
      setIsRecording(false)
      setAudioFile(file)

    }).catch((e) => {
        alert('We could not retrieve your message');
        console.log(e);
    });
  }

  function onSummarize(){
    assembly
      .post("/transcript", {
        audio_url: uploadURL,
        summarization: true,
        summary_model: "informative",
        summary_type: "bullets"
      })
      .then((res) => {
        setTranscriptID(res.data.id)
        checkStatusHandler()
      })
      .catch((err) => console.error(err))
  }

  const checkStatusHandler = async () => {
    setIsLoading(true)
    try {
      await assembly.get(`/transcript/${transcriptID}`).then((res) => {
        setTranscriptData(res.data)
      })
    } catch (err) {
      console.error(err)
    }
  }

  console.log(transcriptData)
  return (
    <div>
      <img className="App-logo" src="logo.png"></img>
      <button onClick={onStartRecording}>
        Start Recording
      </button>
      <button onClick={onStopRecording}>
        Stop Recording
      </button>
      <button onClick={onSummarize}>
        Summarize
      </button>
      {transcriptData.status === "completed" ? (
        <p>{transcript}</p>
      ) : (
        <p>{transcriptData.status}</p>
      )}
    </div>
  );
}

export default App;*/
