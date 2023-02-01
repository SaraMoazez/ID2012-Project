import './App.css';
import HeaderView from './header';
import ButtonView from './buttons';
import 'bootstrap/dist/css/bootstrap.css';
import { GoMegaphone } from "react-icons/go";
import { AiOutlineExclamationCircle } from "react-icons/ai";

const App = () => {
  return (
    <div className='blockStyle'>
      <HeaderView></HeaderView>
      <div className="jumbotron">
        <h1 style={{ fontSize: "1.8rem"}} className="display-4">Say goodbye to endless note-taking and hello to efficient learning with ClassMate!</h1>
        <div>
            <p className="lead">
            <GoMegaphone className="megaPhoneStyle"></GoMegaphone>
            Transform your lecture experience with ClassMate! Never miss a beat by using our tool to record
            your classes and summarize the important points, so you can focus on understanding instead of writing.
            </p>
        </div>
        <hr></hr>
        <ol className="lead">
          <li>Click on the "Listen" button to start recording the lecture</li>
          <li>When the lecture is over, click on the "Stop" button to stop recording</li>
          <li>Click on the "Summarize" button when you are ready to summarize the lecture</li>
        </ol>
        <p className="lead">
          <AiOutlineExclamationCircle className="megaPhoneStyle"></AiOutlineExclamationCircle>
          Did the summary miss some important points? Don't worry, you can listen to the entire recording of the lecture
          by clicking on the play button on the audio player!
        </p>
      </div>
      <ButtonView></ButtonView>
    </div>
  )
}

export default App