import { useEffect, useRef } from "react";
import "./Process.css";

// The three step definitions. Kept at module scope so the array identity is
// stable across renders.
const steps = [
  {
    number: "01",
    title: "Your Idea",
    description: "You know your business. We turn that into a plan.",
  },
  {
    number: "02",
    title: "We Build Together",
    description: "We design and build alongside you, not for you.",
  },
  {
    number: "03",
    title: "A Working Product",
    description: "Websites, software, and content that actually run.",
  },
];

// One IntersectionObserver for the whole section. When an element with
// data-reveal enters the screen, we add "is-revealed" and stop watching it.
// The animation itself is pure CSS, so scroll never triggers a React render.
function useRevealOnScroll(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll("[data-reveal]");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // No observer needed: show everything right away.
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          // Play once, then stop watching this element.
          observer.unobserve(entry.target);
        }
      },
      // Wait until the element is ~80px inside the viewport so the reveal
      // doesn't fire the moment it clips the fold.
      { rootMargin: "0px 0px -80px 0px" },
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [rootRef]);
}

// ===== Process Section =====
export default function Process() {
  const sectionRef = useRef(null);
  useRevealOnScroll(sectionRef);

  return (
    <section
      id="process"
      ref={sectionRef}
      aria-labelledby="process-title"
      className="S4-process">
      <div className="S4-process-inner">
        {/* Section heading */}
        <div className="S4-heading-wrap" data-reveal>
          <p className="S4-heading-eyebrow">
            02 <span>/ Our process</span>
          </p>
          <h2 id="process-title" className="S4-heading">
            From idea to a working product.
          </h2>
        </div>

        {/* Process track with animated connector line */}
        <div className="S4-process-track" data-reveal>
          {/* Base track line */}
          <span className="S4-process-connector-base" aria-hidden="true" />
          {/* Active gradient line that draws in */}
          <span className="S4-process-connector-active" aria-hidden="true" />

          {/* <ol> = ordered steps. role="list" is kept on purpose:
              Safari / VoiceOver removes list meaning when list-style is none. */}
          <ol className="S4-process-list" role="list">
            {steps.map((step) => (
              <li key={step.number} className="S4-process-step" data-reveal>
                {/* The <ol> already numbers the steps for screen readers,
                    so the visual "01" is hidden from them. */}
                <span className="S4-process-num" aria-hidden="true">
                  {step.number}
                </span>

                <div className="S4-process-content">
                  <h3 className="S4-process-step-title">{step.title}</h3>
                  <p className="S4-process-step-desc">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}