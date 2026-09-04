import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/src/lib/utils";
import { useInView } from "motion/react";

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursor?: boolean;
}

export const Typewriter: React.FC<TypewriterProps> = ({ 
  text, 
  speed = 40, 
  delay = 0, 
  className,
  cursor = true 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimer);
  }, [delay, isInView]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setCompleted(true);
      }
    }, speed);
    return () => clearInterval(typingInterval);
  }, [text, speed, started]);

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {displayedText || '\u00A0'}
      {cursor && !completed && (
        <span 
          className="inline-block w-[3px] h-[0.9em] ml-1 bg-current align-middle animate-pulse"
          style={{ animationDuration: '0.8s' }}
        />
      )}
    </span>
  );
};
