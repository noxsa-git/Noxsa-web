import { useEffect, useRef, memo } from "react";
import "./DotField.css";

const TWO_PI = Math.PI * 2;
const FRAME_MS = 1000 / 60;

const DotField = memo(
  ({
    dotRadius = 1.5,
    dotSpacing = 16,
    cursorRadius = 440,
    cursorForce = 0.1,
    bulgeOnly = true,
    bulgeStrength = 65,
    glowRadius = 160,
    // eslint-disable-next-line no-unused-vars
    sparkle = false, // kept so it is not passed down to the DOM element
    waveAmplitude = 0,
    gradientFrom = "rgba(198, 241, 53, 0.55)",
    gradientTo = "rgba(226, 255, 115, 0.25)",
    glowColor = "rgba(198, 241, 53, 0.28)",
    className = "",
    ...rest
  }) => {
    const canvasRef = useRef(null);
    const glowRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      const glowEl = glowRef.current;
      const parent = canvas?.parentElement;
      if (!canvas || !parent) return undefined;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return undefined;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const step = dotRadius + dotSpacing;
      const rad = dotRadius / 2;
      const cr = cursorRadius;
      const crSq = cr * cr;

      // Size + dots
      let w = 0;
      let h = 0;
      let count = 0;
      let ax = new Float32Array(0); // anchor (home) positions
      let ay = new Float32Array(0);
      let sx = new Float32Array(0); // current (smoothed) positions
      let sy = new Float32Array(0);
      let vx = new Float32Array(0); // velocity (only used when bulgeOnly is false)
      let vy = new Float32Array(0);
      let gradient = null;

      // Mouse (viewport coordinates)
      const mouse = { x: -9999, y: -9999, hasPos: false, moved: 0, speed: 0 };
      let engagement = 0;
      let glowOpacity = 0;
      let time = 0;
      let rect = null;
      let rectDirty = true;

      // Loop state
      let raf = 0;
      let visible = true;
      let destroyed = false;
      let firstFrame = true;
      let lastTime = 0;

      const buildDots = () => {
        const cols = Math.floor(w / step);
        const rows = Math.floor(h / step);
        const padX = (w % step) / 2;
        const padY = (h % step) / 2;
        count = cols * rows;
        ax = new Float32Array(count);
        ay = new Float32Array(count);

        let idx = 0;
        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            ax[idx] = padX + col * step + step / 2;
            ay[idx] = padY + row * step + step / 2;
            idx += 1;
          }
        }

        sx = new Float32Array(ax);
        sy = new Float32Array(ay);
        vx = bulgeOnly ? new Float32Array(0) : new Float32Array(count);
        vy = bulgeOnly ? new Float32Array(0) : new Float32Array(count);
      };

      const tick = (now) => {
        raf = 0;
        if (destroyed || !visible || w === 0) return;

        const dt = firstFrame
          ? FRAME_MS
          : Math.min(Math.max(now - lastTime, 1), 50);
        firstFrame = false;
        lastTime = now;
        const f = dt / FRAME_MS;

        time += 0.02 * f;

        if (rectDirty || !rect) {
          rect = canvas.getBoundingClientRect();
          rectDirty = false;
        }

        // Mouse speed in "pixels per 20ms" (same unit as the old interval)
        const sample = mouse.moved * (20 / dt);
        mouse.moved = 0;
        mouse.speed += (sample - mouse.speed) * (1 - Math.pow(0.5, dt / 20));
        if (mouse.speed < 0.001) mouse.speed = 0;

        const targetEngagement = Math.min(mouse.speed / 4, 1);
        engagement += (targetEngagement - engagement) * (1 - Math.pow(0.94, f));
        if (engagement < 0.001) engagement = 0;

        glowOpacity += (engagement - glowOpacity) * (1 - Math.pow(0.92, f));
        if (glowOpacity < 0.002) glowOpacity = 0;

        const mx = mouse.hasPos ? mouse.x - rect.left : -9999;
        const my = mouse.hasPos ? mouse.y - rect.top : -9999;

        // Cursor glow: moved with transform + opacity (compositor only)
        if (glowEl) {
          glowEl.style.transform = `translate3d(${(mx - glowRadius).toFixed(
            1,
          )}px, ${(my - glowRadius).toFixed(1)}px, 0)`;
          glowEl.style.opacity =
            glowOpacity === 0 ? "0" : glowOpacity.toFixed(3);
        }

        const engaged = engagement > 0.01;
        const kPush = 1 - Math.pow(0.85, f);
        const kRest = 1 - Math.pow(0.9, f);
        const damp = Math.pow(0.9, f);
        const wave = waveAmplitude > 0;
        let moving = false;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = gradient;
        ctx.beginPath();

        for (let i = 0; i < count; i += 1) {
          const axi = ax[i];
          const ayi = ay[i];
          let sxi = sx[i];
          let syi = sy[i];

          if (bulgeOnly) {
            let pushed = false;

            if (engaged) {
              const dx = mx - axi;
              const dy = my - ayi;
              const distSq = dx * dx + dy * dy;

              if (distSq < crSq) {
                pushed = true;
                const dist = Math.sqrt(distSq);
                const inv = dist > 0 ? 1 / dist : 0;
                const k = 1 - dist / cr;
                const push = k * k * bulgeStrength * engagement;

                // dx * inv = cos(angle), dy * inv = sin(angle)
                sxi += (axi - dx * inv * push - sxi) * kPush;
                syi += (ayi - dy * inv * push - syi) * kPush;
              }
            }

            if (!pushed) {
              const ox = axi - sxi;
              const oy = ayi - syi;
              if (ox * ox + oy * oy > 1e-4) {
                sxi += ox * kRest;
                syi += oy * kRest;
                moving = true;
              } else {
                // Already at home: no more work for this dot
                sxi = axi;
                syi = ayi;
              }
            }
          } else {
            if (engaged) {
              const dx = mx - axi;
              const dy = my - ayi;
              const distSq = dx * dx + dy * dy;

              if (distSq < crSq && distSq > 1e-6) {
                const dist = Math.sqrt(distSq);
                const move = (500 / dist) * (mouse.speed * cursorForce);
                vx[i] -= (dx / dist) * move;
                vy[i] -= (dy / dist) * move;
              }
            }

            const vxi = vx[i] * damp;
            const vyi = vy[i] * damp;
            vx[i] = vxi;
            vy[i] = vyi;

            sxi += (axi + vxi - sxi) * kRest;
            syi += (ayi + vyi - syi) * kRest;

            const offX = axi - sxi;
            const offY = ayi - syi;
            if (
              vxi * vxi + vyi * vyi > 1e-4 ||
              offX * offX + offY * offY > 1e-4
            ) {
              moving = true;
            }
          }

          sx[i] = sxi;
          sy[i] = syi;

          let drawX = sxi;
          let drawY = syi;
          if (wave) {
            drawY += Math.sin(axi * 0.03 + time) * waveAmplitude;
            drawX += Math.cos(ayi * 0.03 + time * 0.7) * waveAmplitude * 0.5;
          }

          ctx.moveTo(drawX + rad, drawY);
          ctx.arc(drawX, drawY, rad, 0, TWO_PI);
        }

        ctx.fill();

        // Keep the loop alive only while something is still changing
        if (
          engagement > 0 ||
          glowOpacity > 0 ||
          mouse.speed > 0 ||
          moving ||
          wave
        ) {
          raf = requestAnimationFrame(tick);
        }
      };

      // Wake the loop (called from events)
      const schedule = () => {
        if (raf || destroyed || !visible) return;
        firstFrame = true;
        raf = requestAnimationFrame(tick);
      };

      const doResize = () => {
        const bounds = parent.getBoundingClientRect();
        const nw = Math.floor(bounds.width);
        const nh = Math.floor(bounds.height);
        if (nw <= 0 || nh <= 0) return;
        if (nw === w && nh === h) return;

        w = nw;
        h = nh;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Gradient is created once per size, not on every frame
        gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, gradientFrom);
        gradient.addColorStop(1, gradientTo);

        buildDots();
        rectDirty = true;
        schedule();
      };

      // ===== Events =====

      const onMouseMove = (e) => {
        if (mouse.hasPos) {
          const dx = e.clientX - mouse.x;
          const dy = e.clientY - mouse.y;
          mouse.moved += Math.sqrt(dx * dx + dy * dy);
        }
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.hasPos = true;
        schedule();
      };

      const onMouseLeave = () => {
        mouse.hasPos = false;
        mouse.moved = 0;
        schedule(); // let the dots settle back
      };

      const markRectDirty = () => {
        rectDirty = true;
      };

      let resizeTimer = 0;
      let skipFirstObserverCall = true;

      const ro = new ResizeObserver(() => {
        if (skipFirstObserverCall) {
          skipFirstObserverCall = false;
          return;
        }
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(doResize, 80);
      });
      ro.observe(parent);

      // Pause everything while the section is not on screen
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          rectDirty = true;
          schedule();
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      });
      io.observe(parent);

      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("blur", onMouseLeave);
      window.addEventListener("scroll", markRectDirty, { passive: true });
      document.documentElement.addEventListener("mouseleave", onMouseLeave);

      doResize();

      return () => {
        destroyed = true;
        if (raf) cancelAnimationFrame(raf);
        clearTimeout(resizeTimer);
        ro.disconnect();
        io.disconnect();
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("blur", onMouseLeave);
        window.removeEventListener("scroll", markRectDirty);
        document.documentElement.removeEventListener(
          "mouseleave",
          onMouseLeave,
        );
      };
    }, [
      dotRadius,
      dotSpacing,
      cursorRadius,
      cursorForce,
      bulgeOnly,
      bulgeStrength,
      glowRadius,
      waveAmplitude,
      gradientFrom,
      gradientTo,
    ]);

    return (
      <div className={`dot-field-container ${className}`.trim()} {...rest}>
        <canvas ref={canvasRef} className="dot-field-canvas" />
        <div
          ref={glowRef}
          className="dot-field-glow"
          aria-hidden="true"
          style={{
            width: glowRadius * 2,
            height: glowRadius * 2,
            background: `radial-gradient(circle closest-side, ${glowColor} 0%, transparent 100%)`,
          }}
        />
      </div>
    );
  },
);

DotField.displayName = "DotField";

export default DotField;