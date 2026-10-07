import {
  Fragment,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRightIcon, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";
import "./Hero.css";

// Heavy WebGL code — loaded only on desktop, after the browser is idle__
const GradientWaves = lazy(
  () => import("../../../Components/GradientWaves/GradientWaves"),
);

// Rotating taglines
const taglines = [
  { text: "Blueprints that grow your business.", highlight: "grow" },
  { text: "We build what you imagine.", highlight: "build" },
  { text: "Design meets execution.", highlight: "execution" },
];

const HOLD_MS = 5000;
const STAGGER_S = 0.08;
const ENTER_OFFSET_S = 0.05;

// ===== Animated background rules =====
const MOBILE_QUERY = "(max-width: 640px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FAILED_KEY = "noxsa-waves-off";

// Decide if live WebGL waves are allowed on this device__
function canRunWaves() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia(MOBILE_QUERY).matches) return false;
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return false;

  const nav = window.navigator;
  if (nav.connection?.saveData) return false;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) return false;
  if (nav.deviceMemory && nav.deviceMemory <= 2) return false;

  try {
    if (window.sessionStorage.getItem(FAILED_KEY) === "1") return false;
  } catch {
    // storage can be blocked__
  }

  return true;
}

function useWavesEnabled() {
  const [enabled, setEnabled] = useState(canRunWaves);

  useEffect(() => {
    const lists = [MOBILE_QUERY, REDUCED_MOTION_QUERY].map((q) =>
      window.matchMedia(q),
    );
    const update = () => setEnabled(canRunWaves());
    lists.forEach((mq) => mq.addEventListener("change", update));
    return () =>
      lists.forEach((mq) => mq.removeEventListener("change", update));
  }, []);

  return enabled;
}

// Start heavy background only when the browser is idle__
function useIdleMount(active) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return undefined;

    const start = () => setReady(true);

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(start, 300);
    return () => window.clearTimeout(id);
  }, [active]);

  return active && ready;
}

