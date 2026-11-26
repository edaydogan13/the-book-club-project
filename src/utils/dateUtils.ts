import { useState, useEffect } from 'react';
import { Language } from '../translations';

export const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const TR_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
] as const;

export function getCurrentMonthName(language: Language, date: Date = new Date()): string {
  const monthIdx = date.getMonth();
  return language === 'en' ? EN_MONTHS[monthIdx] : TR_MONTHS[monthIdx];
}

export function getCurrentMonthYear(language: Language, date: Date = new Date()): string {
  const monthName = getCurrentMonthName(language, date);
  const year = date.getFullYear();
  return `${monthName} ${year}`;
}

/**
 * React hook returning a Date that automatically refreshes when the calendar month/year rolls over,
 * even if the browser tab stays open across midnight on the 1st of a new month.
 */
export function useCurrentDate(): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const checkDate = () => {
      const fresh = new Date();
      setNow((prev) =>
        prev.getMonth() !== fresh.getMonth() || prev.getFullYear() !== fresh.getFullYear()
          ? fresh
          : prev
      );
    };

    const intervalId = setInterval(checkDate, 60_000);
    window.addEventListener('focus', checkDate);
    const onVis = () => {
      if (document.visibilityState === 'visible') checkDate();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', checkDate);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return now;
}
