import { useState, useEffect, useCallback, useRef } from 'react';

const useSafetyCheck = (onSOSTrigger) => {
  const [isActive, setIsActive] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(10);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [escalationCountdown, setEscalationCountdown] = useState(60);
  const [status, setStatus] = useState('idle'); // idle, safe, warning, escalating

  const timerRef = useRef(null);
  const escalationRef = useRef(null);

  const startCheck = useCallback((minutes) => {
    setIntervalMinutes(minutes);
    setTimeLeft(minutes * 60);
    setIsActive(true);
    setStatus('safe');
    setShowCheckIn(false);
  }, []);

  const stopCheck = useCallback(() => {
    setIsActive(false);
    setTimeLeft(0);
    setShowCheckIn(false);
    setStatus('idle');
    setEscalationCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    if (escalationRef.current) clearInterval(escalationRef.current);
  }, []);

  const confirmSafe = useCallback(() => {
    setShowCheckIn(false);
    setStatus('safe');
    setEscalationCountdown(60);
    setTimeLeft(intervalMinutes * 60);
    if (escalationRef.current) clearInterval(escalationRef.current);
  }, [intervalMinutes]);

  // Main countdown timer
  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowCheckIn(true);
          setStatus('warning');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, intervalMinutes]);

  // Escalation countdown when check-in appears
  useEffect(() => {
    if (!showCheckIn) return;

    setEscalationCountdown(60);
    escalationRef.current = setInterval(() => {
      setEscalationCountdown((prev) => {
        if (prev <= 1) {
          // AUTO-TRIGGER SOS
          setStatus('escalating');
          setShowCheckIn(false);
          if (onSOSTrigger) onSOSTrigger();
          stopCheck();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (escalationRef.current) clearInterval(escalationRef.current);
    };
  }, [showCheckIn, onSOSTrigger, stopCheck]);

  return {
    isActive,
    intervalMinutes,
    timeLeft,
    showCheckIn,
    escalationCountdown,
    status,
    startCheck,
    stopCheck,
    confirmSafe,
    setIntervalMinutes,
  };
};

export default useSafetyCheck;
