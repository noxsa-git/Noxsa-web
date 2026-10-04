import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

/* ---------- helpers ---------- */

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

// Fewer ray-march steps = much cheaper shader. (Was 40 / 70 / 110)
const detailToSteps = (detail) => {
  if (detail === "low") return 32.0;
  if (detail === "high") return 90.0;
  return 56.0;
};

/* ---------- adaptive quality settings ---------- */

const MIN_SCALE = 0.35; // lowest render resolution (relative to CSS pixels)
const WARMUP_FRAMES = 30; // ignore the first frames (shader compile, etc.)
const SAMPLE_FRAMES = 40; // measure average frame time every N frames
const SLOW_MS = 22; // slower than ~45fps -> lower the quality
const FAIL_MS = 32; // slower than ~30fps even at lowest quality -> give up

/* ---------- shaders ---------- */

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;

out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);

  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);

  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot);
  s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;

  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x;
  s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;

  c = cos(uTilt);
  s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  if (uEnableMouse) {
    float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw);
    s = sin(yaw);
    dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
    c = cos(pitch);
    s = sin(pitch);
    dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;
  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);

  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;

  if (uGrain > 0.5) {
    float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
    alpha += (g - 0.5) * uGrainIntensity;
  }

  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}
`;

/* ---------- component ---------- */

export default function GradientWaves({
  horizonColor = "#071109",
  waveColor = "#122a15",
  crestColor = "#c6f135",
  speed = 0.25,
  amplitude = 2.2,
  waveScale = 0.55,
  waveRatio = 0.85,
  swell = 32,
  turbulence = 18,
  tilt = 1.1,
  zoom = 1.0,
  height = 5.2,
  fogDepth = 16,
  detail = "medium",
  brightness = 1.0,
  opacity = 0.85,
  mouseInteraction = true,
  parallaxStrength = 0.35,
  grain = true,
  grainIntensity = 0.04,
  // Render resolution relative to CSS pixels (0.6 = 36% of the pixels of 1.0).
  // Waves are soft, so a low value looks almost the same but is MUCH cheaper.
  resolution = 0.6,
  // Called after the first frames are drawn (use it to fade the canvas in).
  onReady,
  // Called if WebGL fails, the context is lost, or the device is too slow.
  onError,
  className = "",
}) {
  const containerRef = useRef(null);
  const programRef = useRef(null);
  const enableMouseRef = useRef(mouseInteraction);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onReadyRef.current = onReady;
    onErrorRef.current = onError;
  }, [onReady, onError]);

  /* ----- create the scene once ----- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const cleanups = [];
    const teardown = () => {
      while (cleanups.length) {
        try {
          cleanups.pop()();
        } catch {
          /* ignore cleanup errors */
        }
      }
    };

    let raf = 0;
    let disposed = false;

    try {
      const renderer = new Renderer({
        webgl: 2,
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        dpr: Math.min(Math.max(resolution, MIN_SCALE), 1),
      });

      if (!renderer.isWebgl2) throw new Error("WebGL2 is not supported");

      const gl = renderer.gl;
      const canvas = gl.canvas;
      gl.clearColor(0, 0, 0, 0);

      canvas.style.display = "block";
      container.appendChild(canvas);
      cleanups.push(() => {
        if (canvas.parentNode === container) container.removeChild(canvas);
      });
      cleanups.push(() => gl.getExtension("WEBGL_lose_context")?.loseContext());

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Float32Array([1, 1]) },
          uSpeed: { value: speed },
          uAmplitude: { value: amplitude },
          uWaveScale: { value: waveScale },
          uWaveRatio: { value: waveRatio },
          uSwell: { value: swell },
          uTurbulence: { value: turbulence },
          uTilt: { value: tilt },
          uZoom: { value: zoom },
          uHeight: { value: height },
          uFogDepth: { value: fogDepth },
          uSteps: { value: detailToSteps(detail) },
          uBrightness: { value: brightness },
          uOpacity: { value: opacity },
          uGrain: { value: grain ? 1.0 : 0.0 },
          uGrainIntensity: { value: grainIntensity },
          uMouse: { value: new Float32Array([0.5, 0.5]) },
          uParallax: { value: parallaxStrength },
          uEnableMouse: { value: mouseInteraction },
          uHorizonColor: { value: new Float32Array(hexToRgb(horizonColor)) },
          uWaveColor: { value: new Float32Array(hexToRgb(waveColor)) },
          uCrestColor: { value: new Float32Array(hexToRgb(crestColor)) },
        },
      });

      if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
        throw new Error("Wave shader failed to compile");
      }

      const mesh = new Mesh(gl, { geometry, program });
      programRef.current = program;
      cleanups.push(() => {
        programRef.current = null;
      });

      const u = program.uniforms;

      /* ----- sizing (with adaptive resolution) ----- */
      let scale = Math.min(Math.max(resolution, MIN_SCALE), 1);

      const applySize = () => {
        const rect = container.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));
        renderer.dpr = scale;
        renderer.setSize(w, h);
        // The canvas is drawn small and stretched by CSS (cheap + smooth).
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        u.iResolution.value[0] = gl.drawingBufferWidth;
        u.iResolution.value[1] = gl.drawingBufferHeight;
      };

      const ro = new ResizeObserver(() => {
        applySize();
        renderer.render({ scene: mesh }); // avoid a blank flash while resizing
      });
      ro.observe(container);
      cleanups.push(() => ro.disconnect());
      applySize();

      /* ----- mouse (window level, smooth) ----- */
      const mouse = [0.5, 0.5];
      const target = [0.5, 0.5];

      const onPointerMove = (e) => {
        if (!enableMouseRef.current) return;
        if (e.pointerType && e.pointerType !== "mouse") return;
        target[0] = e.clientX / window.innerWidth;
        target[1] = 1.0 - e.clientY / window.innerHeight;
      };
      const onPointerOut = () => {
        target[0] = 0.5;
        target[1] = 0.5;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("blur", onPointerOut);
      document.documentElement.addEventListener("mouseleave", onPointerOut);
      cleanups.push(() => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("blur", onPointerOut);
        document.documentElement.removeEventListener(
          "mouseleave",
          onPointerOut,
        );
      });

      /* ----- context loss ----- */
      const onContextLost = (e) => {
        e.preventDefault();
        onErrorRef.current?.(new Error("WebGL context lost"));
      };
      canvas.addEventListener("webglcontextlost", onContextLost);
      cleanups.push(() =>
        canvas.removeEventListener("webglcontextlost", onContextLost),
      );

      /* ----- render loop ----- */
      let isVisible = true;
      let isPageVisible = !document.hidden;
      let lastT = 0;
      let time = 0;
      let frames = 0;
      let sampleMs = 0;
      let sampleCount = 0;
      let slowStrikes = 0;
      let reducedSteps = false;
      let readyCalled = false;

      const loop = (now) => {
        if (disposed) return;
        raf = requestAnimationFrame(loop);

        const dt = lastT ? Math.min((now - lastT) / 1000, 0.1) : 0.016;
        lastT = now;
        time += dt; // own clock: no time jump after pause/resume
        u.iTime.value = time;

        // Frame-rate independent smoothing -> same feel at 60Hz / 144Hz
        const k = 1 - Math.exp(-dt * 7);
        const tx = enableMouseRef.current ? target[0] : 0.5;
        const ty = enableMouseRef.current ? target[1] : 0.5;
        mouse[0] += (tx - mouse[0]) * k;
        mouse[1] += (ty - mouse[1]) * k;
        u.uMouse.value[0] = mouse[0];
        u.uMouse.value[1] = mouse[1];

        renderer.render({ scene: mesh });
        frames += 1;

        if (!readyCalled && frames >= 3) {
          readyCalled = true;
          onReadyRef.current?.();
        }

        // Adaptive quality: lower resolution -> fewer steps -> give up.
        if (frames > WARMUP_FRAMES) {
          sampleMs += dt * 1000;
          sampleCount += 1;
          if (sampleCount >= SAMPLE_FRAMES) {
            const avg = sampleMs / sampleCount;
            sampleMs = 0;
            sampleCount = 0;

            if (avg > SLOW_MS) {
              if (scale > MIN_SCALE + 0.01) {
                scale = Math.max(MIN_SCALE, scale * 0.8);
                applySize();
              } else if (!reducedSteps) {
                reducedSteps = true;
                u.uSteps.value = Math.min(u.uSteps.value, 28.0);
              } else if (avg > FAIL_MS) {
                slowStrikes += 1;
                if (slowStrikes >= 2) {
                  tryStop();
                  onErrorRef.current?.(new Error("Device too slow for waves"));
                }
              }
            } else {
              slowStrikes = 0;
            }
          }
        }
      };

      const tryStart = () => {
        if (disposed || raf !== 0 || !isVisible || !isPageVisible) return;
        lastT = 0;
        raf = requestAnimationFrame(loop);
      };

      function tryStop() {
        if (raf !== 0) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        lastT = 0;
      }
      cleanups.push(tryStop);

      const io = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) tryStart();
        else tryStop();
      });
      io.observe(container);
      cleanups.push(() => io.disconnect());

      const onVisibility = () => {
        isPageVisible = !document.hidden;
        if (isPageVisible) tryStart();
        else tryStop();
      };
      document.addEventListener("visibilitychange", onVisibility);
      cleanups.push(() =>
        document.removeEventListener("visibilitychange", onVisibility),
      );

      tryStart();
    } catch (err) {
      teardown();
      onErrorRef.current?.(err);
      return undefined;
    }

    return () => {
      disposed = true;
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----- update uniforms when props change ----- */
  useEffect(() => {
    const program = programRef.current;
    if (!program) return;
    const u = program.uniforms;

    enableMouseRef.current = mouseInteraction;
    u.uSpeed.value = speed;
    u.uAmplitude.value = amplitude;
    u.uWaveScale.value = waveScale;
    u.uWaveRatio.value = waveRatio;
    u.uSwell.value = swell;
    u.uTurbulence.value = turbulence;
    u.uTilt.value = tilt;
    u.uZoom.value = zoom;
    u.uHeight.value = height;
    u.uFogDepth.value = fogDepth;
    u.uSteps.value = detailToSteps(detail);
    u.uBrightness.value = brightness;
    u.uOpacity.value = opacity;
    u.uGrain.value = grain ? 1.0 : 0.0;
    u.uGrainIntensity.value = grainIntensity;
    u.uParallax.value = parallaxStrength;
    u.uEnableMouse.value = mouseInteraction;
    u.uHorizonColor.value.set(hexToRgb(horizonColor));
    u.uWaveColor.value.set(hexToRgb(waveColor));
    u.uCrestColor.value.set(hexToRgb(crestColor));
  }, [
    horizonColor,
    waveColor,
    crestColor,
    speed,
    amplitude,
    waveScale,
    waveRatio,
    swell,
    turbulence,
    tilt,
    zoom,
    height,
    fogDepth,
    detail,
    brightness,
    opacity,
    grain,
    grainIntensity,
    mouseInteraction,
    parallaxStrength,
  ]);

  return (
    <div
      ref={containerRef}
      className={`gradient-waves-canvas-wrapper ${className}`.trim()}
    />
  );
}