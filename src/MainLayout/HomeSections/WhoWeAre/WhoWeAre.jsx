import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import "./WhoWeAre.css";

const teamMembers = [
  {
    name: "Sobur Hossen",
    position: "Lead Developer",
    role: "Senior Developer",
    image:
      "https://res.cloudinary.com/ysbpcq4w/image/upload/v1791558751/Sobur.png",
  },
  {
    name: "Aminul Islam",
    position: "Creative Lead",
    role: "Content and Video Editor",
    image:
      "https://res.cloudinary.com/ysbpcq4w/image/upload/v1791558755/Amin.png",
  },
  {
    name: "Marufur Rahman",
    position: "Founding Member",
    role: "Marketing Manager",
    image:
      "https://res.cloudinary.com/ysbpcq4w/image/upload/v1791558751/Fahim.png",
  },
];

function TeamCard({ member }) {
  const cardRef = useRef(null);
  const rotateX = useSpring(useMotionValue(0), {
    damping: 25,
    stiffness: 140,
    mass: 1,
  });
  const rotateY = useSpring(useMotionValue(0), {
    damping: 25,
    stiffness: 140,
    mass: 1,
  });
  const scale = useSpring(1, { damping: 25, stiffness: 140, mass: 1 });

  function handleMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -12);
    rotateY.set((offsetX / (rect.width / 2)) * 12);
  }

  function handleMouseEnter() {
    scale.set(1.03);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <li className="S7-team-card-wrapper">
      <motion.div
        ref={cardRef}
        className="S7-team-card"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale,
        }}>
        <div className="S7-team-photo">
          <img
            src={member.image}
            alt={`${member.name} — ${member.position}`}
            loading="lazy"
            decoding="async"
          />
          <div className="S7-team-photo-gradient" />
        </div>

        <div className="S7-team-info">
          <div className="S7-team-badge">
            <span className="S7-team-badge-dot" />
            <span className="S7-team-position">{member.position}</span>
          </div>
          <h3 className="S7-team-name">{member.name}</h3>
          <p className="S7-team-role">{member.role}</p>
        </div>
      </motion.div>
    </li>
  );
}

export default function WhoWeAre() {
  const [isOn, setIsOn] = useState(false);
  const toggleLamp = () => setIsOn((v) => !v);

  return (
    <section className="S7-who-section" aria-label="WhoWeAre">
      <div className="S7-who-inner">
        <div className="S7-lamp-stage">
          <div
            className={`S7-bell-container ${!isOn ? "off" : ""}`}
            onClick={toggleLamp}
            role="button"
            tabIndex={0}
            aria-label={isOn ? "Dim the lamp" : "Illuminate the lamp"}
            aria-pressed={isOn}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleLamp();
              }
            }}>
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
              05<span>/ Whoweare</span>
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
          </div>
        </div>

        <ul className={`S7-team-grid ${!isOn ? "dimmed" : ""}`} role="list">
          {teamMembers.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </ul>

        <div className="S7-actions">
          <a href="#contact" className="S7-story-cta">
            <span>Work with us</span>
            <ArrowRightIcon size={15} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="S7-click-prompt"
            onClick={toggleLamp}
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