import './App.css'
import NavPg from './Components/NavPg.jsx'
import FooterPg from './Components/FooterPg.jsx';
import { Toaster } from "react-hot-toast";

function App() {


  return (
    <>
      <div className='web-page'>
        <Toaster position="top-right" />
        <NavPg />
        <FooterPg />
      </div>

    </>
  )
}

export default App
