import { useEffect, useState } from 'react';
import type { ParsedTimePlace } from './data';

const getNow = () => new Date();

export const getCurrentScheduleContext = (now: Date = getNow()) => {
  const jsDay = now.getDay();
  const day = jsDay === 0 ? 6 : jsDay - 1;
  const minutes = now.getHours() * 60 + now.getMinutes();

  return { day, minutes };
};

export const isCurrentTimePlace = (timeplace: ParsedTimePlace, now: Date = getNow()) => {
  const { day, minutes } = getCurrentScheduleContext(now);
  return timeplace.day === day && minutes >= timeplace.startMin && minutes < timeplace.endMin;
};

export const useCurrentTime = () => {
  const [now, setNow] = useState(getNow);

  useEffect(() => {
    const tick = () => setNow(getNow());
    let intervalId: number | undefined;

    const timeoutId = window.setTimeout(() => {
      tick();
      intervalId = window.setInterval(tick, 60_000);
    }, (60 - now.getSeconds()) * 1000 - now.getMilliseconds());

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [now]);

  return now;
};
