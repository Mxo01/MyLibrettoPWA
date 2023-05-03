import popupExamLogo from '../img/exam.png';
import popupTaxLogo from '../img/taxes.png';
import logo from '../img/icon512.png';
import { firebaseAPP, firebaseDB } from '../firebaseConfig.js';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import moment from 'moment';
import SubjCSS from './Subjects.module.css';

// Firebase imports
import { getAuth } from 'firebase/auth';
import { setDoc,
         doc,
         collection,
         onSnapshot,
         deleteDoc,
         updateDoc
       } from 'firebase/firestore';

// Get the app
const app = firebaseAPP;

// Get the auth
const auth = getAuth(app)

// Get the database
const db = firebaseDB;

let email, colRef;

// On page load handle light/dark mode
window.onload = () => {
  const wasLightMode = sessionStorage.getItem('LightMode') === 'true';
  document.body.classList.toggle('light-theme', wasLightMode);
}

const Subjects = () => {
  // Mantain user authentication state
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (loading) return;

    if (!user && (!localStorage.getItem('isLoggedIn'))) window.location.href = '/'; // If the user isn't logged in
  }, [loading, user]);

  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    email = localStorage.getItem('Email'); // get the user's email from the local storage 
    if (user || email) {
      colRef = collection(db, email); // get the collection reference
      
      // Get realtime data
      onSnapshot(colRef, {includeMetadataChanges: true}, (snapshot) => {
        setDocuments(snapshot.docs.map(doc => ({id: doc.id, data: doc.data()}))); // save all documents on a list
      });
    }
  }, [user]);

  const [popupExamOpened, setPopupExamOpened] = useState(false);
  const [popupTaxOpened, setPopupTaxOpened] = useState(false);

  const [name, setName] = useState('');
  let [grade, setGrade] = useState('');
  let [cfu, setCfu] = useState('');

  let [taxNumber, setTaxNumber] = useState('');
  let [taxAmount, setTaxAmount] = useState('');
  let [taxExpiration, setTaxExpiration] = useState('');

  const [addExamDisabled, setAddExamDisabled] = useState(false);
  const [addTaxDisabled, setAddTaxDisabled] = useState(false);
  
  // Open/Close exam popup
  const toggleExamPopup = () => {
    setAddExamDisabled(!addExamDisabled);
    setAddTaxDisabled(!addTaxDisabled);
    setPopupExamOpened(!popupExamOpened);
    setName('');
    setGrade('');
    setCfu('');
  }
  
  // Open/Close tax popup
  const toggleTaxPopup = () => {
    setAddExamDisabled(!addExamDisabled);
    setAddTaxDisabled(!addTaxDisabled);
    setPopupTaxOpened(!popupTaxOpened);
    setTaxNumber('');
    setTaxAmount('');
    setTaxExpiration('');
  }

  // Handle adding exams
  const handleAddExam = (e) => {
    e.preventDefault();

    // If grade or cfu starts with "0" remove the starting zero
    grade = (grade.startsWith(0) && grade.toString()[grade.toString().length - 1] !== 0) ? grade.toString().slice(1) : grade;
    cfu = (cfu.startsWith(0) && cfu.toString()[cfu.toString().length - 1] !== 0) ? cfu.toString().slice(1) : cfu;

    // Some controls on grade and cfu
    grade = grade < 18 ? '18' : (grade > 30 ? '30' : grade);
    cfu = cfu < 1 ? '1' : (cfu > 18 ? '18' : cfu);

    toggleExamPopup();

    // Add exam to the database
    setDoc(doc(db, email, name), {
      name: name,
      grade: grade,
      cfu: cfu,
      isExam: true
    });

    // Send a success popup
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Your exam has been added',
      color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
      background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)',
      showConfirmButton: false,
      timer: 1500
    });
  }

  // Handle adding taxes
  const handleAddTax = (e) => {
    e.preventDefault();

    // Remove extra starting zeroes from number and amount
    taxNumber = removeZeroes(taxNumber.toString().split(''));
    taxAmount = removeZeroes(taxAmount.toString().split(''));

    toggleTaxPopup();

    // Add the tax to the database
    setDoc(doc(db, email, taxNumber), {
      number: taxNumber,
      amount: taxAmount,
      expiration: taxExpiration,
      isTax: true
    });

    // Send a success popup
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Your tax has been added',
      color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
      background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)',
      showConfirmButton: false,
      timer: 1500
    });
  }
  
  // Handle deleting exam/tax from id
  const handleDelete = (id) => {
    // Send an info popup
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'orange',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
      background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
    }).then((result) => {
      // If user is sure to delete
      if (result.isConfirmed) {
        // Remove all notifications reminder
        if (localStorage.getItem('Tax7 ' + id)) localStorage.removeItem('Tax7 ' + id);
        if (localStorage.getItem('Tax1 ' + id)) localStorage.removeItem('Tax1 ' + id);
        if (localStorage.getItem('TaxExp ' + id)) localStorage.removeItem('TaxExp ' + id);

        deleteDoc(doc(db, email, id)); // delete document
        const updatetedDocs = documents.filter(doc => doc.id !== id);
        setDocuments(updatetedDocs); // update documents

        // Send a success popup
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Deleted!',
          color: sessionStorage.getItem('LightMode') === 'true' ? 'black' : 'white',
          background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  }

  // Remove extra zeroes from a list of characters
  function removeZeroes(array) {
    if (array.length !== 1 && array[0] === '0') {
      let pos = 0;
  
      for (let i=0; i<array.length; i++) {
        if (array[i] === '0' && i === array.length - 1) break;
        if (array[i] === '0') {
          pos++;
          if (array[i+1] !== '0') break;
        }
      }
    
      let res = array.slice(pos);
      let str = '';
      
      res.forEach(c => str += c); 
    
      return str;
    }

    else return array.join('');
  }

  // Exam component
  const Exam = ({exam}) => {
    const [editable, setEditable] = useState(false);
    let [editGrade, setEditGrade] = useState('');
    let [editCfu, setEditCfu] = useState('');

    // Handle editing exam
    const handleEditExam = () => {
      // Some controls on exam and cfu
      let examGrade = (editGrade < 18 && editGrade !== '') ? '18' : (editGrade > 30 ? '30' : editGrade);
      let examCfu = (editCfu < 1 && editCfu !== '') ? '1' : (editCfu > 18 ? '18' : editCfu);

      if (examGrade === '' && examCfu !== '') examGrade = exam.data.grade;

      if (examGrade !== '' && examCfu === '') examCfu = exam.data.cfu;

      if (examGrade === '' && examCfu === '') {
        examGrade = exam.data.grade;
        examCfu = exam.data.cfu;
      }
      
      setEditable(false); 
      setEditGrade(''); 
      setEditCfu('');

      // Update the exam
      updateDoc(doc(db, email, exam.data.name), {
        grade: examGrade,
        cfu: examCfu
      });
    }

    return (
      <div className={SubjCSS.addedExam}>
        <div className={!editable ? SubjCSS.examP : SubjCSS.examPHidden} title="Double click to edit" onDoubleClick={() => setEditable(true)}>
          <p className={SubjCSS.gradeP}>{exam.data.grade}</p>
          <div className={SubjCSS.nameAndCfu}>
            <p className={SubjCSS.nameP}>{exam.data.name}</p>
            <p className={SubjCSS.cfuP}>{exam.data.cfu + ' CFU'}</p>
          </div>
        </div>
        <div className={editable ? SubjCSS.editInputsG : SubjCSS.editInputsGHidden}>
          <p>{exam.data.name}</p>
          <div className={SubjCSS.edits}>
            <input className={SubjCSS.editableG} type="number" placeholder={exam.data.grade} maxLength="2" min="18" max="30" title="Grade" value={editGrade} onChange={(e) => setEditGrade(e.target.value.length > e.target.maxLength ? e.target.value = e.target.value.slice(0, e.target.maxLength) : e.target.value)} />
            <input className={SubjCSS.editableG} type="number" placeholder={exam.data.cfu} maxLength="2" min="1" max="18" title="Cfu" value={editCfu} onChange={(e) => setEditCfu(e.target.value.length > e.target.maxLength ? e.target.value = e.target.value.slice(0, e.target.maxLength) : e.target.value)} />
            <button className={SubjCSS.confirmEdit} title="Confirm" onClick={handleEditExam}><ion-icon name="checkmark-outline"></ion-icon></button>
          </div>
        </div>
        <div className={SubjCSS.buttons}>
          <button className={SubjCSS.edit} title="Edit exam" onClick={() => setEditable(true)}><ion-icon name="create-outline"></ion-icon></button>
          <button className={SubjCSS.delete} title="Delete exam" onClick={() => handleDelete(exam.id)}><ion-icon name="trash-outline" title="Delete"></ion-icon></button>
        </div>
      </div>
    );
  }

  // Tax component
  const Tax = ({tax}) => {
    const [editable, setEditable] = useState(false);
    let [editAmount, setEditAmount] = useState('');

    // Handle editing tax
    const handleEditTax = () => {
      let newAmount = editAmount;
      newAmount = removeZeroes(editAmount.toString().split('')); // remove extra zeroes from amount
      // Some controls on amount
      if (newAmount === '') newAmount = tax.data.amount;
      if (newAmount < 0) newAmount = '0';

      setEditable(false);
      setEditAmount('');

      // Update the tax
      updateDoc(doc(db, email, tax.data.number), {
        amount: newAmount
      });
    }

    const remaining = getRemaining(tax.data.expiration, tax.data.number); // get tax's remaining time from expiration

    return (
      <div className={SubjCSS.addedTax}>
        <div className={!editable ? SubjCSS.examP : SubjCSS.examPHidden} title={remaining !== '!' ? 'Double click to edit' : 'Expired'} onDoubleClick={() => {if (remaining !== '!') setEditable(true)}}>
          <p className={SubjCSS.remainingP}>{remaining}</p>
          <div className={remaining !== '!' ? SubjCSS.nameAndAmount : SubjCSS.expiredNameAmountP}>
            <p className={remaining !== '!' ? SubjCSS.nameP : SubjCSS.expiredNameP}>{tax.data.number}</p>
            <p className={remaining !== '!' ? SubjCSS.amountP : SubjCSS.expiredAmountP}>{'€' + tax.data.amount}</p>
          </div>
        </div>
        <div className={editable ? SubjCSS.editInputsT : SubjCSS.editInputsTHidden}>
          <p>{tax.data.number}</p>
          <div className={SubjCSS.edits}>
            <input className={SubjCSS.editableT} type="number" placeholder="€" min="0" title="Amount" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
            <button className={SubjCSS.confirmEdit} title="Confirm" onClick={handleEditTax}><ion-icon name="checkmark-outline"></ion-icon></button>
          </div>
        </div>
        <div className={SubjCSS.buttons}>
          <button className={SubjCSS.edit} title="Edit tax" disabled={remaining === '!'} onClick={() => setEditable(true)}><ion-icon name="create-outline"></ion-icon></button>
          <button className={SubjCSS.delete} title="Delete tax" onClick={() => handleDelete(tax.id)}><ion-icon name="trash-outline" title="Delete"></ion-icon></button>
        </div>
      </div>
    );
  }

  // Return the current date
  const getCurrentDate = () => {
    let dtToday = new Date();
    
    let day = dtToday.getDate();
    let month = dtToday.getMonth() + 1;
    let year = dtToday.getFullYear();

    if (day < 10) day = '0' + day.toString();
    if (month < 10) month = '0' + month.toString();
    
    return year + '-' + month + '-' + day;
  }

  // Return the remaining time (before expiration) of a specific tax
  const getRemaining = (expiration, number) => {
    let remaining = '!'; // If remaining === ! the tax has expired

    let currentDate = moment(getCurrentDate()); // get the current date
    let expirationDate = moment(expiration); // get the expiration date

    // Calculating in days, months and years
    if (expirationDate.diff(currentDate, 'days') > 31) remaining = '-' + expirationDate.diff(currentDate, 'months') + 'M';
    if (expirationDate.diff(currentDate, 'months') > 12) remaining = '-' + expirationDate.diff(currentDate, 'year') + 'Y';
    if (expirationDate.diff(currentDate, 'days') > 0 && expirationDate.diff(currentDate, 'days') < 31) remaining = '-' + expirationDate.diff(currentDate, 'days') + 'D';

    const expiration7 = localStorage.getItem('Tax7 ' + number);
    const expiration1 = localStorage.getItem('Tax1 ' + number);
    const expirationExp = localStorage.getItem('TaxExp ' + number);

    if (remaining === '-7D' && !expiration7 && (localStorage.getItem('Notify-Permission') === 'true')) {
      localStorage.setItem('Tax7 ' + number, true);

      // Send toast notification
      toast('Your tax ' + number + ' expires in 7 days!', {
        duration: 5000,
        icon: <ion-icon name="school"></ion-icon>,
        style: {
          color: 'yellow',
          background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
        }
      });
      
      // Send push notification
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification('MyLibretto', {
            body: 'Your tax ' + number + ' expires in 7 days!',
            icon: logo
          });
        });
      }
    }
    
    if (remaining === '-1D' && !expiration1 && (localStorage.getItem('Notify-Permission') === 'true')) {
      localStorage.setItem('Tax1 ' + number, true);

      // Send toast notification
      toast('Your tax ' + number + ' expires tomorrow!', {
        duration: 5000,
        icon: <ion-icon name="school"></ion-icon>,
        style: {
          color:'orange',
          background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
        }
      });
      
      // Send push notification
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification('MyLibretto', {
            body: 'Your tax ' + number + ' expires tomorrow!',
            icon: logo
          });
        });
      }
    }

    if (remaining === '!' && !expirationExp && (localStorage.getItem('Notify-Permission') === 'true')) {
      localStorage.setItem('TaxExp ' + number, true);

      // Send toast notification
      toast('Your tax ' + number + ' has expired!', {
        duration: 5000,
        icon: <ion-icon name="school"></ion-icon>,
        style: {
          color: 'red',
          background: sessionStorage.getItem('LightMode') === 'true' ? 'white' : 'rgb(47, 42, 49)'
        }
      });
      
      // Send push notification
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification('MyLibretto', {
            body: 'Your tax ' + number + ' has expired!',
            icon: logo
          });
        });
      }
    }
    
    return remaining;
  }

  return (
    <>
      <Toaster
        position="bottom-left"
        reverseOrder={true}
      />
      {/*-Base template*/}
      <div className={SubjCSS.template}>
        {/*-Left subjects template*/}
        <div className={SubjCSS.subLeft}>
          <div className={SubjCSS.title}>
            <h2 className={SubjCSS.titleH2}>Grades</h2>
          </div>
          <section className={SubjCSS.gradesList}>
            <div id={SubjCSS.grades}>
              {documents.filter(doc => doc.data.hasOwnProperty('isExam')).map(exam => (
                <div key={exam.id}>
                  <Exam exam={exam} />
                </div>
              ))}
            </div>
            <button className={SubjCSS.add} disabled={addExamDisabled} type="button" onClick={toggleExamPopup}>
              <span className={SubjCSS.buttonIcon} title="Add Exam"><ion-icon name="add-outline" /></span>
            </button>
          </section>
        </div>
        
        {/*-Right subjects template*/}
        <div className={SubjCSS.subRight}>
          <div className={SubjCSS.title}>
            <h2 className={SubjCSS.titleH2}>Taxes</h2>
          </div>
          <section className={SubjCSS.taxes}>
            <div id={SubjCSS.tax}>
              {documents.filter(doc => doc.data.hasOwnProperty('isTax')).map(tax => (
                <div key={tax.id}>
                  <Tax tax={tax} />
                </div>
              ))}
            </div>
            <button className={SubjCSS.addTax} disabled={addTaxDisabled} type="button" onClick={toggleTaxPopup}>
              <span className={SubjCSS.buttonIcon} title="Add Tax"><ion-icon name="add-outline" /></span>
            </button>
          </section>
        </div>
      </div>

      {/*-Pop-up Add Exam*/}
      <div className={popupExamOpened ? SubjCSS.openPopup : SubjCSS.popup}>
        <form onSubmit={handleAddExam}>
          <img className={SubjCSS.popupImg} src={popupExamLogo} alt="New Exam" />
          <h2 className={SubjCSS.popupTitle}>Add new exam</h2>
          <div className={SubjCSS.inputGroup}>
            <span className={SubjCSS.icon} title="Exam name"><ion-icon name="book-outline" /></span>
            <input className={SubjCSS.input} type="text" id="exam" value={name} onChange={(e) => setName(e.target.value)} required />
            <label className={SubjCSS.label}>Exam name</label>
          </div>
          <div className={SubjCSS.inputGroup}>
            <span className={SubjCSS.icon} title="Grade"><ion-icon name="school-outline" /></span>
            <input className={SubjCSS.input} type="number" min="18" max="30" maxLength="2" id="grade" value={grade} onChange={(e) => setGrade(e.target.value.length > e.target.maxLength ? e.target.value = e.target.value.slice(0, e.target.maxLength) : e.target.value)} required />
            <label className={SubjCSS.label}>Grade</label>
          </div>
          <div className={SubjCSS.inputGroup}>
            <span className={SubjCSS.icon} title="CFU"><ion-icon name="barbell-outline" /></span>
            <input className={SubjCSS.input} type="number" min="1" max="18" maxLength="2" id="cfu" value={cfu} onChange={(e) => setCfu(e.target.value.length > e.target.maxLength ? e.target.value = e.target.value.slice(0, e.target.maxLength) : e.target.value)} required />
            <label className={SubjCSS.label}>CFU</label>
          </div>
          <div className={SubjCSS.popupButtons}>
            <button id={SubjCSS.confirmAdd} type="submit">Add</button>
            <button className={SubjCSS.close} type="button" onClick={toggleExamPopup}>
              <span className={SubjCSS.closeIcon} title="Close">
                <ion-icon name="close-outline" />
              </span>
            </button>
          </div>
        </form>
      </div>

      {/*-Pop-up Add Tax*/}
      <div className={popupTaxOpened ? SubjCSS.openPopup : SubjCSS.popup}>
        <form onSubmit={handleAddTax}>
          <img className={SubjCSS.popupImg} src={popupTaxLogo} alt="New Tax" />
          <h2 className={SubjCSS.popupTitle}>Add new tax</h2>
          <div className={SubjCSS.inputGroup}>
            <span className={SubjCSS.icon} title="Tax number"><ion-icon name="book-outline" /></span>
            <input className={SubjCSS.input} type="number" min="1" value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} required />
            <label className={SubjCSS.label}>Tax number</label>
          </div>
          <div className={SubjCSS.inputGroup}>
            <span className={SubjCSS.icon} title="Amount"><ion-icon name="card-outline"></ion-icon></span>
            <input className={SubjCSS.input} type="number" min="1" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} required />
            <label className={SubjCSS.label}>Amount</label>
          </div>
          <div className={SubjCSS.inputGroup}>
            <span className={SubjCSS.icon} title="Expiration"><ion-icon name="calendar-outline"></ion-icon></span>
            <input className={`${SubjCSS.input} ${SubjCSS.inputDate}`} type="date" min={getCurrentDate()} max="2123-12-31" value={taxExpiration} onChange={(e) => setTaxExpiration(e.target.value)} required />
            <label className={SubjCSS.label}>Expiration</label>
          </div>
          <div className={SubjCSS.popupButtons}>
            <button id={SubjCSS.confirmAddTax} type="submit">Add</button>
            <button className={SubjCSS.close} type="button" onClick={toggleTaxPopup}>
              <span className={SubjCSS.closeIcon} title="Close">
                <ion-icon name="close-outline" />
              </span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Subjects;