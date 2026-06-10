import { useEffect } from 'react';
import useVoiceCommand from '../hooks/useVoiceCommand';
import { FiMic, FiMicOff } from 'react-icons/fi';
import './VoiceListener.css';

const VoiceListener = ({ triggerWord, onTrigger }) => {
  const { isListening, isSupported, toggleListening } = useVoiceCommand(
    triggerWord || 'help me',
    onTrigger
  );

  if (!isSupported) {
    return (
      <div className="voice-not-supported">
        <FiMicOff />
        <span>Voice commands not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className="voice-listener">
      <button
        className={`voice-btn ${isListening ? 'active' : ''}`}
        onClick={toggleListening}
        title={isListening ? 'Voice command active — say "' + (triggerWord || 'Help Me') + '"' : 'Click to enable voice command'}
      >
        <div className="voice-btn-inner">
          {isListening ? <FiMic /> : <FiMicOff />}
        </div>
        {isListening && (
          <>
            <span className="voice-ring ring-1"></span>
            <span className="voice-ring ring-2"></span>
            <span className="voice-ring ring-3"></span>
          </>
        )}
      </button>
      <div className="voice-info">
        <span className="voice-status">
          {isListening ? 'Listening...' : 'Voice Off'}
        </span>
        <span className="voice-hint">
          {isListening ? `Say "${triggerWord || 'Help Me'}" to trigger SOS` : 'Tap to enable'}
        </span>
      </div>
    </div>
  );
};

export default VoiceListener;
