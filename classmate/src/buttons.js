import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import MicRecorder from "mic-recorder-to-mp3"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { BiMicrophone, BiMicrophoneOff } from "react-icons/bi";
import { GiNotebook } from "react-icons/gi";
import Spinner from 'react-bootstrap/Spinner';
 // Set AssemblyAI Axios Header
 const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
      authorization: "c5c138e4921f4b83a484283074eb397a",
      "content-type": "application/json",
    },
  })

const ButtonView = () => {

const recorder = useRef(null) //Recorder
  const audioPlayer = useRef(null) //Ref for the HTML Audio Tag
  const [blobURL, setBlobUrl] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [isRecording, setIsRecording] = useState(null)
  const [uploadURL, setUploadURL] = useState("")
  const [transcriptID, setTranscriptID] = useState("")
  const [transcriptData, setTranscriptData] = useState("")
  const [transcript, setTranscript] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
 export default ButtonView