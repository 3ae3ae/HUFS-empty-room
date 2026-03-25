import { useEffect, useState } from 'react';
import type { ParsedTimePlace } from './data';

const getNow = () => new Date();

export interface ScheduleContext {
  day: number;
  minutes: number;
}

export const getCurrentScheduleContext = (now: Date = getNow()): ScheduleContext => {
  const jsDay = now.getDay();
  const day = jsDay === 0 ? 6 : jsDay - 1;
  const minutes = now.getHours() * 60 + now.getMinutes();

  return { day, minutes };
};

export const isTimePlaceInContext = (timeplace: ParsedTimePlace, context: ScheduleContext) => {
  return timeplace.day === context.day && context.minutes >= timeplace.startMin && context.minutes < timeplace.endMin;
};

export const isCurrentTimePlace = (timeplace: ParsedTimePlace, now: Date = getNow()) => {
  return isTimePlaceInContext(timeplace, getCurrentScheduleContext(now));
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
