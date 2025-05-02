import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Routes, Route} from 'react-router-dom';
import HomePage from './components/LandingPages/HomePage';
import NavBar from './components/Navigation/NavBar';
import Footer from './components/Navigation/Footer';
import SignUp from './components/Authorization/SignUp';
import Login from './components/Authorization/Login';
import UserProfileForm from './components/Users/UserProfileForm';
import UserProfile from './components/Users/UserProfile';
import UserDashboard from './components/Users/UserDashboard';
import NotFound from './components/LandingPages/NotFound';
import ForgotPassword from './components/Authorization/ForgotPassword';
import LoadingPage from './components/LandingPages/LoadingPage';
import AboutUs from './components/AboutUs/AboutUs';

function App() {

  return (
    <main className="d-flex flex-column min-vh-100">
      <NavBar/>
      <div className="flex-grow-1 d-flex flex-column">
        <Routes>
          <Route path='/' element={<HomePage/>}/>
          <Route path='/accounts/signup' element={<SignUp/>}/>
          <Route path='/accounts/login' element={<Login/>}/>
          <Route path='/user-profile' element={<UserProfile/>}/>
          <Route path='/users' element={<UserProfileForm/>}/>
          <Route path='/userdashboard' element={<UserDashboard/>}/>
          <Route path='/about-us' element={<AboutUs/>}/>
          <Route path='/forgot-password' element={<ForgotPassword/>}/>
          <Route path='/spinner' element={<LoadingPage/>}/>
          <Route path='*' element={<NotFound/>}/>
        </Routes>
      </div>
      <Footer/>
    </main>
  );
};

export default App;