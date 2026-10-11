import { useEffect, useRef, useState } from "react";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  MailIcon,
  MessageCircleIcon,
  CheckCircle2Icon,
} from "lucide-react";
import "./Contact.css";

const emailAddress = "noxsahq@gmail.com";
const whatsappNumber = "+880 1300-061300";
const whatsappUrl = "https://wa.me/8801300061300";

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

// ===== Contact Section =====
export default function Contact() {
  const sectionRef = useRef(null);
  useRevealOnScroll(sectionRef);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    // Simulated delay so the loading state is visible. Replace with a real
    // POST to your backend when the endpoint is ready.
    await new Promise((resolve) => setTimeout(resolve, 600));

    setStatus("success");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      aria-labelledby="contact-title"
      className="S7-contact">
      <div className="S7-contact-inner">
        <div className="S7-contact-header" data-reveal>
          <p className="S7-eyebrow">
            06 <span>/ Contact</span>
          </p>
          <h2 id="contact-title" className="S7-heading">
            Let&rsquo;s build something.
          </h2>
          <p className="S7-sub">
            Tell us about your project. We&rsquo;ll get back to you within one
            business day.
          </p>
        </div>

        <div className="S7-contact-grid">
          <div className="S7-form-card" data-reveal style={{ "--i": 0.5 }}>
            {status === "success" ? (
              <div className="S7-success" role="status">
                <CheckCircle2Icon
                  size={32}
                  className="S7-success-icon"
                  aria-hidden="true"
                />
                <h3 className="S7-success-title">Message sent.</h3>
                <p className="S7-success-desc">
                  Thanks for reaching out. We&rsquo;ll reply within one business
                  day. If it&rsquo;s urgent, WhatsApp is faster.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="S7-form">
                <div className="S7-fields-row">
                  <div className="S7-field">
                    <label htmlFor="contact-name" className="S7-label">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      className="S7-input"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="S7-field">
                    <label htmlFor="contact-email" className="S7-label">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                      className="S7-input"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="S7-field">
                  <label htmlFor="contact-message" className="S7-label">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={10}
                    placeholder="Share your project goals, timeline, and context."
                    className="S7-input S7-textarea"
                    value={form.message}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className="S7-submit"
                  disabled={status === "submitting"}>
                  <span>
                    {status === "submitting" ? "Sending…" : "Send message"}
                  </span>
                  <ArrowRightIcon
                    size={16}
                    aria-hidden="true"
                    className="S7-submit-arrow"
                  />
                </button>
              </form>
            )}
          </div>

          <aside
            className="S7-channels"
            data-reveal
            style={{ "--i": 1 }}
            aria-labelledby="contact-channels-title">
            <h3 id="contact-channels-title" className="S7-channels-title">
              Prefer a direct line?
            </h3>
            <p className="S7-channels-sub">
              Skip the form and reach us however you like.
            </p>

            <address className="S7-channels-address">
              <ul className="S7-channels-list" role="list">
                <li>
                  <a href={`mailto:${emailAddress}`} className="S7-channel">
                    <span className="S7-channel-icon" aria-hidden="true">
                      <MailIcon size={18} />
                    </span>
                    <span className="S7-channel-body">
                      <span className="S7-channel-label">Email</span>
                      <span className="S7-channel-value">{emailAddress}</span>
                    </span>
                    <ArrowUpRightIcon
                      size={16}
                      className="S7-channel-arrow"
                      aria-hidden="true"
                    />
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="S7-channel">
                    <span className="S7-channel-icon" aria-hidden="true">
                      <MessageCircleIcon size={18} />
                    </span>
                    <span className="S7-channel-body">
                      <span className="S7-channel-label">WhatsApp</span>
                      <span className="S7-channel-value">{whatsappNumber}</span>
                    </span>
                    <ArrowUpRightIcon
                      size={16}
                      className="S7-channel-arrow"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              </ul>
            </address>

            <p className="S7-response">
              <span className="S7-response-dot" aria-hidden="true" />
              We reply within one business day.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}