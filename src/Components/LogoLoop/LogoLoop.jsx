import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import "./LogoLoop.css";

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25, // how soft the speed change is when hover starts/ends
  MIN_COPIES: 2,
  COPY_HEADROOM: 1, // exact minimum for a seamless loop (was 2 = one wasted copy)
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const toCssLength = (value) =>
  typeof value === "number" ? `${value}px` : (value ?? undefined);

// Keep 2 decimals: stable against sub-pixel noise, but exact enough for a seamless loop
const round2 = (n) => Math.round(n * 100) / 100;

// ===== Hooks =====

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia(REDUCED_MOTION_QUERY).matches,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
};

// Observes the container and the first list.
// Refs are stable, so this effect is created once (not on every render).
const useResizeObserver = (callback, containerRef, seqRef) => {
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", callback);
      callback();
      return () => window.removeEventListener("resize", callback);
    }

    const observer = new ResizeObserver(callback);
    if (containerRef.current) observer.observe(containerRef.current);
    if (seqRef.current) observer.observe(seqRef.current);
    callback();

    return () => observer.disconnect();
  }, [callback, containerRef, seqRef]);
};

const useAnimationLoop = ({
  trackRef,
  containerRef,
  hoveredRef,
  targetVelocity,
  hoverSpeed,
  seqSize,
  isVertical,
  disabled,
}) => {
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return undefined;

    // Static mode (reduced motion): no loop at all
    if (disabled) {
      track.style.transform = "";
      return undefined;
    }
    if (seqSize <= 0) return undefined;

    const applyTransform = () => {
      const o = -offsetRef.current;
      track.style.transform = isVertical
        ? `translate3d(0, ${o}px, 0)`
        : `translate3d(${o}px, 0, 0)`;
    };

    offsetRef.current = ((offsetRef.current % seqSize) + seqSize) % seqSize;
    applyTransform();

    let raf = 0;
    let last = null;
    let inView = true;
    let pageVisible = !document.hidden;

    const tick = (timestamp) => {
      raf = requestAnimationFrame(tick);

      if (last === null) last = timestamp;
      const dt = Math.min(Math.max(0, timestamp - last) / 1000, 0.1);
      last = timestamp;

      const target =
        hoveredRef.current && hoverSpeed !== undefined
          ? hoverSpeed
          : targetVelocity;

      const easing = 1 - Math.exp(-dt / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easing;

      // Fully paused (hover) -> do nothing, no style writes
      if (target === 0 && Math.abs(velocityRef.current) < 0.05) {
        velocityRef.current = 0;
        return;
      }

      const next = offsetRef.current + velocityRef.current * dt;
      offsetRef.current = ((next % seqSize) + seqSize) % seqSize;
      applyTransform();
    };

    const start = () => {
      if (raf !== 0 || !inView || !pageVisible) return;
      last = null;
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      last = null;
    };

    // Do not animate when the marquee is off-screen or the tab is hidden
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    });
    io.observe(container);

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    start();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [
    trackRef,
    containerRef,
    hoveredRef,
    targetVelocity,
    hoverSpeed,
    seqSize,
    isVertical,
    disabled,
  ]);
};

// ===== Component =====

