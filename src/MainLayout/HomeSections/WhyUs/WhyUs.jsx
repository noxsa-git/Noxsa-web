import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import {
  TimerIcon,
  MessagesSquareIcon,
  LayersIcon,
  GlobeIcon,
  ShieldCheckIcon,
} from "lucide-react";
import "./WhyUs.css";
import DotField from "../../../Components/DotField/DotField";

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
      "You collaborate directly with senior engineers and designers building your product — no account managers or middlemen.",
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
      "We design for international clients across timezones, while deeply understanding regional operations and nuance.",
    icon: GlobeIcon,
  },
];

// ===== Why Us Section =====
export default function WhyUs() {
  const containerRef = useRef(null);
  const reduce = useReducedMotion();

  // Track scroll entry into the section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  // Silky smooth spring physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 24,
    restDelta: 0.001,
  });

  // Title starts near the top (-80px) and glides smoothly into center (0px)
  const titleY = useTransform(smoothProgress, [0, 1], [-80, 0]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.6], [0.35, 1]);

  return (
    <section
      id="why"
      ref={containerRef}
      aria-labelledby="why-title"
      className="S5-why">
      {/* Background dot field with smooth edge dissolve */}
      <div className="S5-why-bg-wrap" aria-hidden="true">
        <DotField
          dotRadius={1.5}
          dotSpacing={16}
          bulgeStrength={65}
          glowRadius={160}
          cursorRadius={440}
          gradientFrom="rgba(198, 241, 53, 0.55)"
          gradientTo="rgba(226, 255, 115, 0.25)"
          glowColor="rgba(198, 241, 53, 0.28)"
        />
      </div>

      {/* Dark backdrop behind the text so it stays 100% crisp */}
      <div className="S5-why-dark-shield" aria-hidden="true" />

      <div className="S5-why-inner">
        <div className="S5-why-grid">
          {/* Left: heading with scroll-driven descent */}
          <div className="S5-why-heading-col">
            <motion.div
              style={{
                y: reduce ? 0 : titleY,
                opacity: reduce ? 1 : titleOpacity,
              }}
              className="S5-why-heading-content">
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
            </motion.div>
          </div>

          {/* Right: 2x2 architectural cards */}
          <ul className="S5-why-list" role="list">
            {reasons.map(({ num, tag, title, description, icon: Icon }, i) => (
              <li key={title} className="S5-why-item-wrap">
                <motion.article
                  className="S5-why-card"
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                    delay: i * 0.08,
                  }}>
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
                      <span className="S5-card-num">{num}</span>
                    </div>
                  </div>

                  <div className="S5-card-content">
                    <h3 className="S5-card-title">{title}</h3>
                    <p className="S5-card-desc">{description}</p>
                  </div>
                </motion.article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}