# MyLibretto

[MyLibretto](https://mylibretto.web.app/) è una PWA scritta in [React](https://react.dev/) per il lato front-end e utilizza le principali funzionalità di [Firebase](https://firebase.google.com/) per un semplice back-end. Ho deciso di usare altre librerie come:

- [momentJS](https://momentjs.com/): per calcoli tra date, in particolare per calcolare efficientemente la data di scadenza di una determinata tassa permettendomi così di mandare una notifica in determinate situazioni.
- [sweetalert2](https://sweetalert2.github.io/): per mandare semplici alert/popup modificabili così da migliorare l'esperienza utente.
- [react-hot-toast](https://react-hot-toast.com/): per mandare le notifiche stile "toast" personalizzabili.
- [react-firebase-hooks](https://www.npmjs.com/package/react-firebase-hooks): più che una libreria è un insieme di hook che prendono delle funzionalità di Firebase e le ottimizzano per React. In particolare ho usato un hook della sezione "authentication hooks" per mantenere consistente lo stato di autenticazione dell'utente.
- [chartJS](https://www.chartjs.org/): per la realizzazione di grafici, in particolare ho creato dei grafici per visualizzare meglio le statistiche relative ai voti degli utenti e ai cfu ottenuti.

## Scelte implementative

MyLibretto nasce per una mia necessità di voler dare uno stile prettamente personale al solito libretto universitario che non mi soddisfava molto dal punto di vista grafico e di usabilità. Ho deciso di far in modo che ogni utente possa condividere i propri appunti e visionare quelli degli altri senza la necessità di dover eseguire l'accesso. 

Ogni utente, ovviamente, ha un suo percorso universitario privato e quindi una volta eseguito l'accesso al suo account è in grado di visionare solo ed esclusivamente i suoi voti, le sue tasse da pagare e le sue statistiche. È inoltre in grado di poter modificare ogni esame o tassa con un semplice doppio click o cliccando sull'apposito bottone, e se proprio desidera potrà eliminare ciò che non ritiene più necessario. 

Una particolare funzionalità permette anche di fare una previsione su come cambierebbero le sue statistiche a seguito della registrazione di un nuovo voto (aggiungendolo solo momentaneamente) con i crediti relativi.

Ovviamente l'applicazione (essendo una PWA) funziona completamente offline in quanto ho fatto in modo che l'utente possa saltare la fase di log in sotto le seguenti condizioni:

- Deve essere registrato
- Deve aver eseguito almeno una volta il log in con successo spuntando l'opzione "Remember me"

Se le condizioni precedentemente descritte sono soddisfatte, nella schermata di accesso comparirà un bottone autoesplicativo che indica la possibilità di bypassare il log in. Questo risulta particolamente comodo quando l'utente è offline (quindi non potrà completare il log in con successo) in quanto gli permette di usufruire di tutte le funzionalità che avrebbe se fosse online (putroppo qualche feature grafica si perde ma stiamo parlando di qualche popup, niente di particolare). 

Quindi se l'utente vorrà aggiungere un esame o una tassa ma è offline potrà in quanto grazie al service worker e la persistenza dei dati offline garantita da Firebase sarà in grado di accedere all'ultima versione dei dati memorizzata nell'IndexDB del browser e agli assets memorizzati in cache.

## Features

- Light/dark mode
- Condivisione appunti/file senza account
- Suggerimenti universitari simpatici
- Notifiche
- Grafici e statistiche
- Cross platform
- Offline mode

## Authors

Ci tenevo a precisare che è la prima volta che metto mani su HTML, CSS, React e Firebase ma anche in tutte le librerie usate. Mi sono divertito davvero molto a progettare dall'inizio quest'app prima in VanillaJS e subito dopo ricrearla in React aggiungendo più funzionalità e sperimentando. In particolare di CSS non avevo mai scritto una singola riga e ho scelto appositamente di fare tutto a mano per imparare al meglio le sue proprietà, evitando schemi pre-fabbricati come Bootstrap nonostante al giorno d'oggi sia spesso richiesto.

Profilo GitHub:
- [@Mxo01](https://github.com/Mxo01)

