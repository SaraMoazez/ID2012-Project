import './App.css';
import { API_KEY, BASE_URL } from './apiConfig.js';
import 'bootstrap/dist/css/bootstrap.css';
import MicRecorder from "mic-recorder-to-mp3"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { BiMicrophone, BiMicrophoneOff } from "react-icons/bi";
import { GiNotebook } from "react-icons/gi";
import Spinner from 'react-bootstrap/Spinner';

 const assembly = axios.create({
    baseURL: BASE_URL,
    headers: {
      authorization: API_KEY,
      "content-type": "application/json",
    },
  })

const SummarizationView = () => {

  const recorder = useRef(null) 
  const audioPlayer = useRef(null) 
  const [blobURL, setBlobUrl] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [isRecording, setIsRecording] = useState(null)
  const [uploadURL, setUploadURL] = useState("")
  const [transcriptID, setTranscriptID] = useState("")
  const [transcriptData, setTranscriptData] = useState("")
  const [transcript, setTranscript] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  //Initialize a new instance of the MicRecorder class and store it in the recorder.current state object
  useEffect(() => {
    recorder.current = new MicRecorder({ bitRate: 128 })
  }, [])

  //When the user clicks on "Listen", the recording process of the microphone will start
  const startRecording = () => {
    recorder.current.start().then(() => {
      setIsRecording(true)
    })
  }

  //When the user clicks on "Stop", the recording process will be stopped
  //the audio data is then converted into a File object, and the blob URL is stored in the component state
  const stopRecording = () => {
    recorder.current
      .stop()
      .getMp3() //retrieve recorded audio data
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

  //if audioFile state is changed, upload the audio file to AssemblyAI and set the upload URL
  useEffect(() => {
    if (audioFile) {
      assembly
        .post("/upload", audioFile)
        .then((res) => setUploadURL(res.data.upload_url))
        .catch((err) => console.error(err))
    }
  }, [audioFile])

  //Upload the audio URL to AssemblyAI and retrieve the transcript ID
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

  //Check the status of the transcription periodically and retrieve the transcript data when it's completed
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

  //Once the transcriptData.status is equal to "completed", or isLoading is false, retrieve the summary of the transcription
  //the summary is stored in trancript
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
    <div>
        <div className='buttonAlignment'>
            <button className={"button"} disabled={isRecording} onClick={startRecording}>
                <a>        
                    <BiMicrophone></BiMicrophone>
                    Listen
                </a>
            </button>
            <button className={"button"} disabled={!isRecording} onClick={stopRecording}>
                <a>        
                    <BiMicrophoneOff></BiMicrophoneOff>
                    Stop
                </a>
            </button>
            <button className={"button"} onClick={submitTranscriptionHandler}>
                <a>        
                    <GiNotebook padding="100px"></GiNotebook>
                    Summarize
                </a>
            </button>
        </div>
        <div className='audioStyle'>
            <audio ref={audioPlayer} src={blobURL} controls='controls'/>
        </div>
        <div className='blockStyle'>
                <p class="lead"> </p>
                {transcriptData.status === "completed" &&
                    <div className="jumbotron2">
                        <p className= 'lead'>{transcript}</p>
                    </div>
                }
                {transcriptData.status === "processing" &&
                    <Spinner animation="border" role="status"></Spinner>
                }
        </div>
    </div>
  );
 }
 export default SummarizationView;