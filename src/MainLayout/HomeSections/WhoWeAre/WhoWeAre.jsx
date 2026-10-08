import { useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import "./WhoWeAre.css";

export default function WhoWeAre() {
  const [isOn, setIsOn] = useState(false);

  return (
    <section className="S7-who-section" aria-label="Who We Are">
      <div className="S7-who-inner">
        <div className="S7-lamp-stage">
          <div
            className={`S7-bell-container${!isOn ? " off" : ""}`}
            onClick={() => setIsOn((v) => !v)}
            role="button"
            tabIndex={0}
            aria-label={isOn ? "Dim the lamp" : "Illuminate the lamp"}
            aria-pressed={isOn}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsOn((v) => !v);
              }
            }}>
            {/* Single light beam — first child so the lamp paints over it */}
            <div className="S7-volumetric" />

            <div className="S7-rope" />
            <div className="S7-bell-top" />
            <div className="S7-bell-base" />
            <div className="S7-bell-base S7-bell-base-blur" />
            <div className="S7-shadow-l1" />
            <div className="S7-shadow-l2" />
            <div className="S7-left-glow" />
            <div className="S7-left-glow2" />
            <div className="S7-r-glow" />
            <div className="S7-r-glow2" />
            <div className="S7-mid-ring" />
            <div className="S7-mid-ring S7-mid-ring-small" />
            <div className="S7-glow" />
            <div className="S7-glow2" />
            <div className="S7-bell-buff-t" />
            <div className="S7-bell-buff" />
            <div className="S7-bell-btm" />
            <div className="S7-bell-btm2" />
            <div className="S7-bell-ring-container">
              <div className="S7-bell-ring" />
              <div className="S7-bell-rays" />
            </div>
          </div>
        </div>

        <div className={`S7-brand-stage ${isOn ? "on" : "dimmed"}`}>
          <div className="S7-light-puddle" aria-hidden="true" />

          <div className="S7-logo-wrapper">
            <img
              src="https://res.cloudinary.com/ysbpcq4w/image/upload/v1791465225/remove-BG-Noxsa.png"
              alt="NOXSA"
              className="S7-brand-logo"
              loading="lazy"
            />
          </div>

          <div className="S7-story-card">
            <p className="S7-story-eyebrow">
              05 <span>/ Who we are</span>
            </p>
            <h2 className="S7-story-title">
              A small team with everything to prove.
            </h2>
            <p className="S7-story-text">
              We aren&rsquo;t a massive agency with corporate layers. We are a
              young, hardworking studio that simply cares more and works harder.
              We don&rsquo;t have decades of history yet&mdash;which means every
              single product we build has to be our best. Honest effort, clean
              execution, and real dedication.
            </p>
            <a href="#contact" className="S7-story-cta">
              <span>Work With Us</span>
              <ArrowRightIcon size={15} aria-hidden="true" />
            </a>
          </div>

          <button
            type="button"
            className="S7-click-prompt"
            onClick={() => setIsOn((v) => !v)}
            aria-label={isOn ? "Dim the lamp" : "Illuminate the lamp"}>
            <span className={`S7-prompt-indicator ${isOn ? "on" : "off"}`} />
            <span>
              {isOn ? "Click lamp to dim" : "Click lamp to illuminate"}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}