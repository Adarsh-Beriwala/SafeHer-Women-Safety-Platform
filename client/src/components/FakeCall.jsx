import { useState, useEffect, useRef } from 'react';
import { FiPhoneCall, FiPhoneOff, FiPhone } from 'react-icons/fi';
import './FakeCall.css';

const FakeCall = ({ defaultCallerName = 'Mom', delaySeconds = 3 }) => {
  const [callState, setCallState] = useState('idle'); // idle, ringing, active
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef(null);
  const ringtoneRef = useRef(null);

  // Initialize audio object once
  useEffect(() => {
    // Standard phone ringtone sound
    ringtoneRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/phone_ringing.ogg');
    ringtoneRef.current.loop = true;

    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
      clearInterval(timerRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  const triggerCall = () => {
    setCallState('idle'); // reset
    window.speechSynthesis.cancel(); // stop any ongoing speech
    setTimeout(() => {
      setCallState('ringing');
      if (ringtoneRef.current) {
        ringtoneRef.current.play().catch(e => console.log('Audio play blocked', e));
      }
    }, delaySeconds * 1000);
  };

  const acceptCall = () => {
    setCallState('active');
    setCallDuration(0);
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    
    // Play AI Voice
    const aiVoice = new SpeechSynthesisUtterance("Hello? Where are you? I am reaching there in 2 minutes, stay on the line.");
    aiVoice.rate = 0.9;
    aiVoice.pitch = 1.1;
    window.speechSynthesis.speak(aiVoice);
    
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const endCall = () => {
    setCallState('idle');
    setCallDuration(0);
    clearInterval(timerRef.current);
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fake-call-container">
      {callState === 'idle' ? (
        <button className="btn btn-outline fake-call-trigger" onClick={triggerCall}>
          <FiPhoneCall /> Simulate Fake Call ({delaySeconds}s)
        </button>
      ) : (
        <div className={`fake-call-ui ${callState}`}>
          <div className="caller-info">
            <div className="caller-avatar">{defaultCallerName.charAt(0)}</div>
            <h3>{defaultCallerName}</h3>
            <p>{callState === 'ringing' ? 'Incoming call...' : formatTime(callDuration)}</p>
          </div>
          
          <div className="call-actions">
            <button className="btn-call decline" onClick={endCall}>
              <FiPhoneOff />
            </button>
            {callState === 'ringing' && (
              <button className="btn-call accept" onClick={acceptCall}>
                <FiPhone />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FakeCall;
