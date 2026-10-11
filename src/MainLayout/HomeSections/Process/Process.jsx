import { useEffect, useRef } from "react";
import "./Process.css";

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

// Adds "is-revealed" to [data-reveal] targets when they cross the fold, then
// stops watching them. The animation itself is CSS, so scroll never triggers
// a React render.
function useRevealOnScroll(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll("[data-reveal]");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
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
        <div className="S4-heading-wrap" data-reveal>
          <p className="S4-heading-eyebrow">
            02 <span>/ Our process</span>
          </p>
          <h2 id="process-title" className="S4-heading">
            From idea to a working product.
          </h2>
        </div>

        <div className="S4-process-track" data-reveal>
          <span className="S4-process-connector-base" aria-hidden="true" />
          <span className="S4-process-connector-active" aria-hidden="true" />

          {/* role="list" is kept on purpose: Safari / VoiceOver drops list
              semantics when list-style is none. */}
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