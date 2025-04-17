import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Routes, Route} from 'react-router-dom';
import HomePage from './components/HomePage';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Register from './components/Register';
import Login from './components/Login';

function App() {

  return (
    <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1">
      <NavBar/>
        <Routes>
          <Route path='/' element={<HomePage/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>
        </Routes>
      </main>
      <Footer/>
    </div>
  );
};

export default App;