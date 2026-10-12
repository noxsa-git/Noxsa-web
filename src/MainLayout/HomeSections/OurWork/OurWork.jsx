import { useEffect, useRef } from "react";
import { ArrowRightIcon } from "lucide-react";
import "./OurWork.css";

// Add an image URL and the <img> replaces the placeholder automatically.
const projects = [
  {
    num: "01",
    title: "Retail storefront",
    category: "Web Development",
    deliverable: "Next.js • Headless Store",
    image: null,
  },
  {
    num: "02",
    title: "Operations dashboard",
    category: "Custom Software",
    deliverable: "Internal ERP & Analytics",
    image: null,
  },
  {
    num: "03",
    title: "Product launch campaign",
    category: "Video & Visual Content",
    deliverable: "3D Visuals & Motion Identity",
    image: null,
  },
];

// Adds "is-revealed" to [data-reveal] targets when they cross the fold, then
// stops watching them. The animation is CSS, so scroll never triggers a render.
function useRevealOnScroll(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll("[data-reveal]");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [rootRef]);
}

function handleContactClick(event) {
  const contactSection = document.getElementById("contact");
  if (!contactSection) return;

  event.preventDefault();
  contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ===== Our Work Section =====
export default function OurWork() {
  const sectionRef = useRef(null);
  useRevealOnScroll(sectionRef);

  return (
    <section
      id="work"
      ref={sectionRef}
      aria-labelledby="work-title"
      className="S6-work">
      <div className="S6-work-inner">
        <header className="S6-work-header">
          <div data-reveal>
            <p className="S6-eyebrow">
              04 <span>/ Our work</span>
            </p>
            <h2 id="work-title" className="S6-heading">
              Selected work.
            </h2>
          </div>
          <div className="S6-work-sub-wrap" data-reveal style={{ "--i": 1 }}>
            <p className="S6-work-sub">
              Our first case studies are on the drawing board. Honest
              blueprints, not borrowed logos.
            </p>
          </div>
        </header>

        {/* The <li> is the card, so there is no extra wrapper. */}
        <ul className="S6-work-grid" role="list">
          {projects.map((project, i) => (
            <li
              key={project.title}
              className="S6-project"
              data-reveal
              style={{ "--i": i }}>
              <div className="S6-project-image">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={`${project.title} — ${project.category}`}
                    loading="lazy"
                    decoding="async"
                    className="S6-project-img"
                  />
                ) : (
                  <div className="S6-project-placeholder" aria-hidden="true">
                    <div className="S6-placeholder-blueprint" />
                    <span className="S6-project-placeholder-num">
                      {project.num}
                    </span>
                  </div>
                )}

                <span className="S6-project-badge">
                  <span className="S6-project-badge-dot" aria-hidden="true" />
                  In Progress
                </span>
              </div>

              <div className="S6-project-meta">
                <span className="S6-project-category">{project.category}</span>
                <h3 className="S6-project-title">{project.title}</h3>
                <p className="S6-project-deliverable">{project.deliverable}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Stretched link: only the button is a link (clean accessible name),
            and its ::after covers the whole card so the strip is still one
            click target. */}
        <div className="S6-work-cta" data-reveal style={{ "--i": 1.5 }}>
          <div className="S6-cta-text-wrap">
            <p className="S6-cta-primary">
              Want your project to be one of the first?
            </p>
            <p className="S6-cta-secondary">
              Let&rsquo;s build your blueprint together.
            </p>
          </div>
          <a
            href="#contact"
            onClick={handleContactClick}
            className="S6-cta-btn-pill">
            <span>Start a Project</span>
            <ArrowRightIcon
              size={16}
              aria-hidden="true"
              className="S6-work-cta-arrow"
            />
          </a>
        </div>
      </div>
    </section>
  );
}