import './SOSButton.css';

const SOSButton = ({ onTrigger, onDeactivate, isActive }) => {
  return (
    <div className="sos-container">
      {!isActive ? (
        <button className="sos-btn" onClick={onTrigger}>
          <div className="sos-ripple"></div>
          <div className="sos-ripple delay"></div>
          <span className="sos-text">SOS</span>
          <span className="sos-subtext">Tap or say "Help Me"</span>
        </button>
      ) : (
        <button className="sos-btn active" onClick={onDeactivate}>
          <div className="sos-ripple-active"></div>
          <span className="sos-text">ACTIVE</span>
          <span className="sos-subtext">Tap to mark safe</span>
        </button>
      )}
    </div>
  );
};

export default SOSButton;