export const LogoLoop = memo(
  ({
    logos,
    speed = 60,
    direction = "left",
    width = "100%",
    logoHeight = 28,
    gap = 24,
    pauseOnHover = true,
    hoverSpeed,
    fadeOut = true,
    fadeOutColor,
    scaleOnHover = false,
    renderItem,
    ariaLabel = "Technologies we work with",
    className,
    style,
  }) => {
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const seqRef = useRef(null);
    // Hover is a ref (not state): hovering no longer re-renders the component
    const hoveredRef = useRef(false);

    const [seqWidth, setSeqWidth] = useState(0);
    const [seqHeight, setSeqHeight] = useState(0);
    const [copyCount, setCopyCount] = useState(ANIMATION_CONFIG.MIN_COPIES);

    const reducedMotion = usePrefersReducedMotion();
    const isStatic = reducedMotion;

    const effectiveHoverSpeed = useMemo(() => {
      if (hoverSpeed !== undefined) return hoverSpeed;
      if (pauseOnHover === true) return 0;
      if (pauseOnHover === false) return undefined;
      return 0;
    }, [hoverSpeed, pauseOnHover]);

    const isVertical = direction === "up" || direction === "down";

    const targetVelocity = useMemo(() => {
      const magnitude = Math.abs(speed);
      let directionMultiplier = direction === "left" ? 1 : -1;
      if (isVertical) {
        directionMultiplier = direction === "up" ? 1 : -1;
      }
      return magnitude * directionMultiplier;
    }, [speed, direction, isVertical]);

    const updateDimensions = useCallback(() => {
      const container = containerRef.current;
      const seq = seqRef.current;
      if (!container || !seq) return;

      const rect = seq.getBoundingClientRect();

      if (isVertical) {
        if (rect.height > 0) {
          setSeqHeight(round2(rect.height));
          const viewport = container.clientHeight || rect.height;
          const copiesNeeded =
            Math.ceil(viewport / rect.height) + ANIMATION_CONFIG.COPY_HEADROOM;
          setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
        }
      } else if (rect.width > 0) {
        setSeqWidth(round2(rect.width));
        const copiesNeeded =
          Math.ceil(container.clientWidth / rect.width) +
          ANIMATION_CONFIG.COPY_HEADROOM;
        setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
      }
    }, [isVertical]);

    useResizeObserver(updateDimensions, containerRef, seqRef);

    useAnimationLoop({
      trackRef,
      containerRef,
      hoveredRef,
      targetVelocity,
      hoverSpeed: effectiveHoverSpeed,
      seqSize: isVertical ? seqHeight : seqWidth,
      isVertical,
      disabled: isStatic,
    });

    const cssVariables = useMemo(
      () => ({
        "--logoloop-gap": `${gap}px`,
        "--logoloop-logoHeight": `${logoHeight}px`,
        ...(fadeOutColor && { "--logoloop-fadeColor": fadeOutColor }),
      }),
      [gap, logoHeight, fadeOutColor],
    );

    const rootClassName = useMemo(
      () =>
        [
          "logoloop",
          isVertical ? "logoloop--vertical" : "logoloop--horizontal",
          fadeOut && "logoloop--fade",
          scaleOnHover && "logoloop--scale-hover",
          isStatic && "logoloop--static",
          className,
        ]
          .filter(Boolean)
          .join(" "),
      [isVertical, fadeOut, scaleOnHover, isStatic, className],
    );

    // Mouse only: on phones a tap should not "stick" the marquee in a paused state
    const handlePointerEnter = useCallback(
      (e) => {
        if (effectiveHoverSpeed === undefined) return;
        if (e.pointerType && e.pointerType !== "mouse") return;
        hoveredRef.current = true;
      },
      [effectiveHoverSpeed],
    );

    const handlePointerLeave = useCallback(() => {
      hoveredRef.current = false;
    }, []);

    // Keyboard users: pause while something inside has focus
    const handleFocus = useCallback(() => {
      if (effectiveHoverSpeed !== undefined) hoveredRef.current = true;
    }, [effectiveHoverSpeed]);

    const handleBlur = useCallback(() => {
      hoveredRef.current = false;
    }, []);

    const renderLogoItem = useCallback(
      (item, key, isCopy) => {
        if (renderItem) {
          return (
            <li className="logoloop__item" key={key}>
              {renderItem(item, key)}
            </li>
          );
        }

        const isNodeItem = "node" in item;

        const content = isNodeItem ? (
          <span className="logoloop__node">{item.node}</span>
        ) : (
          <img
            src={item.src}
            alt={item.alt ?? item.title ?? ""}
            title={item.title}
            loading="lazy"
            draggable={false}
          />
        );

        return (
          <li className="logoloop__item" key={key}>
            {item.href ? (
              <a
                className="logoloop__link"
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={item.title}
                // copies are hidden from screen readers, so keep them out of tab order too
                tabIndex={isCopy ? -1 : undefined}>
                {content}
              </a>
            ) : (
              content
            )}
          </li>
        );
      },
      [renderItem],
    );

    const renderedCopies = isStatic ? 1 : copyCount;

    const logoLists = useMemo(
      () =>
        Array.from({ length: renderedCopies }, (_, copyIndex) => (
          // role="list" is kept on purpose: Safari/VoiceOver removes list
          // semantics when list-style is none.
          <ul
            className="logoloop__list"
            key={`copy-${copyIndex}`}
            role="list"
            aria-label={copyIndex === 0 ? ariaLabel : undefined}
            aria-hidden={copyIndex > 0 ? true : undefined}
            ref={copyIndex === 0 ? seqRef : undefined}>
            {logos.map((item, itemIndex) =>
              renderLogoItem(item, `${copyIndex}-${itemIndex}`, copyIndex > 0),
            )}
          </ul>
        )),
      [renderedCopies, logos, renderLogoItem, ariaLabel],
    );

    const containerStyle = useMemo(
      () => ({
        width: toCssLength(width) ?? "100%",
        ...cssVariables,
        ...style,
      }),
      [width, cssVariables, style],
    );

    // No role="region" here: the parent <section> is already the landmark.
    // Two nested landmarks with labels would be noisy for screen readers.
    return (
      <div ref={containerRef} className={rootClassName} style={containerStyle}>
        <div
          className="logoloop__track"
          ref={trackRef}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}>
          {logoLists}
        </div>
      </div>
    );
  },
);

LogoLoop.displayName = "LogoLoop";

export default LogoLoop;