'use client';
import { motion, Transition } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';

// Framer Motion's own `Target`/`TargetAndTransition` types are built from a very
// large mapped type over every CSS property; combining them dynamically (as this
// component does to interpolate through N keyframes) makes the TS checker blow up
// ("union type too complex to represent"). We model the plain data shape ourselves
// and only cross into Framer Motion's types at the JSX boundary below.
type Keyframe = Record<string, string | number>;

const buildKeyframes = (from: Keyframe, steps: Keyframe[]): Record<string, (string | number)[]> => {
  const keys = new Set<string>([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))]);

  const keyframes: Record<string, (string | number)[]> = {};
  keys.forEach(k => {
    keyframes[k] = [from[k], ...steps.map(s => s[k])];
  });
  return keyframes;
};

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Keyframe;
  animationTo?: Keyframe[];
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
  /**
   * HTML tag to render as. Defaults to a plain paragraph; pass 'h1'/'h2'/'h3'
   * to use this component for real page/section headings (same animation and
   * styling, just a semantically correct tag) without changing any design.
   */
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span';
}

const BlurText = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = (t: number) => t,
  onAnimationComplete,
  stepDuration = 0.35,
  as: Tag = 'p',
}: BlurTextProps) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, rootMargin]);

  const defaultFrom: Keyframe = useMemo(
    () =>
      direction === 'top' ? { filter: 'blur(10px)', opacity: 0, y: -50 } : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo: Keyframe[] = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 }
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => (stepCount === 1 ? 0 : i / (stepCount - 1)));

  return (
    <Tag
      // Framer Motion/DOM ref typing differs per tag (HTMLParagraphElement vs
      // HTMLHeadingElement); the component only uses the ref for IntersectionObserver,
      // so a single HTMLElement ref is safe here.
      ref={ref as any}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap' }}
    >
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

        const spanTransition: Transition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000,
          ease: easing
        };

        return (
          <motion.span
            className="inline-block whitespace-pre will-change-[transform,filter,opacity]"
            key={index}
            // Framer Motion's `initial`/`animate` prop types are built from a huge
            // mapped type over every CSS property; feeding them a dynamically-built
            // keyframe object makes the TS checker exceed its union complexity limit
            // (TS2590). The values here are plain CSS-like objects, so this is safe.
            initial={fromSnapshot as any}
            animate={(inView ? animateKeyframes : fromSnapshot) as any}
            transition={spanTransition}
            onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
          >
            {segment === ' ' ? ' ' : segment}
            {animateBy === 'words' && index < elements.length - 1 && ' '}
          </motion.span>
        );
      })}
    </Tag>
  );
};

export default BlurText;
