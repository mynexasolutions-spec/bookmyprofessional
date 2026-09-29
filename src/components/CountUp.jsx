"use client";

import { useEffect, useRef, useState } from "react";
import { easeInOutCubic, parseStatValue, placeValues } from "@/lib/count-up";

const STEP_MS = 150;

export default function CountUp({ value, duration = 2000, delay = 0 }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const parsed = parseStatValue(value);
    const el = ref.current;
    if (!parsed || !el || parsed.target === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(parsed.format(parsed.target));
      return;
    }

    let raf;
    let timer;
    let interval;
    let start;

    const tick = (now) => {
      if (start === undefined) start = now;
      const t = Math.min((now - start) / duration, 1);
      setDisplay(parsed.format(parsed.target * easeInOutCubic(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    const begin = () => {
      // Whole numbers fill place by place ("1..9, 10..90, 100.."), odometer
      // style; decimals (e.g. "4.8/5") keep the smooth count-up.
      const seq = Number.isInteger(parsed.target) ? placeValues(parsed.target) : [];
      if (seq.length) {
        setDisplay(parsed.format(seq[0]));
        let n = 0;
        interval = setInterval(() => {
          n += 1;
          setDisplay(parsed.format(seq[n] ?? parsed.target));
          if (n >= seq.length - 1) clearInterval(interval);
        }, STEP_MS);
        return;
      }
      setDisplay(parsed.format(0));
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = setTimeout(begin, delay);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [value, duration, delay]);

  return <span ref={ref}>{display}</span>;
}
