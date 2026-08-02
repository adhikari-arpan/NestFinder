import logo from '../assets/NestFinder Logo.png';

// Single shared loading indicator used everywhere the app needs to show a
// "please wait" state — page-level auth checks, data fetches inside cards,
// modals, etc. Pure CSS animation (see index.css .loading-screen /
// .loading-circles), no extra dependency and no per-usage duplication.
//
// fullScreen=true (default): fixed, full-viewport overlay — for page-level
//   guards where nothing else should render yet.
// fullScreen=false: sized to fit inside its parent (a card, modal, tab
//   panel, etc.) instead of covering the whole screen.
export const LoadingScreen = ({ label, fullScreen = true }) => {
  return (
    <div className={`loading-screen ${fullScreen ? 'loading-screen--fullscreen' : ''}`}>
      <img
        src={logo}
        alt="NestFinder"
        width={102}
        height={56}
        className="loading-screen__logo"
      />
      <div className="loading-circles">
        <div className="circle">
          <div className="dot" />
          <div className="outline" />
        </div>
        <div className="circle">
          <div className="dot" />
          <div className="outline" />
        </div>
        <div className="circle">
          <div className="dot" />
          <div className="outline" />
        </div>
        <div className="circle">
          <div className="dot" />
          <div className="outline" />
        </div>
      </div>
      {label && <p className="loading-screen__label">{label}</p>}
    </div>
  );
};
