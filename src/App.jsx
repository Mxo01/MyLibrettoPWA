import Navbar from './Navbar/Navbar';
import Login from './Login/Login';
import Notes from './Notes/Notes';
import Subjects from './Subjects/Subjects';
import Statistics from './Statistics/Statistics';
import PageNotFound from './PageNotFound/PageNotFound';
import {BrowserRouter, Route, Routes} from 'react-router-dom';

// Check if hamburger menu is clicked
let menuClicked = sessionStorage.getItem('Menu click') === 'true';

const App = () => {
  return ( 
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* For each Route if menu is clicked don't show components */}
          <Route path="/" element={!menuClicked ? <Login /> : <></>} />
          <Route path="/notes" element={!menuClicked ? <Notes /> : <></>} />
          <Route path="/subjects" element={!menuClicked ? <Subjects /> : <></>} />
          <Route path="/statistics" element={!menuClicked ? <Statistics /> : <></>} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
 
export default App;
