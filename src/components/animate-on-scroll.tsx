"use client";

import React from 'react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { cn } from '@/lib/utils';

type AnimationType =
  | 'fade-in-up'
  | 'fade-in-down'
  | 'fade-in-left'
  | 'fade-in-right'
  | 'scale-in';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

/**
 * Wrapper component that animates children when they enter the viewport
 */
export function AnimateOnScroll({
  children,
  animation = 'fade-in-up',
  delay = 0,
  duration,
  className,
  threshold = 0.1,
  triggerOnce = true,
}: AnimateOnScrollProps) {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold,
    triggerOnce
  });

  const animationClass = `animate-${animation}`;

  return (
    <div
      ref={ref}
      className={cn(
        'transition-opacity',
        isVisible ? animationClass : 'opacity-0',
        className
      )}
      style={{
        animationDelay: delay > 0 ? `${delay}ms` : undefined,
        animationDuration: duration ? `${duration}ms` : undefined,
      }}
    >
      {children}
    </div>
  );
}
