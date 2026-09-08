import { useEffect, useRef, useState } from 'react';

export function useCountdown(initialSeconds: number, onExpire?: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  const isRunning = secondsLeft > 0;
  useEffect(() => {
    if (!isRunning) {
      onExpireRef.current?.();
      return;
    }
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const label = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return { secondsLeft, label, isExpired: secondsLeft <= 0 };
}
