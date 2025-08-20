'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  timeRemaining: number;
  onTimeUp: () => void;
  onTick: (timeRemaining: number) => void;
}

export default function Timer({ timeRemaining, onTimeUp, onTick }: TimerProps) {
  const [time, setTime] = useState(timeRemaining);

  useEffect(() => {
    setTime(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (time <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setTime(prev => {
        const newTime = prev - 1000;
        onTick(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [time, onTimeUp, onTick]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const percentage = (time / (95 * 60 * 1000)) * 100;
  const isLowTime = time < 10 * 60 * 1000; // Less than 10 minutes
  const isCriticalTime = time < 5 * 60 * 1000; // Less than 5 minutes

  return (
    <div className="flex items-center space-x-3">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-gray-200"
            strokeWidth="2"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className={`${
              isCriticalTime 
                ? 'stroke-red-500' 
                : isLowTime 
                ? 'stroke-yellow-500' 
                : 'stroke-blue-500'
            }`}
            strokeWidth="2"
            strokeDasharray={`${percentage} 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      <div className="text-right">
        <div className={`text-2xl font-mono font-bold ${
          isCriticalTime 
            ? 'text-red-600' 
            : isLowTime 
            ? 'text-yellow-600' 
            : 'text-gray-900'
        }`}>
          {formatTime(time)}
        </div>
        <div className="text-sm text-gray-500">
          Time Remaining
        </div>
      </div>
      
      {isLowTime && (
        <div className={`animate-pulse w-2 h-2 rounded-full ${
          isCriticalTime ? 'bg-red-500' : 'bg-yellow-500'
        }`} />
      )}
    </div>
  );
}