import { useEffect, useRef, useState } from "react";
import "./MainLoading.css";

// Must match the CSS exit transition on .S9-loading.
const EXIT_DURATION = 700;

export default function MainLoading({ onDone, duration = 2200 }) {
  const [phase, setPhase] = useState("loading");
  const counterRef = useRef(null);

  // Drive the numeric counter from a ref so React never re-renders while the
  // loader is up. The bar itself is a CSS keyframe.
  useEffect(() => {
    const start = performance.now();
    let raf = 0;

    const tick = (now) => {
      const p = Math.min(100, ((now - start) / duration) * 100);
      if (counterRef.current) {
        counterRef.current.textContent = String(Math.round(p)).padStart(2, "0");
      }
      if (p < 100) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  // Lock the page while the overlay is up. Unlock the moment the exit starts,
  // so the user can scroll into the site as it fades.
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const exitTimer = setTimeout(() => {
      setPhase("exiting");
      document.body.style.overflow = "";
    }, duration);

    const doneTimer = setTimeout(() => onDone?.(), duration + EXIT_DURATION);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = "";
    };
  }, [duration, onDone]);

  return (
    <div className={`S9-loading${phase === "exiting" ? " is-exiting" : ""}`}>
      <span role="status" className="S9-loading-sr">
        Loading NOXSA
      </span>

      <div className="S9-loading-inner" aria-hidden="true">
        {/* Lime on "XSA" matches the Hero wordmark. */}
        <p className="S9-loading-brand">
          NO<span>XSA</span>
        </p>
        <p className="S9-loading-tagline">
          Blueprints that grow your business.
        </p>

        <div className="S9-loading-meter">
          <div className="S9-loading-bar-track">
            <div
              className="S9-loading-bar-fill"
              style={{ "--S9-loading-duration": `${duration}ms` }}
            />
          </div>
          <span className="S9-loading-count">
            <span ref={counterRef}>00</span>
            <span className="S9-loading-percent">%</span>
          </span>
        </div>
      </div>
    </div>
  );
}