import { firebaseAPP, firebaseDB } from '../firebaseConfig.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import LoginCSS from './Login.module.css';

// Firebase imports
import { getAuth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword,
         sendPasswordResetEmail 
       } from 'firebase/auth';
import { addDoc,
         collection
       } from 'firebase/firestore';

// Initialize firebase app
const app = firebaseAPP;

// Create authentication and database
const auth = getAuth(app);
const db = firebaseDB;

// Regex that allows to check if a specific email is valid
let validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// On page load handle light/dark mode
window.onload = () => {
  const wasLightMode = sessionStorage.getItem('LightMode') === 'true';
  document.body.classList.toggle('light-theme', wasLightMode);
}

// Check for user permission to send notification
function getPermission(permission) {
  if (permission === 'granted') {
    if (localStorage.getItem('Notify-Permission') !== 'true') {
      localStorage.setItem('Notify-Permission', true);

      toast.success('Notification succesfully activated!', {
        duration: 5000,
        position: 'top-center',
        style: {
          color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
          background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
        }
      });
    }
  }

  if (permission === 'denied') localStorage.setItem('Notify-Permission', 'false');
}

try {
  Notification.requestPermission().then(permission => getPermission(permission)); // try to get user permission
}

catch (error) {
  // For Safari (MacOS) in particular for older Safari versions
  if (error instanceof TypeError) {
    Notification.requestPermission(permission => getPermission(permission)); // this type of function is deprecated for new Safari versions but is compatible with older versions
  }
  
  // For iOS or devices that not support notification
  else {
    if (localStorage.getItem('Notify-Unsupported') !== 'true') {
      Swal.fire({
        icon: 'warning',
        title: 'This device does not support web notifications!',
        confirmButtonColor: 'orange',
        confirmButtonText: 'Ok',
        color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
        background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
      });

      localStorage.setItem('Notify-Unsupported', true);
    }
  }
}

