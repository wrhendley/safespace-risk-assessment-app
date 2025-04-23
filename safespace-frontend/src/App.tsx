import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Routes, Route} from 'react-router-dom';
import HomePage from './components/Other/HomePage';
import NavBar from './components/Other/NavBar';
import Footer from './components/Other/Footer';
import SignUp from './components/Authorization/SignUp';
import Login from './components/Authorization/Login';
import UserProfileForm from './components/Users/UserProfileForm';
import UserDashboard from './components/Users/UserDashboard';
import NotFound from './components/Other/NotFound';
import NoAccess from './components/Other/NoAccess';

function App() {

  return (
    <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1">
      <NavBar/>
        <Routes>
          <Route path='/' element={<HomePage/>}/>
          <Route path='/accounts/signup' element={<SignUp/>}/>
          <Route path='/accounts/login' element={<Login/>}/>
          <Route path='/users/:id' element={<UserProfileForm />}/>
          <Route path='/userdashboard' element={<UserDashboard/>}/>
          <Route path='*' element={<NotFound/>}/>          
        </Routes>
      </main>
      <Footer/>
    </div>
  );
};

export default App;