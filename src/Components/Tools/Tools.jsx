import {
  SiHtml5,
  SiTailwindcss,
  SiJavascript,
  SiReact,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiFirebase,
  SiJsonwebtokens,
} from "react-icons/si";
import { FaCss3Alt } from "react-icons/fa";
import LogoLoop from "../LogoLoop/LogoLoop";
import "./Tools.css";

const techStack = [
  { name: "HTML5", icon: SiHtml5, color: "#e34f26" },
  { name: "CSS3", icon: FaCss3Alt, color: "#1572b6" },
  { name: "TailwindCSS", icon: SiTailwindcss, color: "#06b6d4" },
  { name: "JavaScript", icon: SiJavascript, color: "#f7df1e" },
  { name: "React", icon: SiReact, color: "#61dafb" },
  { name: "Node.js", icon: SiNodedotjs, color: "#5fa04e" },
  { name: "Express.js", icon: SiExpress, color: "#ffffff" },
  { name: "MongoDB", icon: SiMongodb, color: "#47a248" },
  { name: "Firebase", icon: SiFirebase, color: "#ffca28" },
  { name: "JWT", icon: SiJsonwebtokens, color: "#d63aff" },
];

// Built once at module scope — the loop clones this list, so it must be stable.
const logoItems = techStack.map(({ name, icon: Icon, color }) => ({
  node: (
    <span className="S2-tech-card">
      <Icon
        className="S2-tech-icon"
        style={{ "--brand-icon-color": color }}
        aria-hidden="true"
        focusable="false"
      />
      <span className="S2-tech-name">{name}</span>
    </span>
  ),
}));

export default function Tools() {
  return (
    <section aria-labelledby="tools-label" className="S2-tools">
      <div className="S2-tools-inner">
        <div className="S2-tools-header">
          <span className="S2-tools-dot" aria-hidden="true" />
          <p id="tools-label" className="S2-tools-label">
            Built with tools modern businesses trust
          </p>
        </div>

        <div className="S2-tools-ticker-wrap">
          <LogoLoop
            logos={logoItems}
            speed={55}
            direction="left"
            gap={20}
            pauseOnHover
            fadeOut
            fadeOutColor="#0c100c"
            ariaLabel="Technologies we use"
          />
        </div>
      </div>
    </section>
  );
}