const Login = () => {
  // Check if user is already logged in
  const loggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const navigate = useNavigate(); // get the navigate object

  let [errorMessageLogin, setErrorMessageLogin] = useState('');
  let [errorMessageRegister, setErrorMessageRegister] = useState('');
  let [networkErrorLogin, setNetworkErrorLogin] = useState('');
  let [networkErrorRegister, setNetworkErrorRegister] = useState('');

  const [rememberMe, setRememberMe] = useState(false);

  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');

  // If user wants to skip log in
  const handleAutoLogin = (e) => {
    e.preventDefault();

    navigate('/subjects');
  }

  // If user wants to log in
  const handleLogin = (e) => {
    e.preventDefault();

    // Check if the email is valid
    if (emailLogin.match(validEmailRegex)) {
      // Check if the password doesn't contains whitespaces
      if (passwordLogin.indexOf(' ') === -1) {
        // Log in the user
        signInWithEmailAndPassword(auth, emailLogin, passwordLogin).then(() => {
          localStorage.setItem('Email', emailLogin); // save the email
          if (rememberMe) localStorage.setItem('isLoggedIn', true); // if "Remember me" option is checked save the state
          resetForms();
          
          navigate('/subjects');
        }).catch(err => {
          // If user inserted a wrong email/password
          if (err.code !== 'auth/network-request-failed') {
            setErrorMessageLogin('Wrong email or password!');
            // Send a warning popup
            Swal.fire({
              icon: 'error',
              text: 'Wrong email or password!',
              confirmButtonText: 'Try again',
              confirmButtonColor: '#0ef',
              color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
              background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
            });
          }
          // If there is no connection
          else {
            setNetworkErrorLogin('Please, turn on your Wi-Fi to log in');
            // Send a warning popup
            Swal.fire({
              icon: 'error',
              text: 'Please, turn on your Wi-Fi to log in',
              confirmButtonText: 'Try again',
              confirmButtonColor: '#0ef',
              color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
              background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
            });
          }
        });
      }

      // If the user inserted an invalid password
      else {
        setErrorMessageLogin('Invalid password, remove white spaces!');
        // Send a warning popup
        Swal.fire({
          icon: 'error',
          text: 'Invalid password, remove white spaces!',
          confirmButtonText: 'Try again',
          confirmButtonColor: '#0ef',
          color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
          background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
        });
      }
    }

    // If the user inserted an invalid email
    else {
      setErrorMessageLogin('Invalid email!');
      // Send a warning popup
      Swal.fire({
        icon: 'error',
        text: 'Invalid email!',
        confirmButtonText: 'Try again',
        confirmButtonColor: '#0ef',
        color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
        background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
      });
    }
  }

  const [emailRegister, setEmailRegister] = useState('');
  const [passwordRegister, setPasswordRegister] = useState('');

  // If user wants to sign up
  const handleRegister = (e) => {
    e.preventDefault();

    // Check if the email is valid
    if (emailRegister.match(validEmailRegex)) {
      // Check if the password doesn't contains whitespaces
      if (passwordRegister.indexOf(' ') === -1) {
        // Create and sign up the user
        createUserWithEmailAndPassword(auth, emailRegister, passwordRegister).then(() => {
          addDoc(collection(db, emailRegister), {}); // add for the first time the user document to the database

          localStorage.setItem('Email', emailRegister); // save the email
          resetForms();

          navigate('/subjects');
        }).catch(err => {
          // If user inserted a wrong email/password
          if (err.code !== 'auth/network-request-failed') {
            setErrorMessageRegister('This email is already in use!');
            // Send a warning popup
            Swal.fire({
              icon: 'error',
              text: 'This email is already in use!',
              confirmButtonText: 'Try again',
              confirmButtonColor: 'orange',
              color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
              background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
            });
          }
          // If there is no connection
          else {
            setNetworkErrorRegister('Please, turn on your Wi-Fi to sign up');
            // Send a warning popup
            Swal.fire({
              icon: 'error',
              text: 'Please, turn on your Wi-Fi to sign up',
              confirmButtonText: 'Try again',
              confirmButtonColor: '#0ef',
              color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
              background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
            });
          }
        });
      }

      // If the user inserted an invalid password
      else {
        setErrorMessageRegister('Invalid password, remove white spaces!');
        // Send a warning popup
        Swal.fire({
          icon: 'error',
          text: 'Invalid password, remove white spaces!',
          confirmButtonText: 'Try again',
          confirmButtonColor: '#0ef',
          color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
          background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
        });
      }
    }

    // If the user inserted an invalid password
    else {
      setErrorMessageRegister('Invalid email!');
      // Send a warning popup
      Swal.fire({
        icon: 'error',
        text: 'Invalid email!',
        confirmButtonText: 'Try again',
        confirmButtonColor: '#0ef',
        color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
        background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
      });
    }
  }

  // Reset all forms
  function resetForms() {
    setEmailLogin('');
    setPasswordLogin('');
    setEmailRegister('');
    setPasswordRegister('');
    setErrorMessageLogin('');
    setErrorMessageRegister('');
    setNetworkErrorLogin('');
    setNetworkErrorRegister('');
    setShowPassword(false);
  }

  const [isActive, activateLoginSection] = useState(false);

  const changeAccessMode = () => {
    activateLoginSection(!isActive);
    setInResetPwd(false);
    resetForms();
  }

  const [inResetPwd, setInResetPwd] = useState(false);

  // Handle password reset if the user forgot it
  const handleForgotPassword = (e) => {
    e.preventDefault();

    // Send reset email to the user
    sendPasswordResetEmail(auth, emailLogin).then(() => {
      // Send a success popup
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Email sent with success, follow the link to reset your password',
        color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
        background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)',
        showConfirmButton: false,
        timer: 5000
      });

      setInResetPwd(false);
    }).catch(err => {
        // If the user inserted an invalid email
        if (err.code !== 'auth/internal-error') {
          // Send a warning popup
          Swal.fire({
            icon: 'error',
            text: 'This email does not exist!',
            confirmButtonText: 'Try again',
            confirmButtonColor: '#0ef',
            color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
            background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
          });
        }
        // If there is no connection
        else {
          // Send a warning popup
          Swal.fire({
            icon: 'error',
            text: 'Please, turn on your Wi-Fi to reset',
            confirmButtonText: 'Ok',
            confirmButtonColor: 'orange',
            color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
            background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
          });
        }
      });
  }

  const [showPassword, setShowPassword] = useState(false);

  const handleInReset = () => {
    setEmailLogin('');
    setInResetPwd(!inResetPwd);
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className={LoginCSS.background}></div>
      <div className={LoginCSS.container}>
        <div className={LoginCSS.item}>
          <h2 className={LoginCSS.logoLogin}><ion-icon name="school"></ion-icon> MyLibretto</h2>
          <div className={LoginCSS.textItem}>
            <h2>Welcome to your University App!</h2>
            <p>Navigate between the different sections to look at the notes posted by other users or check your grades and related statistics, but first you need to log in</p>
            <div className={LoginCSS.socialIcon}>
              <p>Find me here:</p>
              <a href="https://github.com/Mxo01"><ion-icon name="logo-github"></ion-icon></a>
              <a href="https://www.linkedin.com/in/mariodimodica/"><ion-icon name="logo-linkedin"></ion-icon></a>
              <a href="https://www.instagram.com/not_mxo/"><ion-icon name="logo-instagram"></ion-icon></a>
            </div>
          </div>
        </div>
        <div className={isActive ? LoginCSS.loginSectionActive : LoginCSS.loginSection}>
          <button type="button" className={loggedIn ? LoginCSS.autoLogin : LoginCSS.autoLoginHidden} onClick={handleAutoLogin}>
            <span className={LoginCSS.buttonIcon} title="Skip log in">
              <ion-icon name="log-in-outline"></ion-icon>
            </span>
          </button>
          {/* Log In */}
          <div className={LoginCSS.formWrapper} id={LoginCSS.wrapSignIn}>
            <form onSubmit={inResetPwd ? handleForgotPassword : handleLogin}>
              <p className={LoginCSS.errorMessage}>{errorMessageLogin}</p>
              <p className={LoginCSS.errorMessage}>{networkErrorLogin}</p>
              <h2 className={LoginCSS.loginTitle}>{inResetPwd ? 'Reset Password' : 'Log in'}</h2>
              <div className={LoginCSS.inputGroup}>
                <span className={LoginCSS.icon} title="Email"><ion-icon name="mail-outline" /></span>
                <input type="text" value={emailLogin} onChange={(e) => {setEmailLogin(e.target.value.toLowerCase())}} required />
                <label className={LoginCSS.label}>Email</label>
              </div>
              <div className={inResetPwd ? LoginCSS.fieldHidden : LoginCSS.inputGroup}>
                <span className={LoginCSS.iconPwd} title="Password" onClick={() => setShowPassword(!showPassword)}>{!showPassword ? <ion-icon name="eye-outline"></ion-icon> : <ion-icon name="eye-off-outline"></ion-icon>}</span>
                <input type={showPassword ? 'text' : 'password'} name="logPwd" value={passwordLogin} onChange={(e) => {setPasswordLogin(e.target.value)}} required={!inResetPwd} />
                <label className={LoginCSS.label}>Password</label>
              </div>
              <div className={inResetPwd ? LoginCSS.fieldHidden : LoginCSS.remember} onChange={() => setRememberMe(!rememberMe)}>
                <label><input type="checkbox" /> Remember me</label>
              </div>
              <button className={inResetPwd ? LoginCSS.fieldHidden : LoginCSS.loginBtn} type="submit">Log In</button>
              <div className={!inResetPwd ? LoginCSS.fieldHidden : LoginCSS.resetButtons}>
                <button className={LoginCSS.confirmReset} type="submit">Reset</button>
                <button className={LoginCSS.back} type="button" onClick={handleInReset}>
                  <span className={LoginCSS.backIcon} title="Back">
                    <ion-icon name="arrow-back-outline"></ion-icon>
                  </span>
                </button>
              </div>
              <div className={inResetPwd ? LoginCSS.fieldHidden : LoginCSS.forgotPassword}>
                <p className={LoginCSS.forgotText}>Forgot password?</p>
                <p className={LoginCSS.forgotLink} onClick={handleInReset}>Reset</p>
              </div>
              <div className={inResetPwd ? LoginCSS.fieldHidden : LoginCSS.signUpLink}>
                <p className={LoginCSS.signUpText}>Don't have an account?</p>
                <p className={LoginCSS.signUpBtnLink} onClick={changeAccessMode}>Sign Up</p>
              </div>
            </form>
          </div>

          {/* Sign Up */}
          <div className={LoginCSS.formWrapper} id={LoginCSS.wrapSignUp}>
            <form onSubmit={handleRegister}>
              <p className={LoginCSS.errorMessage}>{errorMessageRegister}</p>
              <p className={LoginCSS.errorMessage}>{networkErrorRegister}</p>
              <h2 className={LoginCSS.signupTitle}>Sign Up</h2>
              <div className={LoginCSS.inputGroup}>
                <span className={LoginCSS.icon} title="Email"><ion-icon name="mail-outline" /></span>
                <input type="text" value={emailRegister} onChange={(e) => {setEmailRegister(e.target.value.toLowerCase())}} required />
                <label className={LoginCSS.label}>Email</label>
              </div>
              <div className={LoginCSS.inputGroup}>
                <span className={LoginCSS.iconPwd} title="Password" onClick={() => setShowPassword(!showPassword)}>{!showPassword ? <ion-icon name="eye-outline"></ion-icon> : <ion-icon name="eye-off-outline"></ion-icon>}</span>
                <input type={showPassword ? 'text' : 'password'} value={passwordRegister} onChange={(e) => {setPasswordRegister(e.target.value)}} required />
                <label className={LoginCSS.label}>Password</label>
              </div>
              <div className={LoginCSS.rememberSignUp}>
                <label><input type="checkbox" required /> I agree to terms & conditions</label>
              </div>
              <button type="submit" className={LoginCSS.signUpBtn}>Sign Up</button>
              <div className={LoginCSS.signInLink}>
                <p className={LoginCSS.signInText}>Already have an account?</p>
                <p className={LoginCSS.signInBtnLink} onClick={changeAccessMode}>Sign In</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
 
export default Login;