import logo from '../img/icon512.png';
import ideaIcon from '../img/idea.png'
import { firebaseAPP } from '../firebaseConfig.js';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Swal from 'sweetalert2';
import NavbarCSS from './Navbar.module.css';

// Firebase imports
import { getAuth, 
         signOut
       } from 'firebase/auth';

// Initialize firebase app
const app = firebaseAPP;

// Create authentication and database
const auth = getAuth(app);

// List of kind advice
const advices = [
  'Find or create a study group... it will make things easier for you',
  "Don't go to bed too late... or you won't understand anything in class next morning!",
  'Everyone has their own times, just look at your path and never compare it with that of others',
  'Rule number 1, never refuse anything in the first three years!',
  'Try to gain as much experience as possible, choosing the most suitable path for you. Not always the simplest one is the best, you could leave out important topics for your future!',
  'Try to get the best out of who you think is better or worse than you',
  'Aim for improvement, not perfection!',
  'Remember that the university must form you, not destroy you',
  "You're not just your matriculation number, or your grade point average... you're so much more",
  'Before being a student you are a person, take care of your mental health',
  "Don't be ashamed to ask questions, curiosity is a fundamental element for learning",
  'There is no universal study method, find the one that best suits you and improve it over time',
  'Thirty 18 make a degree, eighteen 30 make a half'
];

// All possible links
let links = ['/', '/notes', '/subjects', '/statistics'];

