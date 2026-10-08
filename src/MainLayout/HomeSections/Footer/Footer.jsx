import { MailIcon, MessageCircleIcon } from "lucide-react";
import "./Footer.css";

// Inline brand icons — lucide dropped brand marks, so we ship our own.
// Everything is currentColor, so hover styles work like any other icon.
const FacebookIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false">
    <path d="M24 12.07C24 5.44 18.63 0 12 0S0 5.44 0 12.07c0 6 4.39 10.97 10.13 11.88v-8.4H7.08v-3.48h3.05V9.41c0-3 1.79-4.67 4.53-4.67 1.31 0 2.69.23 2.69.23v2.96h-1.52c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.48h-2.8v8.4C19.61 23.04 24 18.07 24 12.07z" />
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false">
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38C1.35 2.68.94 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13.67.67 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.13-1.38.67-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.38-2.13C21.32 1.35 20.65.94 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84c-3.4 0-6.16 2.76-6.16 6.16s2.76 6.16 6.16 6.16 6.16-2.76 6.16-6.16-2.76-6.16-6.16-6.16zm0 10.16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.85-10.4c0 .79-.65 1.44-1.44 1.44s-1.44-.65-1.44-1.44.65-1.44 1.44-1.44 1.44.65 1.44 1.44z" />
  </svg>
);

const LinkedInIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zm1.78 13.02H3.55V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.27V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

// Contact + social details
const emailAddress = "noxsahq@gmail.com";
const whatsappNumber = "+880 1300-061300";
const whatsappUrl = "https://wa.me/8801300061300";

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/noxsahq",
    Icon: FacebookIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/noxsahq",
    Icon: InstagramIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/soburhossen/",
    Icon: LinkedInIcon,
  },
];

// Footer navigation columns
const navGroups = [
  {
    title: "Explore",
    links: [
      { label: "Services", href: "#services" },
      { label: "Work", href: "#work" },
      { label: "Process", href: "#process" },
      { label: "Why us", href: "#why" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "#contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

// ===== Footer =====
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="S8-footer" aria-label="Site footer">
      <div className="S8-footer-inner">
        <div className="S8-footer-top">
          {/* Brand column */}
          <div className="S8-footer-brand">
            <a href="/" className="S8-footer-logo">
              NOXSA
            </a>
            <p className="S8-footer-tagline">
              Blueprints that grow your business.
            </p>

            <ul className="S8-footer-socials" role="list">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="S8-footer-social"
                    aria-label={`NOXSA on ${label}`}>
                    <Icon size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          {navGroups.map((group) => (
            <nav
              key={group.title}
              className="S8-footer-col"
              aria-label={group.title}>
              <h2 className="S8-footer-col-title">{group.title}</h2>
              <ul className="S8-footer-list" role="list">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="S8-footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Get in touch */}
          <div className="S8-footer-col">
            <h2 className="S8-footer-col-title">Get in touch</h2>
            <ul className="S8-footer-list" role="list">
              <li>
                <a
                  href={`mailto:${emailAddress}`}
                  className="S8-footer-link S8-footer-link--icon">
                  <MailIcon size={16} aria-hidden="true" />
                  <span>{emailAddress}</span>
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="S8-footer-link S8-footer-link--icon">
                  <MessageCircleIcon size={16} aria-hidden="true" />
                  <span>{whatsappNumber}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="S8-footer-bottom">
          <p className="S8-footer-copy">
            &copy; {year} NOXSA. All rights reserved.
          </p>
          <p className="S8-footer-credit">Designed and built in Bangladesh.</p>
        </div>
      </div>
    </footer>
  );
}