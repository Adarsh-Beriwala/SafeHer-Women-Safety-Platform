import { useState, useEffect, useRef } from 'react';
import { FiClock, FiAlertCircle, FiCheck, FiPlay, FiSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './PeriodicCheckIn.css';

const PeriodicCheckIn = ({ onSOS }) => {
  const { userProfile } = useAuth();
  
  const [isActive, setIsActive] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(15);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  
  // States for when the prompt is active
  const [isPrompting, setIsPrompting] = useState(false);
  const [countdown, setCountdown] = useState(15); // 15 seconds to reply
  const [inputWord, setInputWord] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const timerRef = useRef(null);
  const promptRef = useRef(null);
  
  const expectedWord = userProfile?.safetyWord?.toLowerCase().trim() || 'safe';

  // Master Timer Loop
  useEffect(() => {
    if (isActive && !isPrompting) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer hit 0! Start the prompt
            setIsPrompting(true);
            setCountdown(15);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(timerRef.current);
  }, [isActive, isPrompting]);

  // Prompt Countdown Loop
  useEffect(() => {
    if (isPrompting) {
      promptRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // 15 seconds expired without correct word! FIRE SOS!
            clearInterval(promptRef.current);
            setIsPrompting(false);
            setIsActive(false); // Stop the periodic check
            if (onSOS) onSOS(); // Auto-Trigger SOS!
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setInputWord('');
      setErrorMsg('');
    }
    
    return () => clearInterval(promptRef.current);
  }, [isPrompting, onSOS]);

  const handleStart = () => {
    if (!userProfile?.safetyWord) {
      alert("Please set a Safety Word in your Profile first!");
      return;
    }
    setIsActive(true);
    setTimeRemaining(intervalMinutes * 60);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPrompting(false);
    clearInterval(timerRef.current);
    clearInterval(promptRef.current);
    setTimeRemaining(0);
  };

  const verifyWord = (e) => {
    e.preventDefault();
    if (inputWord.toLowerCase().trim() === expectedWord) {
      // Success! Reset timer for next interval
      setIsPrompting(false);
      setTimeRemaining(intervalMinutes * 60);
    } else {
      setErrorMsg('Incorrect word! Hurry!');
      setInputWord('');
    }
  };

  // Formatting for display
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="periodic-card glass-card">
      <div className="card-title">
        <FiClock /> Dead Man's Switch
      </div>

      {!isPrompting ? (
        <div className="periodic-controls">
          <p className="periodic-desc">Auto-triggers SOS if you fail to check-in.</p>
          
          <div className="interval-selector">
            <select 
              value={intervalMinutes} 
              onChange={(e) => setIntervalMinutes(Number(e.target.value))}
              disabled={isActive}
              className="interval-select"
            >
              <option value={1}>1 Minute (Test)</option>
              <option value={5}>5 Minutes</option>
              <option value={10}>10 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
            </select>
          </div>

          {isActive ? (
            <div className="active-timer-display" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0, 230, 118, 0.15)', border: '1px solid rgba(0, 230, 118, 0.4)', padding: '20px', borderRadius: '10px', marginTop: '15px' }}>
              <div className="time-remaining" style={{ fontSize: '40px', fontWeight: '800', color: '#00e676', fontFamily: 'monospace', letterSpacing: '2px' }}>{formatTime(timeRemaining)}</div>
              <p style={{ fontSize: '13px', color: '#a89cc4', margin: '5px 0 15px 0' }}>until next check-in</p>
              <button className="btn btn-outline-danger btn-sm" onClick={handleStop} style={{ width: '100%', border: '1px solid #ff1744', color: '#ff1744', background: 'transparent', padding: '8px', borderRadius: '5px', fontWeight: 'bold' }}>
                <FiSquare /> Stop Timer
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={handleStart} style={{ width: '100%', marginTop: '10px' }}>
              <FiPlay /> Start Safety Timer
            </button>
          )}
        </div>
      ) : (
        <div className="prompt-overlay animate-pulse-fast" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 23, 68, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: 'inherit' }}>
          <div className="prompt-box" style={{ textAlign: 'center', padding: '20px', width: '100%' }}>
            <FiAlertCircle size={50} color="#fff" />
            <h3 style={{ color: '#fff', fontSize: '28px', margin: '15px 0', letterSpacing: '2px', fontWeight: 'bold' }}>ARE YOU SAFE?</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px', marginBottom: '20px' }}>Enter your safety word or SOS triggers in:</p>
            <div className="countdown-massive" style={{ fontSize: '60px', fontWeight: '900', color: '#fff', textShadow: '0 0 20px rgba(0,0,0,0.8)', marginBottom: '25px' }}>{countdown}s</div>
            
            <form onSubmit={verifyWord} className="verify-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '0 20px' }}>
              <input 
                type="text" 
                autoFocus
                placeholder="Type safety word here..."
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value)}
                className={errorMsg ? 'error-shake' : ''}
                style={{ padding: '15px', borderRadius: '8px', border: 'none', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}
              />
              <button type="submit" className="btn btn-success" style={{ padding: '12px', fontSize: '18px', fontWeight: 'bold', background: '#00e676', color: '#000', border: 'none', borderRadius: '8px' }}>VERIFY NOW</button>
            </form>
            {errorMsg && <div className="error-text" style={{ color: '#ffd54f', marginTop: '15px', fontWeight: 'bold', fontSize: '16px' }}>{errorMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodicCheckIn;
