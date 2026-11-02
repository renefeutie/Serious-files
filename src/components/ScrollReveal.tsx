import React, { useEffect, useRef, useState } from 'react';

export type ScrollRevealVariant = 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'zoom-in';

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: ScrollRevealVariant;
  delay?: number; // Delay in milliseconds
  duration?: number; // Duration in milliseconds
  distance?: number; // Translate distance in px for directional variants
  threshold?: number;
  rootMargin?: string;
  staggerIndex?: number;
  staggerInterval?: number;
  className?: string;
  as?: React.ElementType;
}

/**
 * Singleton IntersectionObserver manager to observe multiple elements
 * with maximum performance and zero scroll-loop overhead.
 * Automatically unobserves once the element has entered the viewport.
 */
class ScrollRevealObserverManager {
  private observer: IntersectionObserver | null = null;
  private callbacks = new WeakMap<Element, () => void>();

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      // Check for prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const cb = this.callbacks.get(entry.target);
                if (cb) {
                  cb();
                  this.unobserve(entry.target);
                }
              }
            });
          },
          {
            root: null,
            rootMargin: '0px 0px -40px 0px',
            threshold: 0.08,
          }
        );
      }
    }
  }

  public observe(element: Element, callback: () => void) {
    if (!this.observer) {
      // If observer is not supported or prefers-reduced-motion, reveal immediately
      callback();
      return;
    }
    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }

  public unobserve(element: Element) {
    if (this.observer) {
      this.observer.unobserve(element);
    }
    this.callbacks.delete(element);
  }
}

// Global shared singleton instance
let observerManagerInstance: ScrollRevealObserverManager | null = null;
function getObserverManager(): ScrollRevealObserverManager {
  if (!observerManagerInstance) {
    observerManagerInstance = new ScrollRevealObserverManager();
  }
  return observerManagerInstance;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 500,
  distance = 20,
  staggerIndex,
  staggerInterval = 60,
  className = '',
  as: Component = 'div',
  style,
  ...rest
}) => {
  const ref = useRef<HTMLElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Compute actual delay if staggerIndex is supplied
  const effectiveDelay = staggerIndex !== undefined ? staggerIndex * staggerInterval : delay;

  useEffect(() => {
    // Graceful degradation: if window or IntersectionObserver missing, reveal immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    // Check user preference for reduced motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setIsRevealed(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const manager = getObserverManager();
    manager.observe(node, () => {
      setIsRevealed(true);
    });

    return () => {
      if (node) {
        manager.unobserve(node);
      }
    };
  }, []);

  // Compute CSS transition & transform styles based on variant
  const getVariantStyles = (): React.CSSProperties => {
    // If revealed, always final state
    if (isRevealed) {
      return {
        opacity: 1,
        transform: 'translate3d(0, 0, 0) scale(1)',
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${effectiveDelay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${effectiveDelay}ms`,
        willChange: 'auto',
      };
    }

    // Unrevealed initial states
    let initialTransform = 'translate3d(0, 0, 0)';
    switch (variant) {
      case 'fade-up':
        initialTransform = `translate3d(0, ${distance}px, 0)`;
        break;
      case 'fade-left':
        initialTransform = `translate3d(-${distance}px, 0, 0)`;
        break;
      case 'fade-right':
        initialTransform = `translate3d(${distance}px, 0, 0)`;
        break;
      case 'zoom-in':
        initialTransform = 'scale(0.96)';
        break;
      case 'fade-in':
      default:
        initialTransform = 'translate3d(0, 0, 0)';
        break;
    }

    return {
      opacity: 0,
      transform: initialTransform,
      transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${effectiveDelay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${effectiveDelay}ms`,
      willChange: 'opacity, transform',
    };
  };

  return (
    <Component
      ref={ref}
      className={`sr-reveal ${isRevealed ? 'sr-revealed' : 'sr-hidden'} ${className}`}
      style={{
        ...getVariantStyles(),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
};