// ===== Static background (mobile, loading poster, fallback) =====
function StaticBackground() {
  return (
    <div className="S1-static-bg" aria-hidden="true">
      <svg viewBox="0 0 1440 640" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id="s1-wave-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c6f135" stopOpacity="0" />
            <stop offset="0.55" stopColor="#c6f135" stopOpacity="0.32" />
            <stop offset="1" stopColor="#c6f135" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="s1-wave-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#122a15" stopOpacity="0.9" />
            <stop offset="1" stopColor="#071109" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 360C240 280,420 440,720 360S1200 260,1440 340L1440 640L0 640Z"
          fill="url(#s1-wave-fill)"
        />
        <path
          d="M0 360C240 280,420 440,720 360S1200 260,1440 340"
          fill="none"
          stroke="url(#s1-wave-stroke)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0 430C260 350,460 510,760 430S1220 350,1440 420"
          fill="none"
          stroke="url(#s1-wave-stroke)"
          strokeWidth="1.5"
          opacity="0.6"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0 500C280 430,500 570,800 500S1240 430,1440 490"
          fill="none"
          stroke="url(#s1-wave-stroke)"
          strokeWidth="1"
          opacity="0.35"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

// ===== Hero helpers =====
function isHighlight(word, highlight) {
  return word.replace(/[^\p{L}\p{N}]/gu, "") === highlight;
}

function HeroButton({ href, variant = "primary", children }) {
  return (
    <a href={href} className={`S1-btn S1-btn--${variant}`}>
      {children}
    </a>
  );
}

// ===== Hero Section =====
function S1Hero() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const wavesEnabled = useWavesEnabled();
  const [wavesFailed, setWavesFailed] = useState(false);
  const [wavesReady, setWavesReady] = useState(false);

  const mountWaves = useIdleMount(wavesEnabled && !wavesFailed);

  const handleWavesReady = useCallback(() => setWavesReady(true), []);
  const handleWavesError = useCallback(() => {
    try {
      window.sessionStorage.setItem(FAILED_KEY, "1");
    } catch {
      // ignore__
    }
    setWavesFailed(true);
    setWavesReady(false);
  }, []);

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % taglines.length),
      HOLD_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  const { text, highlight } = taglines[index];
  const words = text.split(" ");

  const fade = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay },
  });

  const shift = reduce ? 0 : 12;
  const stagger = reduce ? 0 : STAGGER_S;

  const wordVariants = {
    hidden: { opacity: 0, y: shift },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1],
        delay: i * stagger + ENTER_OFFSET_S,
      },
    }),
    exit: (i) => ({
      opacity: 0,
      y: -shift,
      transition: { duration: 0.28, ease: "easeOut", delay: i * stagger },
    }),
  };

  return (
    <section id="top" aria-labelledby="hero-title" className="S1-hero">
      {/* Static picture — always present (mobile, loading, fallback) */}
      <StaticBackground />

      {/* Live waves — desktop only, loaded when idle, faded in when ready */}
      {mountWaves && (
        <div
          className={`S1-hero-shader${wavesReady ? " is-ready" : ""}`}
          aria-hidden="true">
          <Suspense fallback={null}>
            <GradientWaves
              horizonColor="#050d07"
              waveColor="#0e2011"
              crestColor="#c6f135"
              speed={0.22}
              amplitude={2.3}
              waveScale={0.58}
              waveRatio={0.88}
              swell={32}
              turbulence={16}
              tilt={1.12}
              zoom={1.05}
              height={5.0}
              fogDepth={18}
              detail="medium"
              brightness={0.78}
              opacity={0.72}
              mouseInteraction
              parallaxStrength={0.3}
              grain
              grainIntensity={0.035}
              resolution={0.6}
              onReady={handleWavesReady}
              onError={handleWavesError}
            />
          </Suspense>
        </div>
      )}

      {/* Ambient vignette so text stays readable over the waves */}
      <div aria-hidden="true" className="S1-hero-ambient-vignette" />

      {/* Main content */}
      <div className="S1-hero-inner">
        <div className="S1-hero-content">
          {/* Badges */}
          <motion.div {...fade(0)} className="S1-hero-badge-wrap">
            <span className="S1-hero-badge">
              <span aria-hidden="true" className="S1-hero-badge-dot" />
              <span className="S1-hero-badge-text">Draft to Digital</span>
            </span>
          </motion.div>

          {/* Headline (no fade on the h1 itself — faster first paint) */}
          <h1 id="hero-title" className="S1-hero-title">
            {/* Real text for crawlers and screen readers */}
            <span className="sr-only">
              {taglines.map((t) => t.text).join(" ")}
            </span>

            {/* Animated version for sighted users */}
            <span aria-hidden="true" className="S1-hero-title-stack">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={index}
                  className="S1-hero-title-line"
                  initial="hidden"
                  animate="show"
                  exit="exit">
                  {words.map((word, i) => (
                    <Fragment key={`${index}-${i}`}>
                      <motion.span
                        custom={i}
                        variants={wordVariants}
                        className={
                          isHighlight(word, highlight)
                            ? "S1-hero-word S1-hero-word--accent"
                            : "S1-hero-word"
                        }>
                        {word}
                      </motion.span>
                      {i < words.length - 1 && " "}
                    </Fragment>
                  ))}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p {...fade(0.08)} className="S1-hero-subtitle">
            We design, engineer, and scale high-performance digital products for
            ambitious companies ready to lead their industry.
          </motion.p>

          {/* Call to action */}
          <motion.div {...fade(0.14)} className="S1-hero-actions">
            <HeroButton href="#contact" variant="primary">
              <span>Start a Project</span>
              <ArrowRightIcon size={16} aria-hidden="true" />
            </HeroButton>
            <HeroButton href="#work" variant="secondary">
              <span>Explore</span>
            </HeroButton>
          </motion.div>

          {/* Social proof / credibility metrics */}
          <motion.div {...fade(0.2)} className="S1-hero-meta">
            <div className="S1-meta-item">
              <span className="S1-meta-val">40+</span>
              <span className="S1-meta-label">Products Launched</span>
            </div>
            <div className="S1-meta-divider" aria-hidden="true" />
            <div className="S1-meta-item">
              <span className="S1-meta-val">100%</span>
              <span className="S1-meta-label">Client Retention</span>
            </div>
            <div className="S1-meta-divider" aria-hidden="true" />
            <div className="S1-meta-item">
              <span className="S1-meta-val S1-meta-highlight">
                <Sparkles
                  size={14}
                  className="S1-sparkle-icon"
                  aria-hidden="true"
                />
                Top Tier
              </span>
              <span className="S1-meta-label">Design &amp; Dev Quality</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ===== Hero Section =====
export default function Hero() {
  return (
    <>
      <Helmet>
        {/* Primary */}
        <title>NOXSA — Digital products, built to grow</title>
        <meta
          name="description"
          content="NOXSA designs, builds, and grows digital products for modern businesses — web development, custom software, and visual content."
        />
        {/* Update with your live domain */}
        <link rel="canonical" href="https://noxsa.com/" />
        <meta name="theme-color" content="#0a0d0a" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="NOXSA" />
        <meta property="og:url" content="https://noxsa.com/" />
        <meta
          property="og:title"
          content="NOXSA — Digital products, built to grow"
        />
        <meta
          property="og:description"
          content="We design, build, and grow digital products for modern businesses."
        />
        <meta property="og:locale" content="en_US" />
        {/* TODO: create /public/og-image.jpg at 1200x630 */}
        <meta
          property="og:image"
          content="https://res.cloudinary.com/ysbpcq4w/image/upload/v1791090860/noxsa-logo.jpg"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="NOXSA — Digital products, built to grow"
        />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="NOXSA — Digital products, built to grow"
        />
        <meta
          name="twitter:description"
          content="We design, build, and grow digital products for modern businesses."
        />
        <meta
          name="twitter:image"
          content="https://res.cloudinary.com/ysbpcq4w/image/upload/v1791090860/noxsa-logo.jpg"
        />
      </Helmet>

      <main className="home">
        <S1Hero />
      </main>
    </>
  );
}