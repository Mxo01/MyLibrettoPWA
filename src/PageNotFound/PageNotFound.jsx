import netErrImg from '../img/error404.png';
import PageNotFoundCSS from './PageNotFound.module.css';

// On page load handle light/dark mode
window.onload = () => {
  const wasLightMode = sessionStorage.getItem('LightMode') === 'true';
  document.body.classList.toggle('light-theme', wasLightMode);
}

const PageNotFound = () => {
  return (
    <>
      <div className={PageNotFoundCSS.wrapper}>
        <img className={PageNotFoundCSS.netErrImg} src={netErrImg} alt="Error 404" />
        <h1 className={PageNotFoundCSS.title}>Ooops...</h1>
        <p className={PageNotFoundCSS.netErrText}>Sorry but you can't view this page, it probably doesn't exist.</p>
        <button className={PageNotFoundCSS.button} onClick={() => window.location.href = '/'}>Go back</button>
      </div>
    </>
  );
}
 
export default PageNotFound;