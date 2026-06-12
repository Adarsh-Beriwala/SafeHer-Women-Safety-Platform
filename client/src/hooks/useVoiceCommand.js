import { useState, useEffect, useCallback, useRef } from 'react';

const useVoiceCommand = (triggerWord = 'help me', onTrigger) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const onTriggerRef = useRef(onTrigger);

  // Keep the latest onTrigger without re-running the main effect
  useEffect(() => {
    onTriggerRef.current = onTrigger;
  }, [onTrigger]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim();
          if (transcript.includes(triggerWord.toLowerCase())) {
            if (onTriggerRef.current) {
              onTriggerRef.current();
            }
          }
        }
      };

      recognition.onend = () => {
        // Auto-restart for continuous listening
        if (recognitionRef.current && isListening) {
          try {
            recognition.start();
          } catch (e) {
            // Already started
          }
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          setIsListening(false);
        }
        // Auto-restart on recoverable errors
        if (event.error === 'no-speech' || event.error === 'aborted') {
          if (recognitionRef.current) {
            try {
              recognition.start();
            } catch (e) {
              // Already started
            }
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [triggerWord]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // Already started
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
};

export default useVoiceCommand;
