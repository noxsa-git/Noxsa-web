import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  TimerIcon,
  MessagesSquareIcon,
  LayersIcon,
  GlobeIcon,
  ShieldCheckIcon,
} from "lucide-react";
import "./WhyUs.css";

// The canvas code is downloaded only on devices that can use it (mouse + desktop).
// Phones never load it.
const DotField = lazy(() => import("../../../Components/DotField/DotField"));

// 4 core value pillars
const reasons = [
  {
    num: "01",
    tag: "Speed",
    title: "Fast turnaround",
    description:
      "We move quickly with weekly deliverables, rapid prototyping, and clean execution without cutting quality.",
    icon: TimerIcon,
  },
  {
    num: "02",
    tag: "Transparency",
    title: "Direct communication",
    description:
      "You collaborate directly with senior engineers and designers building your product—no account managers or middlemen.",
    icon: MessagesSquareIcon,
  },
  {
    num: "03",
    tag: "Reliability",
    title: "Modern tech stack",
    description:
      "Built with the exact same high-performance frameworks and architecture trusted by top global tech companies.",
    icon: LayersIcon,
  },
  {
    num: "04",
    tag: "Reach",
    title: "Global + local",
    description:
      "We design for international clients across time zones, while deeply understanding regional operations and nuance.",
    icon: GlobeIcon,
  },
];

/* ---------- when is the interactive canvas allowed? ---------- */

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function canUseInteractiveDots() {
  if (typeof window === "undefined") return false;
  // Phones and tablets have no mouse, so the cursor effect could never run
  if (!window.matchMedia(FINE_POINTER_QUERY).matches) return false;
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return false;

  const nav = window.navigator;
  if (nav.connection?.saveData) return false;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) return false;
  return true;
}

function useInteractiveDots() {
  const [enabled, setEnabled] = useState(canUseInteractiveDots);

  useEffect(() => {
    const lists = [FINE_POINTER_QUERY, REDUCED_MOTION_QUERY].map((q) =>
      window.matchMedia(q),
    );
    const update = () => setEnabled(canUseInteractiveDots());
    lists.forEach((mq) => mq.addEventListener("change", update));
    return () =>
      lists.forEach((mq) => mq.removeEventListener("change", update));
  }, []);

  return enabled;
}

/* ---------- scroll reveal: one observer, CSS animation ---------- */

function useRevealOnScroll(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll("[data-reveal]");
    const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -40px 0px" },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootRef]);
}

/* Static dot grid made with pure CSS (no JS, no canvas, no animation).
   Used on phones/tablets and as the loading picture on desktop. */
function StaticDots() {
  return <div className="S5-why-dots-static" />;
}

export default function WhyUs() {
  const sectionRef = useRef(null);
  const interactiveDots = useInteractiveDots();
  useRevealOnScroll(sectionRef);

  return (
    <section
      id="why"
      ref={sectionRef}
      aria-labelledby="why-title"
      className="S5-why">
      {/* Background dots with soft top/bottom fade */}
      <div className="S5-why-bg-wrap" aria-hidden="true">
        {interactiveDots ? (
          <Suspense fallback={<StaticDots />}>
            <DotField
              dotRadius={1.5}
              dotSpacing={16}
              bulgeStrength={65}
              glowRadius={160}
              cursorRadius={440}
              gradientFrom="rgba(198,241,53,0.55)"
              gradientTo="rgba(226,255,115,0.25)"
              glowColor="rgba(198,241,53,0.28)"
            />
          </Suspense>
        ) : (
          <StaticDots />
        )}
      </div>

      {/* Dark backdrop behind text for crisp readability */}
      <div className="S5-why-dark-shield" aria-hidden="true" />

      <div className="S5-why-inner">
        <div className="S5-why-grid">
          {/* Left column: heading */}
          <div className="S5-why-heading-col">
            <div className="S5-why-heading-content" data-reveal>
              <p className="S5-why-eyebrow">
                03 <span>/ Why us</span>
              </p>

              <h2 id="why-title" className="S5-why-heading">
                Built different.
              </h2>

              <p className="S5-why-sub">
                A focused, senior team that approaches your business challenges
                as our own. We prioritize direct accountability, clean
                engineering, and verifiable results.
              </p>

              {/* Trust badge */}
              <div className="S5-why-assurance">
                <ShieldCheckIcon
                  size={18}
                  className="S5-shield-icon"
                  aria-hidden="true"
                />
                <span>Direct partner access on every engagement</span>
              </div>
            </div>
          </div>

          {/* Right column: 2x2 cards. The <li> is the card itself. */}
          <div className="S5-why-cards-col">
            <ul className="S5-why-list" role="list">
              {reasons.map(
                ({ num, tag, title, description, icon: Icon }, i) => (
                  <li
                    key={title}
                    className="S5-why-card"
                    data-reveal
                    style={{ "--i": i }}>
                    {/* Card header */}
                    <div className="S5-card-header">
                      <div className="S5-icon-box">
                        <Icon
                          size={20}
                          strokeWidth={1.8}
                          className="S5-icon"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="S5-card-meta">
                        <span className="S5-card-tag">{tag}</span>
                        <span className="S5-card-num" aria-hidden="true">
                          {num}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="S5-card-content">
                      <h3 className="S5-card-title">{title}</h3>
                      <p className="S5-card-desc">{description}</p>
                    </div>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}