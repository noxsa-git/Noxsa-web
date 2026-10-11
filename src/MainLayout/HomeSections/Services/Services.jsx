import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import {
  CodeXmlIcon,
  BoxesIcon,
  TrendingUpIcon,
  ClapperboardIcon,
  ArrowDownIcon,
} from "lucide-react";
import "./Services.css";

const services = [
  {
    tag: "Web Engineering",
    title: "Web Development",
    description:
      "Fast, responsive, and reliable websites built with modern frameworks to engage visitors and turn them into customers.",
    icon: CodeXmlIcon,
  },
  {
    tag: "Custom Solutions",
    title: "Custom Software",
    description:
      "Internal tools, custom web applications, and automated workflows designed specifically around how your team operates.",
    icon: BoxesIcon,
  },
  {
    tag: "Strategy & SEO",
    title: "Digital Growth",
    description:
      "Data-driven SEO architecture, performance optimization, and marketing strategies that increase visibility and qualified leads.",
    icon: TrendingUpIcon,
  },
  {
    tag: "Creative Media",
    title: "Video & Visual Content",
    description:
      "Professional promo videos, product visuals, and motion graphics that communicate your brand with clarity and authority.",
    icon: ClapperboardIcon,
  },
];

// Slot positions: each card sits one step behind the previous.
const SLOT_CONFIG = [
  { x: 0, y: 0, scale: 1 },
  { x: 40, y: -36, scale: 0.95 },
  { x: 80, y: -72, scale: 0.9 },
  { x: 120, y: -108, scale: 0.85 },
];

// ===== Scroll timeline =====
// Keyframes are precomputed so no branching runs per animation frame.

const STAGE_POINTS = [0.2, 0.45, 0.7, 0.95];
const EXIT_Y = 650;
const EXIT_FADE = 0.22;
const LAST_INDEX = services.length - 1;

function buildTrack(index, pick, exitValue) {
  const input = [0, STAGE_POINTS[0]];
  const output = [pick(index), pick(index)];
  let slot = index;

  for (let stage = 0; stage < STAGE_POINTS.length - 1; stage += 1) {
    const end = STAGE_POINTS[stage + 1];
    if (slot > 0) {
      slot -= 1;
      input.push(end);
      output.push(pick(slot));
    } else {
      input.push(end);
      output.push(exitValue);
      break;
    }
  }

  input.push(1);
  output.push(output[output.length - 1]);
  return { input, output };
}

const CARD_TRACKS = services.map((_, index) => {
  const exitStart = STAGE_POINTS[index];
  const exitEnd = exitStart + EXIT_FADE;

  return {
    x: buildTrack(index, (s) => SLOT_CONFIG[s].x, 0),
    y: buildTrack(index, (s) => SLOT_CONFIG[s].y, EXIT_Y),
    scale: buildTrack(index, (s) => SLOT_CONFIG[s].scale, 1),
    // The last card stays visible.
    opacity:
      index === LAST_INDEX
        ? { input: [0, 1], output: [1, 1] }
        : { input: [0, exitStart, exitEnd, 1], output: [1, 1, 0, 0] },
    exitEnd,
  };
});