const Navbar = () => {
  const location = useLocation(); // get current location

  const handleAdvice = (e) => {
    e.preventDefault();

    // Get a random advice from the list
    const randomAdvice = advices[Math.floor(Math.random() * advices.length)];

    // Send the popup with the advice
    Swal.fire({
      text: randomAdvice,
      imageUrl: ideaIcon,
      imageWidth: 150,
      imageHeight: 150,
      confirmButtonText: 'Go back',
      confirmButtonColor: 'orange',
      color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
      background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)',
      imageAlt: 'Idea icon',
    });
  }

  const [lightMode, setLightMode] = useState(sessionStorage.getItem('LightMode') === 'true');

  // Handle light mode between different pages
  const handleLightMode = (e) => {
    e.preventDefault();

    const wasLightMode = sessionStorage.getItem('LightMode') === 'true';
    sessionStorage.setItem('LightMode', !wasLightMode);

    document.body.classList.toggle('light-theme');

    if (document.body.classList.contains('light-theme')) setLightMode(true);
    else setLightMode(false);
  }

  // If the user want to logout
  function handleLogOut(e) {
    e.preventDefault();

    // Sign out the users and redirect them to the home page
    signOut(auth).then(() => {
      window.location.href = '/';
      localStorage.removeItem('isLoggedIn'); // remove "Remember me" option
      localStorage.removeItem('Email'); // remove saved email
      setMenuClicked(false);
      sessionStorage.setItem('Menu click', false);
    });
  }

  // If the user want to go back to the home page without sign out
  const handleGoHome = () => {
    setMenuClicked(false);
    sessionStorage.setItem('Menu click', false);
    window.location.href = '/';
  }

  const [menuClicked, setMenuClicked] = useState(sessionStorage.getItem('Menu click') === 'true');

  // Handle the dropdown menu and links
  const handleDropMenu = (e) => {
    e.preventDefault();

    setMenuClicked(!menuClicked);
    sessionStorage.setItem('Menu click', !menuClicked);
    window.location.reload(true);
  }

  // Handle link clicks
  const handleLinks = () => {
    setMenuClicked(false);
    sessionStorage.setItem('Menu click', false);
  }

  return ( 
    <>
      <nav className={NavbarCSS.nav}>
        <div className={NavbarCSS.logo} title='Go to home page' onClick={handleGoHome}>
          <img className={NavbarCSS.logoImg} src={logo} alt="Logo" />
          <h1 className={NavbarCSS.navH1}>MyLibretto</h1>
        </div>
        <div className={location.pathname === '/' ? NavbarCSS.links : NavbarCSS.linksHidden}>
          <Link className={NavbarCSS.route} to="/notes">Notes</Link>
          <button className={NavbarCSS.buttonLink} type="button" title="Kind advice" onClick={handleAdvice}><ion-icon name="bulb-outline" /></button>
          <button className={NavbarCSS.buttonLink} type="button" title="Light Mode" onClick={handleLightMode}>{lightMode ? <ion-icon name="moon-outline"></ion-icon> : <ion-icon name="sunny-outline" />}</button>
        </div>
        <div className={location.pathname === '/notes' ? NavbarCSS.links : NavbarCSS.linksHidden}>
          <Link className={NavbarCSS.route} to="/">Home</Link>
          <button className={NavbarCSS.buttonLink} type="button" title="Light Mode" onClick={handleLightMode}>{lightMode ? <ion-icon name="moon-outline"></ion-icon> : <ion-icon name="sunny-outline" />}</button>
        </div>
        <div className={location.pathname === '/subjects' ? NavbarCSS.links : NavbarCSS.linksHidden}>
          <Link className={NavbarCSS.route} to="/statistics">Statistics</Link>
          <button className={NavbarCSS.buttonLink} type="button" title="Log Out" onClick={handleLogOut}><ion-icon name="log-out-outline"></ion-icon></button>
          <button className={NavbarCSS.buttonLink} type="button" title="Light Mode" onClick={handleLightMode}>{lightMode ? <ion-icon name="moon-outline"></ion-icon> : <ion-icon name="sunny-outline" />}</button>
        </div>
        <div className={location.pathname === '/statistics' ? NavbarCSS.links : NavbarCSS.linksHidden}>
          <Link className={NavbarCSS.route} to="/subjects">Subjects</Link>
          <button className={NavbarCSS.buttonLink} type="button" title="Log Out" onClick={handleLogOut}><ion-icon name="log-out-outline"></ion-icon></button>
          <button className={NavbarCSS.buttonLink} type="button" title="Light Mode" onClick={handleLightMode}>{lightMode ? <ion-icon name="moon-outline"></ion-icon> : <ion-icon name="sunny-outline" />}</button>
        </div>
        <button className={(links.indexOf(location.pathname) > -1) ? NavbarCSS.dropMenu : NavbarCSS.dropMenuHidden} type="button" title="Menu" onClick={handleDropMenu}>{!menuClicked ? <ion-icon name="menu-outline"></ion-icon> : <ion-icon name="close-outline"></ion-icon>}</button>
      </nav>

      {/* Responsive links */}
      <div className={menuClicked ? NavbarCSS.menuLinks : NavbarCSS.linksHidden}>
        <div className={location.pathname === '/' ? NavbarCSS.menuLink : NavbarCSS.linksHidden}>
          <a className={NavbarCSS.route} href="/notes" onClick={handleLinks}>Notes</a>
          <button className={NavbarCSS.buttonLink} type="button" title="Kind advice" onClick={handleAdvice}><ion-icon name="bulb-outline" /></button>
          <button className={NavbarCSS.buttonLink} type="button" title="Light Mode" onClick={handleLightMode}>{lightMode ? <ion-icon name="moon-outline"></ion-icon> : <ion-icon name="sunny-outline" />}</button>
        </div>
        <div className={location.pathname === '/notes' ? NavbarCSS.menuLink : NavbarCSS.linksHidden}>
          <a className={NavbarCSS.route} href="/" onClick={handleLinks}>Home</a>
          <button className={NavbarCSS.buttonLink} type="button" title="Light Mode" onClick={handleLightMode}>{lightMode ? <ion-icon name="moon-outline"></ion-icon> : <ion-icon name="sunny-outline" />}</button>
        </div>
        <div className={location.pathname === '/subjects' ? NavbarCSS.menuLink : NavbarCSS.linksHidden}>
          <a className={NavbarCSS.route} href="/statistics" onClick={handleLinks}>Statistics</a>
          <button className={NavbarCSS.buttonLink} type="button" title="Log Out" onClick={handleLogOut}><ion-icon name="log-out-outline"></ion-icon></button>
          <button className={NavbarCSS.buttonLink} type="button" title="Light Mode" onClick={handleLightMode}>{lightMode ? <ion-icon name="moon-outline"></ion-icon> : <ion-icon name="sunny-outline" />}</button>
        </div>
        <div className={location.pathname === '/statistics' ? NavbarCSS.menuLink : NavbarCSS.linksHidden}>
          <a className={NavbarCSS.route} href="/subjects" onClick={handleLinks}>Subjects</a>
          <button className={NavbarCSS.buttonLink} type="button" title="Log Out" onClick={handleLogOut}><ion-icon name="log-out-outline"></ion-icon></button>
          <button className={NavbarCSS.buttonLink} type="button" title="Light Mode" onClick={handleLightMode}>{lightMode ? <ion-icon name="moon-outline"></ion-icon> : <ion-icon name="sunny-outline" />}</button>
        </div>
      </div>
    </>
  );
}
 
export default Navbar;