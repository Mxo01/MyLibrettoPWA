import popupLogo from '../img/notebook.png';
import { firebaseAPP, firebaseDB } from '../firebaseConfig.js';
import { useEffect, useState, useRef } from 'react';
import NotesCSS from './Notes.module.css';

// Firebase imports
import { getStorage, 
         ref,
         uploadBytesResumable,
         getDownloadURL
       } from 'firebase/storage';
import { setDoc,
         doc,
         collection,
         onSnapshot
       } from 'firebase/firestore';

// Initialize firebase app
const app = firebaseAPP;

// Get the storage and database
const storage = getStorage(app);
const db = firebaseDB;

// Collection reference
const colRef = collection(db, 'Notes'); 

// Create a storage reference
const storageRef = ref(storage);

// On page load handle light/dark mode
window.onload = () => {
  const wasLightMode = sessionStorage.getItem('LightMode') === 'true';
  document.body.classList.toggle('light-theme', wasLightMode);
}

const Notes = () => {  
  const [links, setLinks] = useState([]);

  useEffect(() => {
    // Get realtime data updates
    onSnapshot(colRef, {includeMetadataChanges: true}, (snapshot) => {
      setLinks(snapshot.docs.map(note => ({id: note.id, data: note.data()}))); // save all documents on a list
    });
  }, []);

  const [noteTitle, setNoteTitle] = useState('');
  const [subject, setSubject] = useState('');
  let [title, setTitle] = useState('Notes');
  let [errorMessage, setErrorMessage] = useState('');

  const [popupOpened, setPopupOpened] = useState(false);
  const [addNoteDisabled, setAddNoteDisabled] = useState(false);
  const [file, setFile] = useState(undefined);

  // Open/Close the popup
  const openPopup = () => {
    setErrorMessage('');
    setPopupOpened(!popupOpened);
    setAddNoteDisabled(!addNoteDisabled);
    setNoteTitle('');
    setSubject('');
  }

  // Save the URL of the file on the database
  function storeURLtoDB(url, fileName, subj) {
    setDoc(doc(db, 'Notes', fileName), {
      subject: subj,
      title: fileName,
      url: url
    });
  }

  const hiddenFileInput = useRef(null);

  const handleChooseFile = () => {
    hiddenFileInput.current.click();
  }

  // When the user wants to upload a file
  const handleUpload = (e) => {
    e.preventDefault();
    
    if (noteTitle !== '' && subject !== '' && file)  {
      const uploadTask = uploadBytesResumable(ref(storageRef, noteTitle), file);

      uploadTask.on('state_changed', snapshot => {
        // Display uploading percentage
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setTitle(parseInt(progress) + '%');
      },
      err => {
        console.log('Error uploading your file... :(', err);
      },
      () => { 
        setTitle('Uploaded!');

        setTimeout(() => {
          setTitle('Notes');
        }, 3000);

        // Get the file's URL
        getDownloadURL(uploadTask.snapshot.ref).then(url => {
          storeURLtoDB(url, noteTitle, subject);
        });
      });

      openPopup();
      setNoteTitle('');
      setSubject('');
    }

    else setErrorMessage('You must fill every input field');
  }

  return (
    <>
      <div className={NotesCSS.wrapper}>
        <div className={NotesCSS.title}>
          <h2 className={NotesCSS.titleH2}>{title}</h2>
        </div>
        <section className={NotesCSS.notesList}>
          <div>
            {links && links.map(note => (
              <div className={NotesCSS.addedNote} key={note.id}>
                <p>{note.data.subject}</p>
                <a href={note.data.url}>{note.data.title}</a>
              </div>
            ))}
          </div>
          <button type="button" className={NotesCSS.add} disabled={addNoteDisabled} onClick={openPopup}>
            <span className={NotesCSS.buttonIcon} title="Upload note">
              <ion-icon name="cloud-upload-outline" />
            </span>
          </button>
        </section>
      </div>

      {/*-Pop-up Notes*/}
      <div className={popupOpened ? NotesCSS.openPopup : NotesCSS.popup}>
        <form>
          <img className={NotesCSS.popupImg} src={popupLogo} alt="New Note" />
          <h2 className={NotesCSS.popupTitle}>Add new note</h2>
          <p className={NotesCSS.errorMessage}>{errorMessage}</p>
          <div className={NotesCSS.inputGroup}>
            <span className={NotesCSS.icon} title="Note title"><ion-icon name="text-outline" /></span>
            <input className={NotesCSS.input} type="text" id="noteTitle" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} required />
            <label className={NotesCSS.label}>Note title</label>
          </div>
          <div className={NotesCSS.inputGroup}>
            <span className={NotesCSS.icon} title="Subject name"><ion-icon name="book-outline" /></span>
            <input className={NotesCSS.input} type="text" id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            <label className={NotesCSS.label}>Subject</label>
          </div>
          <div className={NotesCSS.popupButtons}>
            <input className={NotesCSS.fileInput} ref={hiddenFileInput} type="file" accept="file/*" onChange={(e) => setFile(e.target.files[0])} required />
            <label className={NotesCSS.fileInputLabel} title="Choose a file" onClick={handleChooseFile}><ion-icon name="folder-open-outline"></ion-icon></label>
            <button className={NotesCSS.upload} type="submit" onClick={handleUpload}>Upload</button>
            <button className={NotesCSS.closeNote} type="button" onClick={openPopup}>
              <span className={NotesCSS.closeIcon} title="Close">
                <ion-icon name="close-outline" />
              </span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
 
export default Notes;