// ===== Card =====
// memo() so cards skip re-rendering when "Service 0X of 04" ticks.
const CleanCard = memo(function CleanCard({
  service,
  index,
  smoothProgress,
  reduceMotion,
}) {
  const Icon = service.icon;
  const track = CARD_TRACKS[index];
  const isLast = index === LAST_INDEX;

  const cardRef = useRef(null);
  const frameRef = useRef(0);
  const pointRef = useRef({ x: 0, y: 0 });

  const updateGlow = useCallback(() => {
    frameRef.current = 0;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = pointRef.current.x - rect.left;
    const y = pointRef.current.y - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;

    const angle = (Math.atan2(dy, dx) * (180 / Math.PI) + 90 + 360) % 360;

    const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
    const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1) * 100;

    card.style.setProperty("--edge-proximity", edge.toFixed(2));
    card.style.setProperty("--cursor-angle", `${angle.toFixed(2)}deg`);
  }, []);

  // Cap style writes to one per frame — pointermove can fire much faster.
  const handlePointerMove = useCallback(
    (e) => {
      // Skip touch: the glow is meaningless while a finger is scrolling.
      if (e.pointerType === "touch") return;
      pointRef.current.x = e.clientX;
      pointRef.current.y = e.clientY;
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(updateGlow);
      }
    },
    [updateGlow],
  );

  const handlePointerLeave = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    cardRef.current?.style.setProperty("--edge-proximity", "0");
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const cardX = useTransform(smoothProgress, track.x.input, track.x.output);
  const cardY = useTransform(smoothProgress, track.y.input, track.y.output);
  const cardScale = useTransform(
    smoothProgress,
    track.scale.input,
    track.scale.output,
  );
  const cardOpacity = useTransform(
    smoothProgress,
    track.opacity.input,
    track.opacity.output,
  );
  // A faded-out card must not intercept the pointer.
  const cardPointerEvents = useTransform(smoothProgress, (p) =>
    !isLast && p > track.exitEnd ? "none" : "auto",
  );

  return (
    <motion.li
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="S3-swap-card S3-glow-card"
      style={
        reduceMotion
          ? undefined
          : {
              x: cardX,
              y: cardY,
              scale: cardScale,
              opacity: cardOpacity,
              pointerEvents: cardPointerEvents,
              zIndex: 10 - index,
            }
      }>
      <span className="S3-edge-light" aria-hidden="true" />

      {/* Each service is self-contained, so <article> fits. */}
      <article className="S3-card-inner">
        <div className="S3-card-tab-bar">
          <span className="S3-tab-dot" aria-hidden="true" />
          <span className="S3-tab-category">{service.tag}</span>
        </div>

        <div className="S3-card-main">
          <div className="S3-card-icon-wrap">
            <Icon
              size={28}
              strokeWidth={1.8}
              className="S3-card-icon"
              aria-hidden="true"
            />
          </div>

          <div className="S3-card-body">
            <h3 className="S3-card-title">{service.title}</h3>
            <p className="S3-card-desc">{service.description}</p>
          </div>
        </div>
      </article>
    </motion.li>
  );
});

// ===== Services Section =====
export default function Services() {
  const containerRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(1);
  // Below 1024px the heading sits directly under the previous section, so the
  // scroll-linked entrance reads as broken there. Freeze the text; cards keep
  // their motion.
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  // Skip the re-render when the step number didn't change.
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (latest < 0.28) setActiveStep(1);
    else if (latest < 0.54) setActiveStep(2);
    else if (latest < 0.78) setActiveStep(3);
    else setActiveStep(4);
  });

  const titleY = useTransform(smoothProgress, [0, 0.2], [-70, 0]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.12], [0.4, 1]);
  const hintOpacity = useTransform(smoothProgress, [0, 0.08], [1, 0]);

  const textIsStatic = reduceMotion || isCompact;

  return (
    <section
      id="services"
      ref={containerRef}
      aria-labelledby="services-title"
      className="S3-services-pin-container">
      <div className="S3-services-sticky">
        <div className="S3-services-inner">
          <div className="S3-services-left">
            <motion.div
              style={{
                y: textIsStatic ? 0 : titleY,
                opacity: textIsStatic ? 1 : titleOpacity,
              }}
              className="S3-heading-wrap">
              <p className="S3-heading-eyebrow">
                01 <span>/ Services</span>
              </p>

              <h2 id="services-title" className="S3-heading">
                Everything your business needs to grow online.
              </h2>

              <p className="S3-heading-sub">
                From high-performing websites to custom internal software, we
                design and build digital solutions that help modern companies
                operate and scale.
              </p>

              <div className="S3-progress-row" aria-hidden="true">
                <div className="S3-progress-bar-track">
                  <motion.div
                    className="S3-progress-bar-fill"
                    style={{
                      scaleX: smoothProgress,
                      transformOrigin: "left center",
                    }}
                  />
                </div>
                <div className="S3-progress-counter">
                  <span>Service </span>
                  <span className="S3-progress-active">0{activeStep}</span>
                  <span className="S3-progress-total"> of 04</span>
                </div>
              </div>

              <motion.div
                style={{ opacity: textIsStatic ? 1 : hintOpacity }}
                className="S3-scroll-hint"
                aria-hidden="true">
                <ArrowDownIcon size={15} className="S3-hint-arrow" />
                <span>Scroll to see services</span>
              </motion.div>
            </motion.div>
          </div>

          {/* A real list so screen readers announce "list, 4 items". */}
          <div className="S3-services-right">
            <ul className="S3-card-swap-viewport" role="list">
              {services.map((service, index) => (
                <CleanCard
                  key={service.title}
                  service={service}
                  index={index}
                  smoothProgress={smoothProgress}
                  reduceMotion={reduceMotion}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}