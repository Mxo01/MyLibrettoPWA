import popupPrevLogo from '../img/stats.png';
import { firebaseAPP, firebaseDB } from '../firebaseConfig.js';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Chart as ChartJS,
         BarElement,
         LineElement,
         CategoryScale,
         LinearScale,
         PointElement,
         Tooltip,
         Legend
       } from 'chart.js';
import {Bar, Line} from 'react-chartjs-2';
import StatsCSS from './Statistics.module.css';

// Firebase imports
import { getAuth } from 'firebase/auth';
import { collection,
         onSnapshot
       } from 'firebase/firestore';

// Get the app
const app = firebaseAPP;

// Get the auth
const auth = getAuth(app);

// Get the database
const db = firebaseDB;

// ChartJS options
ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

// Chart options
const options = {
  plugins: {
    legend: {
      labels: {
        font: {
          size: 16,
          weight: 500,
          family: 'Poppins'
        }
      }
    }
  },
  responsive: true,
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

let email, colRef;

let average = 0, degree = 0, weightedAverage = 0, weightedDegree = 0, arithmeticSum = 0, weightedSum = 0, totalCFU = 0, totalExam = 0, newAverage = 0, newDegree = 0, newWeightedAverage = 0, newWeightedDegree = 0;

let grades = [];
let gradesSet = [];
let gradesOccurrences = {}

// On page load handle light/dark mode
window.onload = () => {
  const wasLightMode = sessionStorage.getItem('LightMode') === 'true';
  document.body.classList.toggle('light-theme', wasLightMode);
}

const Statistics = () => {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (loading) return;

    if (!user && (!localStorage.getItem('isLoggedIn'))) window.location.href = '/'; // If the user isn't logged in
  }, [loading, user]);

  let data1 = {};
  let data2 = {};
  let data3 = {};

  const [documents, setDocuments] = useState([]);
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    email = localStorage.getItem('Email'); // get the user email
    if (user || email) {
      colRef = collection(db, email); // get the collection reference

      // Get realtime data
      onSnapshot(colRef, {includeMetadataChanges: true}, (snapshot) => {
        setDocuments(snapshot.docs.map(doc => ({id: doc.id, data: doc.data()})));  // save all documents on a list
        setUpdate(true);
      });
    }
  }, [user, update]);
  
  useEffect(() => {
    if (documents.length !== 1) {
      // Initialize some variables
      grades = [];
      totalExam = 0;
      arithmeticSum = 0;
      weightedSum = 0;
      totalCFU = 0;

      // For each document
      documents.forEach(subject => {
        // If the document is an exam
        if (subject.data.hasOwnProperty('isExam')) {
          grades.push(subject.data.grade); // Add the exam to grades list

          arithmeticSum += parseInt(subject.data.grade);
          weightedSum += parseInt(subject.data.grade * subject.data.cfu);
          totalCFU += parseInt(subject.data.cfu); 
          totalExam++;
        }
      });

      gradesSet = [...new Set(grades.sort())]; // sort the list

      // For each grade add new field with the name of the grade and its occurrences
      grades.forEach(grade => gradesOccurrences[grade] = grades.filter(x => x === grade).length);

      average = totalExam === 0 ? 0 : Math.round(((arithmeticSum / totalExam) + Number.EPSILON) * 100) / 100;
      degree = totalExam === 0 ? 0 : Math.round((((average * 110) / 30) + Number.EPSILON) * 100) / 100;
      weightedAverage = totalExam === 0 ? 0 : Math.round(((weightedSum / totalCFU) + Number.EPSILON) * 100) / 100;
      weightedDegree = totalExam === 0 ? 0 : Math.round((((weightedAverage * 110) / 30) + Number.EPSILON) * 100) / 100;
    }
  }, [documents]);

  const [popupExamOpened, setPopupExamOpened] = useState(false);
  const [popupPrevOpened, setPopupPrevOpened] = useState(false);

  let [grade, setGrade] = useState('');
  let [cfu, setCfu] = useState('');

  const [addPrevDisabled, setAddPrevDisabled] = useState(false);

  // Open/Close exam popup
  const toggleExamPopup = () => {
    setAddPrevDisabled(true);
    setPopupExamOpened(!popupExamOpened);
    setGrade('');
    setCfu('');
  }

  // Open/Close prevision popup
  const togglePrevPopup = () => {
    setPopupPrevOpened(!popupPrevOpened);
    setGrade('');
    setCfu('');
  }

  // Handle getting a prevision
  const handleSubmitExam = (e) => {
    e.preventDefault();

    // Prevision variables
    let prevCFU = 0, prevTotalExam = totalExam, prevArithmeticSum = arithmeticSum, prevWeightedSum = weightedSum;

    // If grade or cfu starts with "0" remove the starting zero
    grade = (grade.startsWith(0) && grade.toString()[grade.toString().length - 1] !== 0) ? grade.toString().slice(1) : grade;
    cfu = (cfu.startsWith(0) && cfu.toString()[cfu.toString().length - 1] !== 0) ? cfu.toString().slice(1) : cfu;

    // Some controls on grade and cfu
    grade = grade < 18 ? '18' : (grade > 30 ? '30' : grade);
    cfu = cfu < 1 ? '1' : (cfu > 18 ? '18' : cfu);

    // Update statistics
    ++prevTotalExam;
    prevCFU += (totalCFU + parseInt(cfu));
    prevArithmeticSum += parseInt(grade);
    prevWeightedSum += parseInt(grade * cfu);

    newAverage = Math.round(((prevArithmeticSum / prevTotalExam) + Number.EPSILON) * 100) / 100;
    newDegree = Math.round((((newAverage * 110) / 30) + Number.EPSILON) * 100) / 100;
    newWeightedAverage = Math.round(((prevWeightedSum / prevCFU) + Number.EPSILON) * 100) / 100;
    newWeightedDegree = Math.round((((newWeightedAverage * 110) / 30) + Number.EPSILON) * 100) / 100;

    toggleExamPopup();
    togglePrevPopup();
  }

  // If user wants to make another prevision
  const handleRetry = (e) => {
    e.preventDefault();

    togglePrevPopup();
    toggleExamPopup();
  }

  // Data objects of charts
  data1 = {
    labels: gradesSet,
    datasets: [{
      borderColor: '#0ef',
      backgroundColor: 'rgba(0, 238, 255, 0.301)',
      label: 'Votes Distribution',
      data: Object.values(gradesOccurrences),
      borderWidth: 2
    }]
  };

  data2 = {
    labels: gradesSet,
    datasets: [{
      borderColor: 'orange',
      backgroundColor: 'rgba(255, 166, 0, 0.5)',
      label: 'Votes Distribution',
      data: Object.values(gradesOccurrences),
      borderWidth: 2
    }]
  };

  data3 = {
    labels: ['Gained', 'Total'],
    datasets: [{
      borderColor: ['orange', '#0ef'],
      backgroundColor: ['rgba(255, 166, 0, 0.5)', 'rgba(0, 238, 255, 0.301)'],
      label: 'Gained CFU',
      data: [totalCFU, 180],
      borderWidth: 1
    }]
  };

  return (
    <>
      {/*-Base template*/}
      <div className={StatsCSS.template}>
        {/*-Left subjects template*/}
        <div className={StatsCSS.subLeft}>
          <div className={StatsCSS.title}>
            <h2 className={StatsCSS.titleH2}>Average</h2>
            <button className={StatsCSS.add} type="button" disabled={addPrevDisabled} onClick={toggleExamPopup}>
              <span className={StatsCSS.buttonIcon} title="New Prevision"><ion-icon name="trending-up-outline" /></span>
            </button>
          </div>
          <section className={StatsCSS.average} id="stats">
            <div className={StatsCSS.averageStat}>
              <p>Average</p>
              <p className={StatsCSS.value}>{average}</p>
            </div>
            <div className={StatsCSS.degreeStat}>
              <p>Degree</p>
              <p className={StatsCSS.value}>{degree}</p>
            </div>
            <div className={StatsCSS.weightedAverageStat}>
              <p>Weighted Average</p>
              <p className={StatsCSS.value}>{weightedAverage}</p>
            </div>
            <div className={StatsCSS.weightedDegreeStat}>
              <p>Weighted Degree</p>
              <p className={StatsCSS.value}>{weightedDegree}</p>
            </div>
          </section>
        </div>

        {/*-Right subjects template*/}
        <div className={StatsCSS.subRight}>
          <div className={StatsCSS.title}>
            <h2 className={StatsCSS.titleH2}>Charts</h2>
          </div>
          <section className={StatsCSS.charts}>
            <div className={StatsCSS.plot}>
              <Bar data={data1} options={options} />
            </div>
            <div className={StatsCSS.plot}>
              <Line data={data2} options={options} />
            </div>
            <div className={StatsCSS.plot}>
              <Bar data={data3} options={options} />
            </div>
          </section>
        </div>
      </div>

      {/*-Pop-up Exam*/}
      <div className={popupExamOpened ? StatsCSS.openPopup : StatsCSS.popup}>
        <form onSubmit={handleSubmitExam}>
          <img className={StatsCSS.popupImg} src={popupPrevLogo} alt="New Prevision" />
          <h2 className={StatsCSS.popupTitle}>New prevision</h2>
          <div className={StatsCSS.inputGroup}>
            <span className={StatsCSS.icon} title="Grade"><ion-icon name="school-outline" /></span>
            <input className={StatsCSS.input} type="number" min="18" max="30" maxLength="2" id="grade" value={grade} onChange={(e) => setGrade(e.target.value.length > e.target.maxLength ? e.target.value = e.target.value.slice(0, e.target.maxLength) : e.target.value)} required />
            <label className={StatsCSS.label}>Grade</label>
          </div>
          <div className={StatsCSS.inputGroup}>
            <span className={StatsCSS.icon} title="CFU"><ion-icon name="barbell-outline" /></span>
            <input className={StatsCSS.input} type="number" min="1" max="18" maxLength="2" id="cfu" value={cfu} onChange={(e) => setCfu(e.target.value.length > e.target.maxLength ? e.target.value = e.target.value.slice(0, e.target.maxLength) : e.target.value)} required />
            <label className={StatsCSS.label}>CFU</label>
          </div>
          <div className={StatsCSS.popupButtons}>
            <button id={StatsCSS.confirmAdd} type="submit">Show</button>
            <button className={StatsCSS.close} type="button" onClick={() => {toggleExamPopup(); setAddPrevDisabled(false)}}>
              <span className={StatsCSS.closeIcon} title="Close">
                <ion-icon name="close-outline" />
              </span>
            </button>
          </div>
        </form>
      </div>

      {/*Prevision Pop-up*/}
      <div className={popupPrevOpened ? StatsCSS.openPopup : StatsCSS.popup}>
        <form onSubmit={handleRetry}>
          <img className={StatsCSS.popupImg} src={popupPrevLogo} alt="New Prevision" />
          <h2 className={StatsCSS.popupTitle}>New prevision</h2>
          <div className={StatsCSS.previsions}>
            <p>{average} <ion-icon name="arrow-forward-outline" role="img" class="md hydrated" aria-label="arrow forward outline"></ion-icon> {newAverage}</p>
            <p>{degree} <ion-icon name="arrow-forward-outline" role="img" class="md hydrated" aria-label="arrow forward outline"></ion-icon> {newDegree}</p>
            <p>{weightedAverage} <ion-icon name="arrow-forward-outline" role="img" class="md hydrated" aria-label="arrow forward outline"></ion-icon> {newWeightedAverage}</p>
            <p>{weightedDegree} <ion-icon name="arrow-forward-outline" role="img" class="md hydrated" aria-label="arrow forward outline"></ion-icon> {newWeightedDegree}</p>
          </div>
          <div className={StatsCSS.popupButtons}>
            <button id={StatsCSS.retry} type="submit">Retry</button>
            <button className={StatsCSS.close} type="button" onClick={() => {togglePrevPopup(); setAddPrevDisabled(false)}}>
              <span className={StatsCSS.closeIcon} title="Close">
                <ion-icon name="close-outline" />
              </span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
 
export default Statistics;